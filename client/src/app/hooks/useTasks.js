import { getTasks } from "@/api/task";
import useSWR from "swr";

export function useTasks(projectId, archived, initialTasks) {
  const fetcher = getTasks.bind(null, projectId, archived);
  const { data, isLoading, mutate } = useSWR(
    `/task?projectId=${projectId}&archived=${archived}`,
    fetcher,
    {
      fallbackData: initialTasks,
      revalidateOnFocus: false,
      revalidateOnMount: false,
    }
  );

  return { tasks: data, isLoading, mutate };
}
