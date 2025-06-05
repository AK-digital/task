"use client";
import { Bot, FileText, FolderPlus } from "lucide-react";

export default function ProjectTypeSelection({ onTypeSelect }) {
  const projectTypes = [
    {
      id: "ia",
      title: "Projet par IA",
      description: "Créez votre projet grâce à l'intelligence artificielle",
      icon: <Bot size={48} />,
    },
    {
      id: "template",
      title: "Depuis un modèle enregistré",
      description: "Utilisez un modèle prédéfini pour démarrer rapidement",
      icon: <FileText size={48} />,
    },
    {
      id: "empty",
      title: "Projet vide",
      description: "Commencez avec un projet complètement vide",
      icon: <FolderPlus size={48} />,
    },
  ];

  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="grid grid-cols-3 gap-8 max-w-4xl w-full lg:grid-cols-2 lg:max-w-2xl md:grid-cols-1 md:gap-6 md:max-w-sm">
        {projectTypes.map((type) => (
          <button
            key={type.id}
            className="flex flex-col items-center text-center p-8 bg-secondary rounded-xl cursor-pointer transition-all duration-300 min-h-[250px] justify-center gap-4 shadow-small hover:-translate-y-1 hover:shadow-lg hover:bg-white md:min-h-[200px] md:p-6"
            onClick={() => onTypeSelect(type.id)}
            type="button"
          >
            <div className="text-accent mb-2">
              {type.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 m-0">{type.title}</h3>
            <p className="text-[0.95rem] text-text-muted m-0 leading-relaxed">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
} 