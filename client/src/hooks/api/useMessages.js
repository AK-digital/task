import { getMessages } from "@/api/message";
import useSWR from "swr";

export function useMessages(projectId, taskId, subtaskId = null) {
  const fetcher = getMessages.bind(null, projectId, taskId, subtaskId);
  const queryParams = new URLSearchParams({
    projectId: projectId,
    ...(subtaskId ? { subtaskId } : { taskId })
  });
  
  const { data, isLoading, mutate } = useSWR(
    `/message?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnMount: true,
    }
  );

  if (!data?.success) {
    return { messages: [], messageLoading: isLoading, mutate };
  }

  return { messages: data?.data, messageLoading: isLoading, mutate };
}
