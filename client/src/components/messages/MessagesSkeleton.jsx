import styles from "@/styles/components/messages/messages-skeletons.module.css";

export default function MessagesSkeleton() {
  return (
    <>
      {Array.from({ length: 1 }).map((_, idx) => {
        return (
          <div className={styles.container} key={idx}>
            <div className={styles.message}>
              {/* Message Head */}
              <div className={styles.header}>
                <div></div>
                <div></div>
              </div>
              {/* Message Body */}
              <div className={styles.body}>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
