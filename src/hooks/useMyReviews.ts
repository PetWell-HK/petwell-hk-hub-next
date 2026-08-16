import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserReviews } from "@/services/userReviewApi";

export function useMyReviews() {
  const { i18n } = useTranslation();
  const { isAuthenticated, userInfo } = useAuth();
  const userId = userInfo?.userId;
  const isLoggedIn = isAuthenticated === true && Boolean(userId);

  return useQuery({
    queryKey: ["userReviews", userId, true, i18n.language],
    queryFn: () => fetchUserReviews(userId!, { includeAnonymous: true, language: i18n.language }),
    enabled: isLoggedIn,
  });
}
