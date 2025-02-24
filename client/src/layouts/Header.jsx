"use client";

import styles from "@/styles/layouts/header.module.css";
import getNotifications from "@/api/notification";
import Notifications from "@/components/Notifications/Notifications";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import { Bell, MoreHorizontal, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";

export default function Header() {
  const { user } = useContext(AuthContext);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data, mutate } = useSWR(
    `${process.env.API_URL}/notification`,
    getNotifications
  );

  useEffect(() => {
    const handleNewNotification = () => {
      mutate();
    };

    socket.on("new notification", handleNewNotification);

    return () => {
      socket.off("new notification", handleNewNotification);
    };
  }, [socket, mutate]);

  const hasUnread = data?.data?.some((notif) => !notif.read);

  return (
    <header className={styles.container}>
      <nav className={styles.nav}>
        <Image
          src={"/task-logo.svg"}
          width={70}
          height={70}
          alt="Logo de Täsk"
          className={styles.logo}
        />
        <ul className={styles.actions}>
          <li>
            <Bell
              size={24}
              onClick={(e) => setNotifOpen(true)}
              data-open={notifOpen}
              className={styles.bell}
            />
            {hasUnread && <div className={styles.unread}></div>}
            {notifOpen && (
              <Notifications
                setNotifOpen={setNotifOpen}
                notifications={data?.data}
                mutate={mutate}
              />
            )}
          </li>
          <li className={styles.user}>
            <Link href={"/profile"}>
              <Image
                src={user?.picture || "/default-pfp.webp"}
                alt={`Photo de profil de ${user?.firstName}`}
                width={40}
                height={40}
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
