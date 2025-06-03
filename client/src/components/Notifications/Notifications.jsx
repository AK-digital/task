"use client";

import styles from "@/styles/components/notifications/notifications.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import NoPicture from "../User/NoPicture";
import moment from "moment";
import { useRouter } from "next/navigation";
import { readNotification, readNotifications } from "@/api/notification";
import { useTranslation } from "react-i18next";
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

  const { t } = useTranslation();

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
          <span>{t("notifications.title")}</span>
          {unreadCount > 0 && (
            <div className={styles.headerActions}>
              <div className={styles.unreadCount}>
                {unreadCount}{" "}
                {unreadCount === 1
                  ? t("notifications.unread_singular")
                  : t("notifications.unread_plural")}
              </div>
              <button
                className={styles.readAllButton}
                onClick={handleReadNotifications}
                data-disabled={isLoading}
                disabled={isLoading}
              >
                {t("notifications.mark_all_read")}
              </button>
            </div>
          )}
        </div>
        {!isNotEmpty(notifications) ? (
          <div className={styles.empty}>
            <span>{t("notifications.empty_message")}</span>
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
                        alt={`${t("general.profile_picture_alt")} ${
                          notif?.senderId?.firstName
                        }`}
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
                        <span>{getNotificationTitle(notif, t)}</span>
                      </div>
                      <div className={styles.content}>
                        {getNotificationContent(notif, t)}
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

// Fonction helper pour générer le titre selon le type
function getNotificationTitle(notification, t) {
  const senderName = `${notification?.senderId?.firstName} ${notification?.senderId?.lastName}`;

  switch (notification?.type) {
    case "mention":
      return t("notifications.mentioned_title", { senderName });
    case "reaction":
      return t("notifications.reacted_title", { senderName });
    case "task_assigned":
      return t("notifications.task_assigned_title", {
        senderName,
        ...notification?.params,
      });
    case "project_invitation":
      return t("notifications.project_invitation_title", {
        senderName,
        ...notification?.params,
      });
    default:
      return t("notifications.generic_title");
  }
}

// Fonction helper pour générer le contenu selon le type
function getNotificationContent(notification, t) {
  const senderName = `${notification?.senderId?.firstName} ${notification?.senderId?.lastName}`;

  switch (notification?.type) {
    case "mention":
      return t("notifications.mentioned_content", {
        senderName,
        ...notification?.params,
      });
    case "reaction":
      return t("notifications.reacted_content", {
        senderName,
        ...notification?.params,
      });
    case "task_assigned":
      return t("notifications.task_assigned_content", {
        senderName,
        ...notification?.params,
      });
    case "project_invitation":
      return t("notifications.project_invitation_content", {
        senderName,
        ...notification?.params,
      });
    default:
      return t("notifications.generic_content");
  }
}
