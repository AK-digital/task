"use client";
import { saveProject } from "@/actions/project";
import { FolderPlus, Layout, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  message: "",
  payload: null,
  data: null,
  errors: null,
};

export default function NewProject() {
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [state, formAction, pending] = useActionState(
    saveProject,
    initialState
  );

  const router = useRouter();

  useEffect(() => {
    if (state?.status === "success" && state?.data?._id) {
      router.push(`/projects/${state.data._id}/`);
    }
  }, [state]);

  return (
    <main className="ml-5 w-full h-[calc(100svh-60px)]">
      {/* container */}
      <div className="flex justify-center items-center text-center bg-primary rounded-tl-lg h-full w-full text-text-dark-color">
        <div className="flex flex-col -mt-[60px] gap-6">
          <div className="max-w-[600px]">
            <div className="flex justify-center items-center">
              <FolderPlus size="144" />
            </div>
            <h1>Créer un projet</h1>
            <p className="font-light">
              Créer un nouveau projet n'a jamais été aussi simple. Donnez un nom
              à votre projet pour démarrer un nouveau projet ou profitez de nos
              templates prédéfinies pour gagner du temps.
            </p>
          </div>
          <div className="w-[90%] mx-auto">
            <form action={formAction} className="flex flex-col gap-6">
              <div className="text-center mx-auto w-full">
                <label htmlFor="project-name" hidden></label>
                <input
                  type="text"
                  id="project-name"
                  name="project-name"
                  placeholder="Nom du projet"
                  className="border-b-inherit text-center text-medium"
                  onChange={(e) => {
                    if (e.target.value.length > 0) {
                      setIsSubmitDisabled(false);
                    } else {
                      setIsSubmitDisabled(true);
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-2">
                  <button
                    className={`flex justify-center items-center gap-2 w-full border-2 text-text-color-muted border-text-color-muted ${
                      isSubmitDisabled
                        ? "pointer-events-none bg-transparent border-2 border-text-muted text-text-muted"
                        : "text-white border-accent-color"
                    }`}
                    data-disabled={pending || isSubmitDisabled}
                    type="submit"
                    disabled={pending || isSubmitDisabled}
                  >
                    <PlusCircle size={18} /> Créer un nouveau projet
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/new-project/templates");
                    }}
                    className="flex justify-center items-center gap-2 w-full bg-transparent border-2 border-accent-color text-accent-color hover:bg-transparent hover:text-white hover:border-2 hover:border-text-color hover:shadow-inherit"
                  >
                    <Layout size={18} />
                    Choisir un template
                  </button>
                </div>
                <button
                  type="button"
                  className="bg-transparent shadow-none text-accent-color text-medium max-w-fit mx-auto hover:bg-transparent hover:shadow-none hover:text-accent-color-hover"
                  onClick={(e) => {
                    e.preventDefault();
                    router.back();
                  }}
                >
                  Retour
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
