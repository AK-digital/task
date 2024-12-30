"use server"

import { getProjects } from "@/api/project"

export default async function ProjectsDropdown() {
    const projects = await getProjects()
    return (
        <div>

        </div>
    )
}