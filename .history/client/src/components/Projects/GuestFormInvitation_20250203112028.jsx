import styles from "@/styles/components/projects/guest-form-invitation.module.css";
import { sendProjectInvitationToGuest } from "@/actions/project";
import { useActionState } from "react";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function GuestFormInvitation({ project, setIsOpen }) {
  const sendProjectInvitationToGuestWithId = sendProjectInvitationToGuest.bind(
    null,
    project?._id
  );
  const [state, formAction, pending] = useActionState(
    sendProjectInvitationToGuestWithId,
    initialState
  );
  const errors = state?.errors;

  return (
    <>
      <div id="modal" className={styles.container}>
        <div className={styles.header}>
          <span>Inviter un utilisateur à rejoindre ce projet</span>
        </div>
        <form action={formAction}>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Inviter par e-mail"
          />
          {errors && <i>{errors?.email}</i>}
          <button type="submit">Inviter</button>
        </form>
      </div>
      <div id="modal-layout" onClick={(e) => setIsOpen(false)}></div>
    </>
  );
}
