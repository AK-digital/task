"use client";
import { useActionState, useContext, useEffect, useState } from "react";
import { updateUserProfile } from "@/actions/user";
import { mutate } from "swr";
import { AuthContext } from "@/context/auth";
import PopupMessage from "@/layouts/PopupMessage";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProfileForm() {
  const { user } = useContext(AuthContext);
  const [state, formAction, pending] = useActionState(
    updateUserProfile,
    initialState
  );
  const [popUp, setPopup] = useState(null);

  // Ajout des états pour gérer les champs actifs
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [company, setCompany] = useState(user?.company || "");
  const [position, setPosition] = useState(user?.position || "");
  const [language, setLanguage] = useState(user?.language || "fr");

  useEffect(() => {
    // Mutate the session data if the update was successful
    if (state?.status === "success") {
      mutate("/auth/session");
      
      // Message différent si un changement d'email a été demandé
      const message = state?.data?.emailChangeRequested 
        ? "Profil mis à jour. Un email de validation a été envoyé à votre ancienne adresse pour confirmer le changement d'email."
        : "Profil mis à jour avec succès";
        
      setPopup({
        status: state?.status,
        title: "Succès",
        message: message,
      });
    }

    if (state?.status === "failure") {
      setPopup({
        status: state?.status,
        title: "Erreur",
        message: state?.message || "Une erreur s'est produite lors de la mise à jour du profil",
      });
    }

    // Hide the popup after 6 seconds (plus long pour le message d'email)
    const timeout = setTimeout(() => setPopup(false), 6000);

    return () => clearTimeout(timeout);
  }, [state]);

  // Mettre à jour les états avec les valeurs de l'utilisateur lorsque les données sont chargées
  useEffect(() => {
    if (user) {
      setLastName(user.lastName || "");
      setFirstName(user.firstName || "");
      setEmail(user.email || "");
      setCompany(user.company || "");
      setPosition(user.position || "");
      setLanguage(user.language || "fr");
    }
  }, [user]);

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="userId" defaultValue={user?._id} />

        <div className="form-group">
          <label
            className="select-none"
            htmlFor="firstName"
            data-active={firstName ? true : false}
          >
            Prénom
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            defaultValue={user?.firstName || ""}
            onChange={(e) => setFirstName(e.target.value)}
            className="font-bricolage text-medium focus:outline-none"
          />
          {state?.errors?.firstName && <span>{state.errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label
            className="select-none"
            htmlFor="lastName"
            data-active={lastName ? true : false}
          >
            Nom
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            defaultValue={user?.lastName || ""}
            onChange={(e) => setLastName(e.target.value)}
            className="font-bricolage text-medium focus:outline-none"
          />
          {state?.errors?.lastName && <span>{state.errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label
            className="select-none"
            htmlFor="email"
            data-active={email ? true : false}
          >
            Adresse email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={user?.email || ""}
            onChange={(e) => setEmail(e.target.value)}
            className="font-bricolage text-medium focus:outline-none"
          />
          {state?.errors?.email && <span>{state.errors.email}</span>}
        </div>

        <div className="form-group">
          <label
            className="select-none"
            htmlFor="company"
            data-active={company ? true : false}
          >
            Entreprise
          </label>
          <input
            type="text"
            id="company"
            name="company"
            defaultValue={user?.company || ""}
            onChange={(e) => setCompany(e.target.value)}
            className="font-bricolage text-medium focus:outline-none"
          />
          {state?.errors?.company && <span>{state.errors.company}</span>}
        </div>

        <div className="form-group">
          <label
            className="select-none"
            htmlFor="position"
            data-active={position ? true : false}
          >
            Poste
          </label>
          <input
            type="text"
            id="position"
            name="position"
            defaultValue={user?.position || ""}
            onChange={(e) => setPosition(e.target.value)}
            className="font-bricolage text-medium focus:outline-none"
          />
          {state?.errors?.position && <span>{state.errors.position}</span>}
        </div>

        <div className="form-group">
          <label
            className="select-none"
            htmlFor="language"
            data-active={language ? true : false}
          >
            Langue
          </label>
          <select
            id="language"
            name="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="font-bricolage text-medium focus:outline-none"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
          </select>
          {state?.errors?.language && <span>{state.errors.language}</span>}
        </div>
        <button
          type="submit"
          data-disabled={pending}
          className="font-bricolage ml-auto mt-6"
        >
          Mettre à jour
        </button>
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
