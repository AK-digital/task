import ProjectCard from "./ProjectCard";
import ProjectCardSkeleton from "./ProjectCardSkeleton";

export default function ProjectsGrid({ 
  projectsLoading, 
  sortedProjects, 
  mutateProjects 
}) {
  return (
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
        <ProjectCard href="/new-project" isDefault={true} />
      </div>
    </div>
  );
} 