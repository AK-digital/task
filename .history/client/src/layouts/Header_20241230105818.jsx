"use server"



export default async function Header() {

    console.log(user)
    return (
        <header>
            <nav>
                {/* Logo */}
                <div>
                    <span>Täsk</span>
                </div>
                {/* Project list */}
                <div>
                    {/* <ProjectsDropdown /> */}
                </div>
                {/* user */}
                <div>

                </div>
            </nav>
        </header>
    )
}