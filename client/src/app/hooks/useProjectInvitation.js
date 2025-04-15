import { getProjectInvitations } from "@/api/projectInvitation";
import useSWR from "swr";

export function useProjectInvitation(projectId) {
  const fetcher = getProjectInvitations.bind(null, projectId);
  const { data, isLoading, mutate } = useSWR(
    `/project-invitation/${projectId}?projectId=${projectId}`,
    fetcher,
    {
      revalidateOnMount: true,
    }
  );

  return {
    projectInvitations: data,
    isLoading,
    mutateProjectInvitation: mutate,
  };
}
