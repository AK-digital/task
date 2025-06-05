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
        return "Création d'un projet vide";
      default:
        return "Création d'un nouveau projet";
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return <ProjectTypeSelection onTypeSelect={handleTypeSelection} />;
    }

    if (currentStep === 3) {
      return (
        <ProjectConfigurationStep 
          projectData={projectData}
          onProjectCreate={handleProjectCreate}
          creating={creating}
        />
      );
    }

    // Étape 2 - selon le type sélectionné (sauf pour empty qui va directement à l'étape 3)
    switch (selectedType) {
      case "ia":
        return <IAProjectStep onComplete={handleStepTwoComplete} />;
      case "template":
        return <TemplateProjectStep onComplete={handleStepTwoComplete} />;
      default:
        return <ProjectTypeSelection onTypeSelect={handleTypeSelection} />;
    }
  };

  return (
    <main className="w-full h-full flex flex-col">
      <div className="flex justify-center items-center h-full w-full text-text-dark-color">
        <div className="flex flex-col h-full w-full max-w-[1200px]">
          {/* Header avec bouton retour et titre */}
          <div className="w-full px-[clamp(30px,5%,5%)] py-8 pb-4">
            <div className="flex items-center justify-between gap-4 relative">
              <button 
                className="flex items-center gap-2 bg-transparent border-none text-accent-color text-base cursor-pointer p-2 rounded transition-colors duration-200 hover:bg-secondary"
                onClick={handleGoBack}
                type="button"
              >
                <ArrowLeft size={20} />
                Retour
              </button>
              <h1 className="text-2xl font-semibold m-0 text-text-dark-color absolute left-1/2 transform -translate-x-1/2 text-center">{getPageTitle()}</h1>
              
              <div className="flex items-center gap-8">
                {/* Bouton créer le projet (seulement à l'étape 3) */}
                {currentStep === 3 && (
                  <button
                    className="bg-accent-color text-white border-none rounded-large py-3 px-6 text-medium font-normal cursor-pointer transition-all duration-200 tracking-normal whitespace-nowrap hover:bg-accent-color-hover hover:shadow-[0_5px_20px_rgba(151,112,69,0.15)] hover:-translate-y-px disabled:bg-accent-color-hover disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    onClick={() => {
                      // Déclencher la création depuis le composant ProjectConfigurationStep
                      const event = new CustomEvent('createProject');
                      window.dispatchEvent(event);
                    }}
                    disabled={creating}
                  >
                    {creating ? "Création en cours..." : "Créer le projet"}
                  </button>
                )}
              </div>
            </div>
            
            {/* Indicateur d'étapes sous le titre */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span 
                className={`flex items-center justify-center w-[60px] h-2 rounded-md transition-all duration-200 ease-in-out relative cursor-pointer after:content-[''] after:absolute after:w-5 after:h-0.5 after:left-full after:top-1/2 after:-translate-y-1/2 after:-z-10 last:after:hidden ${currentStep >= 1 ? 'bg-accent-color text-white after:bg-accent-color' : 'bg-secondary text-text-color-muted after:bg-border-color hover:bg-accent-color-hover'} ${currentStep > 1 ? 'hover:-translate-y-px' : ''}`}
                onClick={() => currentStep > 1 && handleStepClick(1)}
              ></span>
              <span 
                className={`flex items-center justify-center w-[60px] h-2 rounded-md transition-all duration-200 ease-in-out relative cursor-pointer after:content-[''] after:absolute after:w-5 after:h-0.5 after:left-full after:top-1/2 after:-translate-y-1/2 after:-z-10 last:after:hidden ${currentStep >= 2 ? 'bg-accent-color text-white after:bg-accent-color' : 'bg-secondary text-text-color-muted after:bg-border-color hover:bg-accent-color-hover'} ${currentStep > 2 && selectedType !== 'empty' ? 'hover:-translate-y-px' : ''}`}
                onClick={() => currentStep > 2 && selectedType !== 'empty' && handleStepClick(2)}
              ></span>
              <span 
                className={`flex items-center justify-center w-[60px] h-2 rounded-md transition-all duration-200 ease-in-out relative cursor-pointer after:content-[''] after:absolute after:w-5 after:h-0.5 after:left-full after:top-1/2 after:-translate-y-1/2 after:-z-10 last:after:hidden ${currentStep >= 3 ? 'bg-accent-color text-white after:bg-accent-color' : 'bg-secondary text-text-color-muted after:bg-border-color hover:bg-accent-color-hover'}`}
              ></span>
            </div>
          </div>

          {/* Contenu de l'étape */}
          <div className="flex-1 p-8 overflow-y-auto">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </main>
  );
}
