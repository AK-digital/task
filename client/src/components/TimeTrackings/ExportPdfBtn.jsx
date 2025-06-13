import { useTranslation } from "react-i18next";

export default function ExportPdfBtn({ handleExport }) {
  const { t } = useTranslation();
  return (
    <button onClick={handleExport}>{t("time_tracking.export_pdf")}</button>
  );
}
