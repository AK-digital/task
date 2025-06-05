"use client";
import { verification } from "@/api/auth";
import Link from "next/link";
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
    } else {
      setText(
        "Une erreur s'est produite lors de la vérification de votre compte."
      );
      setSuccess(false);
    }
  }, [data, error, isLoading, router]);

  return (
    <main className="flex justify-center items-center mx-10 mb-10 h-[100svh]">
      <div className="text-center">
        <h1 className="text-[2.5rem] mb-5 font-bold">
          Vérification de votre adresse e-mail
        </h1>
        <p className="mb-8">{text}</p>
        {success && (
          <Link
            href="/"
            className="p-4 bg-accent-color text-white rounded-4xl no-underline hover:bg-accent-color-hover transition-all duration-200 ease-in-out"
          >
            Se connecter
          </Link>
        )}
      </div>
    </main>
  );
}
