"use server"

import { getProjects } from "@/api/project"

export default async function ProjectsDropdown() {
    // Fetch the projects of the authentified user
    const projects = await getProjects()

    return (
        <div>

        </div>
    )
}