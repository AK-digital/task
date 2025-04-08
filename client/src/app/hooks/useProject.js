import { getProject } from "@/api/project";
import useSWR from "swr";

export function useProject(projectId, initialProject) {
  const fetcher = getProject.bind(null, projectId);
  const { data, isLoading } = useSWR(`/project/${projectId}`, fetcher, {
    fallbackData: initialProject,
  });

  return { project: data };
}
