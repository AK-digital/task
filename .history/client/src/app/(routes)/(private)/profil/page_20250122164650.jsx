"use client";
import styles from "@/styles/pages/profil.module.css";
import { AuthContext } from "@/context/auth";
import { useContext } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export default function Profil() {
  const { user } = useContext(AuthContext);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <form action="">
            <div className={styles.picture}>
              <div>
                <Image
                  src={user?.picture || "/default-pfp.webp"}
                  alt={`Photo de profil de ${user?.firstName}`}
                  width={120}
                  height={120}
                  quality={100}
                  style={{ borderRadius: "50%" }}
                />
                <label htmlFor="picture">
                  <FontAwesomeIcon icon={faPenToSquare} />
                </label>
              </div>
              <div>
                <span>{user?.firstName + " " + user?.lastName}</span>
                <input type="file" name="picture" id="picture" hidden />
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
