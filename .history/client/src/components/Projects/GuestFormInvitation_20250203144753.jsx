import { sendProjectInvitationToGuest } from "@/actions/project";
import { useActionState } from "react";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function GuestFormInvitation({ project }) {
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
    <div>
      <form action={formAction}>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Inviter par e-mail"
        />
        {errors && <i>{errors?.email}</i>}
        <button type="submit" hidden>
          Envoyer
        </button>
      </form>
      <div>
        <span>Bien envoyé</span>
      </div>
    </div>
  );
}
