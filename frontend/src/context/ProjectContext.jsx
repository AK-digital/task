import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProjects from "../hooks/useProjects";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const { projects, currentProject, ...projectsData } =
    useProjects(currentUser);
  const [isProjectDataReady, setIsProjectDataReady] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (currentUser) {
        navigate("/");
      } else {
        navigate("/signin");
      }
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (projects !== null && currentProject !== null) {
      setIsProjectDataReady(true);
    }
  }, [projects, currentProject]);

  if (authLoading || !isProjectDataReady) {
    console.log("Loading state:", {
      authLoading,
      isProjectDataReady,
      projects,
      currentProject,
    });
    return <div>Loading...</div>;
  }

  return (
    <ProjectContext.Provider
      value={{ projects, currentProject, ...projectsData }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
