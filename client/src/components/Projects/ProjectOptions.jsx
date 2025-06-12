"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { deleteProject, updateProjectLogo } from "@/api/project";
import { useRouter } from "next/navigation";
import { updateProject } from "@/actions/project";
import PopupMessage from "@/layouts/PopupMessage";
import { useUserRole } from "../../../hooks/useUserRole";
import { mutate } from "swr";
import { icons, isNotEmpty } from "@/utils/utils";
import ConfirmationDelete from "../Popups/ConfirmationDelete";
import { useTranslation } from "react-i18next";
moment.locale("fr");

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function ProjectOptions({ project }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [links, setLinks] = useState(project?.urls || []);

  const [projectName, setProjectName] = useState(project?.name || "");
  const [note, setNote] = useState(project?.note || "");
  const [moreIcons, setMoreIcons] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [popup, setPopup] = useState(null);

  const updateProjectWithT = (prevState, formData) =>
    updateProject(t, prevState, formData);
  const [state, formAction, pending] = useActionState(
    updateProjectWithT,
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
        title: t("projects.changes_saved"),
        message: t("projects.changes_saved_success"),
      });

      return;
    }
    if (state?.status === "failure") {
      setPopup({
        title: t("projects.error_occurred"),
        message: state?.message,
      });
      return;
    }
  }, [state, t]);

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
    <div className="relative bg-primary-transparent rounded-t-2xl p-8 text-text-dark-color h-full overflow-auto">
      <div
        onClick={() => router.back()}
        className="absolute top-[45px] left-[45px] cursor-pointer"
      >
        <ArrowLeftCircle size={32} />
      </div>
      <form action={formAction}>
        <input type="hidden" name="project-id" defaultValue={project?._id} />

        {/* Columns container */}
        <div className="flex justify-center gap-10 w-full">
          {/* Left Column */}
          <div className="flex gap-10 flex-col w-[40%]">
            <h1>{t("projects.project_options")}</h1>
            {/* Informations */}
            <div className="bg-white/50 rounded-2xl p-8">
              {/* Wrapper header */}
              <div className="flex justify-between">
                <span className="text-large">
                  {t("projects.general_information")}
                </span>
                <div className="flex flex-col items-center gap-0.5 text-[0.8rem] text-text-color-muted">
                  <span>
                    {t("projects.created_on")} {createdAt}
                  </span>
                  <span>
                    {t("projects.created_on")} {createdAt}
                  </span>
                  <span>
                    {t("projects.by")}{" "}
                    {author?.user?.firstName + " " + author?.user?.lastName}
                  </span>
                </div>
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
                    src={project?.logo || "/default-project-logo.webp"}
                    alt={t("projects.project_logo_alt")}
                    width={100}
                    height={100}
                    quality={100}
                    className="rounded-full object-cover object-center"
                  />
                  {(editImg || isPictLoading) && (
                    <label
                      htmlFor="logo"
                      className="absolute flex justify-center items-center inset-0 bg-black/50 cursor-pointer min-w-25 h-25 rounded-full"
                    >
                      {!isPictLoading && (
                        <Pencil size={20} className="text-white" />
                      )}
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
                    className="font-bricolage text-[1.2rem] pl-1 border-b-2 border-text-dark-color text-text-dark-color"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-end mt-6">
                  <div className="flex flex-col gap-1">
                    <span>
                      {project?.boardsCount} {t("projects.boards_count")}
                    </span>
                    <span>
                      {project?.tasksCount} {t("projects.tasks_count")}
                    </span>
                  </div>
                  {/* Project archive */}
                  <div className="flex items-center gap-1">
                    <Archive size={16} />
                    <Link
                      href={`/projects/${project?._id}/archive`}
                      className="underline text-text-dark-color text-small"
                    >
                      {t("projects.project_archive")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/*  Links  */}
            <div className="bg-white/50 rounded-2xl p-8">
              <div className="text-large">
                <span>{t("projects.quick_links")}</span>
              </div>
              <div className="flex flex-col gap-4 mt-5">
                {isNotEmpty(links) &&
                  links?.map((link, idx) => {
                    return (
                      <div className="flex items-center" key={idx}>
                        <div
                          className="relative flex items-center justify-center border border-text-medium-color w-[45px] h-[45px]"
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
                          placeholder={t("projects.url_placeholder")}
                          value={link?.url}
                          onChange={(e) => {
                            links[idx].url = e.target.value;
                            const updatedLinks = [...links];
                            setLinks(updatedLinks);
                          }}
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
                  <button
                    onClick={addLink}
                    className="bg-transparent text-accent-color w-fit p-0 mt-1.5 hover:bg-transparent hover:shadow-none underline"
                  >
                    {t("projects.add_link")}
                  </button>
                )}
              </div>
            </div>

            {/* Project  actions */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="font-bricolage p-0 w-fit bg-transparent bg-none text-text-color-red underline hover:bg-none hover:bg-transparent"
              >
                {t("projects.delete_project")}
              </button>
              <button
                type="submit"
                data-disabled={isDisabled}
                disabled={isDisabled}
                className="font-bricolage rounded-sm"
              >
                {t("projects.save_changes")}
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative top-[94px] w-[20%] min-w-[400px] flex gap-10 flex-col">
            <div className="bg-white/50 rounded-2xl p-8 h-[675px]">
              <div className="text-large">
                <span>{t("projects.notes")}</span>
              </div>
              <div className="flex flex-col gap-0 mt-5 h-full">
                <textarea
                  name="note"
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("projects.add_note_placeholder")}
                  className="font-bricolage h-[90%] resize-none border-none text-normal"
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
          title={`${t("general.project_lowercase")} ${project?.name}`}
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
      <div className="absolute flex justify-center items-center flex-wrap bg-secondary rounded-lg shadow-small gap-3 z-2001 -top-[25px] right-[45px] h-fit p-3 w-[175px]">
        {icons.map((icon) => (
          <div
            key={icon?.name}
            className="flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-150 ease-linear hover:bg-third hover:cursor-pointer"
            onClick={() => handleIconChange(icon?.name)}
          >
            {icon?.icon}
          </div>
        ))}
      </div>
      <div
        className="modal-layout-opacity"
        onClick={(e) => {
          e.stopPropagation();
          setMoreIcons(null);
        }}
      ></div>
    </>
  );
}
