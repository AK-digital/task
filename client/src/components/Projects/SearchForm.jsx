"use client";
import styles from "@/styles/layouts/project-header.module.css";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SearchForm() {
  const { t } = useTranslation();

  return (
    <form className={styles.searchForm}>
      <Search size={16} className={styles.searchIcon} />
      <input
        type="text"
        placeholder={t("projects.search_placeholder")}
        className={styles.searchInput}
      />
    </form>
  );
}
