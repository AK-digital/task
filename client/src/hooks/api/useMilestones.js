import useSWR from "swr";
import { getMilestones } from "@/api/milestone";

export function useMilestones(projectId) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/milestones?projectId=${projectId}` : null,
    () => getMilestones(projectId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    milestones: data || [],
    error,
    isLoading,
    mutateMilestones: mutate,
  };
}
