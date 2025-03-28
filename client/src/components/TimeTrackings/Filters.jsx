"use client";
import styles from "@/styles/components/timeTrackings/filters.module.css";
import { useEffect, useState } from "react";
import { Dropdown } from "../Dropdown/Dropdown";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Filters({ projects, project }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queries = new URLSearchParams(searchParams);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  let usersOptions = [];

  useEffect(() => {
    if (searchParams.get("projectId")) {
      const projectInfo = projects?.find(
        (project) => project?._id === searchParams.get("projectId")
      );
      setSelectedProject({
        id: searchParams.get("projectId"),
        label: projectInfo?.name,
        picture: projectInfo?.logo,
      });
    } else {
      setSelectedProject(null);
    }

    if (project && searchParams.get("userId")) {
      const users = [project?.author, ...project?.guests];
      const user = users?.find(
        (user) => user?._id === searchParams.get("userId")
      );

      // If user is not found, remove the query parameter
      if (!user) {
        queries.delete("userId");
        setSelectedUser(null);
        router.push(`${pathname}?${queries.toString()}`);
        return;
      }

      setSelectedUser({
        id: user?._id,
        label: user?.firstName + " " + user?.lastName,
        picture: user?.picture,
      });
    } else {
      setSelectedUser(null);
    }
  }, [searchParams]);

  const projectsOptions = projects?.map((project) => {
    return {
      id: project?._id,
      picture: project?.logo,
      label: project?.name,
    };
  });

  if (project) {
    const users = [project?.author, ...project?.guests];
    usersOptions = users?.map((guest) => {
      return {
        id: guest?._id,
        picture: guest?.picture,
        label: guest?.firstName + " " + guest?.lastName,
      };
    });
  }

  const handleStartingDate = (e) => {
    e.preventDefault();
    const date = e.target.value;

    // If date is empty, remove the query parameter
    if (date.length === 0) {
      queries.delete("startingDate"); // Remove query parameter
    } else {
      queries.set("startingDate", e.target.value); // Add query parameter
    }
    router.push(`${pathname}?${queries.toString()}`);
  };

  const handleEndingDate = (e) => {
    e.preventDefault();
    const date = e.target.value;

    // If date is empty, remove the query parameter
    if (date.length === 0) {
      queries.delete("endingDate"); // Remove query parameter
    } else {
      queries.set("endingDate", e.target.value); // Add query parameter
    }

    router.push(`${pathname}?${queries.toString()}`);
  };

  return (
    <div className={styles.container}>
      {/* Filter by project */}
      <Dropdown
        defaultValue={"Choisir un projet"}
        selected={selectedProject}
        options={projectsOptions}
        query={"projectId"}
      />
      {/* Filter by user */}
      {project && (
        <>
          <Dropdown
            defaultValue={"Choisir un membre"}
            selected={selectedUser}
            options={usersOptions}
            query={"userId"}
          />
          <div className={styles.date}>
            <label>Date de début</label>
            <input
              type="date"
              name="startingDate"
              id="startingDate"
              defaultValue={queries.get("startingDate")}
              onChange={handleStartingDate}
            />
          </div>
          <div className={styles.date}>
            <label>Date de fin</label>
            <input
              type="date"
              name="endingDate"
              id="endingDate"
              defaultValue={queries.get("endingDate")}
              onChange={handleEndingDate}
            />
          </div>
        </>
      )}
    </div>
  );
}
