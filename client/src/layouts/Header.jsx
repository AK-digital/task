"use client";

import Notifications from "@/components/Notifications/Notifications";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import { Bell } from "lucide-react";
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
    <header className="w-full py-2.5 h-header-height">
      <nav className="flex justify-end items-center h-full ml-30 mr-10">
        <ul className="relative flex items-center gap-6 overflow-visible">
          <li className="relative flex justify-center items-center h-full overflow-visible">
            <button
              onClick={(e) => setNotifOpen(true)}
              className="group relative px-0.5 h-full bg-transparent overflow-visible"
            >
              <Bell
                size={22}
                data-open={notifOpen}
                className="group-hover:fill-text-darker-color  data-[open=true]:fill-text-darker-color text-text-darker-color"
              />
              {/* {unreadCount > 0 && (
                <div className="absolute w-[11px] h-[11px] top-3 right-0 rounded-full bg-red-500 animate-ping"></div>
              )} */}
              {unreadCount > 0 && (
                <div className="absolute w-[11px] h-[11px] top-3 right-0 rounded-full bg-text-color-red"></div>
              )}
            </button>
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
                className="rounded-full max-h-[38px] max-w-[38px] object-cover select-none"
              />
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
