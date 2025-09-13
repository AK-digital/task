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
    <main className="relative ml-6 w-full max-h-[calc(100vh-62px)]">
      <div className="relative flex items-center flex-col rounded-tl-2xl bg-primary-transparent h-full pl-6 pt-6">
        <div className="flex justify-between items-center w-full gap-8 pr-6 max-w-full">
                     <div className="relative">
             <h1 className="select-none mb-0 text-2xl whitespace-nowrap pr-8">Vos projets</h1>
             <span className="absolute -top-1 right-2 text-text-color-muted text-[0.7rem] bg-secondary p-[3px] rounded-md select-none">
               {projectsLoading ? "..." : `${filteredProjects?.length || 0}`}
             </span>
           </div>
          <div className="flex items-center gap-6 w-full">
            <button
              onClick={toggleViewMode}
              className="p-2 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-text-color-muted"
            >
              {viewMode === "grid" ? <List size={20} /> : <Grid3X3 size={20} />}
            </button>
            <ProjectsSearch setQueries={setQueries} />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/new-project"
              className="flex items-center gap-2 p-3 bg-accent-color hover:bg-accent-color/90 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Nouveau projet</span>
              <Plus size={20} />
            </Link>
          </div>
        </div>
        {viewMode === "grid" ? (
          <ProjectsGrid
            projectsLoading={projectsLoading}
            sortedProjects={sortedProjects}
            mutateProjects={mutateProjects}
          />
        ) : (
          <div className="w-full overflow-auto">
            <div className="flex flex-col gap-3 max-w-[1400px] mx-auto py-4 px-3 mt-6">
              {projectsLoading ? (
                <div className="bg-secondary rounded-lg p-4 animate-pulse">
                  <div className="h-12 bg-gray-300 rounded"></div>
                </div>
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
    </main>
  );
}
