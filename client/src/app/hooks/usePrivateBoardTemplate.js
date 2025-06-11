
import { getUserPrivateBoardsTemplates } from "@/api/boardTemplate";
import useSWR from "swr";

export function usePrivateBoardTemplate() {
    const fetcher = getUserPrivateBoardsTemplates

    const options = {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    };

    const { data, isLoading, mutate } = useSWR(
        `board-template/user-private`,
        fetcher,
        options
    );

    return { privateBoardTemplates: data?.data, mutatePrivateBoardTemplates: mutate };
}
