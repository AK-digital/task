import { formatTime } from "@/utils/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportPdfBtn({ projects, trackers }) {
  function handleExportPdf() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Titre centré
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Relevé de temps - AK Digital", pageWidth / 2, 20, {
      align: "center",
    });

    for (const project of projects) {
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

      // Logo rond
      doc.setDrawColor(255); // Pas de bordure
      doc.setFillColor(255);
      doc.addImage(
        project?.logo,
        "PNG",
        centerX - 10,
        35, // était 45
        20,
        20,
        undefined,
        "FAST"
      );
      doc.setLineWidth(1);
      doc.circle(centerX, 45, 10, "S"); // était 55

      // Nom du projet centré sous le logo
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(project?.name, centerX, 60, { align: "center" }); // était 70

      // Date à gauche et durée à droite sous le nom du projet
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Du ${formattedStartingDate} au ${formattedEndingDate}`, 14, 80); // Date à gauche
      doc.text(
        `Durée totale ${formatTime(Math.floor(totalDuration / 1000))}`,
        pageWidth - 14,
        80,
        {
          align: "right",
        }
      ); // Duration à droite

      // Tableau en dessous
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

      if (project !== projects[projects.length - 1]) {
        doc.addPage();
      }
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

    doc.save("recap-temps-taches.pdf");
  }

  return <button onClick={handleExportPdf}>Exporter en PDF</button>;
}
