"use client";
import SignOut from "@/components/auth/SignOut";
import PictureForm from "@/components/Profile/PictureForm";
import ProfileForm from "@/components/Profile/ProfileForm";
import UserManagement from "@/components/Admin/UserManagement";
import { ArrowLeftCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [showUserManagement, setShowUserManagement] = useState(false);

  const handleBack = () => {
    router.back();
  };

  // Vérifier si l'utilisateur est un super admin
  const isSuperAdmin = user?.email === 'aurelien@akdigital.fr' || user?.email === 'nicolas.tombal@akdigital.fr';
  

  return (
    <main className="relative h-full w-full">
      <div
        className="absolute top-5 left-[120px] cursor-pointer"
        onClick={handleBack}
      >
        <ArrowLeftCircle size={32} />
      </div>
      <div className="flex flex-col items-center justify-center gap-6 h-full w-full">
        <h1 className="select-none">Mon profil</h1>
        <div className="bg-secondary rounded-2xl w-full p-[44px] max-w-[540px]">
          <PictureForm />
          <ProfileForm />
          
          {/* Bouton de gestion des utilisateurs pour les super admins */}
          {isSuperAdmin && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowUserManagement(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Users size={18} />
                Gestion des utilisateurs
              </button>
            </div>
          )}
        </div>
        <SignOut />
      </div>

      {/* Sidebar de gestion des utilisateurs */}
      <Sidebar
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        title="Gestion des utilisateurs"
        width="600px"
      >
        <UserManagement />
      </Sidebar>
    </main>
  );
}
