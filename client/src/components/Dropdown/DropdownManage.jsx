import React, { useState } from "react";
import { Settings, X } from "lucide-react";
import { useUserRole } from "../../../hooks/useUserRole";
import GuestFormResend from "../Projects/GuestFormResend";
import { leaveProject } from "@/api/project";
import { useRouter } from "next/navigation";

export default function DropdownManage({
  project,
  setIsPopup,
  mutateProjectInvitation,
  email,
  formAction,
  pending,
  inv,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleIsOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const canInvite = useUserRole(project, ["owner", "manager"]);
  const canDelete = useUserRole(project, ["owner", "manager"]);

  return (
    <>
      <div className="relative text-center text-text-color-muted select-none data-[active=true]:z-9999 !gap-0">
        <button
          onClick={handleIsOpen}
          className="relative flex justify-center items-center gap-[5px] h-8 bg-color-medium-color rounded-sm text-small w-25 hover:bg-color-medium-color/80"
        >
          <Settings size={16} />
          <span>Gérer</span>
        </button>
        <div
          className={`absolute z-9999 top-10 left-0 w-full bg-secondary text-small rounded-sm overflow-hidden text-left shadow-medium transition-all duration-[350ms] ease-in-out ${
            isOpen ? "max-h-[200px]" : "max-h-0"
          }`}
        >
          <ul className="flex justify-center items-center flex-col gap-0 w-full border border-color-border-color rounded-sm">
            <li className="group flex justify-start items-center w-full h-full">
              {canDelete && (
                <form action={formAction} className="w-full">
                  <input
                    type="text"
                    name="project-invitation-id"
                    id="project-invitation-id"
                    defaultValue={inv?._id}
                    hidden
                  />
                  <input
                    type="text"
                    name="project-id"
                    id="project-id"
                    defaultValue={inv?.projectId}
                    hidden
                  />
                  <button
                    type="submit"
                    data-disabled={pending}
                    disabled={pending}
                    className="flex justify-start items-center gap-[10px] text-text-color-muted py-2 px-[5px] bg-transparent rounded-none w-full hover:bg-third group-hover:text-text-dark-color"
                  >
                    <X
                      size={16}
                      className="transition-all duration-200 text-text-color-muted group-hover:text-text-dark-color"
                    />
                    <span className="text-small">Retirer</span>
                  </button>
                </form>
              )}
            </li>
            <li className="group flex justify-start items-center w-full h-full">
              {canInvite && (
                <GuestFormResend
                  project={project}
                  setIsPopup={setIsPopup}
                  mutateProjectInvitation={mutateProjectInvitation}
                  currentEmail={inv?.guestEmail}
                />
              )}
            </li>
          </ul>
        </div>

        {isOpen && (
          <div className="modal-layout-opacity" onClick={handleIsOpen}></div>
        )}
      </div>
    </>
  );
}
