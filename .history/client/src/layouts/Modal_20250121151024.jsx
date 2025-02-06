export default function Modal({ children }) {
  return (
    <div>
      {children}{" "}
      <div id="modal-layout-opacity" onClick={(e) => setOpenModal(false)}></div>
    </div>
  );
}
