import ProjectCard from "./ProjectCard";
import ProjectCardSkeleton from "./ProjectCardSkeleton";

export default function ProjectsGrid({ 
  projectsLoading, 
  sortedProjects, 
  mutateProjects 
}) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 max-w-[1400px] mx-auto">
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
        <ProjectCard href="/new-project" isDefault={true} />
      </div>
    </div>
  );
} 