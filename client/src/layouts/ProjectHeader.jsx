"use client";
import styles from "@/styles/layouts/project-header.module.css";
import Image from "next/image";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import SearchForm from "@/components/Projects/SearchForm";
import { Bell, UserPlus2 } from "lucide-react";
import { useEffect, useState } from "react";
import GuestsModal from "@/components/Modals/GuestsModal";
import Notifications from "@/components/Notifications/Notifications";
import NoPicture from "@/components/User/NoPicture";
import getNotifications from "@/api/notification";
import useSWR from "swr";
import socket from "@/utils/socket";

export default function ProjectHeader({ project }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data, mutate } = useSWR(
    `${process.env.API_URL}/notification`,
    getNotifications
  );

  useEffect(() => {
    const handleNewNotification = () => {
      mutate();
    };

    socket.on("new notification", handleNewNotification);

    return () => {
      socket.off("new notification", handleNewNotification);
    };
  }, [socket, mutate]);

  const hasUnread = data?.data?.some((notif) => !notif.read);
  return (
    <>
      <header className={styles.container}>
        <nav className={styles.nav}>
          <ProjectTitle project={project} />
          <div className={styles.searchContainer}>
            <SearchForm />
          </div>
          <div className={styles.actions}>
            {/* Notifications bell */}
            <div className={styles.notificationBtn} data-open={notifOpen}>
              <Bell size={24} onClick={(e) => setNotifOpen(true)} />
              {hasUnread && <div className={styles.unread}></div>}
              {notifOpen && (
                <Notifications
                  setNotifOpen={setNotifOpen}
                  notifications={data?.data}
                  mutate={mutate}
                />
              )}
            </div>
            <div className={styles.separator}></div>
            {/* Guests avatars */}
            <div className={styles.guests}>
              {project?.guests?.map((guest) => (
                <div key={guest._id} className={styles.guestAvatar}>
                  {guest?.picture ? (
                    <Image
                      src={guest?.picture || "/default-pfp.webp"}
                      alt={`${guest.firstName} ${guest.lastName}`}
                      width={35}
                      height={35}
                      className={styles.avatar}
                    />
                  ) : (
                    <NoPicture user={guest} width={"35px"} height={"35px"} />
                  )}
                </div>
              ))}
              {/* Project author */}
              <div className={styles.guestAvatar}>
                <Image
                  src={project?.author?.picture || "/default-pfp.webp"}
                  alt={`${project?.author?.firstName} ${project?.author?.lastName}`}
                  width={35}
                  height={35}
                  className={styles.avatar}
                />
              </div>
            </div>
            <div
              className={styles.addGuestBtn}
              onClick={(e) => setIsOpen(true)}
            >
              <UserPlus2 size={24} />
            </div>
          </div>
        </nav>
      </header>
      {isOpen && <GuestsModal project={project} setIsOpen={setIsOpen} />}
    </>
  );
}
