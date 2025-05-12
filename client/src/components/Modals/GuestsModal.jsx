"use client";
import { removeGuest } from "@/actions/project";
import styles from "@/styles/components/modals/guests-modal.module.css";
import { isNotEmpty, memberRole } from "@/utils/utils";
import Image from "next/image";
import { useActionState, useContext, useEffect, useState } from "react";
import GuestFormInvitation, {
  GuestFormResend,
} from "../Projects/GuestFormInvitation";
import PopupMessage from "@/layouts/PopupMessage";
import { AuthContext } from "@/context/auth";
import { deleteProjectInvitation } from "@/actions/projectInvitation";
import NoPicture from "../User/NoPicture";
import { useUserRole } from "@/app/hooks/useUserRole";
import { DropDownRole } from "../Dropdown/DropdownRole";
import { useProjectInvitation } from "@/app/hooks/useProjectInvitation";
import Dropdown from "../Dropdown/DropdownManage";
import DropdownManage from "../Dropdown/DropdownManage";

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
      <div className={styles.container} id="modal">
        <div className={styles.heading}>
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
          <div className={styles.guests}>
            <ul>
              {members.map((member) => {
                return (
                  <li key={member?.user?._id} className={styles.member}>
                    <div className={styles.user}>
                      {member?.user?.picture ? (
                        <Image
                          src={member?.user?.picture || "/default-pfp.webp"}
                          width={32}
                          height={32}
                          alt={`Photo de profil de ${member?.firstName}`}
                          style={{
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <NoPicture user={member?.user} width={32} height={32} />
                      )}
                      <span
                        className={styles.email}
                        title={member?.user?.email}
                      >
                        {member?.user?.email}
                      </span>
                      {canEditRole &&
                        member?.user?._id !== uid &&
                        member?.role !== "owner" ? (
                        <DropDownRole
                          defaultValue={member?.role}
                          options={options}
                          project={project}
                          member={member}
                        />
                      ) : (
                        <div className={styles.role}>
                          <span>{memberRole(member?.role)}</span>
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
          <div className={styles.invitations}>
            <ul>
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
      <div id="modal-layout" onClick={(e) => setIsOpen(false)}></div>
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

  const actions = {
    state: state,
    formAction: formAction,
    pending: pending,
    initialState: initialState,
  }

  const canEditRole = useUserRole(project, ["owner", "manager"]);

  useEffect(() => {
    if (state?.status === "success") {
      mutateProjectInvitation();
      setIsPopup({
        status: state?.status,
        title: "Invitation annulée avec succès",
        message: state?.message || "L'invitation a été annulée avec succès",
      });
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
        <li key={inv?._id} className={styles.pending}>
          <div>
            <Image
              src={"/default-pfp.webp"}
              width={32}
              height={32}
              alt={`Photo de profil de ${inv?.guestEmail}`}
              style={{ borderRadius: "50%" }}
            />
            <span className={styles.email}>{inv?.guestEmail}</span>
          </div>
          {canEditRole && (
            <DropDownRole
              defaultValue={inv?.role}
              options={["owner", "manager", "team", "customer", "guest"]}
              invitation={inv}
              project={project}
            />
          )}
          <DropdownManage
            defaultValue={inv?.role}
            project={project}
            actions={actions}
            setIsPopup={setIsPopup}
            mutateProjectInvitation={mutateProjectInvitation}
            email={inv?.guestEmail}
          />
        </li>
      ))}
    </>
  );
}
