"use client";
import { useRouter } from "next/navigation";
import { Home, RefreshCw, ArrowLeft, Zap } from "lucide-react";

export default function Custom404({ 
  title = "Page introuvable", 
  description = "La page que vous recherchez n'existe pas ou a été déplacée.",
  showSearch = false 
}) {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        {/* Icône animée */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-12 h-12 text-blue-600 animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Code d'erreur stylisé */}
        <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          404
        </div>

        {/* Titre et description */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Boutons d'action */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleGoBack}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Message d'encouragement */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-blue-800 text-sm font-medium">
            💡 Conseil : Vérifiez l'URL ou utilisez la navigation pour retrouver ce que vous cherchez.
          </p>
        </div>
      </div>
    </div>
  );
}
