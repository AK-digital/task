
export default function MessagesSkeleton() {
  return (
    <>
      {Array.from({ length: 1 }).map((_, idx) => {
        return (
          <div className="w-full" key={idx}>
            <div className="py-4 px-6 bg-background-secondary-color rounded-lg w-full animate-pulse">
              {/* Message Head */}
              <div className="header_MessagesSkeleton flex items-center gap-2">
                <div className="bg-background-third-color w-[35px] h-[35px] rounded-full"></div>
                <div className="bg-background-third-color w-[120px] h-[20px] rounded-lg"></div>
              </div>
              {/* Message Body */}
              <div className="body_MessagesSkeleton flex flex-col gap-2 mt-[14px]">
                <div className="bg-background-third-color w-[60%] h-[20px] rounded-lg"></div>
                <div className="bg-background-third-color w-[40%] h-[20px] rounded-lg"></div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
