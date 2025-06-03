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
    <div className="sticky flex items-center top-0 bg-secondary border-b border-text-light-color text-small h-[38px] text-text-color-muted font-medium rounded-t-lg z-10 last:border-b-0">
      <div className="min-w-[40px] max-w-[40px] flex justify-center items-center w-full h-full gap-2 cursor-default">
        <input
          type="checkbox"
          id="trackers"
          name="trackers"
          onClick={handleSelectAllTrackers}
          className="w-4 cursor-pointer"
        />
      </div>
      <div className="w-full min-w-[200px] max-w-[700px]">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">Description</span>
      </div>
      <div className="flex justify-center items-center w-full h-full gap-2 cursor-default min-w-[150px] max-w-[150px] border-l border-text-light-color">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">Projet</span>
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
      <div className="flex justify-center items-center w-full h-full gap-2 cursor-default min-w-[150px] max-w-[150px] border-l border-r border-text-light-color">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">Utilisateur</span>
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
      <div className="flex justify-center items-center w-full h-full gap-2 cursor-default min-w-[120px] max-w-[120px] border-r border-text-light-color">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">Date</span>
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

      <div className="flex justify-center items-center w-full h-full gap-2 cursor-default max-w-[100px] min-w-[100px] border-r border-text-light-color">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">Temps</span>
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
      <div className="flex justify-center items-center w-full h-full gap-2 cursor-default max-w-[120px] min-w-[120px] border-r border-text-light-color">
        <span className="flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis">Facturable</span>
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
