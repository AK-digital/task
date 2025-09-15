"use client";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import { UserCog, Plus, FileText, Layers } from "lucide-react";
import { useState } from "react";
import GuestsModal from "@/components/Modals/GuestsModal";
import TasksFilters from "@/components/tasks/TasksFilters";
import { useProjectContext } from "@/context/ProjectContext";
import { saveBoard } from "@/api/board";
import { mutate } from "swr";
import { useUserRole } from "../../hooks/useUserRole";
import BoardsTemplateList from "@/components/Templates/BoardsTemplateList";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function ProjectHeader({ displayedFilters }) {
  const { project, mutateProject } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);
  const members = project?.members || [];
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [showTemplateSidebar, setShowTemplateSidebar] = useState(false);
  
  const isAuthorized = useUserRole(project, [
    "owner",
    "manager", 
    "team",
    "customer",
  ]);

  async function handleAddBoard() {
    if (!isAuthorized || isAddingBoard) return;
    
    setIsAddingBoard(true);
    setShowBoardMenu(false);
    
    try {
      const response = await saveBoard(project?._id);
      
      if (response.success) {
        // Revalider les données des boards
        await mutate(`/boards?projectId=${project?._id}&archived=false`);
        
        // Attendre un peu pour que le DOM soit mis à jour
        setTimeout(() => {
          // Trouver le dernier board ajouté et scroller vers lui
          const boardElements = document.querySelectorAll('[data-board-id]');
          if (boardElements.length > 0) {
            const lastBoard = boardElements[boardElements.length - 1];
            lastBoard.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'nearest',
              inline: 'center'
            });
            
            // Déclencher l'édition du titre du board
            const titleElement = lastBoard.querySelector('[data-board-title]');
            if (titleElement) {
              titleElement.click();
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error('Erreur lors de la création du tableau:', error);
    } finally {
      setIsAddingBoard(false);
    }
  }

  function handleAddTemplate() {
    setShowBoardMenu(false);
    setShowTemplateSidebar(true);
  }
  

  return (
    <>
      <header className="w-full pr-6">
        <nav className="flex items-center gap-5 pb-4">
          <ProjectTitle project={project} />
          <TasksFilters displayedFilters={displayedFilters} />
          {isAuthorized && (
            <div 
              className="relative"
              onMouseEnter={() => !isAddingBoard && setShowBoardMenu(true)}
              onMouseLeave={() => setShowBoardMenu(false)}
            >
              <div
                className={`secondary-button ${isAddingBoard ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title="Ajouter un tableau"
              >
                <Plus size={20} />
                <span className="text-sm font-medium whitespace-nowrap">
                  {isAddingBoard ? 'Création...' : 'Ajouter un tableau'}
                </span>
              </div>
              
              {/* Menu déroulant */}
              {showBoardMenu && !isAddingBoard && (
                <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[250px]" style={{ zIndex: 9999 }}>
                  <div className="py-2 flex flex-col gap-2">
                    <div
                      onClick={handleAddBoard}
                      className="secondary-button mx-2 justify-start"
                    >
                      <FileText size={16} />
                      <span className="text-sm font-medium">Ajouter un tableau vide</span>
                    </div>
                    <div
                      onClick={handleAddTemplate}
                      className="secondary-button mx-2 justify-start"
                    >
                      <Layers size={16} />
                      <span className="text-sm font-medium">Ajouter depuis un modèle</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
            <div
              className='secondary-button'
              onClick={(e) => setIsOpen(true)}
              title={`Gérer les ${members.length} membre${members.length > 1 ? 's' : ''} de l'équipe`}
          >
            <UserCog size={20} />
            <span className="text-sm font-medium whitespace-nowrap">
              Membres
            </span>
            <span className="text-xs bg-secondary text-gray-600 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {members.length}
            </span>
            </div>
           
        </nav>
      </header>
      {isOpen && (
        <GuestsModal
          project={project}
          setIsOpen={setIsOpen}
          mutateProject={mutateProject}
        />
      )}
      
      {/* Sidebar pour les modèles de tableaux */}
      <Sidebar
        isOpen={showTemplateSidebar}
        onClose={() => setShowTemplateSidebar(false)}
        title="Modèles de tableaux"
        width="600px"
      >
        <BoardsTemplateList
          project={project}
          setAddBoardTemplate={() => setShowTemplateSidebar(false)}
          inSidebar={true}
        />
      </Sidebar>
    </>
  );
}
