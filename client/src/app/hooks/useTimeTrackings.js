import { getTimeTrackings } from "@/api/timeTracking";
import useSWR from "swr";
import { generateUrlParams } from "@/utils/generateUrlParams";

export function useTimeTrackings(queries) {
  const fetcher = getTimeTrackings.bind(null, queries);

  console.log(generateUrlParams(queries));

  const options = {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  };

  const { data, isLoading, isValidating, mutate } = useSWR(
    `/time-trackings${generateUrlParams(queries)}`,
    fetcher,
    options
  );

  return {
    timeTrackings: data,
    timeTrackingsLoading: isLoading,
    timeTrackingsValidating: isValidating,
    mutateTimeTrackings: mutate,
  };
}
