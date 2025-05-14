"use client";
import styles from "@/styles/components/projects/guest-form-invitation.module.css";
import { sendProjectInvitationToGuest } from "@/actions/project";
import socket from "@/utils/socket";
import { useActionState, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth";
import { bricolageGrostesque } from "@/utils/font";
import { MoveRight, RotateCw } from "lucide-react";

const initialState = {
  status: "pending",
  message: "",
  data: null,
  errors: null,
};

export default function GuestFormInvitation({
  project,
  setIsPopup,
  mutateProjectInvitation,
}) {
  const { user } = useContext(AuthContext);
  const [value, setValue] = useState("");
  const sendProjectInvitationToGuestWithId = sendProjectInvitationToGuest.bind(
    null,
    project?._id
  );
  const [state, formAction, pending] = useActionState(
    sendProjectInvitationToGuestWithId,
    initialState
  );
  const errors = state?.errors;

  useEffect(() => {
    if (state?.status === "success") {
      mutateProjectInvitation();
      setValue("");
      setIsPopup({
        status: state?.status,
        title: "Invitation envoyé avec succès",
        message: state?.message,
      });

      const message = {
        title: `🎉 Invitation à ${project?.name} !`,
        content: `Bonne nouvelle ! Vous avez été invité pour rejoindre le projet "${project?.name}".`,
      };

      const link = "/invitation/" + state?.data?._id;

      socket.emit("create notification", user, value, message, link);
    }

    if (state?.status === "failure" && state?.errors === null) {
      setIsPopup({
        status: state?.status,
        title: "Une erreur s'est produite",
        message: state?.message,
      });
    }

    return () => {
      socket.off("create notification");
    };
  }, [state]);

  return (
    <>
      <div className={styles.container}>
        <form action={formAction}>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Inviter par e-mail"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={bricolageGrostesque.className}
          />
          {errors && <i>{errors?.email}</i>}
          <button type="submit" data-disabled={pending}>
            Envoyer une invitation
          </button>
        </form>
      </div>
    </>
  );
}

export function GuestFormResend({
  project,
  setIsPopup,
  mutateProjectInvitation,
  currentEmail,

}) {
  const { user } = useContext(AuthContext);
  const [value, setValue] = useState(currentEmail);
  const sendProjectInvitationToGuestWithId = sendProjectInvitationToGuest.bind(
    null,
    project?._id
  );
  const [state, formAction, pending] = useActionState(
    sendProjectInvitationToGuestWithId,
    initialState
  );
  const errors = state?.errors;

  useEffect(() => {
    if (state?.status === "success") {
      mutateProjectInvitation();
      setValue("");
      setIsPopup({
        status: state?.status,
        title: "Invitation envoyé avec succès",
        message: state?.message,
      });

      const message = {
        title: `🎉 Invitation à ${project?.name} !`,
        content: `Bonne nouvelle ! Vous avez été invité pour rejoindre le projet "${project?.name}".`,
      };

      const link = "/invitation/" + state?.data?._id;

      socket.emit("create notification", user, value, message, link);
    }

    if (state?.status === "failure" && state?.errors === null) {
      setIsPopup({
        status: state?.status,
        title: "Une erreur s'est produite",
        message: state?.message,
      });
    }

    return () => {
      socket.off("create notification");
    };
  }, [state]);

  return (
    <>
      <form action={formAction}>
        {errors && <i>{errors?.email}</i>}
        <input
          type="email"
          name="email"
          id="email"
          hidden
          placeholder="Inviter par e-mail"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={bricolageGrostesque.className}
        />
        {errors && <i>{errors?.email}</i>}
        <button type="submit" data-disabled={pending}>
          <RotateCw size={16} className="iconManage" />
          <p>Renvoyer</p>
        </button>
      </form>
    </>
  );
}
