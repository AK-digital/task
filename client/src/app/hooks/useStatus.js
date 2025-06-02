import { getStatusByProject } from "@/api/status";
import useSWR from "swr";

export function useStatuses(projectId, initialStatuses) {
  const fetcher = getStatusByProject.bind(null, projectId);

  const options = {
    revalidateOnMount: true,
    revalidateOnFocus: false,
  };

  if (initialStatuses) options.fallbackData = initialStatuses;

  const { data, isLoading, mutate } = useSWR(
    `/status/project/${projectId}`,
    fetcher,
    options
  );

  return { statuses: data, mutateStatuses: mutate };
}
