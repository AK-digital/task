import styles from "@/styles/components/timeTrackings/time-tracking-header.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function TimeTrackingHeader({
  trackers,
  setFilteredTrackers,
  setSelectedTrackers,
}) {
  const [projectSort, setProjectSort] = useState("");
  const [userSort, setUserSort] = useState("");
  const [dateSort, setDateSort] = useState("");
  const [durationSort, setDurationSort] = useState("");

  const resetStates = () => {
    setUserSort("");
    setDateSort("");
    setDurationSort("");
    setProjectSort("");
  };

  //  If trackers change reset the sort
  useEffect(() => {
    resetStates();
  }, [trackers]);

  const handleProjectSort = (sort) => {
    resetStates();
    setFilteredTrackers([...trackers]);

    if (projectSort === sort) return;

    const newTrackers = [...trackers].sort((a, b) => {
      if (sort === "asc") {
        return a.project?.name.localeCompare(b.project?.name);
      } else {
        return b.project?.name.localeCompare(a.project?.name);
      }
    });

    setProjectSort(sort);
    setFilteredTrackers(newTrackers);
  };

  const handleUserSort = (sort) => {
    resetStates();
    setFilteredTrackers([...trackers]);

    if (userSort === sort) return;

    const newTrackers = [...trackers].sort((a, b) => {
      if (sort === "asc") {
        return a.user?.firstName.localeCompare(b.user?.firstName);
      } else {
        return b.user?.firstName.localeCompare(a.user?.firstName);
      }
    });

    setUserSort(sort);
    setFilteredTrackers(newTrackers);
  };

  const handleDateSort = (sort) => {
    resetStates();
    setFilteredTrackers([...trackers]);

    if (dateSort === sort) return;

    const newTrackers = [...trackers].sort((a, b) => {
      if (sort === "asc") {
        return new Date(a.startTime) - new Date(b.startTime);
      } else {
        return new Date(b.startTime) - new Date(a.startTime);
      }
    });

    setDateSort(sort);
    setFilteredTrackers(newTrackers);
  };

  const handleDurationSort = (sort) => {
    resetStates();
    setFilteredTrackers([...trackers]);

    if (sort === "asc" && durationSort !== "asc") {
      const newTrackers = [...trackers].sort((a, b) => a.duration - b.duration);
      setFilteredTrackers(newTrackers);
      setDurationSort("asc");
    }

    if (sort === "desc" && durationSort !== "desc") {
      const newTrackers = [...trackers].sort((a, b) => b.duration - a.duration);
      setFilteredTrackers(newTrackers);
      setDurationSort("desc");
    }
  };

  const handleSelectAllTrackers = (e) => {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll("input[name=tracker]");
    let selectedTrackers = [];

    checkboxes.forEach((checkbox) => {
      if (isChecked) {
        selectedTrackers.push(checkbox.value);
      } else {
        selectedTrackers = [];
      }
      checkbox.checked = isChecked ? true : false;
    });

    setSelectedTrackers(selectedTrackers);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.selection} ${styles.row}`}>
        <input
          type="checkbox"
          id="trackers"
          name="trackers"
          onClick={handleSelectAllTrackers}
        />
      </div>
      <div className={styles.text}>
        <span>Description</span>
      </div>
      <div className={`${styles.project} ${styles.row}`}>
        <span>Projet</span>
        <div className={styles.sort}>
          <ChevronUp
            size={15}
            cursor={"pointer"}
            onClick={() => handleProjectSort("asc")}
            data-sort={projectSort === "asc"}
          />
          <ChevronDown
            size={15}
            cursor={"pointer"}
            onClick={() => handleProjectSort("desc")}
            data-sort={projectSort === "desc"}
          />
        </div>
      </div>
      <div className={`${styles.user} ${styles.row}`}>
        <span>Utilisateur</span>
        <div className={styles.sort}>
          <ChevronUp
            size={15}
            cursor={"pointer"}
            onClick={() => handleUserSort("asc")}
            data-sort={userSort === "asc"}
          />
          <ChevronDown
            size={15}
            cursor={"pointer"}
            onClick={() => handleUserSort("desc")}
            data-sort={userSort === "desc"}
          />
        </div>
      </div>
      <div className={`${styles.date} ${styles.row}`}>
        <span>Date</span>
        <div className={styles.sort}>
          <ChevronUp
            size={15}
            cursor={"pointer"}
            onClick={() => handleDateSort("asc")}
            data-sort={dateSort === "asc"}
          />
          <ChevronDown
            size={15}
            cursor={"pointer"}
            onClick={() => handleDateSort("desc")}
            data-sort={dateSort === "desc"}
          />
        </div>
      </div>

      <div className={`${styles.duration} ${styles.row}`}>
        <span>Temps</span>
        <div className={styles.sort}>
          <ChevronUp
            size={15}
            cursor={"pointer"}
            onClick={() => handleDurationSort("asc")}
            data-sort={durationSort === "asc"}
          />
          <ChevronDown
            size={15}
            cursor={"pointer"}
            onClick={() => handleDurationSort("desc")}
            data-sort={durationSort === "desc"}
          />
        </div>
      </div>
    </div>
  );
}
