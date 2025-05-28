import { getStatusByProject } from "@/api/status";
import useSWR from "swr";

export function useStatuses(projectId, initialStatuses) {
  if (!projectId) {
    return {
      statuses: [],
      mutateStatuses: () => {},
      statusesValidating: false,
      statusesLoading: false,
    };
  }

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
