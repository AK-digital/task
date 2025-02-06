"use client";
import styles from "@/styles/layouts/project-header.module.css";
import Image from "next/image";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import SearchForm from "@/components/Projects/SearchForm";
import { Bell, UserPlus2 } from "lucide-react";
import { useState } from "react";

export default function ProjectHeader({ project }) {
  const [bellHover, setBellHover] = useState(false);
  return (
    <header className={styles.container}>
      <nav className={styles.nav}>
        <ProjectTitle project={project} />
        <div className={styles.searchContainer}>
          <SearchForm />
        </div>
        <div className={styles.actions}>
          {/* Notifications bell */}
          <div
            className={styles.notificationBtn}
            onMouseEnter={(e) => setBellHover(true)}
            onMouseLeave={(e) => setBellHover(false)}
          >
            {bellHover && <Bell size={24} fill="#ffff" />}
            {!bellHover && <Bell size={24} />}
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
          <div className={styles.addGuestBtn}>
            <UserPlus2 size={24} />
          </div>
        </div>
      </nav>
    </header>
  );
}
