"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import styles from "@/styles/pages/options.module.css";
import moment from "moment/moment";
import "moment/locale/fr";
import Image from "next/image";
import {
  Archive,
  ArrowLeftCircle,
  Figma,
  Github,
  Globe,
  Layout,
  Pencil,
  Youtube,
  Gitlab,

} from "lucide-react";
import Link from "next/link";
import { bricolageGrostesque } from "@/utils/font";
import { deleteProject, updateProjectLogo } from "@/api/project";
import { useRouter } from "next/navigation";
import { updateProject } from "@/actions/project";
import PopupMessage from "@/layouts/PopupMessage";
import { useUserRole } from "@/app/hooks/useUserRole";
import { mutate } from "swr";
moment.locale("fr");

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

const icons = [
  {
    name: "Globe",
    icon: <Globe size={20} />,
  },
  {
    name: "Layout",
    icon: <Layout size={20} />,
  },
  {
    name: "Figma",
    icon: <Figma size={20} />,
  },
  {
    name: "Github",
    icon: <Github size={20} />,
  },
  {
    name: "Youtube",
    icon: <Youtube size={20} />,
  },
  {
    name: "Gitlab",
    icon: <Gitlab size={20} />,
  },
];

export default function ProjectOptions({ project }) {
  const router = useRouter();
  const [moreIcons, setMoreIcons] = useState(null)
  const [hasChange, setHasChange] = useState(true);
  const [firstIcon, setFirstIcon] = useState(project?.urls[0]?.name || icons[0]?.name);
  const [secondIcon, setSecondIcon] = useState(project?.urls[1]?.name || icons[1]?.name);
  const [thirdIcon, setThirdIcon] = useState(project?.urls[2]?.name || icons[2]?.name);
  const [fourthIcon, setFourthIcon] = useState(project?.urls[3]?.name || icons[3]?.name);
  const [initialProject, setInitialProject] = useState({
    name: project?.name,
    note: project?.note,
    urls: project?.urls,
  });
  const [popup, setPopup] = useState(null);
  const [state, formAction, pending] = useActionState(
    updateProject,
    initialState
  );
  const [editImg, setEditImg] = useState(false);
  const [isPictLoading, setIsPictLoading] = useState(false);
  const canEdit = useUserRole(project, ["owner", "manager"]);

  if (!canEdit) {
    router.push("/projects");
  }

  const author = project?.members.find((member) => member?.role === "owner");
  const createdAt = moment(project?.createdAt).format("DD/MM/YYYY");

  useEffect(() => {
    if (state?.status === "success") {
      setHasChange(true);
      mutate(`/project/${project?._id}`);
      setPopup({
        title: "Modifications enregistrées",
        message: "Les modifications ont été enregistrées avec succès",
      });

      return;
    }
    if (state?.status === "failure") {
      setPopup({
        title: "Une erreur est survenue",
        message: state?.message,
      });
      return;
    }
  }, [state]);

  useEffect(() => {
    if (popup) {
      const timeout = setTimeout(() => {
        setPopup(null);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [popup]);

  async function handleHasChange() {
    const currentValues = {
      name: document.getElementById("project-name")?.value,
      note: document.getElementById("note")?.value,
      urls: Array.from(document.getElementsByClassName("url")).map((el) => el.value),
    };
  
    const initialUrls = initialProject?.urls?.map((u) => u.url) || [];
  
    const isDifferent = (
      currentValues.name !== initialProject.name ||
      currentValues.note !== initialProject.note ||
      currentValues.urls.length !== initialUrls.length ||
      currentValues.urls.some((url, index) => url !== initialUrls[index])
    );
  
    setHasChange(!isDifferent);
  }

  async function handleUpdateLogo(e) {
    e.preventDefault();

    await updateProjectLogo(project?._id, e.target.files[0]);

    mutate(`/project/${project?._id}`);
  }

  async function handleDeleteProject(e) {
    e.preventDefault();
    const isConfirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le projet "${project?.name}" ?`
    );

    if (!isConfirmed) return;

    const response = await deleteProject(project?._id);

    if (response?.success) {
      router.refresh();
      router.push("/projects");
    }

    mutate(`/project/${project?._id}`);
  }

  const handleMoreIcon = (num) => {
    setMoreIcons(num);
  }

  function displayIcon(icon) {
    const iconMap = {
      Globe: <Globe size={20} />,
      Layout: <Layout size={20} />,
      Figma: <Figma size={20} />,
      Github: <Github size={20} />,
      Youtube: <Youtube size={20} />,
      Gitlab: <Gitlab size={20} />,
    };
    return iconMap[icon] || null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.back} onClick={() => router.back()}>
        <ArrowLeftCircle size={32} />
      </div>
      <form
        action={formAction}
        className={styles.form}
        onChange={handleHasChange}
      >
        <input type="hidden" name="project-id" defaultValue={project?._id} />

        {/* Columns container */}
        <div className={styles.columns}>
          {/* Left Column */}
          <div className={styles.column}>
            <h1>Options de projet</h1>
            {/* Informations */}
            <div className={styles.wrapper}>
              {/* Wrapper header */}
              <div className={styles.header}>
                <span className={styles.title}>Informations générales</span>
                <div className={styles.infos}>
                  <span>Créée le {createdAt}</span>
                  <span>
                    Par {author?.user?.firstName + " " + author?.user?.lastName}
                  </span>
                </div>
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
                    src={project?.logo || "/default-project-logo.webp"}
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
                  {(editImg || isPictLoading) && (
                    <label htmlFor="logo" className={styles.editPicture}>
                      {!isPictLoading && <Pencil size={20} />}
                    </label>
                  )}
                  <input
                    type="file"
                    name="logo"
                    id="logo"
                    hidden
                    accept="image/*"
                    onChange={handleUpdateLogo}
                    disabled={pending}
                  />
                </div>

                {/* Project Name */}
                <div>
                  <input
                    type="text"
                    id="project-name"
                    name="project-name"
                    className={styles.projectName}
                    defaultValue={project?.name}
                  />
                </div>

                <div className={styles.footer}>
                  <div className={styles.counts}>
                    <span>{project?.boardsCount} Tableaux</span>
                    <span>{project?.tasksCount} tâches</span>
                  </div>
                  {/* Project archive */}
                  <div className={styles.archive}>
                    <Archive size={16} />
                    <Link href={`/projects/${project?._id}/archive`}>
                      Archive du projet
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/*  Links  */}
            <div className={styles.wrapper}>
              <div className={styles.title}>
                <span>Liens rapides</span>
              </div>
              <div className={styles.content}>
                <div className={styles.link}>
                  <div className={styles.icon} onClick={()=> handleMoreIcon(1)}>
                    {displayIcon(firstIcon)}
                    <input
                      type="text"
                      name="first-icon"
                      id="icon"
                      value={firstIcon}
                      hidden
                      readOnly
                    />
                    {moreIcons === 1 && (
                      <>
                        <div className={styles.iconModal}>
                          {icons.map((icon, index) => (
                            <button
                              key={index}
                              className={styles.iconButton}
                              onClick={(e) => {
                                e.stopPropagation()
                                setFirstIcon(icon?.name);
                                setMoreIcons(null);
                              }}
                            >
                              {icon?.icon}
                            </button>
                          ))}
                        </div>
                        <div id="modal-layout-opacity" onClick={(e) => {
                          e.stopPropagation()
                          setMoreIcons(null)
                        }}></div>
                      </>
                    )}
                  </div>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    className="url"
                    placeholder="https://www.exemple.com"
                    defaultValue={project?.urls[0]?.url}
                  />
                </div>
                <div className={styles.link}>
                  <div className={styles.icon} onClick={()=>handleMoreIcon(2)}>
                    {displayIcon(secondIcon)}
                    <input
                      type="text"
                      name="second-icon"
                      id="icon"
                      value={secondIcon}
                      hidden
                      readOnly
                    />
                    {moreIcons === 2 && (
                      <>
                        <div className={styles.iconModal}>
                          {icons.map((icon, index) => (
                            <button
                              key={index}
                              className={styles.iconButton}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSecondIcon(icon?.name);
                                setMoreIcons(null);
                              }}
                            >
                              {icon?.icon}
                            </button>
                          ))}
                        </div>
                        <div id="modal-layout-opacity" onClick={(e) => {
                          e.stopPropagation()
                          setMoreIcons(null)
                        }}></div>
                      </>
                    )}
                  </div>
                  <input
                    type="url"
                    id="url"
                    className="url"
                    name="url"
                    placeholder="https://www.exemple.com/wp-admin"
                    defaultValue={project?.urls[1]?.url}
                  />
                </div>
                <div className={styles.link}>
                  <div className={styles.icon} onClick={()=>handleMoreIcon(3)}>
                    {displayIcon(thirdIcon)}
                    <input
                      type="text"
                      name="third-icon"
                      id="icon"
                      value={thirdIcon}
                      hidden
                      readOnly
                    />
                    {moreIcons === 3 && (
                      <>
                        <div className={styles.iconModal}>
                          {icons.map((icon, index) => (
                            <button
                              key={index}
                              className={styles.iconButton}
                              onClick={(e) => {
                                e.stopPropagation()
                                setThirdIcon(icon?.name);
                                setMoreIcons(null);
                              }}
                            >
                              {icon?.icon}
                            </button>
                          ))}
                        </div>
                        <div id="modal-layout-opacity" onClick={(e) => {
                          e.stopPropagation()
                          setMoreIcons(null)
                        }}></div>
                      </>
                    )}
                  </div>
                  <input
                    type="url"
                    id="url"
                    className="url"
                    name="url"
                    placeholder="https://figma.com"
                    defaultValue={project?.urls[2]?.url}
                  />
                </div>
                <div className={styles.link}>
                  <div className={styles.icon} onClick={()=>handleMoreIcon(4)}>
                    {displayIcon(fourthIcon)}
                    <input
                      type="text"
                      name="fourth-icon"
                      id="icon"
                      value={fourthIcon}
                      hidden
                      readOnly
                    />
                    {moreIcons === 4 && (
                      <>
                        <div className={styles.iconModal}>
                          {icons.map((icon, index) => (
                            <button
                              key={index}
                              className={styles.iconButton}
                              onClick={(e) => {
                                e.stopPropagation()
                                setFourthIcon(icon?.name);
                                setMoreIcons(null);
                              }}
                            >
                              {icon?.icon}
                            </button>
                          ))}
                        </div>
                        <div id="modal-layout-opacity" onClick={(e) => {
                          e.stopPropagation()
                          setMoreIcons(null)
                        }}></div>
                      </>
                    )}
                  </div>
                  <input
                    type="url"
                    id="url"
                    className="url"
                    name="url"
                    placeholder="https://github.com"
                    defaultValue={project?.urls[3]?.url}
                  />
                </div>
              </div>
            </div>
            {/* Delete project */}
            <div className={styles.updateButtons}>
              <button
                type="button"
                onClick={handleDeleteProject}
                className={`${styles.delete} ${bricolageGrostesque.className}`}
              >
                Supprimer ce projet
              </button>
              <button
                type="submit"
                className={`${styles.save} ${bricolageGrostesque.className}`}
                data-disabled={hasChange}
                disabled={hasChange}
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.column}>
            <div className={styles.wrapper}>
              <div className={styles.title}>
                <span>Notes</span>
              </div>
              <div className={styles.content}>
                <textarea
                  name="note"
                  id="note"
                  className={`${styles.note} ${bricolageGrostesque.className}`}
                  defaultValue={project?.note}
                  placeholder="Ajouter une note..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </form>
      {popup && (
        <PopupMessage
          status={state?.status}
          title={popup?.title}
          message={popup?.message}
        />
      )}
    </div>
  );
}
