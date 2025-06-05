"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Plus, Delete, Pencil } from "lucide-react";
import Image from "next/image";
import styles from "@/styles/pages/options.module.css";
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
    <div className={styles.container}>
      <form className={styles.form}>
        {/* Columns container */}
        <div className={`${styles.columns} ${styles.wizardColumns}`}>
          {/* Left Column */}
          <div className={styles.column}>
            {/* Informations */}
            <div className={styles.wrapper}>
              {/* Wrapper header */}
              <div className={styles.header}>
                <span className={styles.title}>Informations générales</span>
              </div>
              
              {/* Wrapper content */}
              <div className={styles.content}>
                {/* Project Logo */}
                <div
                  className={styles.picture}
                  onMouseEnter={() => setEditImg(true)}
                  onMouseLeave={() => setEditImg(false)}
                >
                  <Image
                    src={logoPreview}
                    alt="Logo du projet"
                    width={100}
                    height={100}
                    quality={100}
                    className={styles.logo}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  />
                  {editImg && (
                    <label htmlFor="logo" className={styles.editPicture}>
                      <Pencil size={20} />
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
                    className={`${styles.projectName} ${bricolageGrostesque.className}`}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Nom du projet"
                    required
                  />
                </div>

                {(boardsCount > 0 || tasksCount > 0) && (
                  <div className={styles.footer}>
                    <div className={styles.counts}>
                      <span>{boardsCount} tableaux</span>
                      <span>{tasksCount} tâches</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Links */}
            <div className={styles.wrapper}>
              <div className={styles.title}>
                <span>Liens rapides</span>
              </div>
              <div className={styles.content}>
                {isNotEmpty(links) &&
                  links?.map((link, idx) => {
                    return (
                      <div className={styles.link} key={idx}>
                        <div
                          className={styles.icon}
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
                        />
                        <div
                          className={styles.remove}
                          onClick={(e) => removeLink(e, link)}
                        >
                          <Delete size={20} />
                        </div>
                      </div>
                    );
                  })}
                {links.length < 6 && (
                  <button onClick={addLink} className={styles.addLink} type="button">
                    Ajouter un lien
                  </button>
                )}
              </div>
            </div>


          </div>

          {/* Right Column */}
          <div className={`${styles.column} ${styles.wizardRightColumn}`}>
            {/* Gestion des utilisateurs */}
            <div className={styles.wrapper} style={{ height: 'fit-content' }}>
              <div className={styles.title}>
                <span>Gestion de l'équipe</span>
              </div>
              <div className={styles.content}>
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
            <div className={`${styles.wrapper} ${styles.flexWrapper}`}>
              <div className={styles.title}>
                <span>Notes du projet</span>
              </div>
              <div className={styles.content}>
                <textarea
                  name="note"
                  id="note"
                  className={`${styles.note} ${styles.adaptiveNote} ${projectNote.length > 300 ? styles.hasContent : ''} ${bricolageGrostesque.className}`}
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
      <div className={styles.iconList}>
        {icons.map((icon) => (
          <div
            key={icon?.name}
            className={styles.iconElement}
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