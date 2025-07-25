"use client";
import { saveProject } from "@/actions/project";
import {  X } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
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
      }
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
    }
  };

  return (
    <div className="relative w-full">
      <div className="fixed top-0 right-0 bottom-0 bg-primary gap-1.5 w-full z-9999">
        <span
          className="absolute top-16 right-16 bg-none bg-transparent border-none cursor-pointer"
          onClick={() => setIsCreating(false)}
        >
          <X size={32} />
        </span>
        <form ref={formRef} action={formAction} className="flex justify-start items-center flex-col mt-[15%]">
          <input
            ref={inputRef}
            type="text"
            name="project-name"
            id="project-name"
            placeholder="Nommer votre projet"
            required
            minLength={2}
            maxLength={250}
            className="w-fit mt-2.5 h-[150px] text-[2.5rem] bg-transparent border-none text-center"
          />
          <span className="text-[0.82rem] text-text-color-muted mb-3">
            Appuyer sur Entrée pour créer le projet
          </span>
          <span className="text-[0.82rem] text-text-color-muted mb-3">OU</span>
          <button type="submit" data-disabled={pending} disabled={pending} className="py-3.5 px-[22px]">
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
