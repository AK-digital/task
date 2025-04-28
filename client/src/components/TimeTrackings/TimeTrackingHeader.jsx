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

    if (sort === "asc" && projectSort !== "asc") {
      const newTrackers = [...trackers].sort((a, b) =>
        a.project?.name.localeCompare(b.project?.name)
      );
      setFilteredTrackers(newTrackers);
      setProjectSort("asc");
    }

    if (sort === "desc" && projectSort !== "desc") {
      const newTrackers = [...trackers].sort((a, b) =>
        b.project?.name.localeCompare(a.project?.name)
      );
      setFilteredTrackers(newTrackers);
      setProjectSort("desc");
    }
  };

  const handleUserSort = (sort) => {
    resetStates();
    setFilteredTrackers([...trackers]);

    if (sort === "asc" && userSort !== "asc") {
      const newTrackers = [...trackers].sort((a, b) =>
        a.userId?.firstName.localeCompare(b.userId?.firstName)
      );
      setFilteredTrackers(newTrackers);
      setUserSort("asc");
    }

    if (sort === "desc" && userSort !== "desc") {
      const newTrackers = [...trackers].sort((a, b) =>
        b.userId?.firstName.localeCompare(a.userId?.firstName)
      );
      setFilteredTrackers(newTrackers);
      setUserSort("desc");
    }
  };

  const handleDateSort = (sort) => {
    // Reset the trackers
    resetStates();
    setFilteredTrackers([...trackers]);

    if (sort === "asc" && dateSort !== "asc") {
      const newTrackers = [...trackers].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );
      setFilteredTrackers(newTrackers);
      setDateSort("asc");
    }

    if (sort === "desc" && dateSort !== "desc") {
      const newTrackers = [...trackers].sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime)
      );
      setFilteredTrackers(newTrackers);
      setDateSort("desc");
    }
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
