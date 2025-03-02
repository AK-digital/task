"use client";
import styles from "@/styles/pages/verification.module.css";
import { verification } from "@/api/auth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Verification() {
  const { id } = useParams();
  const [success, setSuccess] = useState(false);
  const [text, setText] = useState("Vérification en cours...");
  const router = useRouter();

  const { data, error, isLoading } = useSWR(
    `${process.env.API_URL}/auth/verification/${id}`,
    () => verification(id)
  );

  useEffect(() => {
    if (isLoading) {
      setText("Vérification en cours...");
      return;
    }

    if (error) {
      setText(
        "Une erreur s'est produite lors de la vérification de votre compte."
      );
      setSuccess(false);
      return;
    }

    if (data?.success) {
      setSuccess(true);
      setText(
        "Votre adresse e-mail a été vérifié avec succès. Vous pouvez maintenant vous connecter."
      );

      const timeout = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(timeout);
    } else {
      setText(
        "Une erreur s'est produite lors de la vérification de votre compte."
      );
      setSuccess(false);
    }
  }, [data, error, isLoading, router]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Vérification de votre adresse e-mail</h1>
        <p>{text}</p>
        {success && <p>Redirection en cours...</p>}
      </div>
    </main>
  );
}
