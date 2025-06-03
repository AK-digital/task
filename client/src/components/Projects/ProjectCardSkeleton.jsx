export default function ProjectCardSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, idx) => {
        return (
          <div className="relative w-full max-w-[290px] rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-2xl overflow-visible animate-pulse" key={idx}>
            <div className="relative top-px left-0 w-[160px] h-[30px] bg-secondary rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-none clip-path-[path('M_0_0_L_128_0_C_144_2,_136_24,_160_34_L_0_34_Z')]">
              <div className="absolute top-[7px] left-[15px] w-4 h-4 rounded-full bg-primary"></div>
            </div>
            <div className="min-h-[181px] py-[18px] px-[22px] bg-secondary rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-2xl">
              <div className="flex justify-between items-center w-full rounded-2xl">
                <div className="w-[45px] h-[45px] rounded-full bg-primary"></div>
                <div className="flex gap-[-8px]">
                  <div className="w-[30px] h-[30px] rounded-full bg-primary ml-0"></div>
                  <div className="w-[30px] h-[30px] rounded-full bg-primary ml-[-8px]"></div>
                  <div className="w-[30px] h-[30px] rounded-full bg-primary ml-[-8px]"></div>
                </div>
              </div>

              <div className="mt-1.5">
                <div className="w-[70%] h-5 rounded-lg bg-primary"></div>
              </div>

              <div className="flex flex-col gap-2.5 mt-[30px]">
                <div className="w-[100px] h-3 rounded-[5px] bg-primary"></div>
                <div className="flex justify-between items-center gap-3">
                  <div className="w-[76px] h-3 rounded-[5px] bg-primary"></div>
                  <div className="h-3 w-full max-w-[120px] rounded-[5px] bg-primary flex-[0.5]"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
