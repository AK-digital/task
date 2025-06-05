"use client";
import { confirmBetaRequest } from "@/api/beta";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Beta() {
  const { id } = useParams(); // id is the token
  const [text, setText] = useState("Vérification en cours...");
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading } = useSWR(`${process.env.API_URL}/beta`, () =>
    confirmBetaRequest(id)
  );

  useEffect(() => {
    if (error) {
      setText(
        "Une erreur s'est produite lors de la vérification de votre compte."
      );
      setSuccess(false);
      return;
    }

    if (data?.success) {
      setText("Félicitations ! Vous avez été ajouté à la beta de Clynt !");
      setSuccess(true);
    } else {
      setText(
        "Une erreur s'est produite lors de la vérification de votre compte."
      );
      setSuccess(false);
    }
  }, [data, error, isLoading]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Vérification de votre adresse e-mail pour l'accès à la beta</h1>
        <p>{text}</p>
        {success && (
          <>
            <p>
              Vous pouvez maintenant vous créer un compte en utilisant votre
              adresse e-mail
            </p>
            <Link href="/sign-up">Créer mon compte</Link>
          </>
        )}
      </div>
    </main>
  );
}
