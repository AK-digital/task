import { useContext } from "react";
import { AuthContext } from "@/context/auth";
import { checkRole } from "@/utils/utils";

export function useUserRole(project, roles) {
  const { uid } = useContext(AuthContext);

  if (!project || !roles || !uid) return false;

  return checkRole(project, roles, uid);
}
