import React, { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useProjects from "../hooks/useProjects";
import Cookies from "js-cookie";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const navigate = useNavigate();
  const projectsData = useProjects();

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      navigate("/");
    } else {
      navigate("/signin");
    }
  }, [navigate]);

  return (
    <ProjectContext.Provider
      value={{
        currentUser,
        ...projectsData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
