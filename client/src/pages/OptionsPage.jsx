"use client";
import styles from "@/styles/pages/options.module.css";
import moment from "moment/moment";
import "moment/locale/fr";
import { useState } from "react";
import Image from "next/image";
import { Archive, Pencil } from "lucide-react";
import Link from "next/link";
import { bricolageGrostesque } from "@/utils/font";
import { deleteProject } from "@/api/project";
import { useRouter } from "next/navigation";
moment.locale("fr");

export default function OptionsPage({ project }) {
  const router = useRouter();
  const [editImg, setEditImg] = useState(false);
  const [projectName, setProjectName] = useState(project?.name);
  const [isPictLoading, setIsPictLoading] = useState(false);
  const [pending, setPending] = useState(false);

  const author = project?.author;
  const createdAt = moment(project?.createdAt).format("DD/MM/YYYY");

  async function handleUpdateLogo(e) {
    e.preventDefault();

    const response = await updateProjectLogo(project?._id, e.target.files[0]);
  }

  console.log(project);

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

  return (
    <div className={styles.container}>
      <form action="" className={styles.form}>
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
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={pending}
                  />
                </div>

                <div className={styles.footer}>
                  <div className={styles.counts}>
                    <span>3 Tableaux</span>
                    <span>48 tâches</span>
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

            {/* Links */}
            <div className={styles.wrapper}>
              <div className={styles.title}>
                <span>Liens rapide</span>
              </div>
              <div></div>
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
              <div></div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
