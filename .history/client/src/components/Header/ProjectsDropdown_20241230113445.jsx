"use server"

import { getProjects } from "@/api/project"

export default async function ProjectsDropdown() {
    // Fetch the projects of the authentified user
    console.log(p, "les params")

    const projects = await getProjects()

    console.log(projects)

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