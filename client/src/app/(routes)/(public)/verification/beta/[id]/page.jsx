import styles from "@/styles/pages/verification.module.css";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

export default function Beta() {
  const { id } = useParams();
  const [text, setText] = useState("Vérification en cours...");

  useEffect(() => {
    const { data, error, isLoading } = useSWR(
      `${process.env.API_URL}/beta`,
      () => verification(id)
    );
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Vérification de votre adresse e-mail pour l'accès à la beta</h1>
        <p>{text}</p>
        {success && <p>Redirection en cours...</p>}
      </div>
    </main>
  );
}
