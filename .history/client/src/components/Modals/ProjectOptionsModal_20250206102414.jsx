"use client";
import {
  useState,
  useRef,
  useEffect,
  useTransition,
  useActionState,
} from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { updateProjectLogo } from "@/actions/project";
import styles from "@/styles/components/modals/project-options-modal.module.css";
import { X } from "lucide-react";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProjectOptionsModal({ projectId, setOpenModal }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [editImg, setEditImg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPending, startTransition] = useTransition();
  const { pending } = useFormStatus();

  const [state, formAction] = useActionState(updateProjectLogo, {
    status: null,
    message: null,
    data: null,
  });

  const [formData, setFormData] = useState({
    siteUrl: "",
    wpUrl: "",
    adminLogin: "",
    adminPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Ajouter la logique pour sauvegarder les options du projet
    console.log("Données du formulaire:", formData);
  };

  const handleDeleteProject = async () => {
    if (confirm("Voulez-vous vraiment supprimer ce projet ?")) {
      try {
        await deleteProject(projectId);
        mutate("/projects");
        router.push("/projects");
      } catch (err) {
        console.error(
          err.message ||
            "Une erreur est survenue lors de la suppression du projet"
        );
      }
    }
  };

  useEffect(() => {
    if (state?.status === "success") {
      mutate("/projects");
      mutate(`/project/${projectId}`);
    }
  }, [state, projectId]);

  const handleUpdateLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);

    const formData = new FormData();
    formData.append("logo", file);
    formData.append("projectId", projectId);

    startTransition(() => {
      formAction(formData);
    });
  };

  // Nettoyer l'URL lors du démontage
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <>
      <div className={styles.overlay}>
        <span
          className={styles.closeButton}
          onClick={() => setOpenModal(false)}
        >
          <X size={32} />
        </span>
        <h2>Options du projet</h2>
        <div className={styles.content}>
          <form action={formAction} ref={formRef}>
            <input type="hidden" name="projectId" defaultValue={projectId} />
            <div className={styles.logoContainer}>
              <div
                className={styles.picture}
                onMouseEnter={() => setEditImg(true)}
                onMouseLeave={() => setEditImg(false)}
              >
                <Image
                  src={
                    previewUrl ||
                    state.data?.logo ||
                    "/default-project-logo.webp"
                  }
                  alt="Logo du projet"
                  width={120}
                  height={120}
                  quality={100}
                  className={styles.projectLogo}
                />
                {editImg && !pending && (
                  <label htmlFor="logo" className={styles.editPicture}>
                    <Pencil size={20} />
                  </label>
                )}
                <input
                  type="file"
                  name="logo"
                  id="logo"
                  hidden
                  onChange={handleUpdateLogo}
                  accept="image/*"
                  disabled={pending}
                />
              </div>
            </div>
          </form>

          {/* Project Options Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="siteUrl">URL du site</label>
              <input
                type="url"
                id="siteUrl"
                name="siteUrl"
                value={formData.siteUrl}
                onChange={handleChange}
                placeholder="https://exemple.com"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="wpUrl">URL du backoffice WordPress</label>
              <input
                type="url"
                id="wpUrl"
                name="wpUrl"
                value={formData.wpUrl}
                onChange={handleChange}
                placeholder="https://exemple.com/wp-admin"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="adminLogin">Login administrateur</label>
              <input
                type="text"
                id="adminLogin"
                name="adminLogin"
                value={formData.adminLogin}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="adminPassword">Mot de passe administrateur</label>
              <input
                type="password"
                id="adminPassword"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Enregistrer les modifications
            </button>
          </form>
          <a className={styles.deleteLink} onClick={handleDeleteProject}>
            Supprimer le projet
          </a>
        </div>
      </div>
      <div id="modal-layout-opacity" onClick={() => setOpenModal(false)}></div>
    </>
  );
}
