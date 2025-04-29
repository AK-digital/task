"use client";
import styles from "@/styles/components/timeTrackings/filters.module.css";
import { useEffect, useState } from "react";
import { Dropdown } from "./Dropdown";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Filters({ projects, selectedProjects }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queries = new URLSearchParams(searchParams);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [usersOptions, setUsersOptions] = useState([]);
  const projectsOptions = projects?.map((project) => ({
    id: project?._id,
    label: project?.name,
    picture: project?.logo,
  }));

  useEffect(() => {
    // If the query parameter userId is present in the URL, we need to set the selectedUsers state
    if (searchParams.get("users")) {
      // Split the userId query parameter into an array of userIds
      const userIds = queries.get("users")?.split(",");
      if (userIds?.length > 0) {
        // Map the userIds to the corresponding user objects from usersOptions
        const users = userIds?.map((userId) => {
          return usersOptions.find((user) => user.label === userId);
        });
        // Filter out undefined values from the users array
        // This is to avoid having undefined values in the selectedUsers array
        const filteredUsers = users.filter((user) => user !== undefined);
        const hasUndefined = users.some((user) => user === undefined);

        // If there are undefined values, we need to handle them
        if (hasUndefined) {
          // Remove the undefined values from the query parameter
          queries.set(
            "users",
            filteredUsers.map((user) => user.label).join(",")
          );
          router.push(`${pathname}?${queries.toString()}`);
        }

        // Set the selectedUsers state with the filtered users
        setSelectedUsers(filteredUsers);
      }
    } else {
      setSelectedUsers([]);
    }
  }, [searchParams, selectedProjects, usersOptions]);

  useEffect(() => {
    const users = [];

    for (const selectedProject of selectedProjects) {
      const allUsers = selectedProject?.members || [];

      for (const user of allUsers) {
        users.push(user?.user);
      }
    }

    // Remove duplicates from the users array
    const uniqueUsers = [
      ...new Set(users.map((user) => JSON.stringify(user))),
    ].map((user) => JSON.parse(user));

    setUsersOptions(
      uniqueUsers.map((user) => ({
        id: user?._id,
        picture: user?.picture,
        label: `${user?.firstName} ${user?.lastName}`,
      }))
    );
  }, [selectedProjects]);

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
        selected={selectedProjects}
        options={projectsOptions}
        query={"projects"}
      />
      {/* Filter by user */}
      {selectedProjects?.length > 0 && (
        <>
          <Dropdown
            defaultValue={"Tous les membres"}
            selected={selectedUsers}
            options={usersOptions}
            query={"users"}
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
