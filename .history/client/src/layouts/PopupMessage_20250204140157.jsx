export default function PopupMessage({ title, message }) {
  return (
    <div>
      <div>
        <span>{title}</span>
      </div>
      <div>
        <p>{message}</p>
      </div>
    </div>
  );
}
