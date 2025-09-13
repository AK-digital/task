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
  const [billableSort, setBillableSort] = useState("");

  const resetStates = () => {
    setUserSort("");
    setDateSort("");
    setDurationSort("");
    setProjectSort("");
    setBillableSort("");
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
        return a.projectId?.name.localeCompare(b.projectId?.name);
      } else {
        return b.projectId?.name.localeCompare(a.projectId?.name);
      }
    });

    console.log(newTrackers);

    setProjectSort(sort);
    setFilteredTrackers(newTrackers);
  };

  const handleUserSort = (sort) => {
    resetStates();
    setFilteredTrackers([...trackers]);

    if (userSort === sort) return;

    const newTrackers = [...trackers].sort((a, b) => {
      if (sort === "asc") {
        return a.userId?.firstName.localeCompare(b.userId?.firstName);
      } else {
        return b.userId?.firstName.localeCompare(a.userId?.firstName);
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

    if (durationSort === sort) return;

    const newTrackers = [...trackers].sort((a, b) => {
      if (sort === "asc") {
        return a.duration - b.duration;
      } else {
        return b.duration - a.duration;
      }
    });

    setDurationSort(sort);
    setFilteredTrackers(newTrackers);
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

  const handleBillableSort = (sort) => {
    resetStates();
    setFilteredTrackers([...trackers]);

    if (billableSort === sort) {
      setBillableSort("");
      return;
    }

    const newTrackers = [...trackers].sort((a, b) => {
      // Pour le tri ascendant (chevron haut), on veut les non facturables en premier
      if (sort === "asc") {
        if (!a.billable && b.billable) return -1; // a non facturable en premier
        if (a.billable && !b.billable) return 1; // b non facturable en premier
        return 0; // garder l'ordre si même état
      }
      // Pour le tri descendant (chevron bas), on veut les facturables en premier
      else {
        if (a.billable && !b.billable) return -1; // a facturable en premier
        if (!a.billable && b.billable) return 1; // b facturable en premier
        return 0; // garder l'ordre si même état
      }
    });

    setBillableSort(sort);
    setFilteredTrackers(newTrackers);
  };

  return (
    <div className="sticky flex items-center top-0 bg-secondary border-b border-text-light-color text-small h-[38px] text-text-color-muted font-medium rounded-t-lg z-10 last:border-b-0 select-none w-full">
      {/* Checkbox - w-10 flex-shrink-0 */}
      <div className="w-10 flex-shrink-0 flex justify-center items-center h-full gap-2 cursor-default">
        <input
          type="checkbox"
          id="trackers"
          name="trackers"
          onClick={handleSelectAllTrackers}
          className="w-4 h-4 p-0 cursor-pointer"
        />
      </div>
      {/* Task text - flex-1 min-w-0 */}
      <div className="flex-1 min-w-0 px-2">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
          Description
        </span>
      </div>
      {/* Project - w-40 flex-shrink-0 */}
      <div className="flex justify-center items-center w-40 flex-shrink-0 h-full gap-2 cursor-default border-l border-text-light-color px-2">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
          Projet
        </span>
        <div className="flex flex-col">
          <ChevronUp
            size={15}
            cursor={"pointer"}
            onClick={() => handleProjectSort("asc")}
            data-sort={projectSort === "asc"}
            className="relative top-1 data-[sort=true]:text-accent-color"
          />
          <ChevronDown
            size={15}
            cursor={"pointer"}
            onClick={() => handleProjectSort("desc")}
            data-sort={projectSort === "desc"}
            className="relative -top-0.5 data-[sort=true]:text-accent-color"
          />
        </div>
      </div>
      {/* User - w-40 flex-shrink-0 */}
      <div className="flex justify-center items-center w-40 flex-shrink-0 h-full gap-2 cursor-default border-l border-r border-text-light-color px-2">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
          Utilisateur
        </span>
        <div className="flex flex-col">
          <ChevronUp
            size={15}
            cursor={"pointer"}
            onClick={() => handleUserSort("asc")}
            data-sort={userSort === "asc"}
            className="relative top-1 data-[sort=true]:text-accent-color"
          />
          <ChevronDown
            size={15}
            cursor={"pointer"}
            onClick={() => handleUserSort("desc")}
            data-sort={userSort === "desc"}
            className="relative -top-0.5 data-[sort=true]:text-accent-color"
          />
        </div>
      </div>
      {/* Date - w-32 flex-shrink-0 */}
      <div className="flex justify-center items-center w-32 flex-shrink-0 h-full gap-2 cursor-default border-r border-text-light-color">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
          Date
        </span>
        <div className="flex flex-col">
          <ChevronUp
            size={15}
            cursor={"pointer"}
            onClick={() => handleDateSort("asc")}
            data-sort={dateSort === "asc"}
            className="relative top-1 data-[sort=true]:text-accent-color"
          />
          <ChevronDown
            size={15}
            cursor={"pointer"}
            onClick={() => handleDateSort("desc")}
            data-sort={dateSort === "desc"}
            className="relative -top-0.5 data-[sort=true]:text-accent-color"
          />
        </div>
      </div>
      {/* Duration - w-24 flex-shrink-0 */}
      <div className="flex justify-center items-center w-24 flex-shrink-0 h-full gap-2 cursor-default border-r border-text-light-color">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
          Temps
        </span>
        <div className="flex flex-col">
          <ChevronUp
            size={15}
            cursor={"pointer"}
            onClick={() => handleDurationSort("asc")}
            data-sort={durationSort === "asc"}
            className="relative top-1 data-[sort=true]:text-accent-color"
          />
          <ChevronDown
            size={15}
            cursor={"pointer"}
            onClick={() => handleDurationSort("desc")}
            data-sort={durationSort === "desc"}
            className="relative -top-0.5 data-[sort=true]:text-accent-color"
          />
        </div>
      </div>
      {/* Billable - w-24 flex-shrink-0 */}
      <div className="flex justify-center items-center w-24 flex-shrink-0 h-full gap-2 cursor-default border-r border-text-light-color">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
          Facturable
        </span>
        <div className="flex flex-col gap-0">
          <ChevronUp
            size={15}
            cursor={"pointer"}
            onClick={() => handleBillableSort("asc")}
            data-sort={billableSort === "asc"}
            className="relative top-1 data-[sort=true]:text-accent-color"
          />
          <ChevronDown
            size={15}
            cursor={"pointer"}
            onClick={() => handleBillableSort("desc")}
            data-sort={billableSort === "desc"}
            className="relative -top-0.5 data-[sort=true]:text-accent-color"
          />
        </div>
      </div>
    </div>
  );
}
