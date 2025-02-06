"use client";
import styles from "@/styles/components/layouts/project-header.module.css";
import { useState, useRef, useEffect } from "react";
import { updateProjectName } from "@/actions/project";
import { useDebouncedCallback } from "use-debounce";

export default function ProjectTitle({ project }) {
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project?.name);
  const inputRef = useRef(null);

  const debouncedUpdate = useDebouncedCallback(async (newName) => {
    if (project?._id && newName !== project?.name) {
      const response = await updateProjectName(project._id, newName);
      if (!response.success) {
        setProjectName(project?.name);
      }
    }
  }, 600);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setProjectName(project?.name);
  }, [project]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      e.target.blur();
    }
    if (e.key === "Escape") {
      setProjectName(project?.name);
      setIsEditing(false);
    }
  };

  const handleChange = (e) => {
    const newName = e.target.value;
    setProjectName(newName);
    debouncedUpdate(newName);
  };

  return (
    <div className={styles.title}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={projectName}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={styles.titleInput}
        />
      ) : (
        <span onClick={handleClick}>{projectName}</span>
      )}
    </div>
  );
}
