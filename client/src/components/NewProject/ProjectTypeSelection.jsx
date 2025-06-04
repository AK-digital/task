"use client";
import { Bot, FileText, FolderPlus } from "lucide-react";
import styles from "@/styles/components/new-project/project-type-selection.module.css";

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
    <div className={styles.container}>
      <div className={styles.typeGrid}>
        {projectTypes.map((type) => (
          <button
            key={type.id}
            className={styles.typeCard}
            onClick={() => onTypeSelect(type.id)}
            type="button"
          >
            <div className={styles.typeIcon}>
              {type.icon}
            </div>
            <h3 className={styles.typeTitle}>{type.title}</h3>
            <p className={styles.typeDescription}>{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
} 