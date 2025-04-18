import { getMessages } from "@/api/message";
import useSWR from "swr";

export function useMessages(projectId, taskId) {
  const fetcher = getMessages.bind(null, projectId, taskId);
  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${projectId}&taskId=${taskId}`,
    fetcher
  );

  if (!data?.success) {
    return { messages: [], messageLoading: isLoading, mutate };
  }

  return { messages: data?.data, messageLoading: isLoading, mutate };
}
