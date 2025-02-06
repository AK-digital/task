"use client";
import styles from "@/styles/components/notifications/notifications.module.css";
import socket from "@/utils/socket";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { useEffect } from "react";
import NoPicture from "../User/NoPicture";
import moment from "moment";
import Link from "next/link";

export default function Notifications({ setNotifOpen, notifications, mutate }) {
  console.log(notifications);
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
        </div>
        <div>
          {!isNotEmpty(notifications) ? (
            <span>Vous n'avez aucune notification pour le moment</span>
          ) : (
            <ul className={styles.notifications}>
              {notifications?.map((notif, idx) => {
                const dateFromNow = moment(notif?.createdAt).fromNow();
                return (
                  <li className={styles.notification} key={idx}>
                    <Link>
                      <div>
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
                      </div>
                      <div className={styles.message}>
                        <div className={styles.title}>
                          <span>{notif?.message?.title}</span>
                        </div>
                        <div className={styles.content}>
                          <span>{notif?.message?.content}</span>
                        </div>
                      </div>
                      <div className={styles.date}>
                        <span>{dateFromNow}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <div id="modal-layout-opacity" onClick={(e) => setNotifOpen(false)}></div>
    </>
  );
}
