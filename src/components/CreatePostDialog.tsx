import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { uploadData } from "aws-amplify/storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { 
  createForumPost, 
  getOrCreateClient, 
  fetchForumCategories,
  getCategoryLabel,
  type CreateForumPostInput
} from "@/services/forumApi";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthPanel } from "@/contexts/AuthPanelContext";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { buildForumImageUrl } from "@/utils/forumImageUrl";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

const CreatePostDialog = ({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useAppNavigate();
  const { isAuthenticated, userInfo } = useAuth();
  const { openPanel } = useAuthPanel();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("DOG"); // Category enum value
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<Array<{ id: string; file: File; preview: string }>>([]);

  // Check authentication when dialog opens
  useEffect(() => {
    if (open) {
      // If user is not authenticated, open login panel and close this dialog
      if (isAuthenticated === false) {
        onOpenChange(false);
        openPanel("LANDING");
      }
    }
  }, [open, isAuthenticated, onOpenChange, openPanel]);

  // Get fixed categories with translations (no API call needed)
  const categories = fetchForumCategories(i18n.language);


  // Handle image selection
  const handleImageSelect = useCallback((files: File[]) => {
    const newPreviews = files.map((file) => {
      const id = `${Date.now()}-${Math.random()}`;
      return {
        id,
        file,
        preview: URL.createObjectURL(file),
      };
    });
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    
    // Insert simple image marker in content at cursor position (default left aligned, inline with text)
    const imageMarker = i18n.language === 'zh' ? '[圖片]' : '[Image]';
    const placeholder = newPreviews.map(() => imageMarker).join(' ');
    setContent((prev) => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = prev.substring(0, start);
        const after = prev.substring(end);
        // Insert with space before and after to make it inline with text
        const insertText = (before && !before.endsWith(' ') && !before.endsWith('\n') ? ' ' : '') + 
                          placeholder + 
                          (after && !after.startsWith(' ') && !after.startsWith('\n') ? ' ' : '');
        return before + insertText + after;
      }
      return prev + (prev && !prev.endsWith(' ') ? ' ' : '') + placeholder;
    });
  }, [i18n.language]);

  // Handle image removal
  const handleRemoveImage = useCallback((id: string) => {
    setImagePreviews((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      const filtered = prev.filter((p) => p.id !== id);
      
      // Remove the corresponding image marker from content
      const imageMarker = i18n.language === 'zh' ? '[圖片]' : '[Image]';
      setContent((current) => {
        // Find the index of the removed image in the original array
        const removedIndex = prev.findIndex((p) => p.id === id);
        if (removedIndex === -1) return current;
        
        // Count occurrences of the marker before the removed one
        let markerCount = 0;
        let lastIndex = 0;
        for (let i = 0; i < removedIndex; i++) {
          const markerPos = current.indexOf(imageMarker, lastIndex);
          if (markerPos !== -1) {
            markerCount++;
            lastIndex = markerPos + imageMarker.length;
          } else {
            break;
          }
        }
        
        // Find and remove the marker at the correct position
        let searchIndex = 0;
        for (let i = 0; i <= markerCount; i++) {
          const markerPos = current.indexOf(imageMarker, searchIndex);
          if (markerPos !== -1 && i === markerCount) {
            // Remove this marker
            return current.substring(0, markerPos) + 
                   current.substring(markerPos + imageMarker.length).replace(/^\s+/, '');
          }
          if (markerPos !== -1) {
            searchIndex = markerPos + imageMarker.length;
          } else {
            break;
          }
        }
        
        return current;
      });
      
      return filtered;
    });
  }, [i18n.language]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.preview);
      });
    };
  }, [imagePreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double check authentication before submitting
    if (isAuthenticated !== true || !userInfo?.userId || !userInfo?.email) {
      setError(t("auth.loginRequired") || "Please log in to create a post");
      onOpenChange(false);
      openPanel("LANDING");
      return;
    }

    setError(null);
    setReviewNotice(null);
    setLoading(true);

    try {
      // No tags - removed tag functionality
      const tagNames: string[] = [];
      const tagIds: string[] = [];

      // Get or create Client for the current user
      // This ensures we use the correct Client.id as authorId (not Cognito userId)
      if (!userInfo.email || userInfo.email.trim() === '') {
        throw new Error(t("auth.emailRequired") || "Email is required to create a post");
      }
      
      // SECURITY: Pass authenticated user email to validate ownership
      // Users can only create posts with their own email
      const clientId = await getOrCreateClient(userInfo.email, userInfo.email);
      
      if (!clientId) {
        throw new Error(t("forum.createPost.error") || "Failed to get user information");
      }


        // Upload images to S3 and replace image markers in content
        let finalContent = content.trim();
        if (imagePreviews.length > 0) {
          const timestamp = Date.now();
          const imageMarker = i18n.language === 'zh' ? '[圖片]' : '[Image]';
          
          const uploadPromises = imagePreviews.map(async (preview, index) => {
            try {
              // Generate unique key for the image
              const fileExtension = preview.file.name.split('.').pop() || 'jpg';
              const imageKey = `forum-images/${timestamp}-${clientId}-${index}.${fileExtension}`;
              
              // Upload to S3 using Amplify Storage v6 API
              await uploadData({
                key: imageKey,
                data: preview.file,
                options: {
                  contentType: preview.file.type,
                  accessLevel: 'guest', // Guest access for public images
                },
              }).result;

              return { url: buildForumImageUrl(imageKey) };
            } catch (err) {
              console.error('Error uploading image:', err);
              throw new Error(`Failed to upload image: ${preview.file.name}`);
            }
          });

          const uploadResults = await Promise.all(uploadPromises);
          
          // Replace image markers with actual image BBCode tags (replace from first to last)
          let markerIndex = 0;
          uploadResults.forEach(({ url }) => {
            // Find and replace the first occurrence of the marker
            const markerIndexInContent = finalContent.indexOf(imageMarker, markerIndex);
            if (markerIndexInContent !== -1) {
              finalContent = finalContent.substring(0, markerIndexInContent) + 
                           `[img]${url}[/img]` + 
                           finalContent.substring(markerIndexInContent + imageMarker.length);
              markerIndex = markerIndexInContent + `[img]${url}[/img]`.length;
            }
          });
        }

      const input: CreateForumPostInput = {
        title: title.trim(),
        content: finalContent,
        authorId: clientId, // Use Client.id directly
        category: category || "DOG", // Category enum value
        tags: tagNames.length > 0 ? tagNames : undefined, // Legacy tags (for backward compatibility)
        tagIds: tagIds.length > 0 ? tagIds : undefined, // New tag IDs
        location: undefined,
        isAnonymous: isAnonymous, // Anonymous mode
      };

      const createdPost = await createForumPost(input);

      if ("pendingReview" in createdPost) {
        setTitle("");
        setContent("");
        setCategory("DOG");
        setIsAnonymous(false);
        imagePreviews.forEach((preview) => {
          URL.revokeObjectURL(preview.preview);
        });
        setImagePreviews([]);
        setError(null);
        setReviewNotice(i18n.language === 'zh'
          ? "系統偵測到內容可能包含敏感字眼。內容已提交人工審核，通過前不會公開顯示。"
          : "We detected potentially sensitive wording. Your content has been submitted for manual review and will not be public until approved.");
        return;
      }

      // Reset form
      setTitle("");
      setContent("");
      setCategory("DOG"); // Reset to default category
      setIsAnonymous(false);
      setError(null);
      setReviewNotice(null);
      // Clean up image previews
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.preview);
      });
      setImagePreviews([]);

      // Close dialog
      onOpenChange(false);

      // Callback to refresh posts
      if (onPostCreated) {
        onPostCreated();
      }

      // Navigate to the new post
      navigate(`/forum/${createdPost.id}`);
    } catch (err: unknown) {
      console.error("Error creating post:", err);
      setError(err instanceof Error ? err.message : t("forum.createPost.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setContent("");
      setCategory("DOG"); // Reset to default category
      setIsAnonymous(false);
      setError(null);
      setReviewNotice(null);
      // Clean up image previews
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.preview);
      });
      setImagePreviews([]);
      onOpenChange(false);
    }
  };

  // Don't render if not authenticated (will be handled by useEffect)
  // Also don't render if still checking authentication
  if (isAuthenticated !== true || !userInfo?.userId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("forum.createPost.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          {reviewNotice && (
            <div className="bg-amber-50 text-amber-900 text-sm p-3 rounded-md border border-amber-200">
              <div className="font-semibold mb-1">
                {i18n.language === 'zh' ? '內容需要審核' : 'Content Pending Review'}
              </div>
              <div>{reviewNotice}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <div className="space-y-2">
              <Label htmlFor="title">{t("forum.createPost.titleLabel")} *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("forum.createPost.titlePlaceholder")}
                required
                maxLength={200}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/200 {t("forum.createPost.characters")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t("forum.createPost.categoryLabel")} *</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={loading}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder={t("forum.createPost.categoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t("forum.createPost.contentLabel")} *</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder={t("forum.createPost.contentPlaceholder")}
              rows={16}
              maxLength={10000}
              disabled={loading}
              onImageSelect={handleImageSelect}
              imagePreviews={imagePreviews}
              onRemoveImage={handleRemoveImage}
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/10000 {t("forum.createPost.characters")}
            </p>
          </div>


          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              disabled={loading}
            />
            <Label
              htmlFor="anonymous"
              className="text-sm font-normal cursor-pointer"
            >
              {t("forum.createPost.anonymousLabel")}
            </Label>
            <span className="text-xs text-muted-foreground ml-2">
              ({t("forum.createPost.anonymousHint")})
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("forum.createPost.creating")}
                </>
              ) : (
                t("forum.createPost.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;

