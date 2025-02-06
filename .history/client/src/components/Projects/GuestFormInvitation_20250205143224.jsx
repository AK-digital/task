import styles from "@/styles/components/projects/guest-form-invitation.module.css";
import { sendProjectInvitationToGuest } from "@/actions/project";
import socket from "@/utils/socket";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function GuestFormInvitation({ project, setIsPopup }) {
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
      setIsPopup({
        status: state?.status,
        title: "Invitation envoyé avec succès",
        message: state?.message,
      });
      socket.emit("create notification", value, project);
    }

    if (state?.status === "failure" && state?.errors === null) {
      setIsPopup({
        status: state?.status,
        title: "Une erreur s'est produite",
        message: state?.message,
      });
    }
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
          />
          {errors && <i>{errors?.email}</i>}
          <button type="submit" data-disabled={pending}>
            Inviter
          </button>
        </form>
      </div>
    </>
  );
}
