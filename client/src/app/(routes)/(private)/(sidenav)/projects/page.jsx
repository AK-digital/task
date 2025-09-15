"use client";
import { ArrowLeftCircle, Grid3X3, List, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/Projects/ProjectCard";
import ProjectCardSkeleton from "@/components/Projects/ProjectCardSkeleton";
import ProjectsSearch from "@/components/Projects/ProjectsSearch";
import ProjectsGrid from "@/components/Projects/ProjectsGrid";
import ProjectListItem from "@/components/Projects/ProjectListItem";
import { useProjects } from "../../../../../../hooks/useProjects";
import { AuthContext } from "@/context/auth";
import { useContext, useState, useEffect } from "react";
import Link from "next/link";

export default function Projects() {
  const { uid } = useContext(AuthContext);
  const { projects, projectsLoading, mutateProjects } = useProjects();
  const [queries, setQueries] = useState({ search: "" });
  const [viewMode, setViewMode] = useState("grid");

  // Charger le mode d'affichage depuis localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("projectsViewMode");
    if (savedViewMode && (savedViewMode === "grid" || savedViewMode === "list")) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Fonction pour changer le mode d'affichage
  const toggleViewMode = () => {
    const newViewMode = viewMode === "grid" ? "list" : "grid";
    setViewMode(newViewMode);
    localStorage.setItem("projectsViewMode", newViewMode);
  };

  // Filtrer les projets par terme de recherche
  const filteredProjects = projects?.filter((project) => {
    if (!queries.search) return true;
    return project?.name?.toLowerCase().includes(queries.search.toLowerCase()) ||
      project?.description?.toLowerCase().includes(queries.search.toLowerCase());
  });

  // Trier les projets par favoris (favoris en premier)
  const sortedProjects = filteredProjects?.sort((a, b) => {
    const aIsFavorite = a?.favorites?.some((fav) => fav?.user === uid) || false;
    const bIsFavorite = b?.favorites?.some((fav) => fav?.user === uid) || false;

    return bIsFavorite - aIsFavorite;
  });

  return (
    <main className="ml-6 w-full min-w-0 max-h-[calc(100vh-64px)]">
      <div className="py-4 pr-4 pl-[38px] bg-[#dad6c799] h-full rounded-tl-[10px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pr-4 pb-6 flex-shrink-0">
          {/* Header Left - Titre + Bouton vue */}
          <div className="flex items-center gap-8">
            <div className="relative mr-6">
              <h1 className="text-2xl min-w-max select-none mb-0">Vos projets</h1>
              <span className="absolute -top-2 -right-8 text-text-color-muted text-xs bg-secondary px-2 py-1 rounded-full select-none min-w-[24px] text-center">
                {projectsLoading ? "..." : `${filteredProjects?.length || 0}`}
              </span>
            </div>
            
            <div className="secondary-button" onClick={toggleViewMode} title={viewMode === "grid" ? "Vue liste" : "Vue grille"}>
              {viewMode === "grid" ? <List size={20} /> : <Grid3X3 size={20} />}
              <span className="text-sm font-medium">
                {viewMode === "grid" ? "Liste" : "Grille"}
              </span>
            </div>
            <ProjectsSearch setQueries={setQueries} />
          </div>

          
          {/* Header Right - Bouton nouveau projet */}
          <div className="flex items-center">
            <Link href="/new-project" className="secondary-button bg-accent-color hover:bg-accent-color/90 text-white border-accent-color">
              <Plus size={20} />
              <span className="text-sm font-medium whitespace-nowrap">Nouveau projet</span>
            </Link>
          </div>
        </div>
        
        {/* Container scrollable pour les projets */}
        <div className="flex-1 overflow-auto pr-5">
          {viewMode === "grid" ? (
          <ProjectsGrid
            projectsLoading={projectsLoading}
            sortedProjects={sortedProjects}
            mutateProjects={mutateProjects}
          />
        ) : (
          <div className="w-full">
            <div className="flex flex-col gap-3 max-w-[1400px] mx-auto">
              {projectsLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-secondary rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 h-4 bg-gray-300 rounded"></div>
                      <div className="w-20 h-4 bg-gray-300 rounded"></div>
                      <div className="w-20 h-4 bg-gray-300 rounded"></div>
                      <div className="w-32 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {sortedProjects?.map((project) => {
                    return (
                      <ProjectListItem
                        key={project?._id}
                        project={project}
                        mutateProjects={mutateProjects}
                        href={`/projects/${project?._id}`}
                      />
                    );
                  })}
                  <ProjectListItem href="/new-project" isDefault={true} />
                </>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
