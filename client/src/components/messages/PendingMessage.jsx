import { AuthContext } from "@/context/auth";
import Image from "next/image";
import { useContext } from "react";

export default function PendingMessage({ message }) {
  const { user } = useContext(AuthContext);

  // Fonction pour nettoyer et gérer les images dans le HTML
  const processMessageHTML = (htmlContent) => {
    if (!htmlContent) return "";

    // Créer un élément temporaire pour traiter le HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    // Gérer toutes les images
    const images = tempDiv.querySelectorAll("img");
    images.forEach((img) => {
      // Ajouter des gestionnaires d'erreur et de chargement
      img.onerror = function () {
        this.style.display = "none";
      };
      img.onload = function () {
        this.style.background = "transparent";
      };

      // Si l'image n'a pas de src valide, la cacher
      if (
        !img.src ||
        img.src === "" ||
        img.src.includes("data:image/svg+xml;base64,")
      ) {
        img.style.display = "none";
      }
    });

    return tempDiv.innerHTML;
  };

  return (
    <div className="flex flex-col gap-2 opacity-75 transition-opacity duration-[50ms] ease-linear data-[loading=true]:opacity-[0.4] ">
      <div className="relative flex justify-between flex-col gap-3.5 py-4 px-6 bg-secondary rounded-lg transition-all duration-[50ms] ease-linear">
        {/* Header auteur */}
        <div className="flex items-center justify-between [&_svg]:cursor-pointer ">
          <div className="flex items-center gap-2 select-none">
            <Image
              src={user?.picture || "/default/default-pfp.webp"}
              width={35}
              height={35}
              alt={`Photo de profil de ${user?.firstName}`}
              className="rounded-full w-[35px] h-[35px] max-w-[35px] max-h-[35px]"
            />
            <span className="text-normal font-medium">
              {user?.firstName + " " + user?.lastName}
            </span>
          </div>
        </div>
        {/* Message */}
        <div className="text_Message">
          <div
            dangerouslySetInnerHTML={{ __html: processMessageHTML(message) }}
          />
        </div>
      </div>
    </div>
  );
}
