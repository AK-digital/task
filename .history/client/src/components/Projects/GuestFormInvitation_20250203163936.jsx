import { sendProjectInvitationToGuest } from "@/actions/project";
import socket from "@/utils/socket";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function GuestFormInvitation({ project }) {
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
      socket.emit("project invitation", value, project?.name);
    }
  }, [state]);

  return (
    <div>
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
        <button type="submit" hidden>
          Envoyer
        </button>
      </form>
    </div>
  );
}
