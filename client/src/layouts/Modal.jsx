export default function Modal({ children, setOpenModal }) {
  return (
    <div>
      {children}
      <div onClick={(e) => setOpenModal(false)} className="modal-layout-opacity"></div>
    </div>
  );
}
