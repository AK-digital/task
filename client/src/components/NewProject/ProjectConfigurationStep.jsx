"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Plus, Delete, Pencil } from "lucide-react";
import Image from "next/image";
import { bricolageGrostesque } from "@/utils/font";
import { icons, isNotEmpty } from "@/utils/utils";
import ProjectInvitationForm from "./ProjectInvitationForm";

export default function ProjectConfigurationStep({ 
  projectData, 
  onProjectCreate,
  creating = false 
}) {
  // États pour les options du projet
  const [projectName, setProjectName] = useState(projectData?.title || projectData?.name || "");
  const [projectNote, setProjectNote] = useState("");
  const [projectLogo, setProjectLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("/default-project-logo.webp");
  const [links, setLinks] = useState([{ url: "", icon: "Globe" }]);
  const [moreIcons, setMoreIcons] = useState(null);
  const [invitations, setInvitations] = useState([]);
  
  // États UI
  const [editImg, setEditImg] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Validation : au minimum un nom de projet
    setIsValid(projectName.trim().length > 0);
  }, [projectName]);

  useEffect(() => {
    // Écouter l'événement de création depuis le header
    const handleCreateProject = () => {
      if (isValid && !creating) {
        const finalProjectData = {
          ...projectData,
          name: projectName,
          note: projectNote,
          logo: projectLogo,
          urls: links.filter(link => link.url.trim() !== ""),
          invitations: invitations
        };
        onProjectCreate(finalProjectData);
      }
    };

    window.addEventListener('createProject', handleCreateProject);
    return () => window.removeEventListener('createProject', handleCreateProject);
  }, [isValid, creating, projectData, projectName, projectNote, projectLogo, links, invitations, onProjectCreate]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProjectLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayIcon = (name) => {
    const icon = icons.find((icon) => icon.name === name);
    return icon?.icon || <Globe size={20} />;
  };

  const addLink = (e) => {
    e.preventDefault();
    if (links.length >= 6) return;

    setLinks((prevLinks) => [
      ...prevLinks,
      {
        url: "",
        icon: "Globe",
      },
    ]);
  };

  const removeLink = (e, link) => {
    e.preventDefault();
    const updatedLinks = links.filter((l) => l !== link);
    setLinks(updatedLinks);
  };

  const updateLinkUrl = (index, url) => {
    const updatedLinks = [...links];
    updatedLinks[index].url = url;
    setLinks(updatedLinks);
  };

  const updateLinkIcon = (index, iconName) => {
    const updatedLinks = [...links];
    updatedLinks[index].icon = iconName;
    setLinks(updatedLinks);
    setMoreIcons(null);
  };

  // Données simulées pour les compteurs
  const boardsCount = projectData?.boards?.length || 0;
  const tasksCount = projectData?.boards?.reduce((total, board) => total + (board.tasks?.length || 0), 0) || 0;

  return (
    <div className="relative bg-primary/90 rounded-tl-lg p-8 text-text-dark h-full overflow-auto">
      <div className="w-full h-full">
        {/* Columns container */}
        <div className="w-full flex justify-center gap-10">
          {/* Left Column */}
          <div className="flex flex-col gap-10 w-2/5">
            {/* Informations */}
            <div className="bg-white/50 rounded-lg p-8">
              {/* Wrapper header */}
              <div className="flex justify-between mb-5">
                <span className="text-lg font-medium">Informations générales</span>
              </div>
              
              {/* Wrapper content */}
              <div className="flex flex-col gap-0 mt-5">
                {/* Project Logo */}
                <div
                  className="relative w-fit mb-4"
                  onMouseEnter={() => setEditImg(true)}
                  onMouseLeave={() => setEditImg(false)}
                >
                  <Image
                    src={logoPreview}
                    alt="Logo du projet"
                    width={100}
                    height={100}
                    quality={100}
                    className="rounded-full object-cover object-center"
                  />
                  {editImg && (
                    <label htmlFor="logo" className="absolute inset-0 bg-black/50 flex justify-center items-center cursor-pointer min-w-[100px] h-[100px] rounded-full">
                      <Pencil size={20} className="text-white" />
                    </label>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="logo"
                    hidden
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </div>

                {/* Project Name */}
                <div>
                  <input
                    type="text"
                    id="project-name"
                    name="project-name"
                    className={`text-xl pl-1 border-b-2 border-text-dark text-text-dark bg-transparent focus:outline-none w-full ${bricolageGrostesque.className}`}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Nom du projet"
                    required
                  />
                </div>

                {(boardsCount > 0 || tasksCount > 0) && (
                  <div className="mt-6 flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{boardsCount} tableaux</span>
                      <span className="text-sm">{tasksCount} tâches</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Links */}
            <div className="bg-white/50 rounded-lg p-8">
              <div className="text-lg font-medium mb-5">
                <span>Liens rapides</span>
              </div>
              <div className="flex flex-col gap-4">
                {isNotEmpty(links) &&
                  links?.map((link, idx) => {
                    return (
                      <div className="flex items-center" key={idx}>
                        <div
                          className="relative flex items-center justify-center border border-border h-11 w-11 cursor-pointer"
                          onClick={() => setMoreIcons(moreIcons === idx ? null : idx)}
                        >
                          {displayIcon(link.icon)}
                          {moreIcons === idx && (
                            <IconList
                              setMoreIcons={setMoreIcons}
                              updateLinkIcon={updateLinkIcon}
                              idx={idx}
                            />
                          )}
                        </div>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateLinkUrl(idx, e.target.value)}
                          placeholder="https://example.com"
                          className="relative top-0.5 pl-2 bg-transparent border-none focus:outline-none flex-1"
                        />
                        <button
                          className="text-red-600 pl-5 cursor-pointer bg-transparent border-none"
                          onClick={(e) => removeLink(e, link)}
                        >
                          <Delete size={16} />
                        </button>
                      </div>
                    );
                  })}

                <button
                  onClick={addLink}
                  className="bg-transparent text-accent w-fit p-0 mt-1.5 hover:bg-transparent hover:shadow-none hover:underline border-none cursor-pointer"
                  disabled={links.length >= 6}
                >
                  <Plus size={16} className="inline mr-1" />
                  Ajouter un lien
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative top-0 w-1/5 min-w-[400px] flex flex-col items-start h-full">
            <div className="flex-1 flex flex-col w-full">
              <div className="flex-1 bg-white/50 rounded-lg p-8 flex flex-col w-full">
                <div className="text-lg font-medium mb-5">
                  <span>Notes du projet</span>
                </div>
                <div className="flex-1 flex flex-col">
                  <textarea
                    value={projectNote}
                    onChange={(e) => setProjectNote(e.target.value)}
                    placeholder="Ajoutez vos notes sur le projet..."
                    className="flex-1 w-full h-auto min-h-[150px] resize-y box-border bg-transparent border-none text-base focus:outline-none overflow-y-hidden"
                  />
                </div>
              </div>
            </div>
            
            {/* Invitations */}
            <div className="w-full mt-8">
              <ProjectInvitationForm
                onInvitationsChange={setInvitations}
                disabled={creating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconList({ setMoreIcons, updateLinkIcon, idx }) {
  function handleIconChange(iconName) {
    updateLinkIcon(idx, iconName);
    setMoreIcons(null);
  }

  return (
    <div className="absolute z-[2001] -top-6 right-11 h-fit p-3 w-44 flex justify-start items-center flex-wrap bg-secondary rounded-sm shadow-small gap-3">
      {icons.map((icon, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center p-1 rounded-sm transition-all duration-150 hover:bg-third cursor-pointer"
          onClick={() => handleIconChange(icon.name)}
        >
          <span className="text-xs">{icon.icon}</span>
        </div>
      ))}
    </div>
  );
} 