"use client";
import styles from "@/styles/layouts/project-header.module.css";
import Image from "next/image";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import SearchForm from "@/components/Projects/SearchForm";
import { Bell, UserPlus2 } from "lucide-react";
import GuestFormInvitation from "@/components/Projects/GuestFormInvitation";
import { useState } from "react";
import GuestsModal from "@/components/Projects/GuestsModal";
import Notifications from "@/components/Notifications/Notifications";

export default function ProjectHeader({ project }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
            <div className={styles.notificationBtn}>
              <Bell size={24} onClick={(e) => setNotifOpen(true)} />
              {notifOpen && <Notifications setNotifOpen={setNotifOpen} />}
            </div>
            <div className={styles.separator}></div>
            {/* Guests avatars */}
            <div className={styles.guests}>
              {project?.guests?.map((guest) => (
                <div key={guest._id} className={styles.guestAvatar}>
                  <Image
                    src={guest?.picture || "/default-pfp.webp"}
                    alt={`${guest.firstName} ${guest.lastName}`}
                    width={35}
                    height={35}
                    className={styles.avatar}
                  />
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
