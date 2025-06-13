import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import moment from "moment-timezone";
import I18nProvider from "@/components/providers/I18nProvider";
import { cookies } from "next/headers";
import { decryptToken } from "@/api/auth";

moment.tz.setDefault("Europe/Paris");

// Traductions statiques pour les métadonnées
const translations = {
  fr: {
    title: "Clynt | Gestion de projet sans effort",
    description: "Plateforme de gestion de projet simple et efficace",
  },
  en: {
    title: "Clynt | Effortless Project Management",
    description: "Simple and efficient project management platform",
  },
};

export async function generateMetadata() {
  let userLanguage = "fr"; // langue par défaut

  try {
    // Récupérer la session utilisateur pour obtenir sa langue
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    // Seulement essayer de décrypter si il y a une session
    if (sessionCookie?.value) {
      try {
        const sessionData = await decryptToken();
        // Vérifier si la session est valide et contient des données utilisateur
        if (sessionData?.success && sessionData?.data?.language) {
          userLanguage = sessionData.data.language;
        }
      } catch (sessionError) {
        // Si le déchiffrement échoue (token invalide, expiré, etc.), on garde la langue par défaut
        console.log(
          "Session invalide ou expirée, utilisation de la langue par défaut"
        );
      }
    }
    // Si pas de session, on garde la langue par défaut (utilisateur non connecté)
  } catch (error) {
    // En cas d'erreur générale, on garde la langue par défaut
    console.log(
      "Erreur lors de la récupération de la langue utilisateur:",
      error.message
    );
  }

  const t = translations[userLanguage] || translations.fr;

  return {
    title: t.title,
    description: t.description,
    icons: {
      icon: [
        {
          url: "/clynt-logo-light.svg",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/clynt-logo-dark.svg",
          media: "(prefers-color-scheme: dark)",
        },
      ],
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html className="max-w-[100vw] min-h-[100svh] overflow-x-hidden" lang="fr">
      <body className="font-bricolage">
        <I18nProvider>{children}</I18nProvider>
      </body>
      <Analytics />
    </html>
  );
}
