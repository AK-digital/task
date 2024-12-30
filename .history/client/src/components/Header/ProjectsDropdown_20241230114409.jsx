"use client"


export default function ProjectsDropdown({ projects }) {
    // Fetch the projects of the authentified user

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