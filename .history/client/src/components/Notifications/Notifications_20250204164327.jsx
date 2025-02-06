"use client";
import getNotifications from "@/api/notification";
import styles from "@/styles/components/notifications/notifications.module.css";
import useSWR from "swr";

export default function Notifications({ setNotifOpen }) {
  const { data } = useSWR(
    `${process.env.API_URL}/notification`,
    getNotifications
  );

  return (
    <>
      <div className={styles.container} id="popover">
        <div>
          <span>Notifications</span>
        </div>
      </div>
      <div id="modal-layout-opacity" onClick={(e) => setNotifOpen(false)}></div>
    </>
  );
}
