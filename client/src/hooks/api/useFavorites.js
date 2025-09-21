import { getFavorites } from "@/api/favorite";
import useSWR from "swr";

export function useFavorites() {
  const fetcher = getFavorites;

  const { data, isLoading, isValidating, mutate } = useSWR(
    "/favorite",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );

  return {
    favorites: data,
    favoritesLoading: isLoading,
    favoritesMutate: mutate,
  };
}
