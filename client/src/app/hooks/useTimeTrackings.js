import { getTimeTrackings } from "@/api/timeTracking";
import useSWR from "swr";
import { generateUrlParams } from "@/utils/generateUrlParams";

export function useTimeTrackings(queries, fallbackData = null) {
  const fetcher = getTimeTrackings.bind(null, queries);

  const options = {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  };

  if (fallbackData) options.fallbackData = fallbackData;

  const { data, mutate } = useSWR(
    `/time-trackings${generateUrlParams(queries)}`,
    fetcher,
    options
  );

  return {
    timeTrackings: data,
    mutateTimeTrackings: mutate,
  };
}
