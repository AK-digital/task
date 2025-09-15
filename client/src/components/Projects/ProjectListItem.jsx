import ProjectMembers from "./ProjectMembers";
import StatusSegment from "./StatusSegment";
import Link from "next/link";
import { Star, Plus } from "lucide-react";
import Image from "next/image";
import { deleteFavorite, saveFavorite } from "@/api/favorite";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth";
import { mutate } from "swr";

export default function ProjectListItem({
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
    e.preventDefault();

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
    mutate("/favorite");
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
    mutate("/favorite");
  }

  if (isDefaultProject) {
    return (
      <Link
        href={href}
        className="no-underline w-full group"
      >
        <div className="flex items-center gap-6 p-5 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-accent-color hover:bg-accent-color/5 transition-all duration-200 group-hover:shadow-md">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-[18px] h-[18px]"></div>
            
            <div className="flex items-center justify-center w-[50px] h-[50px] bg-accent-color/10 rounded-full group-hover:bg-accent-color/20 transition-colors">
              <Plus size={24} className="text-accent-color" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-text-darker-color group-hover:text-accent-color transition-colors">
                Créer un nouveau projet
              </h3>
              <p className="text-sm text-text-color-muted">
                Commencez votre prochain projet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm text-text-color-muted opacity-60">
            <div className="text-center min-w-[80px]">
              <span className="font-medium">-</span>
              <div className="text-xs">tableaux</div>
            </div>
            
            <div className="text-center min-w-[80px]">
              <span className="font-medium">-</span>
              <div className="text-xs">tâches</div>
            </div>
            
            <div className="flex items-center gap-3 min-w-[200px]">
              <span className="text-xs whitespace-nowrap">Progression:</span>
              <div className="flex h-2 w-full rounded-full bg-gray-200"></div>
            </div>
            
            <div className="min-w-[120px]">
              <div className="flex">
                <div className="w-[30px] h-[30px] bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="no-underline w-full group"
    >
      <div className="flex items-center gap-6 py-3 px-5 bg-secondary rounded-xl border border-gray-100  hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Star
            size={20}
            onClick={handleFavorite}
            className={`cursor-pointer transition-all duration-200 hover:scale-110 ${
              isFavorite
                ? "fill-accent-color text-accent-color"
                : "fill-gray-300 text-gray-300 hover:fill-accent-color hover:text-accent-color"
            }`}
          />
          
          <Image
            src={project?.logo || "/default/default-project-logo.webp"}
            alt="project"
            width={50}
            height={50}
            className="rounded-full w-[50px] h-[50px] max-w-[50px] max-h-[50px] flex-shrink-0 border-2 border-white shadow-sm"
          />
          
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-text-darker-color truncate group-hover:text-accent-color transition-colors">
              {name}
            </h3>
            <p className="text-sm text-text-color-muted">
              Créé le {new Date(project?.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 text-sm text-text-darker-color">
          <div className="text-center min-w-[80px]">
            <span className="font-semibold text-lg">{totalBoards}</span>
            <div className="text-xs text-text-color-muted">
              tableau{totalBoards === 1 ? "" : "x"}
            </div>
          </div>
          
          <div className="text-center min-w-[80px]">
            <span className="font-semibold text-lg">{totalTasks}</span>
            <div className="text-xs text-text-color-muted">
              tâche{totalTasks === 1 ? "" : "s"}
            </div>
          </div>
          
          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-xs text-text-color-muted whitespace-nowrap font-medium">Progression:</span>
            <div className="flex h-3 w-full rounded-full bg-gray-100 overflow-hidden shadow-inner">
              {statuses.map((status) => (
                <StatusSegment
                  key={status?._id}
                  status={status}
                  totalTasks={totalTasks}
                />
              ))}
            </div>
          </div>
          
          <div className="min-w-[120px]">
            <ProjectMembers members={members} />
          </div>
        </div>
      </div>
    </Link>
  );
} 