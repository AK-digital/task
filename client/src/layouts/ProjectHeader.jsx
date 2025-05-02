"use client";
import styles from "@/styles/layouts/project-header.module.css";
import Image from "next/image";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import { UserPlus2 } from "lucide-react";
import { useState } from "react";
import GuestsModal from "@/components/Modals/GuestsModal";
import NoPicture from "@/components/User/NoPicture";
import { isNotEmpty } from "@/utils/utils";

export default function ProjectHeader({ project, mutateProject }) {
  const [isOpen, setIsOpen] = useState(false);
  const members = project?.members;

  return (
    <>
      <header className={styles.container}>
        <nav className={styles.nav}>
          <ProjectTitle project={project} />
          <div className={styles.actions}>
            <div className={styles.members}>
              {isNotEmpty(members) &&
                members?.map((member) => (
                  <div key={member?.user?._id} className={styles.guestAvatar}>
                    {member?.user?.picture ? (
                      <Image
                        src={member?.user?.picture || "/default-pfp.webp"}
                        alt={`${member?.user?.firstName} ${member?.user?.lastName}`}
                        width={32}
                        height={32}
                        className={styles.avatar}
                      />
                    ) : (
                      <NoPicture
                        user={member?.user}
                        width={"32px"}
                        height={"32px"}
                      />
                    )}
                  </div>
                ))}
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
          setIsOpen={setIsOpen}
          mutateProject={mutateProject}
        />
      )}
    </>
  );
}
