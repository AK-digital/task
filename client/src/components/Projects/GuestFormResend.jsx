"use client";
import { sendProjectInvitationToGuest } from "@/actions/project";
import socket from "@/utils/socket";
import { useActionState, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth";
import { RotateCw } from "lucide-react";

const initialState = {
  status: "pending",
  message: "",
  data: null,
  errors: null,
};

export default function GuestFormResend({
  project,
  setIsPopup,
  mutateProjectInvitation,
  currentEmail,
}) {
  const { user } = useContext(AuthContext);
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
      setIsPopup({
        status: state?.status,
        title: "Nouvelle invitation envoyée avec succès",
        message: state?.message,
      });

      const message = {
        title: `🎉 Invitation à ${project?.name} !`,
        content: `Bonne nouvelle ! Vous avez été invité pour rejoindre le projet "${project?.name}".`,
      };

      const link = "/invitation/" + state?.data?._id;

      socket.emit("create notification", user, currentEmail, message, link);
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
    <div>
      <form action={formAction} className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          id="email"
          defaultValue={currentEmail}
          hidden
        />
        {errors && (
          <p className="text-sm text-red-500">{errors?.email}</p>
        )}
        <button
          type="submit"
          data-disabled={pending}
          disabled={pending}
          className="secondary-button w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCw size={16} className={pending ? "animate-spin" : ""} />
          <span className="text-sm font-medium">
            {pending ? "Envoi..." : "Renvoyer"}
          </span>
        </button>
      </form>
    </div>
  );
}
