"use client";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import Link from "next/link";
import { Home, FileQuestion } from "lucide-react";
import { AuthContext } from "@/context/auth";

export default function NotFound() {
  const router = useRouter();
  
  // Gérer le cas où AuthContext n'est pas disponible (page 404 globale)
  let user = null;
  try {
    const authContext = useContext(AuthContext);
    user = authContext?.user || null;
  } catch (error) {
    // AuthContext non disponible, utilisateur considéré comme non connecté
    user = null;
  }
  
  // Déterminer la destination et le texte selon l'état de connexion
  const isAuthenticated = !!user;
  const destination = isAuthenticated ? "/projects" : "/";
  const buttonText = isAuthenticated ? "Tous les projets" : "Retour à l'accueil";

  return (
    <div className="min-h-screen bg-[#F6F4E9] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Illustration simple et élégante */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 border border-[#acaba5]">
            <FileQuestion className="w-16 h-16 text-[#a87e51]" />
          </div>
          
          {/* Numéro 404 avec la police de l'app */}
          <div className="text-7xl font-bricolage font-bold text-[#3a4344] mb-4">
            404
          </div>
        </div>

        {/* Titre avec les couleurs de l'app */}
        <h1 className="text-2xl font-bricolage font-semibold text-[#1f312d] mb-3">
          Page introuvable
        </h1>

        {/* Description */}
        <p className="text-[#72716f] mb-8 leading-relaxed font-bricolage">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Bouton d'action avec le style de l'app */}
        <Link
          href={destination}
          className="font-bricolage inline-flex items-center gap-2 bg-[#a87e51] text-white px-6 py-3 rounded-lg hover:bg-[#977045] transition-colors font-medium shadow-md"
        >
          <Home className="w-5 h-5" />
          {buttonText}
        </Link>

        {/* Message d'aide discret */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-[#acaba5] shadow-sm">
          <p className="text-[#72716f] text-sm font-bricolage">
            💡 Vérifiez l'URL ou utilisez la navigation pour retrouver ce que vous cherchez.
          </p>
        </div>
      </div>
    </div>
  );
}