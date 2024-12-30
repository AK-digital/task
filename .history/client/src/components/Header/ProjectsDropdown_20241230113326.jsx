"use server"

import { getProjects } from "@/api/project"

export default async function ProjectsDropdown({ slug }) {
    // Fetch the projects of the authentified user
    const p = await params
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