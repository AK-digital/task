"use client";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/Projects/ProjectCard";
import ProjectCardSkeleton from "@/components/Projects/ProjectCardSkeleton";
import { useProjects } from "@/app/hooks/useProjects";

export default function Projects() {
  const router = useRouter();
  const { projects, projectsLoading, mutateProjects } = useProjects();
  // Sort projects by favorites
  projects?.sort((a, b) => {
    return b.favorites?.length - a.favorites?.length;
  });

  return (
    <main className="relative ml-6 w-full max-h-[calc(100vh-62px)]">
      <div className="relative flex items-center flex-col rounded-tl-2xl bg-background-primary-transparent h-full pl-6 pt-6">
        <div onClick={() => router.back()} className="absolute z-2 top-20 left-10 cursor-pointer">
          <ArrowLeftCircle size={32} />
        </div>
        <div className="flex justify-between items-center w-full pr-6 mb-5">
          <h1 className="ml-[175px]">Vos projets</h1>
          <div className="text-text-color-muted text-[0.85rem] font-medium bg-background-secondary-color px-3 py-1.5 rounded-lg">
            <span>
              {projectsLoading ? "..." : `${projects?.length} projets`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-y-20 gap-x-15 justify-center w-full max-w-[calc(4*310px+3*60px)] mx-auto pt-15 pb-15 pr-6">
          {projectsLoading ? (
            <ProjectCardSkeleton />
          ) : (
            <>
              {projects?.map((project) => {
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
    </main>
  );
}
