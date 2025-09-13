"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthFetch } from "@/utils/api";

export default function EmailChangePage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const validateEmailChange = async () => {
      try {
        if (!token) {
          setStatus("error");
          setMessage("Token manquant");
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
        const response = await fetch(`${apiUrl}/user/email-change/${token}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("Votre adresse email a été mise à jour avec succès !");
          
          // Rediriger vers la page de profil après 3 secondes
          setTimeout(() => {
            router.push("/profile");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Une erreur est survenue");
        }
      } catch (error) {
        console.error("Erreur lors de la validation:", error);
        setStatus("error");
        setMessage(`Erreur de connexion: ${error.message}`);
      }
    };

    validateEmailChange();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Validation du changement d'email
          </h2>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          {status === "loading" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto mb-4"></div>
              <p className="text-gray-600">Validation en cours...</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-green-800 mb-2">Succès !</h3>
              <p className="text-green-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Vous allez être redirigé vers votre profil dans quelques secondes...
              </p>
            </div>
          )}
          
          {status === "error" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Erreur</h3>
              <p className="text-red-600 mb-4">{message}</p>
              <button
                onClick={() => router.push("/profile")}
                className="bg-primary-color text-white px-4 py-2 rounded-md hover:bg-primary-color/90 transition-colors"
              >
                Retour au profil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
