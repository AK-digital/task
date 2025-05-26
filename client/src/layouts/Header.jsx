"use client";

import styles from "@/styles/layouts/header.module.css";
import Notifications from "@/components/Notifications/Notifications";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import { Bell, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { getNotifications } from "@/api/notification";

export default function Header() {
  const { user } = useContext(AuthContext);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data, isLoading, mutate } = useSWR(
    `${process.env.API_URL}/notification`,
    getNotifications
  );
  const notificationsData = data?.data;

  useEffect(() => {
    const handleNewNotification = () => {
      mutate();
    };

    socket.on("new notification", handleNewNotification);

    return () => {
      socket.off("new notification", handleNewNotification);
    };
  }, [socket, mutate]);

  // Count the number of unread notifications
  const unreadNotifications = notificationsData?.filter((notif) => !notif.read);
  const unreadCount = unreadNotifications?.length;

  return (
    <header className="w-full py-2.5 h-spacing-header-height">
      <nav className="flex justify-between items-center h-full ml-30 mr-10">
        <div className="[&_svg]:text-text-dark-color">
          <Link href={"/time-trackings"}>
            <Timer size={24} cursor={"pointer"} />
          </Link>
        </div>
        <ul className="relative flex items-center gap-6">
          <li className="relative action flex justify-center items-center h-full">
            <Bell
              size={22}
              onClick={(e) => setNotifOpen(true)}
              data-open={notifOpen}
              className="hover:fill-text-darker-color hover:cursor-pointer data-[open=true]:fill-text-darker-color "
            />
            {unreadCount > 0 && <div className="absolute w-[11px] h-[11px] top-3 left-3 rounded-full bg-danger-color"></div>}
            {notifOpen && (
              <Notifications
                setNotifOpen={setNotifOpen}
                notifications={notificationsData}
                unreadNotifications={unreadNotifications}
                unreadCount={unreadCount}
                mutate={mutate}
              />
            )}
          </li>
          <li>
            <Link href={"/profile"}>
              <Image
                src={user?.picture || "/default-pfp.webp"}
                alt={`Photo de profil de ${user?.firstName}`}
                width={38}
                height={38}
                quality={100}
                className="rounded-full max-h-[38px] max-w-[38px] object-cover"
              />
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
