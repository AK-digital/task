export default function Modal({ children, setOpenModal }) {
  return (
    <div>
      {children}
      <div
        id="modal-layout-opacity"
        onClick={(e) => {
          setOpenModal(false);
          e.stopPropagation();
        }}
      ></div>
    </div>
  );
}
