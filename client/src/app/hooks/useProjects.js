import { getProjects } from "@/api/project";
import useSWR from "swr";

export function useProjects() {
  const fetcher = getProjects;

  const { data, isLoading, isValidating, mutate } = useSWR(
    "/project",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );

  return {
    projects: data,
  };
}
