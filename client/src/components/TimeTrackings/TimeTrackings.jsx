"use client";
import styles from "@/styles/components/timeTrackings/time-trackings.module.css";
import { formatTime, isNotEmpty } from "@/utils/utils";
import TimeTracking from "./TimeTracking";
import Filters from "./Filters";
import TimeTrackingHeader from "./TimeTrackingHeader";
import { useEffect, useState } from "react";
import SelectedTimeTrackings from "./SelectedTimeTrackings";
import { useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function TimeTrackings({ trackers, projects }) {
  const searchParams = useSearchParams();
  const queries = new URLSearchParams(searchParams);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [filteredTrackers, setFilteredTrackers] = useState(trackers || []);
  const [selectedTrackers, setSelectedTrackers] = useState([]);
  const totalDuration = trackers?.reduce((acc, tracker) => {
    return acc + Math.floor(tracker?.duration / 1000) * 1000;
  }, 0);

  useEffect(() => {
    setFilteredTrackers(trackers);
  }, [trackers]);

  useEffect(() => {
    const projectIds = queries?.get("projectId")?.split(" ");

    if (projectIds?.length > 0) {
      setSelectedProjects(
        projects.filter((project) => projectIds.includes(project?._id))
      );
    } else {
      setSelectedProjects([]);
    }
  }, [searchParams]);

  // function timeExportPDF() {
  //   const data = [
  //     {
  //       task: "Test de tâche",
  //       user: "Nicolas Tombal",
  //       date: "10/04/2025",
  //       time: "00:00:02",
  //     },
  //     {
  //       task: "Test de tâche",
  //       user: "Nicolas Tombal",
  //       date: "10/04/2025",
  //       time: "00:00:01",
  //     },
  //   ];

  //   const totalTime = "00:00:03";
  //   const projectName = "Task Dev";

  //   const doc = new jsPDF();

  //   doc.setFontSize(16);
  //   doc.text(`Projet : ${projectName}`, 14, 20);

  //   autoTable(doc, {
  //     head: [["Tâche", "Utilisateur", "Date", "Temps"]],
  //     body: data.map((item) => [item.task, item.user, item.date, item.time]),
  //     startY: 30,
  //   });

  //   doc.setFontSize(12);
  //   doc.text(`Temps total : ${totalTime}`, 14, doc.lastAutoTable.finalY + 10);

  //   doc.save(`suivi-temps-${projectName}.pdf`);
  // }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Suivi du temps</h1>
        {/* Filters */}
        <Filters projects={projects} selectedProjects={selectedProjects} />
        {/* Total duration */}

        {totalDuration && (
          <span className={styles.total}>
            Temps total : {formatTime(Math.floor(totalDuration / 1000))}
          </span>
        )}
        {/* <button className={styles.export} onClick={timeExportPDF}>
          Exporter en PDF
        </button> */}
      </div>
      {/* Time tracking list */}
      {selectedProjects?.length > 0 ? (
        <>
          {isNotEmpty(filteredTrackers) && (
            <div className={styles.content}>
              <TimeTrackingHeader
                trackers={trackers}
                setFilteredTrackers={setFilteredTrackers}
                setSelectedTrackers={setSelectedTrackers}
              />
              {filteredTrackers?.map((tracker) => {
                return (
                  <TimeTracking
                    tracker={tracker}
                    projects={projects}
                    setSelectedTrackers={setSelectedTrackers}
                    key={tracker?._id}
                  />
                );
              })}
              {selectedTrackers.length > 0 && (
                <SelectedTimeTrackings
                  selectedTrackers={selectedTrackers}
                  setSelectedTrackers={setSelectedTrackers}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <h2>Choisissez un projet pour voir les temps de suivi</h2>
        </div>
      )}
    </div>
  );
}
