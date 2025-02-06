"use client";
import styles from "@/styles/layouts/project-header.module.css";

export default function SearchForm() {
  return (
    <form className={styles.searchForm}>
      {/* <Search size={16} className={styles.searchIcon} /> */}
      <input
        type="text"
        placeholder="Rechercher..."
        className={styles.searchInput}
      />
    </form>
  );
}
