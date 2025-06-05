"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProjectTypeSelection from "@/components/NewProject/ProjectTypeSelection";
import IAProjectStep from "@/components/NewProject/IAProjectStep";
import TemplateProjectStep from "@/components/NewProject/TemplateProjectStep";
import ProjectConfigurationStep from "@/components/NewProject/ProjectConfigurationStep";
import { saveProject, sendProjectInvitationFromWizard } from "@/actions/project";
import { createBoard } from "@/actions/board";
import { saveTask } from "@/actions/task";
import { useCustomTemplate } from "@/api/template";
import { mutate } from "swr";

export default function NewProject() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleGoBack = () => {
    if (currentStep === 1) {
      router.back();
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedType(null);
      setProjectData(null);
    } else if (currentStep === 3) {
      // Si on est à l'étape 3 et que c'est un projet vide, on retourne à l'étape 1
      // Sinon on retourne à l'étape 2
      if (selectedType === 'empty') {
        setCurrentStep(1);
        setSelectedType(null);
        setProjectData(null);
      } else {
        setCurrentStep(2);
        setProjectData(null);
      }
    }
  };

  const handleStepClick = (targetStep) => {
    if (targetStep < currentStep) {
      if (targetStep === 1) {
        setCurrentStep(1);
        setSelectedType(null);
        setProjectData(null);
      } else if (targetStep === 2 && selectedType !== 'empty') {
        setCurrentStep(2);
        setProjectData(null);
      }
    }
  };

  const handleTypeSelection = (type) => {
    setSelectedType(type);
    
    if (type === 'empty') {
      // Pour les projets vides, on va directement aux options (étape 3)
      setProjectData({
        type: 'empty',
        title: '',
        boards: []
      });
      setCurrentStep(3);
    } else {
      // Pour les autres types, on va à l'étape 2
      setCurrentStep(2);
    }
  };

  const handleStepTwoComplete = (data) => {
    setProjectData(data);
    // Pour les projets vides, on va directement à l'étape d'options (étape 3)
    // Pour les autres types, on passe aussi à l'étape 3
    setCurrentStep(3);
  };

  const handleProjectCreate = async (finalProjectData) => {
    setCreating(true);
    try {
      let projectId;
      
      // Créer le projet selon le type
      if (finalProjectData.type === 'template') {
        // Utiliser l'API template avec les données personnalisées
        const res = await useCustomTemplate(finalProjectData.name, finalProjectData.boards);
        if (res?.success && res?.data?._id) {
          projectId = res.data._id;
        } else {
          throw new Error("Erreur lors de la création du projet depuis le modèle");
        }
      } else {
        // Créer un projet standard (IA ou vide)
        const formData = new FormData();
        formData.set("project-name", finalProjectData.name);
        if (finalProjectData.skipDefaultBoard) {
          formData.set("skipDefaultBoard", "true");
        }
        
        const projectRes = await saveProject({}, formData);
        if (projectRes.status !== "success" || !projectRes.data?._id) {
          throw new Error(projectRes.message || "Erreur création projet");
        }
        projectId = projectRes.data._id;
        
        // Créer les boards et tâches pour les projets IA
        if (finalProjectData.type === 'ia' && finalProjectData.boards) {
          for (const board of finalProjectData.boards) {
            const boardRes = await createBoard(projectId, board.name);
            if (!boardRes.success || !boardRes.data?._id) {
              throw new Error(boardRes.message || "Erreur création board");
            }
            const boardId = boardRes.data._id;
            
            // Créer les tâches
            for (const task of board.tasks) {
              const taskForm = new FormData();
              taskForm.set("board-id", boardId);
              taskForm.set("new-task", task);
              await saveTask(projectId, {}, taskForm);
            }
          }
        }
      }
      
      // Envoyer les invitations si il y en a
      if (finalProjectData.invitations && finalProjectData.invitations.length > 0) {
        for (const invitation of finalProjectData.invitations) {
          try {
            const result = await sendProjectInvitationFromWizard(projectId, invitation.email);
            if (result.success) {
              // console.log(`Invitation envoyée avec succès à ${invitation.email}`);
            } else {
              // console.warn(`Erreur lors de l'envoi de l'invitation à ${invitation.email}:`, result.message);
            }
                      } catch (inviteError) {
              // console.warn(`Erreur lors de l'envoi de l'invitation à ${invitation.email}:`, inviteError.message);
              // On continue même si une invitation échoue
            }
        }
        
        // Forcer la revalidation du cache des invitations pour ce projet
        mutate(`/project-invitation/${projectId}?projectId=${projectId}`);
        
        // Revalider aussi les données du projet pour s'assurer que tout est à jour
        mutate(`/project/${projectId}`);
      }
      
      // Mettre à jour le projet avec les options supplémentaires (logo, liens, notes)
      if (finalProjectData.note || finalProjectData.urls?.length > 0) {
        try {
          const updateFormData = new FormData();
          updateFormData.set("project-id", projectId);
          updateFormData.set("project-name", finalProjectData.name);
          
          if (finalProjectData.note) {
            updateFormData.set("note", finalProjectData.note);
          }
          
          if (finalProjectData.urls?.length > 0) {
            finalProjectData.urls.forEach(link => {
              updateFormData.append("url", link.url);
              updateFormData.append("icon", link.icon);
            });
          }
          
          const { updateProject } = await import("@/actions/project");
          await updateProject({}, updateFormData);
        } catch (updateError) {
          // console.warn("Erreur lors de la mise à jour des options du projet:", updateError);
          // On continue même si la mise à jour échoue
        }
      }
      
      // Rediriger vers le projet créé
      router.push(`/projects/${projectId}`);
      
    } catch (error) {
      // console.error("Erreur lors de la création du projet:", error);
      setCreating(false);
    }
  };

  const getPageTitle = () => {
    if (currentStep === 1) {
      return "Création d'un nouveau projet";
    }
    
    if (currentStep === 3) {
      return "Options du projet";
    }
    
    switch (selectedType) {
      case "ia":
        return "Création avec l'IA";
      case "template":
        return "Depuis un modèle enregistré";
      case "empty":
        return "Projet vide";
      default:
        return "Nouveau projet";
    }
  };

  const handleCreateButtonClick = () => {
    // Déclencher l'événement pour le composant ProjectConfigurationStep
    if (currentStep === 3) {
      window.dispatchEvent(new Event('createProject'));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ProjectTypeSelection onTypeSelect={handleTypeSelection} />;
      case 2:
        if (selectedType === "ia") {
          return <IAProjectStep onComplete={handleStepTwoComplete} />;
        } else if (selectedType === "template") {
          return <TemplateProjectStep onComplete={handleStepTwoComplete} />;
        }
        return null;
      case 3:
        return (
          <ProjectConfigurationStep
            projectData={projectData}
            onProjectCreate={handleProjectCreate}
            creating={creating}
          />
        );
      default:
        return null;
    }
  };

  const getCurrentStepForDisplay = () => {
    if (selectedType === 'empty') {
      // Pour les projets vides : étape 1 = sélection type, étape 2 = options
      return currentStep === 1 ? 1 : 2;
    } else {
      // Pour les autres : étape 1 = sélection type, étape 2 = génération/template, étape 3 = options
      return currentStep;
    }
  };

  const getTotalStepsForDisplay = () => {
    return selectedType === 'empty' ? 2 : 3;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-center items-center h-full w-full text-text-dark">
        <div className="flex flex-col h-full w-full max-w-[1200px]">
          <div className="w-full py-8 px-[clamp(30px,5%,5%)] pb-4">
            <div className="flex items-center justify-between gap-4 relative">
              <div className="flex items-center gap-8">
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-2 bg-transparent border-none text-accent text-base cursor-pointer p-2 rounded transition-colors hover:bg-secondary"
                >
                  <ArrowLeft size={20} />
                  Retour
                </button>
              </div>

              <h1 className="text-2xl font-semibold m-0 text-text-dark absolute left-1/2 transform -translate-x-1/2 text-center">
                {getPageTitle()}
              </h1>

              <div className="flex items-center gap-8">
                {currentStep === 3 && (
                  <button
                    onClick={handleCreateButtonClick}
                    disabled={creating}
                    className="bg-accent text-white border-none rounded-lg py-3 px-6 text-base cursor-pointer transition-all duration-200 font-normal tracking-normal whitespace-nowrap hover:bg-accent-hover hover:shadow-[0_5px_20px_rgba(151,112,69,0.15)] disabled:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {creating ? "Création..." : "Créer le projet"}
                  </button>
                )}
              </div>
            </div>

            {/* Indicateur d'étapes */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: getTotalStepsForDisplay() }, (_, i) => i + 1).map((step) => {
                const isActive = step === getCurrentStepForDisplay();
                const isClickable = step < getCurrentStepForDisplay() && !(selectedType === 'empty' && step === 2);
                
                return (
                  <div
                    key={step}
                    className={`flex items-center justify-center w-15 h-2 rounded-md bg-secondary text-text-muted text-sm font-medium transition-all duration-200 relative cursor-pointer hover:bg-accent-hover ${isClickable ? 'hover:-translate-y-0.5' : ''} ${isActive ? 'bg-accent text-white' : ''} ${step !== getTotalStepsForDisplay() ? "after:content-[''] after:absolute after:w-5 after:h-0.5 after:bg-border after:left-full after:top-1/2 after:-translate-y-1/2 after:-z-10" : ''} ${isActive && step !== getTotalStepsForDisplay() ? 'after:bg-accent' : ''}`}
                    onClick={() => isClickable && handleStepClick(step)}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
