export default function ProjectCardSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, idx) => {
        return (
          <div className="relative w-full max-w-[290px] rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-2xl overflow-visible mt-6" key={idx}>
            <div className="relative top-px left-0 w-[160px] h-[30px] bg-background-secondary-color rounded-tl-2xl rounded-tr-none rounded-bl-none rounded-br-none clip-path-[path('M_0_0_L_128_0_C_144_2,_136_24,_160_34_L_0_34_Z')]">
              <div className="absolute top-[7px] left-[15px] w-4 h-4 rounded-full bg-background-primary-color shimmer_ProjectCardSkeleton"></div>
            </div>
            <div className="min-h-[181px] py-[18px] px-[22px] bg-background-secondary-color rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-2xl">
              <div className="flex justify-between items-center w-full rounded-2xl">
                <div className="w-[45px] h-[45px] rounded-full bg-background-primary-color shimmer_ProjectCardSkeleton"></div>
                <div className="flex gap-[-8px]">
                  <div className="member_ProjectCardSkeleton ml-0 shimmer_ProjectCardSkeleton"></div>
                  <div className="member_ProjectCardSkeleton ml-[-8px] shimmer_ProjectCardSkeleton"></div>
                  <div className="member_ProjectCardSkeleton ml-[-8px] shimmer_ProjectCardSkeleton"></div>
                </div>
              </div>

              <div className="mt-1.5">
                <div className="w-[70%] h-5 rounded-lg bg-background-primary-color shimmer_ProjectCardSkeleton"></div>
              </div>

              <div className="flex flex-col gap-2.5 mt-[30px]">
                <div className="w-[100px] h-3 rounded-[5px] bg-background-primary-color shimmer_ProjectCardSkeleton"></div>
                <div className="flex justify-between items-center gap-3">
                  <div className="w-[76px] h-3 rounded-[5px] bg-background-primary-color shimmer_ProjectCardSkeleton"></div>
                  <div className="h-3 w-full max-w-[120px] rounded-[5px] bg-background-primary-color flex-[0.5] shimmer_ProjectCardSkeleton"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
