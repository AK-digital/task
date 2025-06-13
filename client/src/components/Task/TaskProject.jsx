import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function TaskProject({ task }) {
  const { t } = useTranslation();
  const project = task?.projectId;
  return (
    <div className="flex items-center flex-col justify-center border-l border-r border-text-color px-4 w-20 text-[#CC9348] text-small h-full select-none">
      <Image
        src={project?.logo || "/default-project-logo.webp"}
        width={32}
        height={32}
        className="rounded-full w-8 h-8 max-w-8 max-h-8"
        alt={`${t("projects.project_logo_alt")} ${project?.name}`}
      />
    </div>
  );
}
