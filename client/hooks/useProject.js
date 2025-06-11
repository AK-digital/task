import { getProject } from "@/api/project";
import useSWR from "swr";

export function useProject(projectId, initialProject) {
  const fetcher = getProject.bind(null, projectId);

  const options = {
    revalidateOnMount: true,
    revalidateOnFocus: false,
  };

  if (initialProject) options.fallbackData = initialProject;

  const { data, isLoading, mutate } = useSWR(
    `/project/${projectId}`,
    fetcher,
    options
  );

  return { project: data, mutateProject: mutate };
}
