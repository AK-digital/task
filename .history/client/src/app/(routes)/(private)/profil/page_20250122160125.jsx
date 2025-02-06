"use client";
import styles from "@/styles/pages/profil.module.css";
import { AuthContext } from "@/context/auth";
import { useContext } from "react";

export default function Profil() {
  const { user } = useContext(AuthContext);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <form action="">
            {/* picture */}
            <div>
              <label htmlFor="">Changer la photo de profil</label>
              <input type="file" name="picture" id="picture" />
            </div>
            <div>
              <label htmlFor="">Nom</label>
              <input type="text" name="picture" id="picture" />
            </div>
            <div></div>
          </form>
        </div>
      </div>
    </main>
  );
}
