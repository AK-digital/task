import styles from "@/styles/components/popups/colors-popup.module.css";

export default function ColorsPopup({
  colors,
  setColor,
  setMoreColor,
  updateStatus,
}) {
  return (
    <>
      <div className={styles.container}>
        <ul className={styles.colors}>
          {colors?.map((color, idx) => {
            return (
              <li
                key={idx}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setColor(color);
                  updateStatus(color);
                }}
                className={styles.color}
              ></li>
            );
          })}
        </ul>
      </div>
      <div id="modal-layout-opacity" onClick={() => setMoreColor(false)}></div>
    </>
  );
}
