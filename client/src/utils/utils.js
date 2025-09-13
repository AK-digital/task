import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Figma, 
  Github, 
  Gitlab, 
  Globe, 
  Layout, 
  Youtube,
  Slack,
  Trello,
  Database,
  Cloud,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Link2,
  Settings
} from "lucide-react";
import socket from "./socket";
import Image from "next/image";

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

export function memberRole(role) {
  if (role === "owner") {
    return "👑 Créateur";
  }
  if (role === "manager") {
    return "👨‍💼 Manager";
  }
  if (role === "team") {
    return "🙏 Équipe";
  }
  if (role === "customer") {
    return "👤Client";
  }
  if (role === "guest") {
    return "🙋‍♂️ Invité";
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
  {
    name: "Slack",
    icon: <Slack size={20} />,
  },
  {
    name: "Trello",
    icon: <Trello size={20} />,
  },
  {
    name: "Database",
    icon: <Database size={20} />,
  },
  {
    name: "Cloud",
    icon: <Cloud size={20} />,
  },
  {
    name: "Mail",
    icon: <Mail size={20} />,
  },
  {
    name: "MessageSquare",
    icon: <MessageSquare size={20} />,
  },
  {
    name: "Calendar",
    icon: <Calendar size={20} />,
  },
  {
    name: "FileText",
    icon: <FileText size={20} />,
  },
  {
    name: "Link2",
    icon: <Link2 size={20} />,
  },
  {
    name: "Settings",
    icon: <Settings size={20} />,
  },
  {
    name: "Google Drive",
    icon: <Image src={"/icons/icon-Google-Drive.svg"} alt="Google Drive" width={20} height={20} />,
  },
  {
    name: "Dropbox",
    icon: <Image src={"/icons/icon-dropbox.svg"} alt="Dropbox" width={20} height={20} />,
  },
  {
    name: "Excel Document",
    icon: <Image src={"/icons/icon-excel-document.svg"} alt="Excel" width={20} height={20} />,
  },
  {
    name: "Document",
    icon: <Image src={"/icons/icon-document.svg"} alt="Document" width={20} height={20} />,
  },
  {
    name: "PDF Document",
    icon: <Image src={"/icons/icon-PDF.svg"} alt="PDF" width={20} height={20} />,
  },
  {
    name: "Word Document",
    icon: <Image src={"/icons/icon-word.svg"} alt="Word" width={20} height={20} />,
  },
  {
    name: "PowerPoint",
    icon: <Image src={"/icons/icon-powerpoint.svg"} alt="PowerPoint" width={20} height={20} />,
  },
  {
    name: "ZIP Archive",
    icon: <Image src={"/icons/icon-ZIP.svg"} alt="ZIP" width={20} height={20} />,
  },
];

export function exportTimeTracking(projects, trackers) {
  for (const project of projects) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Titre
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Relevé de temps", pageWidth / 2, 20, {
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
      project?.logo || "/default/default-project-logo.webp",
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
    doc.text(`Du ${formattedStartingDate} au ${formattedEndingDate}`, 14, 80);
    doc.text(
      `Durée totale ${formatTime(Math.floor(totalDuration / 1000))}`,
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
      doc.text("Tâches facturables", 14, currentY);
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text(
        `Total : ${formatTime(Math.floor(billableDuration / 1000))}`,
        pageWidth - 14,
        currentY,
        { align: "right" }
      );
      currentY += 10;

      autoTable(doc, {
        head: [["Description", "Responsable", "Temps", "Date"]],
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
      doc.text("Tâches non facturables", 14, currentY);
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text(
        `Total : ${formatTime(Math.floor(nonBillableDuration / 1000))}`,
        pageWidth - 14,
        currentY,
        { align: "right" }
      );
      currentY += 10;

      autoTable(doc, {
        head: [["Description", "Responsable", "Temps", "Date"]],
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
        `Page ${i} / ${pageCount}`,
        pageWidth - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
      doc.text(
        "Document généré automatiquement",
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Sauvegarde du fichier avec nom du projet
    doc.save(
      `${formattedStartingDate}-${formattedEndingDate}-${project?.name || "projet"
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

  // Vérifier s'il y a du texte non vide
  const hasText = !!temp.textContent.trim();

  // Vérifier s'il y a des images
  const hasImages = temp.querySelectorAll('img').length > 0;

  // Retourner true s'il y a du texte OU des images
  return hasText || hasImages;
}


export function isStringPlural(str, elt = []) {
  if (elt?.length > 1) {
    return str + "s";
  }
  return str;
}