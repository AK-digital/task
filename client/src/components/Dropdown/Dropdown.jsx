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
        <div
          onClick={handleIsOpen}
          className="bg-accent-color cursor-pointer duration-[80ms] ease-in hover:bg-accent-color-hover p-2 rounded-sm text-small transition-all w-25 h-8"
        >
          <span className="flex items-center justify-center text-white text-center w-full">
            {memberRole(current)}
          </span>
        </div>
        <div
          className={`absolute flex flex-col z-9999 top-10 left-0 gap-0 w-full bg-secondary text-small rounded-sm text-left shadow-medium overflow-hidden transition-all duration-[200ms] ease-in-out ${
            isOpen ? "max-h-96" : "max-h-0"
          } `}
        >
          <ul className="w-full border border-color-border-color max-h-96 overflow-y-auto">
            {options.map((option, idx) => {
              return (
                <li
                  key={idx}
                  className="flex items-center justify-start p-2 cursor-pointer hover:bg-third text-text-darker-color"
                  onClick={handleChangeRole}
                  data-value={option}
                >
                  <span className="flex items-center justify-center">
                    {memberRole(option)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        {isOpen && (
          <div className="modal-layout-opacity" onClick={handleIsOpen}></div>
        )}
      </div>
    </>
  );
}
