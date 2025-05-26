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
      <div id="popover" className="flex flex-col top-10 right-[50px] w-[560px] p-0 pr-2 max-h-[400px] overflow-y-auto rounded-2xl shadow-shadow-box-medium">
        <div className="sticky flex justify-between items-center top-0 z-2 border-b border-text-medium-color font-bold text-text-size-normal p-[14px]">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="py-0.5 px-2 bg-color-accent-color text-text-size-small rounded-xl font-medium text-white">
                {unreadCount} non {unreadCount === 1 ? "lue" : "lues"}
              </div>
              <button
                onClick={handleReadNotifications}
                data-disabled={isLoading}
                disabled={isLoading}
                className="bg-transparent text-text-accent-color py-1 px-2 text-text-size-small rounded-sm shadow-none hover:bg-[#a87e511a] hover:shadow-none data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-[#a87e511a]"
              >
                Tout marquer comme lu
              </button>
            </div>
          )}
        </div>
        {!isNotEmpty(notifications) ? (
          <div className="text-center p-6 text-text-color-muted italic">
            <span>Vous n'avez aucune notification pour le moment</span>
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
                  className="flex justify-between flex-row gap-1 cursor-pointer no-underline w-full text-text-medium-color transition-[background-color] duration-200 p-[14px] hover:bg-background-third-color data-[read=false]:bg-color-accent-color-transparent"
                >
                  <div className="flex gap-2">
                    {notif?.senderId?.picture ? (
                      <Image
                        src={notif?.senderId?.picture}
                        width={30}
                        height={30}
                        alt={`Photo de profil de ${notif?.senderId?.firstName}`}
                        className="rounded-full max-h-[30px]"
                      />
                    ) : (
                      <NoPicture
                        user={notif?.senderId}
                        width={"30px"}
                        height={"30px"}
                      />
                    )}
                    <div className="flex flex-col gap-1 p-[14px]">
                      <div className="text-text-size-normal font-medium">
                        <span>{notif?.message?.title}</span>
                      </div>
                      <div className="text-text-size-small text-text-color-muted">
                        {notif?.message?.content}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end border-b-0 gap-2">
                    <div className="text-text-size-small text-text-color-muted self-start text-right min-w-max">{dateFromNow}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="modal-layout-opacity" onClick={(e) => setNotifOpen(false)}></div>
    </>
  );
}
