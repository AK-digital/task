import NoPicture from "@/components/User/NoPicture";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Crown,
  Figma,
  Github,
  Gitlab,
  Globe,
  Layout,
  Youtube,
} from "lucide-react";
import Image from "next/image";
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
];

export function exportTimeTracking(projects, trackers) {
  for (const project of projects) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Titre
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Relevé de temps - AK Digital", pageWidth / 2, 20, {
      align: "center",
    });

    const filteredTrackers = trackers?.filter(
      (tracker) => tracker?.projectId === project?._id
    );
    const totalDuration = filteredTrackers?.reduce((acc, tracker) => {
      return acc + Math.floor(tracker?.duration / 1000) * 1000;
    }, 0);

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
    doc.text(`Du ${formattedStartingDate} au ${formattedEndingDate}`, 14, 80);
    doc.text(
      `Durée totale ${formatTime(Math.floor(totalDuration / 1000))}`,
      pageWidth - 14,
      80,
      { align: "right" }
    );

    autoTable(doc, {
      head: [["Description", "Responsable", "Temps", "Date"]],
      body: filteredTrackers?.map((tracker) => {
        return [
          tracker?.taskText || tracker?.task[0]?.text,
          tracker?.user?.firstName + " " + tracker?.user?.lastName,
          formatTime(Math.floor(tracker?.duration / 1000)),
          new Date(tracker?.startTime).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
        ];
      }),
      startY: 90,
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
      `${formattedStartingDate}-${formattedEndingDate}-${
        project?.name || "projet"
      }-temps-task.pdf`
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

export function displayPicture(user, width, height) {
  if (user?.picture) {
    return (
      <Image
        src={user?.picture}
        width={width}
        height={height}
        quality={100}
        alt={`Photo de ${user?.firstName}`}
        style={{ borderRadius: "50%", minHeight: height, minWidth: width }}
      />
    );
  } else {
    return <NoPicture width={width} height={height} user={user} />;
  }
}

export function sendNotification(receiver, user, uid, message, link) {
  // Ne pas envoyer de notification si c'est l'utilisateur qui s'ajoute lui-même
  if (receiver?._id === uid) return;

  socket.emit("create notification", user, receiver?.email, message, link);
}
