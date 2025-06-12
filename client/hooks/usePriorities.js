import { getPrioritiesByProjects, getPriorityByProject } from "@/api/priority";
import useSWR from "swr";

export function usePriorities(projectId, initialPriorities) {
  const fetcher = getPriorityByProject.bind(null, projectId);

  const options = {
    revalidateOnMount: true,
    revalidateOnFocus: false,
  };

  if (initialPriorities) options.fallbackData = initialPriorities;

  const { data, isLoading, mutate } = useSWR(
    `/priority/project/${projectId}`,
    fetcher,
    options
  );

  return { priorities: data, mutatePriorities: mutate };
}

export function usePrioritiesByProjects() {
  const fetcher = getPrioritiesByProjects;

  const options = {
    revalidateOnMount: true,
    revalidateOnFocus: false,
  };

  const { data, isLoading, mutate } = useSWR(`/priority`, fetcher, options);

  return { priorities: data, mutatePriorities: mutate };
}
