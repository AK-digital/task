import { getAllUsersForAdmin } from "@/api/admin";
import useSWR from "swr";

export function useAdminUsers() {
  const { data, error, isLoading, mutate } = useSWR(
    "/admin/users",
    getAllUsersForAdmin,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 30000, // 30 secondes
    }
  );

  return {
    users: data?.data || [],
    usersLoading: isLoading,
    usersError: error,
    mutateUsers: mutate,
  };
}
