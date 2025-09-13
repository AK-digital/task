import Image from "next/image";

export default function TaskProject({ task }) {
  const project = task?.projectId;
  return (
    <div className="task-col-project task-content-col  flex-col text-[#CC9348] text-small select-none border-l border-r border-text-color">
      <Image
        src={project?.logo || "/default/default-project-logo.webp"}
        width={32}
        height={32}
        className="rounded-full w-6 h-6 lg:w-8 lg:h-8 max-w-8 max-h-8"
        alt={`Logo du projet ${project?.name}`}
      />
    </div>
  );
}
