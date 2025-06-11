
import { getPublicBoardsTemplates } from "@/api/boardTemplate";
import useSWR from "swr";

export function usePublicBoardTemplate() {
    const fetcher = getPublicBoardsTemplates

    const options = {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    };

    const { data, isLoading, mutate } = useSWR(
        `board-template`,
        fetcher,
        options
    );

    return { publicBoardTemplates: data?.data, mutatePublicBoardTemplates: mutate };
}
