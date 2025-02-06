import styles from "@/styles/components/modals/tagged-users-modal.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";

export default function TaggedUsersModal({
  project,
  filteredGuests,
  setTaggedUsers,
  mentionPosition,
}) {
  function handleTaggedUsers(guestId) {
    setTaggedUsers((prev) => [...prev, guestId]);
  }

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

      {isNotEmpty(filteredGuests) ? (
        <ul>
          {filteredGuests?.map((guest) => {
            return (
              <li
                key={guest?._id}
                onClick={(e) => {
                  handleTaggedUsers(guest?._id);
                }}
              >
                <Image
                  src={guest?.picture}
                  width={25}
                  height={25}
                  alt={`Photo de profil de ${guest?.firstName}`}
                  style={{ borderRadius: "50%" }}
                />
                {guest?.firstName + " " + guest?.lastName}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul>
          {project?.guests?.map((guest) => {
            return (
              <li key={guest?._id}>
                <Image
                  src={guest?.picture}
                  width={25}
                  height={25}
                  alt={`Photo de profil de ${guest?.firstName}`}
                  style={{ borderRadius: "50%" }}
                />
                {guest?.firstName + " " + guest?.lastName}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
