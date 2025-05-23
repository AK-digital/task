"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import styles from "@/styles/pages/options.module.css";
import moment from "moment/moment";
import "moment/locale/fr";
import Image from "next/image";
import {
  Archive,
  ArrowLeftCircle,
  Cross,
  Delete,
  Globe,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { bricolageGrostesque } from "@/utils/font";
import { deleteProject, updateProjectLogo } from "@/api/project";
import { useRouter } from "next/navigation";
import { updateProject } from "@/actions/project";
import PopupMessage from "@/layouts/PopupMessage";
import { useUserRole } from "@/app/hooks/useUserRole";
import { mutate } from "swr";
import { icons, isNotEmpty } from "@/utils/utils";
import ConfirmationDelete from "../Popups/ConfirmationDelete";
moment.locale("fr");

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProjectOptions({ project }) {
  const router = useRouter();
  const [links, setLinks] = useState(project?.urls || []);

  const [projectName, setProjectName] = useState(project?.name || "");
  const [note, setNote] = useState(project?.note || "");
  const [moreIcons, setMoreIcons] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [popup, setPopup] = useState(null);
  const [state, formAction, pending] = useActionState(
    updateProject,
    initialState
  );
  const [editImg, setEditImg] = useState(false);
  const [isPictLoading, setIsPictLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const initialLinks = useRef(
    project?.urls?.length
      ? project.urls.map((link) => ({ ...link }))
      : [{ url: "", icon: "Globe" }]
  );

  const author = project?.members.find((member) => member?.role === "owner");
  const createdAt = moment(project?.createdAt).format("DD/MM/YYYY");

  useEffect(() => {
    if (state?.status === "success") {
      setIsDisabled(true);
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

  useEffect(() => {
    const nameChanged = projectName !== project?.name;
    const noteChanged = note !== project?.note;

    const linksChanged = () => {
      if (links.length !== initialLinks.current.length) return true;

      for (let i = 0; i < links.length; i++) {
        if (
          links[i].url !== initialLinks.current[i]?.url ||
          links[i].icon !== initialLinks.current[i]?.icon
        ) {
          return true;
        }
      }

      return false;
    };

    const hasChanges = nameChanged || noteChanged || linksChanged();

    setIsDisabled(!hasChanges);
  }, [projectName, note, links]);

  async function handleUpdateLogo(e) {
    e.preventDefault();

    await updateProjectLogo(project?._id, e.target.files[0]);

    mutate(`/project/${project?._id}`);
  }

  async function handleDeleteProject() {
    const response = await deleteProject(project?._id);

    if (response?.success) {
      router.push("/projects");
    }

    mutate(`/project/${project?._id}`);
  }

  function displayIcon(name) {
    const icon = icons.find((icon) => icon.name === name);
    return icon?.icon || <Globe size={20} />;
  }

  function addLink(e) {
    e.preventDefault();
    if (links.length >= 6) return;

    setLinks((prevLinks) => [
      ...prevLinks,
      {
        url: "",
        icon: "Globe",
      },
    ]);
  }

  function removeLink(e, link) {
    e.preventDefault();
    const updatedLinks = links.filter((l) => l !== link);
    setLinks(updatedLinks);
  }

  return (
    <div className={styles.container}>
      <div className={styles.back} onClick={() => router.back()}>
        <ArrowLeftCircle size={32} />
      </div>
      <form action={formAction} className={styles.form}>
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
                    className={`${styles.projectName} ${bricolageGrostesque.className}`}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
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
                {isNotEmpty(links) &&
                  links?.map((link, idx) => {
                    return (
                      <div className={styles.link} key={idx}>
                        <div
                          className={styles.icon}
                          onClick={() => setMoreIcons(idx)}
                        >
                          {displayIcon(link?.icon)}
                          <input
                            type="text"
                            id="icon"
                            name="icon"
                            value={link?.icon}
                            hidden
                            readOnly
                          />
                          {moreIcons === idx && (
                            <IconList
                              setMoreIcons={setMoreIcons}
                              links={links}
                              setLinks={setLinks}
                              idx={idx}
                            />
                          )}
                        </div>
                        <input
                          type="url"
                          id="url"
                          name="url"
                          placeholder="https://www.exemple.com"
                          value={link?.url}
                          onChange={(e) => {
                            links[idx].url = e.target.value;
                            const updatedLinks = [...links];
                            setLinks(updatedLinks);
                          }}
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
                  <button onClick={addLink} className={styles.addLink}>
                    Ajouter un lien
                  </button>
                )}
              </div>
            </div>

            {/* Project  actions */}
            <div className={styles.updateButtons}>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={`${styles.delete} ${bricolageGrostesque.className}`}
              >
                Supprimer ce projet
              </button>
              <button
                type="submit"
                className={`${styles.save} ${bricolageGrostesque.className}`}
                data-disabled={isDisabled}
                disabled={isDisabled}
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
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
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
      {isOpen && (
        <ConfirmationDelete
          title={`projet ${project?.name}`}
          onCancel={() => setIsOpen(false)}
          onConfirm={handleDeleteProject}
        />
      )}
    </div>
  );
}

export function IconList({ setMoreIcons, links, setLinks, idx }) {
  function handleIconChange(iconName) {
    links[idx].icon = iconName;
    const updatedLinks = [...links];
    setLinks(updatedLinks);
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
      ></div>
    </>
  );
}
