import { getTasks } from "@/api/task";
import { generateUrlParams } from "@/utils/generateUrlParams";
import useSWR from "swr";

export function useTasks(queries, fallbackData = null) {
  const fetcher = getTasks.bind(null, queries);

  console.log(generateUrlParams(queries));

  const options = {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  };

  if (fallbackData) options.fallbackData = fallbackData;

  const { data, isLoading, isValidating, mutate } = useSWR(
    `/task${generateUrlParams(queries)}`,
    fetcher,
    options
  );

  return {
    tasks: data || [], // Toujours retourner un tableau
    tasksValidating: isValidating,
    tasksLoading: isLoading,
    mutateTasks: mutate,
  };
}
