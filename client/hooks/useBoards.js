import { getBoards } from "@/api/board";
import useSWR from "swr";

export function useBoards(projectId, archived, initialBoards) {
  const fetcher = getBoards.bind(null, projectId, archived);
  const { data, isLoading, mutate } = useSWR(
    `/boards?projectId=${projectId}&archived=${archived}`,
    fetcher,
    {
      fallbackData: initialBoards,
      revalidateOnFocus: false,
    }
  );

  return { boards: data, mutateBoards: mutate, isLoading };
}
