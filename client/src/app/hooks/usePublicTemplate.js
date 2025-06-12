
import { getPublicTemplates } from "@/api/template";
import useSWR from "swr";

export function usePublicTemplate() {
    const fetcher = getPublicTemplates

    const options = {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    };

    const { data, isLoading, mutate } = useSWR(
        `/template`,
        fetcher,
        options
    );

    return { publicTemplates: data?.data, mutatePublicTemplates: mutate };
}
