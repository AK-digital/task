import { getDrafts } from "@/api/draft";
import useSWR from "swr";

export function useDrafts(projectId, taskId, draftType) {
  const fetcher = getDrafts.bind(null, projectId, taskId, draftType);
  const { data, mutate } = useSWR(
    `/draft?projectId=${projectId}&taskId=${taskId}&type=${draftType}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return { draft: data, mutateDraft: mutate };
}
