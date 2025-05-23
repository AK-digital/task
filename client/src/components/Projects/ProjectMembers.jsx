"use client";
import styles from "@/styles/components/projects/projectMembers.module.css";
import { displayPicture } from "@/utils/utils";

export default function ProjectMembers({ members }) {
  return (
    <div className={styles.membersWrapper}>
      {/* Membres du projet (affiche max 4) */}
      {members.slice(0, 4).map((member) => (
        <div key={member?.user?._id} className={styles.memberWrapper}>
          {displayPicture(member?.user, 30, 30)}
        </div>
      ))}

      {/* Affichage "+n" si plus de 4 membres */}
      {members?.length > 4 && (
        <div className={styles.memberWrapper}>
          <div className={styles.moreMembers}>+{members.length - 4}</div>
        </div>
      )}
    </div>
  );
}
