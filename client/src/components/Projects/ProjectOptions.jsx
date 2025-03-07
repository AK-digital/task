"use client";

import { useActionState, useRef, useState } from "react";
import styles from "@/styles/pages/options.module.css";
import moment from "moment/moment";
import "moment/locale/fr";
import Image from "next/image";
import { Archive, Figma, Github, Globe, Layout, Pencil } from "lucide-react";
import Link from "next/link";
import { bricolageGrostesque } from "@/utils/font";
import { deleteProject, updateProjectLogo } from "@/api/project";
import { useRouter } from "next/navigation";
import { updateProject } from "@/actions/project";
import { useDebouncedCallback } from "use-debounce";
moment.locale("fr");

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProjectOptions({ project }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [state, formAction, pending] = useActionState(
    updateProject,
    initialState
  );
  const [editImg, setEditImg] = useState(false);
  const [isPictLoading, setIsPictLoading] = useState(false);

  const author = project?.author;
  const createdAt = moment(project?.createdAt).format("DD/MM/YYYY");

  async function handleUpdateLogo(e) {
    e.preventDefault();

    await updateProjectLogo(project?._id, e.target.files[0]);
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
  }

  const debounceChange = useDebouncedCallback(async (e) => {
    const form = formRef.current;

    form.requestSubmit();
  }, 1500);

  console.log(state);

  return (
    <div className={styles.container}>
      <form
        action={formAction}
        className={styles.form}
        ref={formRef}
        onChange={debounceChange}
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
                  <span>Par {author?.firstName + " " + author?.lastName}</span>
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
                  <div className={styles.icon}>
                    <Globe size={20} />
                  </div>
                  <input
                    type="url"
                    id="website-url"
                    name="website-url"
                    placeholder="https://www.exemple.com"
                    defaultValue={project?.urls?.website}
                  />
                </div>
                <div className={styles.link}>
                  <div className={styles.icon}>
                    <Layout size={20} />
                  </div>
                  <input
                    type="url"
                    id="admin-url"
                    name="admin-url"
                    placeholder="https://www.exemple.com/wp-admin"
                    defaultValue={project?.urls?.admin}
                  />
                </div>
                <div className={styles.link}>
                  <div className={styles.icon}>
                    <Figma size={20} />
                  </div>
                  <input
                    type="url"
                    id="figma-url"
                    name="figma-url"
                    placeholder="https://figma.com"
                    defaultValue={project?.urls?.figma}
                  />
                </div>
                <div className={styles.link}>
                  <div className={styles.icon}>
                    <Github size={20} />
                  </div>
                  <input
                    type="url"
                    id="github-url"
                    name="github-url"
                    placeholder="https://github.com"
                    defaultValue={project?.urls?.github}
                  />
                </div>
              </div>
            </div>
            {/* Delete project */}
            <button
              type="button"
              onClick={handleDeleteProject}
              className={`${styles.delete} ${bricolageGrostesque.className}`}
            >
              Supprimer ce projet
            </button>
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
    </div>
  );
}
