import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useProjects from "../hooks/useProjects"; // Assurez-vous que le chemin est correct
import Cookies from "js-cookie";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
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
        setCurrentUser,
        ...projectsData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
