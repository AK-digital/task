"use client";
import { removeGuest } from "@/actions/project";
import styles from "@/styles/components/modals/guests-modal.module.css";
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
import { useTranslation } from "react-i18next";

export default function GuestsModal({ project, setIsOpen, mutateProject }) {
  const { t } = useTranslation();
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
        title: t("guests.user_revoked_success"),
        message: state?.message,
      });
    }

    if (state?.status === "failure" && state?.errors === null) {
      setIsPopup({
        status: state?.status,
        title: t("general.error_occurred"),
        message: state?.message,
      });
    }
  }, [state, t]);
  const options = ["owner", "manager", "team", "customer", "guest"];

  return (
    <>
      <div className={styles.container} id="modal">
        <div className={styles.heading}>
          <span>{t("guests.invite_users")}</span>
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
                      <DisplayPicture
                        user={member?.user}
                        style={{
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                        }}
                      />
                      <span
                        className={styles.email}
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
                          {t("guests.revoke")}
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
  const { t } = useTranslation();
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
        title: t("guests.invitation_cancelled_success"),
        message: state?.message || t("guests.invitation_cancelled_message"),
      });
    }
    if (state?.status === "failure") {
      setIsPopup({
        status: state?.status,
        title: t("general.error_occurred"),
        message: state?.message || t("guests.invitation_cancel_error"),
      });
    }
  }, [state, t]);

  return (
    <>
      {projectInvitations.map((inv) => (
        <li key={inv?._id} className={styles.pending}>
          <div>
            <Image
              src={"/default-pfp.webp"}
              width={32}
              height={32}
              alt={`${t("general.profile_picture_alt")} ${inv?.guestEmail}`}
              style={{ borderRadius: "50%" }}
            />
            <span>{inv?.guestEmail}</span>
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
              <button type="submit" data-disabled={pending} disabled={pending}>
                {t("guests.cancel_invitation")}
              </button>
            </form>
          )}
        </li>
      ))}
    </>
  );
}
