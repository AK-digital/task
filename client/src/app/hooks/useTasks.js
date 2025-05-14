import { getTasks } from "@/api/task";
import { generateUrlParams } from "@/utils/generateUrlParams";
import useSWR from "swr";

// export function useTasks(queries, initialTasks) {
//   const fetcher = getTasks.bind(null, queries);

//   const options = {
//     revalidateOnFocus: false,
//     revalidateOnMount: false,
//   };

//   // Some pages fetch data on the server and pass it to the client
//   if (initialTasks) options.fallbackData = initialTasks;

//   const { data, isLoading, mutate } = useSWR(
//     `task${generateUrlParams(queries)}`,
//     fetcher,
//     options
//   );

//   return { tasks: data, isLoading, mutateTasks: mutate };
// }

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
    tasks: data,
    tasksValidating: isValidating,
    tasksLoading: isLoading,
    mutateTasks: mutate,
  };
}
