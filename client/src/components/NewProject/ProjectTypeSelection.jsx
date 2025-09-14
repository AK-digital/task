"use client";
import { Bot, FileText, FolderPlus, Import } from "lucide-react";
import { useRef } from "react";

export default function ProjectTypeSelection({ onTypeSelect }) {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Veuillez sélectionner un fichier JSON valide');
      return;
    }

    try {
      const text = await file.text();
      const projectData = JSON.parse(text);
      
      // Vérifier que le fichier contient les données nécessaires
      if (!projectData.project || !projectData.exportVersion) {
        alert('Le fichier JSON ne semble pas être un export de projet valide');
        return;
      }

      // Appeler la fonction d'import avec les données
      onTypeSelect('import', projectData);
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error);
      alert('Erreur lors de la lecture du fichier JSON');
    }

    // Réinitialiser l'input
    event.target.value = '';
  };

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
    <div className="flex flex-col justify-center items-center h-full w-full">
      <div className="grid grid-cols-3 gap-8 max-w-4xl w-full mb-6 lg:grid-cols-3 md:grid-cols-1 md:gap-6">
        {projectTypes.map((type) => (
          <button
            key={type.id}
            className="flex flex-col items-center text-center p-8 bg-secondary rounded-xl cursor-pointer transition-all duration-300 min-h-[250px] justify-center gap-4 shadow-small hover:-translate-y-1 hover:shadow-lg hover:bg-white md:min-h-[200px] md:p-6 text-text-dark-color"
            onClick={() => onTypeSelect(type.id)}
            type="button"
          >
            <div className="mb-2 text-accent-color">
              {type.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 m-0">{type.title}</h3>
            <p className="text-[0.95rem] text-text-muted m-0 leading-relaxed">{type.description}</p>
          </button>
        ))}
      </div>
      <div className="flex flex-col justify-center items-center w-full gap-4">
        <span className="text text-text-color-muted text-lg">ou</span>
        <button 
          className="secondary-button flex items-center gap-2"
          onClick={handleImportClick}
          type="button"
        >
          <Import size={20} /> Importer un projet
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
} 