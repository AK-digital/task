"use client"

import { getProjects } from "@/api/project"

export default async function ProjectsDropdown() {
    // Fetch the projects of the authentified user
    const projects = await getProjects()

    return (
        <div>
            {projects.length > 0 && (
                <>
                    <span>Séléctionner un projet</span>
                    {/* Dropdown */}
                    <div>

                    </div>
                </>
            )}

        </div>
    )
}