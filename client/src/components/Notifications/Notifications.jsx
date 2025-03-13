"use client";

import styles from "@/styles/components/notifications/notifications.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import NoPicture from "../User/NoPicture";
import moment from "moment";
import { useRouter } from "next/navigation";
import { readNotification, readNotifications } from "@/api/notification";
import Link from "next/link";
import { useState } from "react";

export default function Notifications({
  setNotifOpen,
  notifications,
  unreadNotifications,
  unreadCount,
  mutate,
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Read the notification on click and redirect the user to notification link
  const handleReadNotification = async (e, notification) => {
    e.preventDefault();

    const res = await readNotification(notification?._id);

    if (res?.success) {
      await mutate(); // Refresh the notifications
      setNotifOpen(false);
      router.push(notification.link);
    }
  };

  const handleReadNotifications = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Get the ids of the unread notifications
    const ids = unreadNotifications.map((notif) => notif?._id);

    const res = await readNotifications(ids);

    if (res?.success) {
      await mutate(); // Refresh the notifications
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container} id="popover">
        <div className={styles.header}>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <div className={styles.headerActions}>
              <div className={styles.unreadCount}>
                {unreadCount} non {unreadCount === 1 ? "lue" : "lues"}
              </div>
              <button
                className={styles.readAllButton}
                onClick={handleReadNotifications}
                data-disabled={isLoading}
                disabled={isLoading}
              >
                Tout marquer comme lu
              </button>
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
              return (
                <li
                  className={styles.notification}
                  data-read={notif?.read}
                  key={idx}
                  onClick={(e) => handleReadNotification(e, notif)}
                >
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
                  </div>
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
