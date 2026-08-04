import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Underline, 
  Strikethrough, 
  Type, 
  Palette, 
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  onImageSelect?: (files: File[]) => void;
  imagePreviews?: Array<{ id: string; file: File; preview: string }>;
  onRemoveImage?: (id: string) => void;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 8,
  maxLength,
  onImageSelect,
  imagePreviews = [],
  onRemoveImage,
}: RichTextEditorProps) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [urlText, setUrlText] = useState("");
  const [urlLink, setUrlLink] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Color options
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#FF0000" },
    { name: "Green", value: "#008000" },
    { name: "Blue", value: "#0000FF" },
    { name: "Orange", value: "#FF902A" },
    { name: "Purple", value: "#800080" },
    { name: "Brown", value: "#A52A2A" },
    { name: "Gray", value: "#808080" },
  ];

  // Font size options: small (12px), medium (24px), large (36px)
  const fontSizes = [
    { label: "Small", value: "small", px: 12 },
    { label: "Medium", value: "medium", px: 24 },
    { label: "Large", value: "large", px: 36 },
  ];

  // Get current selection
  const getSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, text: "" };
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value.substring(start, end);
    
    return { start, end, text };
  };

  // Insert BBCode tags at selection
  const insertTag = useCallback((openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea || disabled) return;

    const { start, end, text } = getSelection();
    const before = value.substring(0, start);
    const after = value.substring(end);
    const selectedText = text || "";

    const newValue = before + openTag + selectedText + closeTag + after;
    onChange(newValue);

    // Restore cursor position after the inserted tag
    setTimeout(() => {
      const newPosition = start + openTag.length + selectedText.length + closeTag.length;
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  }, [value, onChange, disabled]);

  // Insert color tag
  const insertColor = useCallback((color: string) => {
    insertTag(`[color=${color}]`, "[/color]");
    setShowColorPicker(false);
  }, [insertTag]);

  // Insert size tag
  const insertSize = useCallback((size: string) => {
    insertTag(`[${size}]`, `[/${size}]`);
    setShowSizePicker(false);
  }, [insertTag]);

  // Insert URL tag
  const insertUrl = useCallback(() => {
    if (!urlLink.trim()) return;
    const link = urlLink.trim().startsWith("http") ? urlLink.trim() : `https://${urlLink.trim()}`;
    const text = urlText.trim() || link;
    insertTag(`[url=${link}]`, `[/url]`);
    setUrlText("");
    setUrlLink("");
    setShowUrlDialog(false);
  }, [urlLink, urlText, insertTag]);

  // Handle image file selection
  const handleImageSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0 && onImageSelect) {
      onImageSelect(imageFiles);
    }
    setShowImageDialog(false);
  }, [onImageSelect]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageSelect(e.dataTransfer.files);
    }
  }, [handleImageSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageSelect(e.target.files);
    }
  }, [handleImageSelect]);

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border border-border rounded-md bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag("[b]", "[/b]")}
          disabled={disabled}
          className="h-7 w-7 p-0"
          title={t("forum.createPost.editor.bold")}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag("[u]", "[/u]")}
          disabled={disabled}
          className="h-7 w-7 p-0"
          title={t("forum.createPost.editor.underline")}
        >
          <Underline className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag("[s]", "[/s]")}
          disabled={disabled}
          className="h-7 w-7 p-0"
          title={t("forum.createPost.editor.strikethrough")}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Font Size Picker */}
        <Popover open={showSizePicker} onOpenChange={setShowSizePicker}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-7 w-7 p-0"
              title={t("forum.createPost.editor.fontSize")}
            >
              <Type className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2">
            <div className="space-y-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertSize("small")}
                className="w-full justify-start h-8 text-xs"
              >
                <Type className="h-3 w-3 mr-2" />
                {t("forum.createPost.editor.small")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertSize("medium")}
                className="w-full justify-start h-8 text-xs"
              >
                <Type className="h-4 w-4 mr-2" />
                {t("forum.createPost.editor.medium")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertSize("large")}
                className="w-full justify-start h-8 text-xs"
              >
                <Type className="h-5 w-5 mr-2" />
                {t("forum.createPost.editor.large")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-7 w-7 p-0"
              title={t("forum.createPost.editor.textColor")}
            >
              <Palette className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2">
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-1.5">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => insertColor(color.value)}
                    className="h-8 w-full rounded border border-border hover:border-[#FF902A] transition-all"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={showUrlDialog} onOpenChange={setShowUrlDialog}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-7 w-7 p-0"
              title={t("forum.createPost.editor.insertLink")}
            >
              <Link className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="urlLink" className="text-xs">{t("forum.createPost.editor.urlLabel")}</Label>
                <Input
                  id="urlLink"
                  type="text"
                  value={urlLink}
                  onChange={(e) => setUrlLink(e.target.value)}
                  placeholder={t("forum.createPost.editor.urlPlaceholder")}
                  className="h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urlText" className="text-xs">{t("forum.createPost.editor.linkTextLabel")}</Label>
                <Input
                  id="urlText"
                  type="text"
                  value={urlText}
                  onChange={(e) => setUrlText(e.target.value)}
                  placeholder={t("forum.createPost.editor.linkTextPlaceholder")}
                  className="h-8"
                />
              </div>
              <Button
                type="button"
                onClick={insertUrl}
                disabled={!urlLink.trim()}
                className="w-full"
                size="sm"
              >
                {t("forum.createPost.editor.insertLink")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            } else {
              setShowImageDialog(true);
            }
          }}
          disabled={disabled}
          className="h-7 w-7 p-0"
          title={t("forum.createPost.editor.insertImage") || "Insert Image"}
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-px h-5 bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag("[left]", "[/left]")}
          disabled={disabled}
          className="h-7 w-7 p-0"
          title={t("forum.createPost.editor.alignLeft")}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag("[center]", "[/center]")}
          disabled={disabled}
          className="h-7 w-7 p-0"
          title={t("forum.createPost.editor.alignCenter")}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertTag("[right]", "[/right]")}
          disabled={disabled}
          className="h-7 w-7 p-0"
          title={t("forum.createPost.editor.alignRight")}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border border-border rounded-md bg-muted/30">
          {imagePreviews.map((preview) => (
            <div key={preview.id} className="relative group">
              <img
                src={preview.preview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded border border-border"
              />
              <button
                type="button"
                onClick={() => onRemoveImage?.(preview.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image Upload Dialog */}
      {showImageDialog && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${
            isDragging ? 'bg-black/70' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => setShowImageDialog(false)}
        >
          <div
            className={`bg-card border border-border rounded-lg p-8 max-w-md w-full mx-4 ${
              isDragging ? 'border-[#FF902A] border-2' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {t("forum.createPost.editor.uploadImage") || "Upload Image"}
            </h3>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging
                  ? 'border-[#FF902A] bg-[#FF902A]/10'
                  : 'border-border hover:border-[#FF902A]/50'
              } transition-colors cursor-pointer`}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {isDragging
                  ? (t("forum.createPost.editor.dropImage") || "Drop image here")
                  : (t("forum.createPost.editor.dragOrClick") || "Drag and drop image here, or click to select")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("forum.createPost.editor.imageFormats") || "Supports: JPG, PNG, GIF, WebP"}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageDialog(false)}
                className="flex-1"
              >
                {t("forum.createPost.editor.cancel") || "Cancel"}
              </Button>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-[#FF902A] hover:bg-[#FF7A1A]"
              >
                {t("forum.createPost.editor.selectFile") || "Select File"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className="resize-none text-sm leading-relaxed"
        style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", emoji, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif' }}
      />
    </div>
  );
};

export default RichTextEditor;

