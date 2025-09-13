"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Icône d'erreur animée */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Titre d'erreur */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Oups ! Une erreur s'est produite
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Quelque chose s'est mal passé de notre côté. 
          Nos développeurs ont été automatiquement notifiés et travaillent sur une solution.
        </p>

        {/* Détails de l'erreur (en mode développement) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <div className="flex items-center gap-2 mb-2">
              <Bug className="w-4 h-4 text-red-600" />
              <span className="text-red-800 font-medium text-sm">Détails de l'erreur (dev)</span>
            </div>
            <code className="text-xs text-red-700 break-all">
              {error.message}
            </code>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 mb-8">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-300 shadow-sm"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
        </div>

        {/* Conseils */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Que pouvez-vous faire ?
          </h3>
          
          <div className="space-y-3 text-left text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <p className="text-gray-700">
                <strong>Actualisez la page</strong> - Le problème peut être temporaire
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <p className="text-gray-700">
                <strong>Vérifiez votre connexion</strong> - Assurez-vous d'être connecté à Internet
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <p className="text-gray-700">
                <strong>Contactez le support</strong> - Si le problème persiste
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-500">
          Code d'erreur : {error?.digest || 'UNKNOWN'}
        </div>
      </div>
    </div>
  );
}
