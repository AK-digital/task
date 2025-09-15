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
      <div className="fixed inset-0 bg-primary/95 backdrop-blur-sm z-[9999] flex items-center justify-center">
        <button
          className="absolute top-8 right-8 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() => setIsCreating(false)}
        >
          <X size={24} className="text-white" />
        </button>
        
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-darker-color mb-2">
              Nouveau projet
            </h2>
            <p className="text-text-color-muted">
              Donnez un nom à votre projet pour commencer
            </p>
          </div>
          
          <form ref={formRef} action={formAction} className="space-y-6">
            <div>
              <input
                ref={inputRef}
                type="text"
                name="project-name"
                id="project-name"
                placeholder="Nom du projet"
                required
                minLength={2}
                maxLength={250}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-text-darker-color text-lg font-medium placeholder:text-text-color-muted focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-accent-color transition-all duration-200"
              />
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-text-color-muted">
                Appuyez sur Entrée ou cliquez sur le bouton
              </p>
              
              <button 
                type="submit" 
                data-disabled={pending} 
                disabled={pending} 
                className="secondary-button w-full bg-accent-color hover:bg-accent-color/90 text-white border-accent-color disabled:opacity-50 disabled:cursor-not-allowed justify-center"
              >
                <span className="text-sm font-medium">
                  {pending ? "Création..." : "Créer le projet"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div
        className="fixed inset-0 bg-black/20 z-[9998]"
        onClick={() => setIsCreating(false)}
      />
    </div>
  );
}
