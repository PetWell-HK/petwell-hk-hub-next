import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { resolvePetByTagId } from "@/services/petApi";

const normalizeTagId = (value?: string) => {
  if (!value) return value;
  return value.trim().replace(/^\{+/, "").replace(/\}+$/, "");
};

// Hardcoded tag redirects mapping
const TAG_REDIRECTS: Record<string, string> = {
  "cb682181-d37-4c42-aff8-5bd675a04c53": "5e7e4ab1-480f-4471-8ff2-0b0796ccc6ab",
  "cb682181-4d37-4c42-aff8-5bd675a04c53": "5e7e4ab1-480f-4471-8ff2-0b0796ccc6ab",
  "e6507c6b-68f6-4ccd-9c1b-474598d7c6d1": "a295e69e-c019-4a82-af6f-c0b3fab74c6c",
  "a1737291-af1e-4787-9f18-e27e8557b1d5": "a486dd25-b766-4e99-b767-b8bcc55f1df3",
  "add4d181-d222-446e-84bf-15d329b14ebb": "47e36c23-3a89-4f33-b3e7-e6b29d09deb7",
  "557c3ce6-3b95-48f8-a848-5ae23cb51a25": "1e94d684-48e1-419c-a990-2cd7aa840dab",
  "7c1cb182-aec4-4362-bf29-e1a37dd8121b": "d444fbbd-229f-47cb-b9dc-2b68d4c86642",
  "11a670b9-0558-467e-9fc7-f62206e5f298": "0ce439de-51ca-4239-9fe9-878a68c57eef",
  "dd39fa02-c4f9-423c-8545-97f6b1adb039": "82245b17-2432-4057-935e-f5310bc9ce30",
  "b403a9cf-6e91-4a4d-9e16-cee30857093a": "6484d8bc-f346-44ea-a627-904d6015660f",
};

const CheckTag = () => {
  const { id: rawId } = useParams();

  const normalizedRawId = normalizeTagId(rawId);

  // Check if there's a hardcoded redirect for this tag
  const id = normalizedRawId ? (TAG_REDIRECTS[normalizedRawId] || normalizedRawId) : normalizedRawId;

  const { data: pet, isLoading } = useQuery({
    queryKey: ["checkPet", id],
    queryFn: async () => {
      if (!id) return null;
      return resolvePetByTagId(id);
    },
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activateId = pet?.id ?? id;

  // Only activated pets can go to public pet profile.
  if (pet?.isTagActivated === true) {
    return <Navigate to={`/pet/${pet.id}`} replace />;
  }

  return <Navigate to={`/activate/${activateId}`} replace />;
};

export default CheckTag;
