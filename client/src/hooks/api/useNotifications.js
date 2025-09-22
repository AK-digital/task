import { getNotifications } from "@/api/notification";
import useSWR from "swr";

export function useNotifications() {
  const { data, isLoading, mutate, error } = useSWR(
    "/notifications",
    getNotifications,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 5000,
    }
  );

  const notifications = data?.data || [];
  const unreadNotifications = notifications.filter((notif) => !notif.read);
  const unreadCount = unreadNotifications.length;

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    notificationsLoading: isLoading,
    notificationsError: error,
    mutateNotifications: mutate,
  };
}
