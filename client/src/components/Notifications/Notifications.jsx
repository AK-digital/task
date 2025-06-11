"use client";

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
      <div className="absolute flex flex-col top-[54px] right-0 w-[560px] z-2001 p-0 pr-2 max-h-[400px] overflow-y-auto rounded-lg bg-secondary shadow-medium select-none">
        <div className="sticky flex justify-between items-center top-0 z-2 border-b border-text-medium-color font-bold text-normal p-[14px]">
          <span>{t("notifications.title")}</span>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="py-0.5 px-2 bg-accent-color text-small rounded-xl font-medium text-white">
                {unreadCount}{" "}
                {unreadCount === 1
                  ? t("notifications.unread_singular")
                  : t("notifications.unread_plural")}
              </div>
              <button
                onClick={handleReadNotifications}
                data-disabled={isLoading}
                disabled={isLoading}
                className="bg-transparent text-accent-color-light text-small rounded-sm shadow-none hover:bg-[#a87e511a] hover:shadow-none data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-[#a87e511a]"
              >
                {t("notifications.mark_all_read")}
              </button>
            </div>
          )}
        </div>
        {!isNotEmpty(notifications) ? (
          <div className="text-center p-6 text-text-color-muted italic">
            <span>{t("notifications.empty_message")}</span>
          </div>
        ) : (
          <ul className="h-full overflow-y-auto">
            {notifications?.map((notif, idx) => {
              const dateFromNow = moment(notif?.createdAt).fromNow();
              return (
                <li
                  data-read={notif?.read}
                  key={idx}
                  onClick={(e) => handleReadNotification(e, notif)}
                  className="flex justify-between flex-row gap-1 cursor-pointer no-underline w-full text-text-medium-color transition-[background-color] duration-200 p-[14px] hover:bg-third data-[read=false]:bg-accent-color-transparent"
                >
                  <div className="flex gap-2">
                    {notif?.senderId?.picture ? (
                      <Image
                        src={notif?.senderId?.picture}
                        width={30}
                        height={30}
                        alt={`${t("general.profile_picture_alt")} ${
                          notif?.senderId?.firstName
                        }`}
                        style={{ borderRadius: "50%" }}
                        className="rounded-full max-h-[30px] min-w-[30px]"
                      />
                    ) : (
                      <NoPicture
                        user={notif?.senderId}
                        width={"30px"}
                        height={"30px"}
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <div className="text-normal font-medium text-text-darker-color">
                        <span>{getNotificationTitle(notif, t)}</span>
                      </div>
                      <div className="text-small text-text-color-muted">
                        {getNotificationContent(notif, t)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center border-b-0 gap-2">
                    <div className="text-small text-text-color-muted self-start text-right min-w-max">
                      {dateFromNow}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div
        className="modal-layout-opacity"
        onClick={(e) => setNotifOpen(false)}
      ></div>
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
