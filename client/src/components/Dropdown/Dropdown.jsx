"use client";

import { updateProjectRole } from "@/api/project";
import { updateProjectInvitationRole } from "@/actions/projectInvitation";
import socket from "@/utils/socket";
import { memberRole } from "@/utils/utils";
import { useState } from "react";
import { mutate } from "swr";

export function DropDown({
  defaultValue,
  options,
  project,
  member = null,
  invitation = null,
}) {
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

      const res = await updateProjectInvitationRole(null, formData);

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
      <div className="relative select-none">
        <div onClick={handleIsOpen} className="p-2 bg-color-accent-color w-full text-text-size-small rounded-sm cursor-pointer transition-all ease-in duration-[80ms] hover:bg-color-accent-color-hover">
          <span className="text-white text-center w-full">{memberRole(current)}</span>
        </div>
        {isOpen && (
          <ul className="absolute flex flex-col z-9999 top-10 left-0 gap-0 w-full bg-background-secondary-color text-text-size-small rounded-sm max-h-50 overflow-auto text-left shadow-shadow-box-medium">
            {options.map((option, idx) => {
              return (
                <li
                  key={idx}
                  className="p-2 cursor-pointer hover:bg-background-third-color text-text-darker-color"
                  onClick={handleChangeRole}
                  data-value={option}
                >
                  <span>{memberRole(option)}</span>
                </li>
              );
            })}
          </ul>
        )}
        {isOpen && <div className="modal-layout-opacity" onClick={handleIsOpen}></div>}
      </div>
    </>
  );
}
