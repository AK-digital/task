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
import { instrumentSans } from "@/utils/font";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProjectOptionsModal({ projectId, setOpenModal }) {
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
                placeholder="https://exemple.com"
                className={`${instrumentSans.className} ${styles.input}`}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="wpUrl">URL du backoffice WordPress</label>
              <input
                type="url"
                id="wpUrl"
                name="wpUrl"
                placeholder="https://exemple.com/wp-admin"
                className={`${instrumentSans.className} ${styles.input}`}
              />
            </div>
            {/* 
            <div className={styles.formGroup}>
              <label htmlFor="adminLogin">Login administrateur</label>
              <input
                type="text"
                id="adminLogin"
                name="adminLogin"
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
         
                className={styles.input}
              />
            </div> */}

            <button
              type="submit"
              className={`${instrumentSans.className} ${styles.submitBtn}`}
            >
              Enregistrer les modifications
            </button>
          </form>
          <a className={styles.deleteLink} onClick={handleDeleteProject}>
            Supprimer le projet
          </a>
        </div>
        <div
          id="modal-layout-opacity"
          onClick={() => setOpenModal(false)}
        ></div>
      </div>
    </>
  );
}
