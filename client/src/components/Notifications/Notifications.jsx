"use client";
import styles from "@/styles/components/notifications/notifications.module.css";
import socket from "@/utils/socket";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import NoPicture from "../User/NoPicture";
import moment from "moment";
import Link from "next/link";

export default function Notifications({ setNotifOpen, notifications, mutate }) {
  // Calculer le nombre de notifications non lues
  const unreadCount = useMemo(() => {
    return notifications?.filter(notif => !notif.read).length || 0;
  }, [notifications]);

  useEffect(() => {
    const getUnreadNotifications = () => {
      return notifications?.filter((notif) => !notif.read);
    };

    const unread = getUnreadNotifications();

    if (notifications?.some((notif) => !notif.read)) {
      socket.emit("unread notifications", unread);
    }

    const handleReadNotifications = () => {
      mutate();
    };

    socket.on("notifications read", handleReadNotifications);

    return () => {
      socket.off("unread notifications", unread);
      socket.off("notifications read", handleReadNotifications);
    };
  }, [socket]);

  return (
    <>
      <div className={styles.container} id="popover">
        <div className={styles.header}>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <div className={styles.unreadCount}>
              {unreadCount} non {unreadCount === 1 ? 'lue' : 'lues'}
            </div>
          )}
        </div>
        {!isNotEmpty(notifications) ? (
          <div className={styles.empty}>
            <span>Vous n'avez aucune notification pour le moment</span>
          </div>
        ) : (
          <ul className={styles.notifications}>
            {notifications?.map((notif, idx) => {
              const dateFromNow = moment(notif?.createdAt).fromNow();
              const isLastItem = idx === notifications.length - 1;

              return (
                <li
                  className={`${styles.notification} ${!notif.read ? styles.unread : ''}`}
                  key={idx}
                >
                  <Link href={`${notif?.link}`}>
                    <div className={styles.left}>
                      {notif?.senderId?.picture ? (
                        <Image
                          src={notif?.senderId?.picture}
                          width={30}
                          height={30}
                          alt={`Photo de profil de ${notif?.senderId?.firstName}`}
                          style={{ borderRadius: "50%" }}
                        />
                      ) : (
                        <NoPicture
                          user={notif?.senderId}
                          width={"30px"}
                          height={"30px"}
                        />
                      )}
                      <div className={styles.message}>
                        <div className={styles.title}>
                          <span>{notif?.message?.title}</span>
                        </div>
                        <div className={styles.content}>
                          {notif?.message?.content}
                        </div>
                      </div>
                    </div>
                    <div className={styles.right}>
                      <div className={styles.date}>{dateFromNow}</div>
                      <div className={styles.bullet}></div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div id="modal-layout-opacity" onClick={(e) => setNotifOpen(false)}></div>
    </>
  );
}
