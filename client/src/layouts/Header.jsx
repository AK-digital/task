"use client";

import styles from "@/styles/layouts/header.module.css";
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
    <header className={styles.container}>
      <nav className={styles.nav}>
        <ul className={styles.actions}>
          <li className={styles.action}>
            <Bell
              size={22}
              onClick={(e) => setNotifOpen(true)}
              data-open={notifOpen}
              className={styles.bell}
            />
            {unreadCount > 0 && <div className={styles.unread}></div>}
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
          <li className={styles.user}>
            <Link href={"/profile"}>
              <Image
                src={user?.picture || "/default-pfp.webp"}
                alt={`Photo de profil de ${user?.firstName}`}
                width={38}
                height={38}
                quality={100}
                style={{ borderRadius: "50%" }}
              />
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
