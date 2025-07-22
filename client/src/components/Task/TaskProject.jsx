import Image from "next/image";

export default function TaskProject({ task }) {
  const project = task?.projectId;
  return (
    <div className="hidden md:flex items-center flex-col justify-center border-l border-r border-text-color px-2 lg:px-4 w-16 lg:w-20 text-[#CC9348] text-small h-full select-none flex-shrink-0">
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
