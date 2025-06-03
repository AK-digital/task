"use client";

import { updateProjectRole } from "@/api/project";
import { updateProjectInvitationRole } from "@/actions/projectInvitation";
import styles from "@/styles/components/dropdown/dropdown.module.css";
import socket from "@/utils/socket";
import { memberRole } from "@/utils/utils";
import { useState } from "react";
import { mutate } from "swr";
import { useTranslation } from "react-i18next";

export function DropDown({
  defaultValue,
  options,
  project,
  member = null,
  invitation = null,
}) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  const handleIsOpen = () => {
    setIsOpen((prev) => !prev);
  };

  async function handleChangeRole(e) {
    const role = e?.currentTarget?.getAttribute("data-value");
    setCurrent(role);
    setIsOpen(false);

    if (!member) {
      const formData = new FormData();
      formData.append("project-id", project?._id);
      formData.append("project-invitation-id", invitation._id);
      formData.append("role", role);
      formData.append("email", invitation.guestEmail);

      const res = await updateProjectInvitationRole(null, formData, t);

      if (res.status === "failure") {
        setCurrent(defaultValue);
      }

      mutate(`/project-invitations/${project?._id}`);
    } else {
      const memberId = member?.user?._id;

      const res = await updateProjectRole(project?._id, memberId, role);

      if (res.status === "failure") {
        setCurrent(defaultValue);
      }

      mutate(`/project/${project?._id}`);
      socket.emit("update-project-role", memberId);
    }
  }

  return (
    <>
      <div className={styles.container}>
        <div onClick={handleIsOpen} className={styles.current}>
          <span>{memberRole(current, t)}</span>
        </div>
        {isOpen && (
          <ul className={styles.options}>
            {options.map((option, idx) => {
              return (
                <li
                  key={idx}
                  className={styles.option}
                  onClick={handleChangeRole}
                  data-value={option}
                >
                  <span>{memberRole(option, t)}</span>
                </li>
              );
            })}
          </ul>
        )}
        {isOpen && <div id="modal-layout-opacity" onClick={handleIsOpen}></div>}
      </div>
    </>
  );
}
