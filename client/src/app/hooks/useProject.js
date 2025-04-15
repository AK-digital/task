import { getProject } from "@/api/project";
import useSWR from "swr";

export function useProject(projectId, initialProject) {
  const fetcher = getProject.bind(null, projectId);
  const { data, isLoading, mutate } = useSWR(`/project/${projectId}`, fetcher, {
    fallbackData: initialProject,
    revalidateOnFocus: false,
  });

  return { project: data, mutateProject: mutate };
}
