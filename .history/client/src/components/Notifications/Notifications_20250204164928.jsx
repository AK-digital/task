"use client";
import getNotifications from "@/api/notification";
import styles from "@/styles/components/notifications/notifications.module.css";
import { isNotEmpty } from "@/utils/utils";
import useSWR from "swr";

export default function Notifications({ setNotifOpen }) {
  const { data } = useSWR(
    `${process.env.API_URL}/notification`,
    getNotifications
  );

  const notFound = data?.message === "Aucune notifications trouvées";

  const notifications = data?.data;

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
                  return <li>{notif?.message?.content}</li>;
                })}
            </ul>
          )}
        </div>
      </div>
      <div id="modal-layout-opacity" onClick={(e) => setNotifOpen(false)}></div>
    </>
  );
}
