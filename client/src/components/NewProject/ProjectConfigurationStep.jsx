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
    <div className="relative bg-primary/90 rounded-tl-medium p-8 text-text-dark-color h-full overflow-auto">
      <form>
        {/* Columns container */}
        <div className="w-full flex justify-center gap-10">
          {/* Left Column */}
          <div className="flex flex-col gap-10 w-2/5">
            {/* Informations */}
            <div className="bg-secondary rounded-xl p-8">
              {/* Wrapper header */}
              <div className="flex justify-between">
                <span className="text-large">Informations générales</span>
              </div>
              
              {/* Wrapper content */}
              <div className="flex flex-col gap-0 mt-5">
                {/* Project Logo */}
                <div
                  className="relative w-fit"
                  onMouseEnter={() => setEditImg(true)}
                  onMouseLeave={() => setEditImg(false)}
                >
                  <Image
                    src={logoPreview}
                    alt="Logo du projet"
                    width={100}
                    height={100}
                    quality={100}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
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
                    className={`text-xl pl-1 border-b-2 border-text-dark-color text-text-color-dark ${bricolageGrostesque.className}`}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Nom du projet"
                    required
                  />
                </div>

                {(boardsCount > 0 || tasksCount > 0) && (
                  <div className="mt-6 flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                      <span>{boardsCount} tableaux</span>
                      <span>{tasksCount} tâches</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Links */}
            <div className="bg-secondary rounded-xl rounded-medium p-8">
              <div className="text-large">
                <span>Liens rapides</span>
              </div>
              <div className="flex flex-col gap-4 mt-5">
                {isNotEmpty(links) &&
                  links?.map((link, idx) => {
                    return (
                      <div className="flex items-center" key={idx}>
                        <div
                          className="relative flex items-center justify-center border border-text-medium-color h-11 w-11 cursor-pointer"
                          onClick={() => setMoreIcons(moreIcons === idx ? null : idx)}
                        >
                          {displayIcon(link?.icon)}
                          {moreIcons === idx && (
                            <IconList
                              setMoreIcons={setMoreIcons}
                              links={links}
                              setLinks={setLinks}
                              updateLinkIcon={updateLinkIcon}
                              idx={idx}
                            />
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="https://www.exemple.com"
                          value={link?.url}
                          onChange={(e) => updateLinkUrl(idx, e.target.value)}
                          className="relative top-0.5 pl-2"
                        />
                        <div
                          className="text-text-color-red pl-5 cursor-pointer"
                          onClick={(e) => removeLink(e, link)}
                        >
                          <Delete size={20} />
                        </div>
                      </div>
                    );
                  })}
                {links.length < 6 && (
                  <button onClick={addLink} className="bg-transparent text-accent-color w-fit p-0 mt-1.5 hover:bg-transparent hover:shadow-none hover:underline" type="button">
                    Ajouter un lien
                  </button>
                )}
              </div>
            </div>


          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-10 relative top-0 items-start h-full w-1/5 min-w-[400px]">
            {/* Gestion des utilisateurs */}
            <div className="bg-secondary rounded-xl p-8" style={{ height: 'fit-content' }}>
              <div className="text-large">
                <span>Gestion de l'équipe</span>
              </div>
              <div className="flex flex-col gap-0 mt-5">
                <ProjectInvitationForm 
                  invitations={invitations}
                  onInvitationsChange={setInvitations}
                />
                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-color-muted)' }}>
                  <p>💡 Les invitations seront envoyées après la création du projet</p>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="flex-1 flex flex-col w-full bg-secondary rounded-xl rounded-medium p-8">
              <div className="text-large">
                <span>Notes du projet</span>
              </div>
              <div className="flex-1 flex flex-col mt-5">
                <textarea
                  name="note"
                  id="note"
                  className={`flex-1 w-full h-auto min-h-[150px] resize-y box-border overflow-y-hidden border-none text-normal ${projectNote.length > 300 ? 'overflow-y-auto' : ''} ${bricolageGrostesque.className}`}
                  value={projectNote}
                  onChange={(e) => setProjectNote(e.target.value)}
                  placeholder="Ajouter une note sur le projet..."
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Composant pour la liste des icônes
function IconList({ setMoreIcons, updateLinkIcon, idx }) {
  function handleIconChange(iconName) {
    updateLinkIcon(idx, iconName);
  }

  return (
    <>
      <div className="absolute z-[2001] -top-6 right-11 h-fit p-3 w-44 flex justify-start items-center flex-wrap bg-secondary rounded-small shadow-small gap-3">
        {icons.map((icon) => (
          <div
            key={icon?.name}
            className="flex flex-col items-center justify-center p-1 rounded-small transition-all duration-150 linear hover:bg-third-background-color hover:cursor-pointer"
            onClick={() => handleIconChange(icon?.name)}
          >
            {icon?.icon}
          </div>
        ))}
      </div>
      <div
        id="modal-layout-opacity"
        onClick={(e) => {
          e.stopPropagation();
          setMoreIcons(null);
        }}
      />
    </>
  );
} 