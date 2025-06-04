export default function ProjectSideNavSkeleton() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, idx) => {
        return (
          <div key={idx} className="relative flex items-center gap-3 mb-2 cursor-pointer text-text-lighter-color transition-all ease-linear duration-150 animate-pulse">
            <div className="w-[42px] h-[42px] min-w-[42px] min-h-[42px] rounded-full bg-white"></div>
          </div>
        );
      })}
    </>
  );
}
