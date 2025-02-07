"use client";
import { updateUserPicture } from "@/actions/user";
import { AuthContext } from "@/context/auth";
import PopupMessage from "@/layouts/PopupMessage";
import styles from "@/styles/components/profile/picture-form.module.css";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useActionState, useContext, useEffect, useRef, useState } from "react";
import { mutate } from "swr";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function PictureForm() {
  const { user } = useContext(AuthContext);
  const formRef = useRef(null);
  const [editImg, setEditImg] = useState(false);
  const [popUp, setPopup] = useState(null);

  const [state, formAction, pending] = useActionState(
    updateUserPicture,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      mutate("/auth/session");
      setPopup({
        status: state?.status,
        title: "Succès",
        message: "Photo de profil mise à jour avec succès",
      });
    }

    if (state?.status === "failure") {
      setPopup({
        status: state?.status,
        title: "Erreur",
        message: "Une erreur s'est produite lors de la mise à jour de la photo",
      });
    }

    // Hide popup after 4 seconds
    setTimeout(() => setPopup(false), 4000);
  }, [state]);

  const handleUpdatePicture = () => {
    formRef?.current?.requestSubmit();
  };

  return (
    <>
      <form action={formAction} ref={formRef} className={styles.container}>
        <input type="hidden" name="userId" defaultValue={user?._id} />
        <div
          className={styles.picture}
          onMouseEnter={() => setEditImg(true)}
          onMouseLeave={() => setEditImg(false)}
        >
          <Image
            src={user?.picture || "/default-pfp.webp"}
            alt={`Photo de profil de ${user?.firstName}`}
            width={120}
            height={120}
            quality={100}
            className={styles.profileImage}
          />
          {editImg && !pending && (
            <label htmlFor="picture" className={styles.editPicture}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </label>
          )}
          <input
            type="file"
            name="picture"
            id="picture"
            hidden
            disabled={pending}
            onChange={handleUpdatePicture}
          />
        </div>
      </form>

      {popUp && (
        <PopupMessage
          status={popUp.status}
          title={popUp.title}
          message={popUp.message}
        />
      )}
    </>
  );
}
