"use client";
import getNotifications from "@/api/notification";
import styles from "@/styles/components/notifications/notifications.module.css";
import socket from "@/utils/socket";
import { isNotEmpty } from "@/utils/utils";
import { useEffect } from "react";
import useSWR from "swr";

export default function Notifications({ setNotifOpen }) {
  const { data, mutate } = useSWR(
    `${process.env.API_URL}/notification`,
    getNotifications
  );

  console.log(data);

  const notFound = data?.message === "Aucune notifications trouvées";

  const notifications = data?.data;

  useEffect(() => {
    socket.on("new notification", () => {
      console.log("worked");
      mutate();
    });
  }, [socket]);

  return (
    <>
      <div className={styles.container} id="popover">
        <div className={styles.header}>
          <span>Notifications</span>
        </div>
        <div>
          {notFound ? (
            <span>Vous n'avez aucune notification pour le moment</span>
          ) : (
            <ul>
              {isNotEmpty(notifications) &&
                notifications?.map((notif) => {
                  return (
                    <li className={styles.notification}>
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
