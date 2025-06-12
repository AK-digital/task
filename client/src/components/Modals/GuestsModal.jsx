"use client";
import { removeGuest } from "@/actions/project";
import { isNotEmpty, memberRole } from "@/utils/utils";
import Image from "next/image";
import { useActionState, useContext, useEffect, useState } from "react";
import GuestFormInvitation from "../Projects/GuestFormInvitation";
import PopupMessage from "@/layouts/PopupMessage";
import { AuthContext } from "@/context/auth";
import { deleteProjectInvitation } from "@/actions/projectInvitation";
import { useUserRole } from "@/app/hooks/useUserRole";
import { DropDown } from "../Dropdown/Dropdown";
import { useProjectInvitation } from "@/app/hooks/useProjectInvitation";
import DisplayPicture from "../User/DisplayPicture";
import socket from "@/utils/socket";

export default function GuestsModal({ project, setIsOpen, mutateProject }) {
  const initialState = {
    status: "pending",
    message: "",
    errors: null,
    guestId: null,
  };

  const { projectInvitations, mutateProjectInvitation } = useProjectInvitation(
    project?._id
  );
  const { uid } = useContext(AuthContext);
  const [isPopup, setIsPopup] = useState(null);
  const removeGuestWithId = removeGuest.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    removeGuestWithId,
    initialState
  );
  const canInvite = useUserRole(project, ["owner", "manager"]);
  const canRemove = useUserRole(project, ["owner", "manager"]);
  const canEditRole = useUserRole(project, ["owner", "manager"]);

  const members = project?.members;

  useEffect(() => {
    if (isPopup) {
      const timeout = setTimeout(() => {
        setIsPopup(null);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [isPopup]);

  useEffect(() => {
    if (state?.status === "success") {
      mutateProject();
      setIsPopup({
        status: state?.status,
        title: "Utilisateur révoqué avec succès",
        message: state?.message,
      });

      socket.emit("update-project", state?.guestId, project?._id);
    }

    if (state?.status === "failure" && state?.errors === null) {
      setIsPopup({
        status: state?.status,
        title: "Une erreur s'est produite",
        message: state?.message,
      });
    }
  }, [state]);

  const options = ["owner", "manager", "team", "customer", "guest"];

  return (
    <>
      <div className="fixed z-2001 top-1/2 left-1/2 -translate-1/2 flex flex-col rounded-lg bg-secondary gap-5 w-full max-w-125 p-6 shadow-[2px_2px_4px_var(--color-foreground)] select-none">
        <div className="text-[1.4rem] font-medium">
          <span>Inviter d'autres utilisateurs</span>
        </div>
        {canInvite && (
          <GuestFormInvitation
            project={project}
            setIsPopup={setIsPopup}
            mutateProjectInvitation={mutateProjectInvitation}
          />
        )}
        {/* Guests list */}
        {isNotEmpty(members) && (
          <div className="border-t border-color-border-color [&_div]:flex [&_div]:justify-between [&_div]:items-center [&_div]:gap-2">
            <ul className="flex flex-col gap-3.5 mt-6">
              {members.map((member) => {
                return (
                  <li
                    key={member?.user?._id}
                    className="flex justify-between items-center gap-3"
                  >
                    <div className="[&_div]:justify-center">
                      <DisplayPicture
                        user={member?.user}
                        style={{ width: "32px", height: "32px" }}
                        className="rounded-full"
                      />
                      <span
                        className="w-55 overflow-hidden text-ellipsis select-all"
                        title={member?.user?.email}
                      >
                        {member?.user?.email}
                      </span>
                      {canEditRole &&
                      member?.user?._id !== uid &&
                      member?.role !== "owner" ? (
                        <DropDown
                          defaultValue={member?.role}
                          options={options}
                          project={project}
                          member={member}
                        />
                      ) : (
                        <div className="w-full text-small">
                          <span className="text-center w-full text-text-color-muted">
                            {memberRole(member?.role)}
                          </span>
                        </div>
                      )}
                    </div>
                    {canRemove && member?.role !== "owner" && (
                      <form action={formAction}>
                        <input
                          type="text"
                          name="guest-id"
                          id="guest-id"
                          defaultValue={member?.user?._id}
                          hidden
                        />
                        <button
                          type="submit"
                          data-disabled={pending}
                          disabled={pending}
                          className="rounded-sm p-2 text-small bg-danger-color h-8 hover:bg-text-color-red"
                        >
                          Révoquer
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {isNotEmpty(projectInvitations) && (
          <div className="border-t border-color-border-color [&_div]:flex [&_div]:justify-between [&_div]:items-center [&_div]:gap-2 ">
            <ul className="flex flex-col gap-3.5">
              <ProjectInvitationsList
                projectInvitations={projectInvitations}
                setIsPopup={setIsPopup}
                project={project}
                mutateProjectInvitation={mutateProjectInvitation}
              />
            </ul>
          </div>
        )}
      </div>
      <div className="modal-layout" onClick={(e) => setIsOpen(false)}></div>
      {isPopup && (
        <PopupMessage
          status={isPopup?.status}
          title={isPopup?.title}
          message={isPopup?.message}
        />
      )}
    </>
  );
}

export function ProjectInvitationsList({
  projectInvitations,
  setIsPopup,
  project,
  mutateProjectInvitation,
}) {
  const initialState = {
    status: "pending",
    message: "",
  };

  const [state, formAction, pending] = useActionState(
    deleteProjectInvitation,
    initialState
  );

  const canDelete = useUserRole(project, ["owner", "manager"]);
  const canEditRole = useUserRole(project, ["owner", "manager"]);

  useEffect(() => {
    if (state?.status === "success") {
      mutateProjectInvitation();
      setIsPopup({
        status: state?.status,
        title: "Invitation annulée avec succès",
        message: state?.message || "L'invitation a été annulée avec succès",
      });

      socket.emit("update-project-invitation", project?._id);
    }
    if (state?.status === "failure") {
      setIsPopup({
        status: state?.status,
        title: "Une erreur s'est produite",
        message:
          state?.message ||
          "Une erreur s'est produite lors de l'annulation de l'invitation",
      });
    }
  }, [state]);

  return (
    <>
      {projectInvitations.map((inv) => (
        <li
          key={inv?._id}
          className="flex justify-between items-center gap-3 text-text-color-muted mt-3"
        >
          <div>
            <Image
              src={"/default-pfp.webp"}
              width={32}
              height={32}
              alt={`Photo de profil de ${inv?.guestEmail}`}
              className="rounded-full"
            />
            <span className="w-45 whitespace-nowrap overflow-hidden text-ellipsis">
              {inv?.guestEmail}
            </span>
          </div>
          {canEditRole && (
            <DropDown
              defaultValue={inv?.role}
              options={["owner", "manager", "team", "customer", "guest"]}
              invitation={inv}
              project={project}
            />
          )}
          {canDelete && (
            <form action={formAction}>
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
                className="rounded-sm p-2 text-small bg-danger-color h-8 hover:bg-text-color-red"
              >
                Annuler
              </button>
            </form>
          )}
        </li>
      ))}
    </>
  );
}
