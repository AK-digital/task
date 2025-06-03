import styles from "@/styles/components/timeTrackings/adminFilter.module.css";
import React, { useEffect, useState } from "react";
import DisplayPicture from "../User/DisplayPicture";
import { ChevronDownIcon } from "lucide-react";

export default function AdminFilter({ projects, queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [members, setMembers] = useState([]);

  const hasMembers = currentMembers?.length > 0;

  function uniqueProjectMembers(arr) {
    return arr?.reduce((acc, member) => {
      if (!acc.find((m) => m?.user?._id === member?.user?._id)) {
        acc.push(member);
      }
      return acc;
    }, []);
  }

  useEffect(() => {
    if (queries?.projects?.length === 0 || !queries?.projects) {
      const projectMembers = projects?.map((p) => p?.members).flat();
      const uniqueMembers = uniqueProjectMembers(projectMembers);

      setMembers(uniqueMembers);
    } else {
      const selectedProjects = projects?.filter((p) =>
        queries?.projects?.includes(p?.name)
      );

      const selectedProjectsMembers = selectedProjects
        ?.map((p) => p?.members)
        .flat();

      const uniqueSelectedMembers = uniqueProjectMembers(
        selectedProjectsMembers
      );
      setMembers(uniqueSelectedMembers || []);
    }
  }, [projects, queries]);

  function handleMemberChange(e, member) {
    const isChecked = e.target.checked;

    if (isChecked) {
      const newCurrentMembers = [...currentMembers, member];
      setCurrentMembers(newCurrentMembers);

      const newMemberIds = newCurrentMembers.map((m) => m?.user?._id);
      setQueries({ ...queries, members: newMemberIds });
    } else {
      const newCurrentMembers = currentMembers.filter(
        (m) => m?.user?._id !== member?.user?._id
      );
      setCurrentMembers(newCurrentMembers);

      const newMemberIds = newCurrentMembers.map((m) => m?.user?._id);
      setQueries({ ...queries, members: newMemberIds });
    }
  }

  return (
    <div className={styles.container}>
      <div onClick={() => setIsOpen(!isOpen)} className={styles.current}>
        {hasMembers ? (
          <>
            <span>
              {currentMembers?.map((m) => {
                return (
                  <React.Fragment key={m?.user?._id}>
                    <DisplayPicture
                      user={m?.user}
                      style={{ width: "24px", height: "24px" }}
                    />
                  </React.Fragment>
                );
              })}
            </span>
          </>
        ) : (
          <span>Tous les membres</span>
        )}
        <ChevronDownIcon size={16} className={styles.icon} />
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          <ul className={styles.members}>
            {members?.map((member) => {
              return (
                <li key={member?.user?._id} className={styles.member}>
                  <input
                    type="checkbox"
                    id={`user-${member?.user?._id}`}
                    name="user"
                    onChange={(e) => handleMemberChange(e, member)}
                    value={
                      member?.user?.firstName + " " + member?.user?.lastName
                    }
                    checked={queries?.members?.includes(member?.user?._id)}
                  />
                  <label htmlFor={`user-${member?.user?._id}`}>
                    <DisplayPicture
                      user={member?.user}
                      style={{ width: "22px", height: "22px" }}
                    />
                    <span>
                      {member?.user?.firstName} {member?.user?.lastName}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
