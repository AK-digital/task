export default function TaskSkeletons({ displayedElts }) {
  const { isCheckbox, isDrag, isProject, isBoard } = displayedElts;

  return (
    <div>
      {Array.from({ length: 16 }).map((_, idx) => {
        return (
          <div
            className="flex items-center gap-3 border-b border-text-color h-[46px] animate-pulse"
            key={idx}
          >
            {/* <div className="w-3.5 h-3.5 rounded-xs bg-primary"></div> */}

            <div className="w-full max-w-[700px] h-4.5 ml-4 rounded-xs bg-primary"></div>

            {isProject && (
              <div className="w-full max-w-[180px] h-4.5 rounded-xs bg-primary"></div>
            )}

            {isBoard && (
              <div className="w-full max-w-[160px] h-4.5 rounded-2xl bg-primary"></div>
            )}

            {!isBoard && (
              <div className="flex flex-col gap-2 min-w-[150px]">
                <div className="w-full max-w-[150px] h-4.5 rounded-2xl bg-primary"></div>
                <div className="w-full max-w-[150px] h-4.5 rounded-2xl bg-primary"></div>
                <div className="w-full max-w-[150px] h-4.5 rounded-2xl bg-primary"></div>
                <div className="w-full max-w-[150px] h-4.5 rounded-2xl bg-primary"></div>
              </div>
            )}

            <div className="w-full max-w-[34px] h-[34px] rounded-full bg-primary"></div>

            <div className="w-full max-w-[150px] h-4.5 rounded-2xl bg-primary"></div>

            <div className="w-full max-w-[150px] h-4.5 rounded-2xl bg-primary"></div>

            <div className="w-full max-w-[150px] h-4.5 rounded-2xl bg-primary"></div>

            <div className="w-full max-w-[150px] h-4.5 rounded-2xl bg-primary"></div>

            <div className="w-full max-w-[150px] h-4.5 mr-4 rounded-xs bg-primary"></div>
          </div>
        );
      })}
    </div>
  );
}
