export default function TaskText() {
  <div className={styles.container}>
    <form action={formAction} ref={formRef}>
      <input
        type="text"
        name="text"
        id="text"
        value={inputValue}
        onChange={handleChange}
      />
    </form>
  </div>;
}
