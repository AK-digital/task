"use client";
import { Bot, FileText, FolderPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProjectTypeSelection({ onTypeSelect }) {
  const { t } = useTranslation();

  const projectTypes = [
    {
      id: "ia",
      title: t("newProject.type_ai_title"),
      description: t("newProject.type_ai_description"),
      icon: <Bot size={48} />,
    },
    {
      id: "template",
      title: t("newProject.type_template_title"),
      description: t("newProject.type_template_description"),
      icon: <FileText size={48} />,
    },
    {
      id: "empty",
      title: t("newProject.type_empty_title"),
      description: t("newProject.type_empty_description"),
      icon: <FolderPlus size={48} />,
    },
  ];

  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="grid grid-cols-3 gap-8 max-w-4xl w-full lg:grid-cols-3 md:grid-cols-1 md:gap-6">
        {projectTypes.map((type) => (
          <button
            key={type.id}
            className="flex flex-col items-center text-center p-8 bg-secondary rounded-xl cursor-pointer transition-all duration-300 min-h-[250px] justify-center gap-4 shadow-small hover:-translate-y-1 hover:shadow-lg hover:bg-white md:min-h-[200px] md:p-6 text-text-dark-color"
            onClick={() => onTypeSelect(type.id)}
            type="button"
          >
            <div className="mb-2 text-accent-color">{type.icon}</div>
            <h3 className="text-xl font-semibold mb-2 m-0">{type.title}</h3>
            <p className="text-[0.95rem] text-text-muted m-0 leading-relaxed">
              {type.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
