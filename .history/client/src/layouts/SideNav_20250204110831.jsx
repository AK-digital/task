"use server";
import styles from "@/styles/layouts/side-nav.module.css";
import { getProjects } from "@/api/project";
import CreateProject from "@/components/Projects/CreateProject";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/actions/auth";

export default async function SideNav() {
  const projects = await getProjects();

  return (
    <aside className={styles.container}>
      <svg
        width="46"
        height="20"
        viewBox="0 0 41 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.42977 15.2C5.17643 15.2 4.24977 14.9067 3.64977 14.32C3.0631 13.72 2.76977 12.8267 2.76977 11.64V2.48L5.30977 1.54V11.7C5.30977 12.1933 5.4431 12.56 5.70977 12.8C5.97643 13.04 6.39643 13.16 6.96977 13.16C7.19643 13.16 7.39643 13.1467 7.56977 13.12C7.75643 13.08 7.92977 13.0333 8.08977 12.98V14.94C7.92977 15.02 7.7031 15.08 7.40977 15.12C7.11643 15.1733 6.78977 15.2 6.42977 15.2ZM0.809766 6.78V4.8H8.08977V6.78H0.809766ZM16.198 15C16.1314 14.7333 16.078 14.44 16.038 14.12C16.0114 13.8 15.998 13.4133 15.998 12.96H15.918V8.12C15.918 7.58667 15.7647 7.18667 15.458 6.92C15.1647 6.64 14.7114 6.5 14.098 6.5C13.498 6.5 13.018 6.61333 12.658 6.84C12.3114 7.05333 12.098 7.36667 12.018 7.78H9.59805C9.70471 6.83333 10.158 6.06667 10.958 5.48C11.758 4.89333 12.8314 4.6 14.178 4.6C15.578 4.6 16.638 4.92 17.358 5.56C18.078 6.18667 18.438 7.11333 18.438 8.34V12.96C18.438 13.28 18.458 13.6067 18.498 13.94C18.5514 14.2733 18.6247 14.6267 18.718 15H16.198ZM12.658 15.2C11.6314 15.2 10.8114 14.9467 10.198 14.44C9.59805 13.92 9.29805 13.2267 9.29805 12.36C9.29805 11.4267 9.63805 10.6867 10.318 10.14C10.998 9.59333 11.958 9.22667 13.198 9.04L16.378 8.56V10.16L13.618 10.58C13.018 10.6733 12.5647 10.84 12.258 11.08C11.9647 11.32 11.818 11.6533 11.818 12.08C11.818 12.4667 11.958 12.7667 12.238 12.98C12.518 13.18 12.9047 13.28 13.398 13.28C14.118 13.28 14.718 13.1 15.198 12.74C15.678 12.38 15.918 11.94 15.918 11.42L16.198 12.96C15.9314 13.6933 15.4914 14.2533 14.878 14.64C14.278 15.0133 13.538 15.2 12.658 15.2ZM15.118 3.14V0.339999H17.858V3.14H15.118ZM10.518 3.14V0.339999H13.258V3.14H10.518ZM24.6951 15.2C23.2817 15.2 22.1551 14.9067 21.3151 14.32C20.4751 13.72 20.0151 12.8933 19.9351 11.84H22.2351C22.3017 12.36 22.5484 12.7533 22.9751 13.02C23.4017 13.2867 23.9751 13.42 24.6951 13.42C25.3484 13.42 25.8351 13.32 26.1551 13.12C26.4884 12.9067 26.6551 12.6067 26.6551 12.22C26.6551 11.94 26.5617 11.7133 26.3751 11.54C26.1884 11.3533 25.8351 11.2 25.3151 11.08L23.6751 10.7C22.5551 10.46 21.7217 10.0867 21.1751 9.58C20.6417 9.06 20.3751 8.41333 20.3751 7.64C20.3751 6.69333 20.7351 5.95333 21.4551 5.42C22.1884 4.87333 23.1951 4.6 24.4751 4.6C25.7417 4.6 26.7551 4.87333 27.5151 5.42C28.2884 5.95333 28.7151 6.69333 28.7951 7.64H26.4951C26.4284 7.22667 26.2151 6.91333 25.8551 6.7C25.5084 6.48667 25.0284 6.38 24.4151 6.38C23.8417 6.38 23.4084 6.47333 23.1151 6.66C22.8217 6.83333 22.6751 7.09333 22.6751 7.44C22.6751 7.70667 22.7884 7.93333 23.0151 8.12C23.2417 8.29333 23.6217 8.44667 24.1551 8.58L25.9151 8.98C26.9151 9.20667 27.6684 9.6 28.1751 10.16C28.6951 10.72 28.9551 11.38 28.9551 12.14C28.9551 13.1133 28.5817 13.8667 27.8351 14.4C27.0884 14.9333 26.0417 15.2 24.6951 15.2ZM30.6779 15V0.459999H33.1979V15H30.6779ZM37.2579 15L32.6179 9.7L37.1179 4.8H40.1579L34.9579 10.16L35.0979 9.22L40.3579 15H37.2579Z"
          fill="#43455F"
        />
      </svg>
      <div>
        <div className={styles.projects}>
          {/* list of project */}
          <nav className={styles.nav}>
            <ul className={styles.projectsList}>
              {projects?.map((project) => {
                return (
                  <li className={styles.projectsItem} key={project?._id}>
                    <Link href={`/project/${project?._id}`}>
                      {project.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* create a project */}
          <CreateProject />
        </div>
        <div className={styles.userAvatar}>
          <Link href="/profile">
            <Image
              src={user?.picture || "/default-pfp.webp"}
              alt="Photo de profil"
              width={40}
              height={40}
              style={{
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </Link>
        </div>
      </div>
    </aside>
  );
}
