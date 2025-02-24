"use client";
import styles from "@/styles/layouts/project-header.module.css";
import Image from "next/image";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import SearchForm from "@/components/Projects/SearchForm";
import { Archive, UserPlus2 } from "lucide-react";
import { useEffect, useState } from "react";
import GuestsModal from "@/components/Modals/GuestsModal";
import NoPicture from "@/components/User/NoPicture";
import getNotifications from "@/api/notification";
import useSWR from "swr";
import socket from "@/utils/socket";
import Link from "next/link";

export default function ProjectHeader({ project, projectInvitations }) {
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

  return (
    <>
      <div className={styles.top}></div>
      <header className={styles.container}>
        <nav className={styles.nav}>
          <ProjectTitle project={project} />
          <div className={styles.searchContainer}>
            <SearchForm />
          </div>
          <div className={styles.actions}>
            <div title="Archive du projet">
              <Link href={`/projects/${project._id}/archive`}>
                <Archive size={24} />
              </Link>
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
                      width={32}
                      height={32}
                      className={styles.avatar}
                    />
                  ) : (
                    <NoPicture user={guest} width={"32px"} height={"32px"} />
                  )}
                </div>
              ))}
              {/* Project author */}
              <div className={styles.guestAvatar}>
                <Link href={"/profile"}>
                  <Image
                    src={project?.author?.picture || "/default-pfp.webp"}
                    alt={`${project?.author?.firstName} ${project?.author?.lastName}`}
                    width={32}
                    height={32}
                    className={styles.avatar}
                  />
                </Link>
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
      {isOpen && (
        <GuestsModal
          project={project}
          projectInvitations={projectInvitations}
          setIsOpen={setIsOpen}
        />
      )}
    </>
  );
}
