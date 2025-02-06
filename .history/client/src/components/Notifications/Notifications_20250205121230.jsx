"use client";
import styles from "@/styles/components/notifications/notifications.module.css";
import socket from "@/utils/socket";
import { isNotEmpty } from "@/utils/utils";
import { useEffect } from "react";

export default function Notifications({ setNotifOpen, notifications, mutate }) {
  useEffect(() => {
    const handleReadNotifications = () => {
      return notifications?.filter((notif) => !notif.read);
    };

    const unread = handleReadNotifications();

    if (notifications?.some((notif) => !notif.read)) {
      socket.emit("unread notifications", unread);
    }

    socket.on("notifications read", (data) => {
    
    return () => {
      socket.off("unread notifications", unread);
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
            <ul>
              {notifications?.map((notif, idx) => {
                return (
                  <li className={styles.notification} key={idx}>
                    <div className={styles.title}>
                      <span>{notif?.message?.title}</span>
                    </div>
                    <div className={styles.content}>
                      <span>{notif?.message?.content}</span>
                    </div>
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
