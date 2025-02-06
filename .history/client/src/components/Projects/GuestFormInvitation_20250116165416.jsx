const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function GuestFormInvitation() {
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
