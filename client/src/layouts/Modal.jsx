export default function Modal({ children, setOpenModal }) {
  return (
    <div>
      {children}
      <div onClick={(e) => setOpenModal(false)} className="fixed z-2000 top-0 left-0 w-full h-full bg-transparent"></div>
    </div>
  );
}
