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
    <>
      <div>
        <form action={formAction} className="flex flex-row gap-3">
          <input
            type="email"
            name="email"
            id="email"
            placeholder="E-mail de l'invité"
            value={valueEmail}
            onChange={(e) => setValueEmail(e.target.value)}
            className="input_GuestFormInvitation font-bricolage border-none bg-third p-2 rounded-sm w-2/3"
          />
          <button
            type="submit"
            data-disabled={pending}
            className="w-1/3 rounded-sm text-medium p-2"
          >
            Inviter
          </button>
        </form>
        {errors && <i>{errors?.email}</i>}
      </div>
    </>
  );
}
