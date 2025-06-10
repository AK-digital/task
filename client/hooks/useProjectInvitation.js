import { getProjectInvitations } from "@/api/projectInvitation";
import useSWR from "swr";

export function useProjectInvitation(projectId) {
  const fetcher = getProjectInvitations.bind(null, projectId);
  const { data, isLoading, mutate } = useSWR(
    `/project-invitation/${projectId}?projectId=${projectId}`,
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: true,
      refreshInterval: 0, // Pas de refresh automatique
      dedupingInterval: 2000, // Réduire l'intervalle de déduplication
    }
  );

  return {
    projectInvitations: data,
    isLoading,
    mutateProjectInvitation: mutate,
  };
}
