import styles from "@/styles/components/projects/projectSideNav-skeleton.module.css";

export default function ProjectSideNavSkeleton() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, idx) => {
        return (
          <div className={styles.container} key={idx}>
            <div className={styles.logo}></div>
          </div>
        );
      })}
    </>
  );
}
