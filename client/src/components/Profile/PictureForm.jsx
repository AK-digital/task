"use client";
// import styles from "@/styles/components/profile/picture-form.module.css";
import { updateUserPicture } from "@/actions/user";
import { AuthContext } from "@/context/auth";
import PopupMessage from "@/layouts/PopupMessage";
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

    // Hide the popup after 4 seconds
    const timeout = setTimeout(() => setPopup(false), 4000);

    return () => clearTimeout(timeout);
  }, [state]);

  const handleUpdatePicture = () => {
    formRef?.current?.requestSubmit();
  };

  return (
    <>
      <form action={formAction} ref={formRef} className="flex justify-center mb-4">
        <input type="hidden" name="userId" defaultValue={user?._id} />
        <div
          onMouseEnter={() => setEditImg(true)}
          onMouseLeave={() => setEditImg(false)}
          className="relative inline-block w-25 h-25 m-auto"
        >
          <Image
            src={user?.picture || "/default-pfp.webp"}
            alt={`Photo de profil de ${user?.firstName}`}
            width={100}
            height={100}
            quality={100}
            className="rounded-full object-cover"
          />
          {editImg && !pending && (
            <label htmlFor="picture" className="absolute flex justify-center items-center z-2001 left-1/2 top-1/2 w-25 h-25 bg-black/30 rounded-full -translate-1/2 cursor-pointer">
              <FontAwesomeIcon icon={faPenToSquare} className="w-5 h-5 text-white" />
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
