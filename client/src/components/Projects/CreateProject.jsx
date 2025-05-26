"use client";
import { saveProject } from "@/actions/project";
import styles from "@/styles/components/projects/create-project.module.css";
import { instrumentSans } from "@/utils/font";
import { Plus, X } from "lucide-react";
import { useActionState, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const initialState = {
  status: "pending",
  message: "",
  payload: null,
  data: null,
  errors: null,
};

export default function CreateProject({
  onProjectCreated,
  isCreating,
  setIsCreating,
}) {
  const [state, formAction, pending] = useActionState(
    saveProject,
    initialState
  );
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (state?.status === "success" && state?.data?._id) {
      setIsCreating(false);
      router.refresh();
      // Correction de l'URL de redirection
      router.push(`/projects/${state.data._id}/`);
    }
  }, [state, router]);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setIsCreating(false);
      }
    };
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCreating]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await saveProject(formData);

      if (response.success) {
        // Appeler la fonction de callback avec le nouveau projet
        onProjectCreated(response.data);
        // Réinitialiser le formulaire ou fermer la modal
        // ...
      }
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <span
          className={styles.closeButton}
          onClick={() => setIsCreating(false)}
        >
          <X size={32} />
        </span>
        <form ref={formRef} action={formAction} className={styles.form}>
          <input
            ref={inputRef}
            type="text"
            name="project-name"
            id="project-name"
            placeholder="Nommer votre projet"
            required
            minLength={2}
            maxLength={250}
          />
          <span className={styles.projectCreationInfo}>
            Appuyer sur Entrée pour créer le projet
          </span>
          <span className={styles.projectCreationInfo}>OU</span>
          <button type="submit" data-disabled={pending} disabled={pending}>
            Cliquer pour créer le projet
          </button>
        </form>
      </div>
      <div
        className="modal-layout-opacity"
        onClick={(e) => setIsCreating(false)}
      ></div>
    </div>
  );
}
