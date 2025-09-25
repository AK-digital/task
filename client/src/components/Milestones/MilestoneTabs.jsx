"use client";

import { useState, useRef, useMemo } from "react";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import { useMilestones } from "@/hooks/api/useMilestones";
import { useUserRole } from "@/hooks/api/useUserRole";
import { saveMilestone, updateMilestone, deleteMilestone, assignBoardToMilestone } from "@/api/milestone";

export default function MilestoneTabs({ 
  project, 
  activeMilestone, 
  setActiveMilestone, 
  onBoardDrop 
}) {
  // S'assurer que nous n'utilisons que l'ID du projet pour éviter les problèmes de sérialisation
  const projectId = project?._id;
  const { milestones, mutateMilestones } = useMilestones(projectId);
  
  // États locaux
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [editMilestoneName, setEditMilestoneName] = useState("");
  const [dragOverMilestone, setDragOverMilestone] = useState(null);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  // Créer un objet projet sérialisé pour useUserRole
  const serializedProject = useMemo(() => {
    if (!project) return null;
    
    try {
      return {
        _id: typeof project._id === 'string' ? project._id : project._id?.toString(),
        members: project.members?.map(member => ({
          user: typeof member.user === 'object' ? 
            (typeof member.user._id === 'string' ? member.user._id : member.user._id?.toString()) : 
            (typeof member.user === 'string' ? member.user : member.user?.toString()),
          role: member.role
        })) || []
      };
    } catch (error) {
      console.error("Erreur lors de la sérialisation du projet:", error);
      return null;
    }
  }, [project]);

  const isManager = useUserRole(serializedProject, ["owner", "manager"]);

  // Couleurs pour les jalons
  const milestoneColors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
  ];

  const handleAddMilestone = async () => {
    if (!newMilestoneName.trim() || !isManager) return;

    try {
      const color = milestoneColors[milestones.length % milestoneColors.length];
      const response = await saveMilestone(projectId, {
        name: newMilestoneName.trim(),
        color
      });

      if (response.success) {
        // Revalider les jalons en forçant un refetch
        await mutateMilestones();
        setNewMilestoneName("");
        setIsAddingMilestone(false);
      }
    } catch (error) {
      console.error("Erreur lors de la création du jalon:", error);
    }
  };

  const handleUpdateMilestone = async (milestoneId) => {
    if (!editMilestoneName.trim() || !isManager) return;

    try {
      const response = await updateMilestone(milestoneId, {
        name: editMilestoneName.trim()
      });

      if (response.success) {
        await mutateMilestones();
        setEditingMilestone(null);
        setEditMilestoneName("");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du jalon:", error);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!isManager) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce jalon ? Les tableaux qui lui sont assignés seront désassignés.")) {
      return;
    }

    try {
      const response = await deleteMilestone(milestoneId, projectId);

      if (response.success) {
        await mutateMilestones();
        
        // Si le jalon supprimé était actif, revenir à "Tous"
        if (activeMilestone === milestoneId) {
          setActiveMilestone("all");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du jalon:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, milestoneId) => {
    e.preventDefault();
    if (isManager) {
      setDragOverMilestone(milestoneId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Vérifier si on quitte vraiment l'élément (pas juste un enfant)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverMilestone(null);
    }
  };

  const handleDrop = async (e, milestoneId) => {
    e.preventDefault();
    setDragOverMilestone(null);
    
    console.log("🎯 [DROP] Début du drop");
    console.log("🎯 [DROP] MilestoneId:", milestoneId);
    console.log("🎯 [DROP] IsManager:", isManager);
    
    if (!isManager) {
      console.log("🎯 [DROP] Pas de permissions manager");
      return;
    }

    const boardId = e.dataTransfer.getData("text/plain");
    console.log("🎯 [DROP] BoardId récupéré:", boardId);
    
    if (!boardId) {
      console.log("🎯 [DROP] Pas de boardId");
      return;
    }

    try {
      console.log("🎯 [DROP] Appel assignBoardToMilestone avec:", {
        boardId,
        milestoneId: milestoneId === "all" ? null : milestoneId,
        projectId
      });
      
      const response = await assignBoardToMilestone(
        boardId, 
        milestoneId === "all" ? null : milestoneId, 
        projectId
      );

      console.log("🎯 [DROP] Réponse:", response);

      if (response.success) {
        console.log("🎯 [DROP] Succès - revalidation des données");
        // Revalider les jalons pour mettre à jour les statistiques
        await mutateMilestones();
        
        // Callback pour notifier le parent
        if (onBoardDrop) {
          onBoardDrop(boardId, milestoneId);
        }
      } else {
        console.error("🎯 [DROP] Échec:", response.message);
      }
    } catch (error) {
      console.error("🎯 [DROP] Erreur lors de l'assignation du tableau:", error);
    }
  };

  const startEditing = (milestone) => {
    setEditingMilestone(milestone._id);
    setEditMilestoneName(milestone.name);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const cancelEditing = () => {
    setEditingMilestone(null);
    setEditMilestoneName("");
  };

  const startAdding = () => {
    setIsAddingMilestone(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelAdding = () => {
    setIsAddingMilestone(false);
    setNewMilestoneName("");
  };

  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
      {/* Tab "Tous les jalons" */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
          activeMilestone === "all"
            ? "bg-primary text-white"
            : "bg-secondary hover:bg-gray-200"
        } ${
          dragOverMilestone === "all" && isManager
            ? "ring-2 ring-blue-400 ring-opacity-50 bg-blue-50"
            : ""
        }`}
        onClick={() => setActiveMilestone("all")}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, "all")}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, "all")}
      >
        <span className="text-sm font-medium">Tous les jalons</span>
        {dragOverMilestone === "all" && isManager && (
          <span className="text-xs opacity-75">📋 Désassigner</span>
        )}
      </div>

      {/* Tabs des jalons */}
      {milestones.map((milestone) => (
        <div
          key={milestone._id}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap group ${
            activeMilestone === milestone._id
              ? "text-white"
              : "bg-secondary hover:bg-gray-200"
          } ${
            dragOverMilestone === milestone._id && isManager
              ? "ring-2 ring-opacity-50 scale-105"
              : ""
          }`}
          style={{
            backgroundColor: activeMilestone === milestone._id ? milestone.color : undefined,
            ringColor: dragOverMilestone === milestone._id ? milestone.color : undefined
          }}
          onClick={() => setActiveMilestone(milestone._id)}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, milestone._id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, milestone._id)}
        >
          {editingMilestone === milestone._id ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                ref={editInputRef}
                type="text"
                value={editMilestoneName}
                onChange={(e) => setEditMilestoneName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateMilestone(milestone._id);
                  if (e.key === "Escape") cancelEditing();
                }}
                onBlur={() => handleUpdateMilestone(milestone._id)}
                className="bg-white text-gray-900 px-2 py-1 rounded text-sm min-w-0 w-24"
              />
            </div>
          ) : (
            <>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: milestone.color }}
              />
              <span className="text-sm font-medium">{milestone.name}</span>
              
              {/* Afficher les statistiques du jalon */}
              {milestone.totalTasks > 0 && (
                <div className="flex items-center gap-1 text-xs opacity-75">
                  <span>({milestone.completedTasks}/{milestone.totalTasks})</span>
                  {milestone.progress > 0 && (
                    <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white/60 rounded-full transition-all"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* Afficher la deadline si elle existe */}
              {milestone.endDate && (
                <div className="text-xs opacity-75">
                  📅 {new Date(milestone.endDate).toLocaleDateString('fr-FR')}
                </div>
              )}

              {/* Indicateur de drop */}
              {dragOverMilestone === milestone._id && isManager && (
                <span className="text-xs opacity-75">📋 Assigner</span>
              )}
              
              {isManager && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(milestone);
                    }}
                    className="p-1 hover:bg-white/20 rounded"
                    title="Modifier le jalon"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMilestone(milestone._id);
                    }}
                    className="p-1 hover:bg-white/20 rounded text-red-300 hover:text-red-200"
                    title="Supprimer le jalon"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Bouton/Input d'ajout de jalon */}
      {isManager && (
        <div className="flex-shrink-0">
          {isAddingMilestone ? (
            <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
              <input
                ref={inputRef}
                type="text"
                value={newMilestoneName}
                onChange={(e) => setNewMilestoneName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddMilestone();
                  if (e.key === "Escape") cancelAdding();
                }}
                onBlur={handleAddMilestone}
                placeholder="Nom du jalon"
                className="bg-white px-2 py-1 rounded text-sm min-w-0 w-32"
              />
              <button
                onClick={cancelAdding}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={startAdding}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-gray-200 rounded-lg transition-all whitespace-nowrap"
              title="Ajouter un jalon"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">Ajouter un jalon</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
