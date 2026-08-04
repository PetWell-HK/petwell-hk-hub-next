import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Tag, Shield, PawPrint, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { resolvePetByTagId } from "@/services/petApi";
const logo = "/assets/logo.png";

// Hardcoded tag redirects mapping
const TAG_REDIRECTS: Record<string, string> = {
  "cb682181-d37-4c42-aff8-5bd675a04c53": "5e7e4ab1-480f-4471-8ff2-0b0796ccc6ab",
  "cb682181-4d37-4c42-aff8-5bd675a04c53": "5e7e4ab1-480f-4471-8ff2-0b0796ccc6ab",
  "a1737291-af1e-4787-9f18-e27e8557b1d5": "a486dd25-b766-4e99-b767-b8bcc55f1df3",
  "add4d181-d222-446e-84bf-15d329b14ebb": "47e36c23-3a89-4f33-b3e7-e6b29d09deb7",
  "557c3ce6-3b95-48f8-a848-5ae23cb51a25": "1e94d684-48e1-419c-a990-2cd7aa840dab",
  "b403a9cf-6e91-4a4d-9e16-cee30857093a": "6484d8bc-f346-44ea-a627-904d6015660f",
};

const normalizeTagId = (value?: string) => {
  if (!value) return value;
  return value.trim().replace(/^\{+/, "").replace(/\}+$/, "");
};

const ActivateTag = () => {
  const { tagId: rawTagId } = useParams();

  const normalizedRawTagId = normalizeTagId(rawTagId);

  // Check if there's a hardcoded redirect for this tag
  const tagId = normalizedRawTagId ? (TAG_REDIRECTS[normalizedRawTagId] || normalizedRawTagId) : normalizedRawTagId;
  const { t } = useTranslation();

  // Fetch pet data by tag ID (which is the pet's UUID)
  const { data: pet, isLoading } = useQuery({
    queryKey: ["checkPetForActivation", tagId],
    queryFn: async () => {
      if (!tagId) return null;
      return resolvePetByTagId(tagId);
    },
    enabled: !!tagId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If pet data exists and is already activated, redirect to pet profile
  if (pet && pet.isTagActivated) {
    return <Navigate to={`/pet/${pet.id}`} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-8">
          <Link to="/" aria-label="PetWell é¦–é " className="inline-block">
            <img src={logo} alt="PetWell Logo" className="h-10 w-auto mx-auto mb-6" />
          </Link>
        </div>
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">å•Ÿç”¨æ‚¨çš„å¯µç‰©æ¨™ç±¤</h1>
          <p className="text-muted-foreground">Activate Your Pet Tag</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 text-left">
            <PawPrint className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">ä¿è­·æ¯›å­©å®‰å…¨</h3>
              <p className="text-sm text-muted-foreground">
                è¬ä¸€æ¯›å­©èµ°å¤±ï¼Œæœ‰äººç™¼ç¾å°±å¯ä»¥å³åˆ»æµä½ ï¼
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <Lock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">å®‰å…¨ä¿å¯†</h3>
              <p className="text-sm text-muted-foreground">
                åªæœƒé¡¯ç¤ºå¿…éœ€è³‡æ–™
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">ä½ çš„å¯µç‰©</p>
          <p className="font-mono font-bold text-lg">{pet?.name || tagId}</p>
        </div>

        <Button size="lg" className="w-full" asChild>
          <Link to="/download">
            <Tag className="mr-2 h-5 w-5" />
            å³åˆ»å•Ÿç”¨åç‰Œï¼Œé é˜²æ¯›å­©èµ°å¤±ï¼
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ActivateTag;