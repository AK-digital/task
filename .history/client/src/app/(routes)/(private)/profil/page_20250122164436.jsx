"use client";
import styles from "@/styles/pages/profil.module.css";
import { AuthContext } from "@/context/auth";
import { useContext } from "react";
import Image from "next/image";

export default function Profil() {
  const { user } = useContext(AuthContext);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <form action="">
            {/* picture */}
            {/* <div>
              <label htmlFor="">Changer la photo de profil</label>
              <input type="file" name="picture" id="picture" />
            </div> */}
            <div>
              <Image {}/>
              <span>{user?.firstName + " " + user?.lastName}</span>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
