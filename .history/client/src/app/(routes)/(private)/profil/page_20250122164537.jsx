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
              <Image
                src={user?.picture || "/default-pfp.webp"}
                alt={`Photo de profil de ${user?.firstName}`}
                width={120}
                height={120}
                quality={100}
                style={{ borderRadius: "50%" }}
              />
              <span>{user?.firstName + " " + user?.lastName}</span>
              <input type="file" name="picture" id="picture" hidden />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
