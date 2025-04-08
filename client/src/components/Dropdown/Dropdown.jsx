"use client";

import { updateProjectRole } from "@/api/project";
import styles from "@/styles/components/dropdown/dropdown.module.css";
import socket from "@/utils/socket";
import { memberRole } from "@/utils/utils";
import { useState } from "react";
import { mutate } from "swr";

export function DropDown({ defaultValue, options, project, member }) {
  const [current, setCurrent] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  const handleIsOpen = () => {
    setIsOpen((prev) => !prev);
  };

  async function handleChangeRole(e) {
    const memberId = member?.user?._id;
    const role = e?.currentTarget?.getAttribute("data-value");
    setCurrent(role);

    setIsOpen(false);
    const res = await updateProjectRole(project?._id, memberId, role);

    if (!res.success) {
      setCurrent(defaultValue);
    }

    mutate(`/project/${project?._id}`);

    socket.emit("update-project-role", memberId);
  }

  return (
    <>
      <div className={styles.container}>
        <div onClick={handleIsOpen} className={styles.current}>
          <span>{memberRole(current)}</span>
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
                  <span>{memberRole(option)}</span>
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
