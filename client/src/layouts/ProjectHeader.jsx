"use client";
import styles from "@/styles/layouts/project-header.module.css";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import { UserPlus2 } from "lucide-react";
import { useState } from "react";
import GuestsModal from "@/components/Modals/GuestsModal";
import { isNotEmpty } from "@/utils/utils";
import TasksFilters from "@/components/tasks/TasksFilters";
import DisplayPicture from "@/components/User/DisplayPicture";

export default function ProjectHeader({
  project,
  displayedFilters,
  queries,
  setQueries,
  mutateProject,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const members = project?.members;

  return (
    <>
      <header className={styles.container}>
        <nav className={styles.nav}>
          <ProjectTitle project={project} />
          <TasksFilters
            displayedFilters={displayedFilters}
            queries={queries}
            setQueries={setQueries}
          />
          <div className={styles.actions}>
            <div className={styles.members}>
              {isNotEmpty(members) &&
                members?.map((member) => (
                  <div key={member?.user?._id} className={styles.guestAvatar}>
                    <DisplayPicture
                      user={member?.user}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        marginTop: "5px",
                        objectFit: "cover",
                      }}
                    />
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
