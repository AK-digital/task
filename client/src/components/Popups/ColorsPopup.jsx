export default function ColorsPopup({
  colors,
  setColor,
  setMoreColor,
  updateStatus,
}) {
  return (
    <>
      <div className="absolute z-2001 top-6 left-0 bg-secondary p-2 rounded-lg shadow-small w-[180px]">
        <ul className="grid grid-cols-6 justify-center gap-1.5 flex-wrap">
          {colors?.map((color, idx) => {
            return (
              <li
                key={idx}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setColor(color);
                  updateStatus(color);
                }}
                className="h-[22px] w-[22px] rounded-3xl cursor-pointer"
              ></li>
            );
          })}
        </ul>
      </div>
      <div
        className="modal-layout-opacity"
        onClick={() => setMoreColor(false)}
      ></div>
    </>
  );
}
