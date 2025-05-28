import Image from "next/image";

export default function TaskProject({ task }) {
  const project = task?.projectId;
  return (
    <div className="flex-col justify-center border-l border-r border-color-text-color px-4 min-w-[140px] max-w-[180px] w-full text-[#CC9348] text-text-size-small h-full" id="task-row">
      <Image
        src={project?.logo || "/default-project-logo.webp"}
        width={24}
        height={24}
        className="rounded-full w-6 h-6 max-w-6 max-h-6"
        alt={`Logo du projet ${project?.name}`}
      />
      <span>{project?.name}</span>
    </div>
  );
}
