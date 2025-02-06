import styles from "@/styles/components/modals/tagged-users-modal.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";

export default function TaggedUsersModal({ project, mentionPosition }) {
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
        {!isNotEmpty(project) &&
          project?.guests?.map((guest) => {
            return (
              <li>
                <Image
                  src={guest?.picture}
                  width={25}
                  height={25}
                  alt={`Photo de profil de ${guest?.firstName}`}
                />
                {guest?.firstName + " " + guest?.lastName}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
