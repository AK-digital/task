import { getStatusesByProjects } from "@/api/status";
import useSWR from "swr";

export function useProjectsStatus(projectsIds, initialStatuses) {
  const fetcher = getStatusesByProjects.bind(null, projectsIds);

  const options = {
    revalidateOnMount: true,
    revalidateOnFocus: false,
  };

  if (initialStatuses) options.fallbackData = initialStatuses;

  const { data, isLoading, mutate } = useSWR(
    `/status?projects=${projectsIds.join(",")}`,
    fetcher,
    options
  );

  return { statuses: data, mutateStatuses: mutate };
}
