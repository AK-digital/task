"use client";
import { sendProjectInvitationToGuest } from "@/actions/project";
import socket from "@/utils/socket";
import { useActionState, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [value, setValue] = useState("");
  const sendProjectInvitationToGuestWithId = sendProjectInvitationToGuest.bind(
    null,
    project?._id,
    t
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
        title: t("projects.invitation_sent_success"),
        message: state?.message,
      });

      const message = {
        title: `${t("projects.invitation_emoji")} ${project?.name} !`,
        content: `${t("projects.invitation_good_news")} "${project?.name}".`,
      };

      const link = "/invitation/" + state?.data?._id;

      socket.emit("create notification", user, value, message, link);
    }

    if (state?.status === "failure" && state?.errors === null) {
      setIsPopup({
        status: state?.status,
        title: t("projects.error_occurred_simple"),
        message: state?.message,
      });
    }

    return () => {
      socket.off("create notification");
    };
  }, [state, t]);

  return (
    <>
      <div>
        <form action={formAction} className="gap-3">
          <input
            type="email"
            name="email"
            id="email"
            placeholder={t("projects.invite_by_email")}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input_GuestFormInvitation font-bricolage border-none bg-third p-2 rounded-sm"
          />
          {errors && <i>{errors?.email}</i>}
          <button
            type="submit"
            data-disabled={pending}
            className="w-full rounded-sm text-medium p-2"
          >
            {t("projects.send_invitation")}
          </button>
        </form>
      </div>
    </>
  );
}
