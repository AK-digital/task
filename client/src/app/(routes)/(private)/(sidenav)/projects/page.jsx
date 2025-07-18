"use client";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/Projects/ProjectCard";
import ProjectCardSkeleton from "@/components/Projects/ProjectCardSkeleton";
import ProjectsSearch from "@/components/Projects/ProjectsSearch";
import { useProjects } from "../../../../../../hooks/useProjects";
import { AuthContext } from "@/context/auth";
import { useContext, useState } from "react";

export default function Projects() {
  const { uid } = useContext(AuthContext);
  const { projects, projectsLoading, mutateProjects } = useProjects();
  const [queries, setQueries] = useState({ search: "" });

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
        <div className="flex justify-between items-start w-full gap-6 pr-6 mb-5 max-w-[1400px]">
          <h1 className="select-none">Vos projets</h1>

            <ProjectsSearch setQueries={setQueries} />
            <div className="text-text-color-muted text-[0.85rem] font-medium bg-secondary px-3 py-1.5 rounded-lg select-none">
              <span>
                {projectsLoading ? "..." : `${filteredProjects?.length || 0} projets`}
              </span>
            </div>
          </div>
        <div className="w-full overflow-auto">
          <div className="grid grid-cols-4 gap-[70px] max-w-[1400px] mx-auto py-4 px-3 mt-6">
            {projectsLoading ? (
              <ProjectCardSkeleton />
            ) : (
              <>
                {sortedProjects?.map((project) => {
                  return (
                    <ProjectCard
                      key={project?._id}
                      project={project}
                      mutateProjects={mutateProjects}
                      href={`/projects/${project?._id}`}
                    />
                  );
                })}
              </>
            )}
            {/* Élément pour créer un nouveau projet */}
            <ProjectCard href="/new-project" isDefault={true} />
          </div>
        </div>
      </div>
    </main>
  );
}
