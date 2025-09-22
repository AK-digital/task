"use client";
import { useAdminUsers } from "@/hooks/api/useAdminUsers";
import { toggleUserVerification } from "@/api/admin";
import { useState, useContext } from "react";
import { Check, X, User, Mail, Calendar, Shield, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AuthContext } from "@/context/auth";

export default function UserManagement() {
  const { users, usersLoading, usersError, mutateUsers } = useAdminUsers();
  const [loadingUsers, setLoadingUsers] = useState(new Set());
  const { user: currentUser } = useContext(AuthContext);


  const handleToggleVerification = async (userId, currentStatus) => {
    setLoadingUsers(prev => new Set(prev).add(userId));
    
    try {
      await toggleUserVerification(userId, !currentStatus);
      await mutateUsers(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      alert("Erreur lors de la modification du statut utilisateur");
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (usersLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-600">
        <p>Erreur lors du chargement des utilisateurs:</p>
        <p className="text-sm mt-2">{usersError.message}</p>
        <button 
          onClick={() => mutateUsers()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestion des utilisateurs</h3>
        <span className="text-sm text-gray-500">
          {users.length} utilisateur{users.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Informations utilisateur */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </h4>
                    {user.verified ? (
                      <ShieldCheck size={16} className="text-green-500" title="Compte vérifié" />
                    ) : (
                      <Shield size={16} className="text-gray-400" title="Compte non vérifié" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 mt-1">
                    <Mail size={12} className="text-gray-400" />
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  {user.company && (
                    <p className="text-xs text-gray-500 mt-1">
                      {user.position ? `${user.position} chez ` : ''}{user.company}
                    </p>
                  )}

                  <div className="flex items-center space-x-1 mt-2">
                    <Calendar size={12} className="text-gray-400" />
                    <p className="text-xs text-gray-400">
                      Inscrit {formatDistanceToNow(new Date(user.createdAt), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleToggleVerification(user._id, user.verified)}
                  disabled={loadingUsers.has(user._id)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    user.verified
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } ${loadingUsers.has(user._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingUsers.has(user._id) ? (
                    <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent mr-1" />
                  ) : user.verified ? (
                    <X size={12} className="mr-1" />
                  ) : (
                    <Check size={12} className="mr-1" />
                  )}
                  {user.verified ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !usersLoading && !usersError && (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun utilisateur trouvé</p>
          <p className="text-xs mt-2">Vérifiez que vous êtes connecté avec un compte super admin</p>
        </div>
      )}
      
    </div>
  );
}
