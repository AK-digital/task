import ProjectMembers from "./ProjectMembers";
import StatusSegment from "./StatusSegment";
import Link from "next/link";
import { Star } from "lucide-react";
import Image from "next/image";
import { deleteFavorite, saveFavorite } from "@/api/favorite";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth";

export default function ProjectCard({
  project,
  mutateProjects,
  href,
  isDefault,
}) {
  const { uid } = useContext(AuthContext);
  const userFavIds = project?.favorites?.map((fav) => fav.user);
  const hasFav = userFavIds?.includes(uid);
  const [isFavorite, setIsFavorite] = useState(hasFav);
  const isDefaultProject = isDefault || false;

  const statuses = project?.statuses || [];

  const totalTasks = project?.tasksCount || 0;
  const totalBoards = project?.boardsCount || 0;

  const members = project?.members || [];

  const projectId = project?._id;

  const name = project?.name || "Nouveau projet";

  async function handleFavorite(e) {
    e.stopPropagation();

    if (isFavorite) {
      await RemoveFavorite();
    } else {
      await AddFavorite();
    }
  }

  async function AddFavorite() {
    setIsFavorite(true);

    const res = await saveFavorite(projectId);

    if (!res.success) {
      setIsFavorite(false);
      return;
    }

    mutateProjects();
  }

  async function RemoveFavorite() {
    setIsFavorite(false);
    const favoriteId = project?.favorites?.find((fav) => fav.user === uid)?._id;

    const res = await deleteFavorite(favoriteId);

    if (!res.success) {
      setIsFavorite(true);
      return;
    }
    mutateProjects();
  }

  return (
    <div key={projectId} className="relative w-full max-w-[290px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-visible transition-all duration-200 ease-in-out cursor-pointer mt-6 no-underline hover:-translate-y-0.5 flex flex-col">
      <div className={`relative w-40 h-[30px] rounded-tl-2xl rounded-tr-0 rounded-bl-0 rounded-br-0 [clip-path:path('M_0_0_L_128_0_C_144_2_136_24,_160_34_L_0_34_Z')] ${isDefaultProject ? 'bg-[#e9e7dd]' : 'top-px left-0 bg-background-secondary-color'}`}>

        <Star
          size={16}
          onClick={handleFavorite}
          className={`absolute top-[7px] left-[15px] ${isFavorite ? 'fill-color-accent-color text-color-accent-color' : 'fill-[#d0cec7] text-[#d0cec7]'}`} 
          />
      </div>

      <Link href={href} className="no-underline">
        <div className={`flex-1 py-[18px] px-[22px] rounded-tr-2xl rounded-bl-2xl min-h-[193px] rounded-br-2xl rounded-tl-none transition-all duration-200 ease-in-out hover:shadow-[10px_10px_10px_rgba(0,0,0,0.1)] hover:!text-transparent flex flex-col justify-between ${isDefaultProject ? 'absolute w-full bg-[#e9e7dd]' : 'bg-background-secondary-color'}`}>
          
          <div>
            {isDefaultProject ? (
              <div className="flex justify-between w-full rounded-2xl">
                <div className="flex items-center justify-center w-[45px] h-[45px] bg-[#d0cec7] rounded-full">
                  <Image
                    src="/default-project-logo.svg"
                    alt="project"
                    width={22}
                    height={22}
                    className="rounded-full w-[22px] h-[22px] max-w-[22px] max-h-[22px]"
                  />
                </div>

                <div className="flex w-[30px] h-[30px] max-w-[30px] max-h-[30px] rounded-full bg-[#d0cec7]">
                  <div className="-ml-2"></div>
                </div>
              </div>
              
            ) : (
              <div className="flex justify-between w-full rounded-2xl">
                <Image
                  src={project?.logo || "/default-project-logo.webp"}
                  alt="project"
                  width={45}
                  height={45}
                  className="rounded-full w-[45px] h-[45px] max-w-[45px] max-h-[45px] cursor-pointer"
                />

                <ProjectMembers members={members} />
              </div>
            )}

            <div className="text-xl mt-1.5 text-text-darker-color">
              <span>{name}</span>
            </div>
          </div>

          {isDefaultProject ? (
            <div className="flex flex-col mt-6 gap-2.5 text-text-size-small flex-1">
              <div className={`text-text-darker-color ${isDefaultProject ? 'bg-[#d0cec7] w-[100px] h-3 rounded-[5px]' : ''}`} data-default="true"></div>
              <div className="flex justify-between items-center text-text-darker-color" data-default="true">
                <div className="rounded-[5px] bg-[#d0cec7] w-[76px] h-3" />
                <div className={`flex h-3 w-full rounded-[5px] flex-[0.5] statusBar_ProjectCard ${isDefaultProject ? 'bg-[#d0cec7]' : 'bg-[#e9ecef]'}`} data-default="true"></div>
              </div>
            </div>
          ) : (
            project && (
              <div className="flex flex-col mt-6 gap-2.5 text-text-size-small flex-1">
                <span className="text-text-darker-color">
                  {`${totalBoards} tableau${totalBoards === 1 ? "" : "x"}`}
                </span>
                <div className="flex justify-between items-center text-text-darker-color">
                  {`${totalTasks} tâche${totalTasks === 1 ? "" : "s"}`}
                  <div className="flex h-3 w-full rounded-[5px] bg-[#e9ecef] flex-[0.5] statusBar_ProjectCard">
                    {statuses.map((status, idx) => {
                      return (
                        <StatusSegment
                          key={status?._id}
                          status={status}
                          totalTasks={totalTasks}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </Link>
    </div>
  );
}
