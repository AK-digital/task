
import { getUserPrivateTemplates } from "@/api/template";
import useSWR from "swr";

export function usePrivateTemplate() {
    const fetcher = getUserPrivateTemplates;

    const options = {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    };

    const { data, isLoading, mutate } = useSWR(
        `/template/user-private`,
        fetcher,
        options
    );

    return { privateTemplates: data?.data, mutatePrivateTemplates: mutate };
}
