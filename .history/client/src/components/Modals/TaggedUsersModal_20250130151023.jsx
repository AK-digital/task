import styles from "@/styles/components/modals/tagged-users-modal.module.css";
import Image from "next/image";

export default function TaggedUsersModal({
  filteredGuests,
  mentionPosition,
  handleInsertMention,
}) {
  return (
    <div
      className={styles.container}
      style={{
        top: `${mentionPosition.top}px`,
        left: `${mentionPosition.left}px`,
      }}
    >
      <div>
        <span>Personnes à mentionner</span>
      </div>
      <ul>
        {filteredGuests.length > 0 ? (
          filteredGuests.map((guest) => (
            <li key={guest._id} onClick={() => handleInsertMention(guest)}>
              <Image
                src={guest.picture}
                width={25}
                height={25}
                alt={`Photo de profil de ${guest.firstName}`}
                style={{ borderRadius: "50%" }}
              />
              {guest.firstName} {guest.lastName}
            </li>
          ))
        ) : (
          <li>Aucun utilisateur trouvé</li>
        )}
      </ul>
    </div>
  );
}
