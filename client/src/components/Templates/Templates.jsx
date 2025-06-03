"use client";
import styles from "@/styles/components/templates/templates.module.css";
import { isNotEmpty } from "@/utils/utils";
import Template from "./Template";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function Templates({ templates }) {
  const { t } = useTranslation();
  const data = templates?.data;
  const router = useRouter();

  const handleGoBack = (e) => {
    e.preventDefault();
    router.back();
  };

  return (
    <div className={styles.container}>
      {/* Filters */}
      {/* <div></div> */}
      {/* Templates */}
      {isNotEmpty(data) ? (
        <div className={styles.templates}>
          {data.map((elt) => {
            return <Template elt={elt} key={elt?._id} />;
          })}
        </div>
      ) : (
        <div>
          <p>{t("templates.no_template_found")}</p>
        </div>
      )}

      {/* buttons */}

      <button type="button" onClick={handleGoBack} className={styles.back}>
        {t("templates.back")}
      </button>
    </div>
  );
}
