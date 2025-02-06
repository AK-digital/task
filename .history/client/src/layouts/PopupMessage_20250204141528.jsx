import { useState } from "react";

export default function PopupMessage({ status, title, message }) {
  const [display, setDisplay] = useState(false);

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
