export default function TaskStatus() {
  return (
    <div className={styles["dropdown"]}>
      <div
        className={styles["dropdown-current"]}
        data-current={optimisticCurrent}
        onClick={(e) => setIsOpen(!isOpen)}
      >
        <span>{optimisticCurrent}</span>
      </div>
      {isOpen && (
        <div className={styles["dropdown-list"]}>
          <ul>
            {values.map((value, idx) => {
              return (
                <li key={idx} data-value={value} onClick={handleUpdateTask}>
                  {value}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
