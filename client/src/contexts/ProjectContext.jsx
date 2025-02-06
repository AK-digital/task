"use client";
import { createContext, useContext, useState } from "react";

const ProjectContext = createContext();

export function ProjectProvider({ children, initialProjects }) {
    const [projects, setProjects] = useState(initialProjects || []);

    const addProject = (newProject) => {
        setProjects(prev => [...prev, newProject]);
    };

    const removeProject = (projectId) => {
        setProjects(prev => prev.filter(p => p._id !== projectId));
    };

    const updateProjectsOrder = (newProjects) => {
        setProjects(newProjects);
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            addProject,
            removeProject,
            updateProjectsOrder
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export const useProjects = () => useContext(ProjectContext);