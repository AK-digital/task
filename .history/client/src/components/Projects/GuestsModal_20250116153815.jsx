export default function GuestsModal({ project }) {
  const guests = project?.guests;

  return (
    <div>
      <div>
        <span>Inviter d'autres utilisateurs</span>
      </div>
      <div>
        <form action="">
          <input type="text" />
        </form>
      </div>
      {/* Guests list */}
      <div></div>
    </div>
  );
}
