"use server";
import styles from "@/styles/layouts/project-header.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import SearchForm from "@/components/Projects/SearchForm";
import { Bell, LucideUserPlus2, UserPlus, UserPlus2 } from "lucide-react";

export default async function ProjectHeader({ project }) {
  return (
    <header className={styles.container}>
      <nav className={styles.nav}>
        <ProjectTitle project={project} />

        <div className={styles.searchContainer}>
          <SearchForm />
        </div>

        <div className={styles.actions}>
          {/* Notifications bell */}
          <button className={styles.notificationBtn}>
            <Bell size={24} />
          </button>
          {/* Guests avatars */}
          <div className={styles.guests}>
            {project?.guests?.map((guest) => (
              <div key={guest._id} className={styles.guestAvatar}>
                <Image
                  src={guest?.picture || "/default-pfp.webp"}
                  alt={`${guest.firstName} ${guest.lastName}`}
                  width={35}
                  height={32}
                  className={styles.avatar}
                />
              </div>
            ))}
            {/* Project author */}
            <div className={styles.guestAvatar}>
              <Image
                src={project?.author?.picture || "/default-pfp.webp"}
                alt={`${project?.author?.firstName} ${project?.author?.lastName}`}
                width={32}
                height={32}
                className={styles.avatar}
              />
            </div>
            <div className={styles.addGuestBtn}>
              <UserPlus2 size={24} />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
