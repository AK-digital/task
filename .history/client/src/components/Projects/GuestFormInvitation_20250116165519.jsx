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
  const [state, formAction, pending] = useActionState();
  return (
    <div>
      <form action="">
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Inviter par e-mail"
        />
        <button type="submit" hidden>
          Envoyer
        </button>
      </form>
    </div>
  );
}
