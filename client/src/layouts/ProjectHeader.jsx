"use client";
import styles from "@/styles/layouts/project-header.module.css";
import Image from "next/image";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import { Archive, Layout, UserPlus2 } from "lucide-react";
import { useState } from "react";
import GuestsModal from "@/components/Modals/GuestsModal";
import NoPicture from "@/components/User/NoPicture";
import Link from "next/link";
import AddTemplate from "@/components/Templates/AddTemplate";
import { isNotEmpty } from "@/utils/utils";
import { useUserRole } from "@/app/hooks/useUserRole";

export default function ProjectHeader({ project, projectInvitations }) {
  const [addTemplate, setAddTemplate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const members = project?.members;
  const canPost = useUserRole(project, ["owner", "manager"]);

  return (
    <>
      <header className={styles.container}>
        <nav className={styles.nav}>
          <ProjectTitle project={project} />

          <div className={styles.actions}>
            {canPost && (
              <div className={styles.template} title="Ajouter un template">
                <Layout size={24} onClick={(e) => setAddTemplate(true)} />
                {addTemplate && (
                  <AddTemplate
                    project={project}
                    setAddTemplate={setAddTemplate}
                  />
                )}
              </div>
            )}
            <div className={styles.archive} title="Archive du projet">
              <Link href={`/projects/${project._id}/archive`}>
                <Archive size={24} />
              </Link>
            </div>
            <div className={styles.separator}></div>
            {/* Guests avatars */}

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
          projectInvitations={projectInvitations}
          setIsOpen={setIsOpen}
        />
      )}
    </>
  );
}
