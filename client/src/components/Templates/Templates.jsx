"use client";
import styles from "@/styles/components/templates/templates.module.css";
import { isNotEmpty } from "@/utils/utils";
import Template from "./Template";
import { useRouter } from "next/navigation";

export default function Templates({ templates }) {
  const data = templates?.data;
  const router = useRouter();

  const handleGoBack = (e) => {
    e.preventDefault();
    router.back();
  };

  return (
    <div className={styles.container}>
      {/* Filters */}
      {/* <div></div> */}
      {/* Templates */}
      {isNotEmpty(data) ? (
        <div className={styles.templates}>
          {data.map((elt) => {
            return <Template elt={elt} key={elt?._id} />;
          })}
        </div>
      ) : (
        <div>
          <p>Aucun modèle trouvé</p>
        </div>
      )}

      {/* buttons */}

      <button type="button" onClick={handleGoBack} className={styles.back}>
        Retour
      </button>
    </div>
  );
}
