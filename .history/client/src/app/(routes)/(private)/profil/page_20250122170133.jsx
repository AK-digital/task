"use client";
import styles from "@/styles/pages/profil.module.css";
import { AuthContext } from "@/context/auth";
import { useActionState, useContext, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function Profil() {
  const [state, formAction, pending] = useActionState();
  const [editImg, setEditImg] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <form action="">
          <div
            className={styles.picture}
            onMouseEnter={(e) => setEditImg(true)}
            onMouseLeave={(e) => setEditImg(false)}
          >
            <Image
              src={user?.picture || "/default-pfp.webp"}
              alt={`Photo de profil de ${user?.firstName}`}
              width={120}
              height={120}
              quality={100}
              style={{ borderRadius: "50%" }}
            />
            {editImg && (
              <label htmlFor="picture" className={styles.editPicture}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </label>
            )}
          </div>
          <div>
            <span>{user?.firstName + " " + user?.lastName}</span>
            <input type="file" name="picture" id="picture" hidden />
          </div>
        </form>
      </div>
    </main>
  );
}
