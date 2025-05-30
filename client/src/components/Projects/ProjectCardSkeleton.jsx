import styles from "@/styles/components/projects/projectCard-skeleton.module.css";

export default function ProjectCardSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, idx) => {
        return (
          <div className={styles.projectWrapper} key={idx}>
            <div className={styles.starWrapper}>
              <div className={styles.star}></div>
            </div>
            <div className={styles.contentWrapper}>
              <div className={styles.imagesWrapper}>
                <div className={styles.logo}></div>
                <div className={styles.membersWrapper}>
                  <div className={styles.member}></div>
                  <div className={styles.member}></div>
                  <div className={styles.member}></div>
                </div>
              </div>

              <div className={styles.nameWrapper}>
                <div className={styles.name}></div>
              </div>

              <div className={styles.footerWrapper}>
                <div className={styles.tabs}></div>
                <div className={styles.tasks}>
                  <div className={styles.taskText}></div>
                  <div className={styles.statusBar}></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
