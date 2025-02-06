"use client";
import styles from "@/styles/pages/profil.module.css";
import { AuthContext } from "@/context/auth";
import { useActionState, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { updateUserPicture } from "@/actions/user";
import { mutate } from "swr";
import { getSession } from "@/api/auth";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function Profil() {
  const form = useRef(null);
  const [editImg, setEditImg] = useState(false);
  const { user } = useContext(AuthContext);
  const updateUserPictureWithId = updateUserPicture.bind(null, user?._id);
  const [state, formAction, pending] = useActionState(
    updateUserPictureWithId,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      mutate("/auth/session", getSession);
    }
  }, [state]);

  function handleUpdateUpdatePicture() {
    form.current.requestSubmit();

    mutate("/auth/session", getSession);
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <form action={formAction} ref={form}>
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
            <input
              type="file"
              name="picture"
              id="picture"
              hidden
              onChange={handleUpdateUpdatePicture}
            />
          </div>
          <div>
            <span>{user?.firstName + " " + user?.lastName}</span>
          </div>
        </form>
      </div>
    </main>
  );
}
