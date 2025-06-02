export default function TaskSkeletons({ displayedElts }) {
  const { isCheckbox, isDrag, isProject, isBoard } = displayedElts;

  return (
    <div>
      {Array.from({ length: 16 }).map((_, idx) => {
        return (
          <div 
            className="flex items-center gap-3 border-b border-text-color h-[46px] last:border-b-0 animate-pulse" 
            key={idx}
          >
            <div className="w-3.5 h-3.5 rounded-xs bg-background-primary-color"></div>

            <div className="w-full max-w-[700px] h-4.5 rounded-xs bg-background-primary-color"></div>

            {isProject && <div className="w-full max-w-[180px] h-4.5 rounded-xs bg-background-primary-color"></div>}

            {isBoard && <div className="w-full max-w-[160px] h-8 rounded-border-radius-medium bg-background-primary-color"></div>}

            <div className="w-full max-w-[34px] h-[34px] rounded-full bg-background-primary-color"></div>

            <div className="w-full max-w-[150px] h-8 rounded-border-radius-medium bg-background-primary-color"></div>

            <div className="w-full max-w-[150px] h-8 rounded-border-radius-medium bg-background-primary-color"></div>

            <div className="w-full max-w-[150px] h-8 rounded-border-radius-medium bg-background-primary-color"></div>

            <div className="w-full max-w-[150px] h-8 rounded-border-radius-medium bg-background-primary-color"></div>

            <div className="w-full max-w-[150px] h-4.5 rounded-xs bg-background-primary-color"></div>
          </div>
        );
      })}
    </div>
  );
}
