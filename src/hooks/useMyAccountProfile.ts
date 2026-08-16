import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  ACCOUNT_PROFILE_QUERY_KEY,
  fetchMyAccountProfile,
  updateMyAccountProfile,
  type AccountProfileUpdate,
} from "@/services/accountApi";

export function useMyAccountProfile() {
  const { isAuthenticated, userInfo } = useAuth();
  const userId = userInfo?.userId;
  const enabled = isAuthenticated === true && Boolean(userId);

  return useQuery({
    queryKey: [ACCOUNT_PROFILE_QUERY_KEY, userId],
    queryFn: () => fetchMyAccountProfile(userId!),
    enabled,
  });
}

export function useUpdateMyAccountProfile() {
  const queryClient = useQueryClient();
  const { userInfo } = useAuth();
  const userId = userInfo?.userId;

  return useMutation({
    mutationFn: (update: AccountProfileUpdate) => {
      if (!userId) {
        throw new Error("Not authenticated.");
      }
      return updateMyAccountProfile(userId, update);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [ACCOUNT_PROFILE_QUERY_KEY, userId],
      });
    },
  });
}
