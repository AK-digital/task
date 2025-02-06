export default function NoPicture({ user, width, height }) {
  return (
    <div
      className={styles.container}
      style={{
        width: width,
        height: height,
      }}
    >
      <span></span>
    </div>
  );
}
