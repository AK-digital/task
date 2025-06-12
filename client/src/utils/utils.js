import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Figma, Github, Gitlab, Globe, Layout, Youtube } from "lucide-react";
import socket from "./socket";

export function isNotEmpty(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

export function formatTime(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function checkRole(project, roles, uid) {
  const member =
    project?.members?.find((member) => member?.user === uid) ||
    project?.members?.find((member) => member?.user?._id === uid);

  if (!member) return false;

  return roles?.includes(member?.role);
}

export function memberRole(role, t) {
  if (role === "owner") {
    return t("roles.owner_emoji");
  }
  if (role === "manager") {
    return t("roles.manager_emoji");
  }
  if (role === "team") {
    return t("roles.team_emoji");
  }
  if (role === "customer") {
    return t("roles.customer_emoji");
  }
  if (role === "guest") {
    return t("roles.guest_emoji");
  }
}

export const icons = [
  {
    name: "Globe",
    icon: <Globe size={20} />,
  },
  {
    name: "Layout",
    icon: <Layout size={20} />,
  },
  {
    name: "Figma",
    icon: <Figma size={20} />,
  },
  {
    name: "Github",
    icon: <Github size={20} />,
  },
  {
    name: "Gitlab",
    icon: <Gitlab size={20} />,
  },
  {
    name: "Youtube",
    icon: <Youtube size={20} />,
  },
];

export function exportTimeTracking(projects, trackers, t) {
  for (const project of projects) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Titre
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(t("time_tracking.time_report"), pageWidth / 2, 20, {
      align: "center",
    });

    const filteredTrackers = trackers?.filter(
      (tracker) => tracker?.projectId?._id === project?._id
    );

    // Séparer les trackers facturables et non facturables
    const billableTrackers = filteredTrackers?.filter(
      (tracker) => tracker?.billable === true
    );
    const nonBillableTrackers = filteredTrackers?.filter(
      (tracker) => tracker?.billable === false
    );

    // Calculer les durées totales
    const billableDuration = billableTrackers?.reduce((acc, tracker) => {
      return acc + Math.floor(tracker?.duration / 1000) * 1000;
    }, 0);

    const nonBillableDuration = nonBillableTrackers?.reduce((acc, tracker) => {
      return acc + Math.floor(tracker?.duration / 1000) * 1000;
    }, 0);

    const totalDuration = billableDuration + nonBillableDuration;

    const startingDate = filteredTrackers?.sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    )[0]?.startTime;

    const formattedStartingDate = new Date(startingDate).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

    const endingDate = filteredTrackers?.sort(
      (a, b) => new Date(b.startTime) - new Date(a.startTime)
    )[0]?.startTime;

    const formattedEndingDate = new Date(endingDate).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

    const centerX = pageWidth / 2;

    doc.setDrawColor(255);
    doc.setFillColor(255);
    doc.addImage(
      project?.logo || "/default-project-logo.webp",
      "PNG",
      centerX - 10,
      35,
      20,
      20,
      undefined,
      "FAST"
    );
    doc.setLineWidth(1);
    doc.circle(centerX, 45, 10, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(project?.name, centerX, 60, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(
      t("time_tracking.from_to_date", {
        startDate: formattedStartingDate,
        endDate: formattedEndingDate,
      }),
      14,
      80
    );
    doc.text(
      `${t("time_tracking.total_duration")} ${formatTime(
        Math.floor(totalDuration / 1000)
      )}`,
      pageWidth - 14,
      80,
      { align: "right" }
    );

    let currentY = 90;

    // Tableau des tâches facturables
    if (billableTrackers?.length > 0) {
      // Titre du tableau facturable
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text(t("time_tracking.billable_tasks_title"), 14, currentY);
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text(
        `${t("time_tracking.total_label")} ${formatTime(
          Math.floor(billableDuration / 1000)
        )}`,
        pageWidth - 14,
        currentY,
        { align: "right" }
      );
      currentY += 10;

      autoTable(doc, {
        head: [
          [
            t("time_tracking.description_column"),
            t("time_tracking.responsible_column"),
            t("time_tracking.time_column"),
            t("time_tracking.date_column"),
          ],
        ],
        body: billableTrackers?.map((tracker) => {
          return [
            tracker?.taskText || tracker?.taskId?.text,
            tracker?.userId?.firstName + " " + tracker?.userId?.lastName,
            formatTime(Math.floor(tracker?.duration / 1000)),
            new Date(tracker?.startTime).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
          ];
        }),
        startY: currentY,
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          halign: "center",
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 14, right: 14 },
      });

      currentY = doc.lastAutoTable.finalY + 20;
    }

    // Tableau des tâches non facturables
    if (nonBillableTrackers?.length > 0) {
      // Titre du tableau non facturable
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(192, 57, 43);
      doc.text(t("time_tracking.non_billable_tasks_title"), 14, currentY);
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text(
        `${t("time_tracking.total_label")} ${formatTime(
          Math.floor(nonBillableDuration / 1000)
        )}`,
        pageWidth - 14,
        currentY,
        { align: "right" }
      );
      currentY += 10;

      autoTable(doc, {
        head: [
          [
            t("time_tracking.description_column"),
            t("time_tracking.responsible_column"),
            t("time_tracking.time_column"),
            t("time_tracking.date_column"),
          ],
        ],
        body: nonBillableTrackers?.map((tracker) => {
          return [
            tracker?.taskText || tracker?.taskId?.text,
            tracker?.userId?.firstName + " " + tracker?.userId?.lastName,
            formatTime(Math.floor(tracker?.duration / 1000)),
            new Date(tracker?.startTime).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
          ];
        }),
        startY: currentY,
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [192, 57, 43],
          textColor: 255,
          halign: "center",
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 14, right: 14 },
      });
    }

    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        t("time_tracking.page_info", { current: i, total: pageCount }),
        pageWidth - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
      doc.text(
        t("time_tracking.document_generated"),
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Sauvegarde du fichier avec nom du projet
    doc.save(
      `${formattedStartingDate}-${formattedEndingDate}-${
        project?.name || t("time_tracking.default_project")
      }-temps-clynt.pdf`
    );
  }
}

export function groupReactionsByEmoji(reactions = []) {
  return reactions.reduce((acc, curr) => {
    const emoji = acc.find((item) => item.emoji === curr.emoji);
    const total = reactions.filter(
      (reaction) => reaction.emoji === curr.emoji
    ).length;
    const usersWhoReacted = reactions
      .filter((reaction) => reaction.emoji === curr.emoji)
      .map((reaction) => reaction.userId);

    if (!emoji) {
      const newCurr = { ...curr, total, users: usersWhoReacted };
      return acc.concat([newCurr]);
    } else {
      return acc;
    }
  }, []);
}

export function sendNotification(receiver, user, uid, message, link) {
  // Ne pas envoyer de notification si c'est l'utilisateur qui s'ajoute lui-même
  if (receiver?._id === uid) return;

  socket.emit("create notification", user, receiver?.email, message, link);
}

export const colors = [
  "#b3bcc0",
  "#559fc6",
  "#f3b158",
  "#63a758",
  "#007bff",
  "#28a745",
  "#ffc107",
  "#dc3545",
  "#4ECDC4",
  "#556270",
  "#aa51c4",
  "#D35400",
  "#2574A9",
  "#26A65B",
  "#F5D76E",
  "#663399",
  "#E74C3C",
];

export const priorityColors = [
  "#E0F7FA", // Très Basse
  "#afbde9", // Basse (existante)
  "#BBDEFB", // Info
  "#C5CAE9", // Routine
  "#B2EBF2", // Planifiée
  "#879ce0", // Moyenne (existante)
  "#D1C4E9", // Standard
  "#9575CD", // Importante
  "#7c67ad", // Haute (existante)
  "#8E24AA", // Critique
  "#F06292", // Urgente
  "#e17587", // Urgent (existante)
  "#E53935", // Très Urgente
  "#D32F2F", // Immédiate
  "#C62828", // Blocante
  "#FF7043", // Sécurité
  "#FF8A65", // Alerte modérée
];

export function isMeaningfulContent(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return !!temp.textContent.trim(); // retourne true s'il y a du texte non vide
}
