"use client";
import { useState, useEffect, useActionState } from "react";
import Image from "next/image";
import {
  AppWindow,
  Edit,
  Figma,
  Github,
  Globe,
  Pencil,
  Trash,
  Umbrella,
  X,
} from "lucide-react";
import { updateProject } from "@/actions/project";
import { updateProjectLogo } from "@/api/project";
import styles from "@/styles/components/modals/project-options-modal.module.css";
import { instrumentSans } from "@/utils/font";
import { deleteProject } from "@/api/project";
import { useRouter } from "next/navigation";
import PopupMessage from "@/layouts/PopupMessage";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

const icons = [
  { name: "Globe", icon: Globe },
  { name: "AppWindow", icon: AppWindow },
  { name: "Figma", icon: Figma },
  { name: "Github", icon: Github },
  { name: "Umbrella", icon: Umbrella },
];

export default function ProjectOptionsModal({ project, setOpenModal, uid }) {
  const [isPictLoading, setIsPicLoading] = useState(false);
  const [editImg, setEditImg] = useState(false);
  const [moreIcons, setMoreIcons] = useState(null);
  const [links, setLinks] = useState(project?.urls || []);
  const [state, formAction, pending] = useActionState(
    updateProject,
    initialState
  );
  const router = useRouter();

  const [popup, setPopup] = useState(null);

  useEffect(() => {
    setLinks(project?.urls || []);
  }, [project]);

  useEffect(() => {
    if (state?.status === "success") {
      setPopup({
        status: state?.status,
        title: "Modifications enregistrées avec succès",
        message: "Les modifications ont été enregistrées avec succès",
      });
    }

    if (state?.status === "failure") {
      setPopup({
        status: state?.status,
        title: "Une erreur s'est produite",
        message:
          state?.message ||
          "Une erreur est survenue lors de l'enregistrement des modifications",
      });
    }

    // Hide the popup after 4 seconds
    const timeout = setTimeout(() => setPopup(false), 4000);

    return () => clearTimeout(timeout);
  }, [state]);

  async function handleDeleteProject(e) {
    e.preventDefault();
    const isConfirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le projet "${project?.name}" ?`
    );

    if (!isConfirmed) return;

    const response = await deleteProject(project?._id);

    if (response?.success) {
      setOpenModal(false);
      router.refresh();
      router.push("/projects");
    }
  }

  const addLink = (e) => {
    e.preventDefault();

    setLinks((prev) => [
      ...prev,
      {
        icon: "Globe",
        url: "",
      },
    ]);
  };

  function removeLink(e) {
    e.preventDefault();
    const idx = e.currentTarget.getAttribute("data-idx");
    const idxInt = parseInt(idx);
    setLinks((prev) => prev.filter((_, i) => i !== idxInt));
  }

  function handleMoreIcons(e, idx) {
    e.preventDefault();

    if (moreIcons !== null) {
      setMoreIcons(null);
    } else {
      setMoreIcons(idx);
    }
  }

  function handleChangeIcon(e, idx) {
    e.preventDefault();

    const newIcon = e.currentTarget.getAttribute("data-icon");

    setLinks((prev) =>
      prev.map((link, i) => {
        if (i === idx) {
          return { ...link, icon: newIcon };
        }
        return link;
      })
    );

    setMoreIcons(null);
  }

  async function handleUpdateLogo(e) {
    e.preventDefault();

    setIsPicLoading(true);

    const response = await updateProjectLogo(project?._id, e.target.files[0]);

    if (response?.status === "success") {
      setIsPicLoading(false);
    }
  }

  return (
    <>
      <div className={styles.container} id="modal">
        <div className={styles.modal}>
          <span>Options du projet</span>
          <div className={styles.wrapper}>
            <div className={styles.content}>
              <form action={formAction} className={styles.form}>
                <input
                  type="hidden"
                  name="project-id"
                  defaultValue={project?._id}
                />
                {/* Left side */}
                <div className={styles.left}>
                  <div className={`${styles.formGroup} ${styles.name}`}>
                    <div className={styles.project}>
                      <label htmlFor="project-name">Nom du projet</label>
                      <input
                        type="text"
                        id="project-name"
                        name="project-name"
                        placeholder="Täsk"
                        className={`${instrumentSans.className} ${styles.input}`}
                        defaultValue={project?.name}
                        required
                      />
                    </div>
                    <div
                      className={styles.picture}
                      onMouseEnter={() => setEditImg(true)}
                      onMouseLeave={() => setEditImg(false)}
                    >
                      <Image
                        src={project?.logo || "/default-project-logo.webp"}
                        alt="Logo du projet"
                        width={120}
                        height={120}
                        quality={100}
                        className={styles.projectLogo}
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
                  </div>
                  {links.map((link, linksIdx) => {
                    return (
                      <div className={styles.formGroup} key={linksIdx}>
                        <div className={styles.inputWrapper}>
                          <div
                            className={styles.icon}
                            onClick={(e) => {
                              handleMoreIcons(e, linksIdx);
                            }}
                          >
                            {icons.map((icon, idx) => {
                              // If the icon name doesn't match the link icon, return null
                              if (link.icon !== icon.name) return null;
                              return <icon.icon size={22} key={idx} />;
                            })}
                            {moreIcons === linksIdx && (
                              <>
                                <div className={styles.moreIcons}>
                                  {icons.map((icon, idx) => {
                                    return (
                                      <icon.icon
                                        size={18}
                                        key={idx}
                                        data-icon={icon?.name}
                                        onClick={(e) => {
                                          handleChangeIcon(e, linksIdx);
                                        }}
                                      />
                                    );
                                  })}
                                </div>
                                <div
                                  id="modal-layout-opacity"
                                  onClick={(e) => handleMoreIcons(e, idx)}
                                ></div>
                              </>
                            )}
                          </div>
                          <input
                            type="text"
                            id="icon"
                            name="icon"
                            hidden
                            value={link?.icon ?? ""}
                            onChange={(e) => {
                              e.preventDefault();
                            }}
                            required
                          />
                          <input
                            type="text"
                            name="url"
                            id="url"
                            placeholder="https://exemple.com"
                            className={`${instrumentSans.className} ${styles.input}`}
                            defaultValue={link?.url}
                            required
                          />
                          {linksIdx > 0 && (
                            <div
                              className={styles.deleteLink}
                              onClick={removeLink}
                              data-idx={linksIdx}
                            >
                              <X size={22} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {links.length < 6 && (
                    <div className={styles.addLink} onClick={addLink}>
                      <span>Ajouter un lien</span>
                    </div>
                  )}
                </div>
                {/* Right side */}
                <div className={styles.right}>
                  <div className={`${styles.formGroup} ${styles.note}`}>
                    <label htmlFor="wpUrl">Note du projet</label>
                    <textarea
                      name="note"
                      id="note"
                      className={`${instrumentSans.className} ${styles.input}`}
                      defaultValue={project?.note}
                    ></textarea>
                  </div>
                  <div className={styles.submitWrapper}>
                    <button
                      type="submit"
                      className={`${instrumentSans.className} ${styles.submit}`}
                      data-disabled={pending}
                      disabled={pending}
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div>
              <button
                type="button"
                className={`${instrumentSans.className} ${styles.delete}`}
                onClick={handleDeleteProject}
              >
                Supprimer le projet
              </button>
            </div>
          </div>
        </div>

        <div id="modal-layout" onClick={(e) => setOpenModal(false)}></div>
      </div>
      {popup && (
        <PopupMessage
          status={popup.status}
          title={popup.title}
          message={popup.message}
        />
      )}
    </>
  );
}
