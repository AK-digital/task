"use client";
import { sendProjectInvitationToGuest } from "@/actions/project";
import socket from "@/utils/socket";
import { useActionState, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth";

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
  const sendProjectInvitationToGuestWithId = sendProjectInvitationToGuest.bind(
    null,
    project?._id
  );
  const [state, formAction, pending] = useActionState(
    sendProjectInvitationToGuestWithId,
    initialState
  );
  const errors = state?.errors;
  const [valueEmail, setValueEmail] = useState("");

  useEffect(() => {
    if (state?.status === "success") {
      mutateProjectInvitation();
      setValueEmail("");
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

      socket.emit("create notification", user, valueEmail, message, link);
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
        <div className="flex gap-3">
          <input
            type="email"
            name="email"
            id="email"
            placeholder="E-mail de l'invité"
            value={valueEmail}
            onChange={(e) => setValueEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-text-darker-color text-sm font-bricolage placeholder:text-text-color-muted focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-accent-color transition-all duration-200"
          />
          <button
            type="submit"
            data-disabled={pending}
            disabled={pending}
            className="secondary-button bg-accent-color hover:bg-accent-color/90 text-white border-accent-color disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium">
              {pending ? "Envoi..." : "Inviter"}
            </span>
          </button>
        </div>
        {errors && (
          <p className="text-sm text-red-500 mt-1">{errors?.email}</p>
        )}
      </form>
    </div>
  );
}
