"use client"

import { usePathname } from "next/navigation"


export default function ProjectsDropdown({ projects }) {
    // Fetch the projects of the authentified user
    const pathname = usePathname();
    const projectId = pathname.split("/")[2];

    return (
        <div>
            {projects?.length > 0 && (
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