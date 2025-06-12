"use client";
import { confirmBetaRequest } from "@/api/beta";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useTranslation } from "react-i18next";

export default function Beta() {
  const { t } = useTranslation();
  const { id } = useParams(); // id is the token
  const [text, setText] = useState("Vérification en cours...");
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading } = useSWR(`${process.env.API_URL}/beta`, () =>
    confirmBetaRequest(id)
  );

  useEffect(() => {
    if (error) {
      setText(
        t("verification.error")
      );
      setSuccess(false);
      return;
    }

    if (data?.success) {
      setText(t("verification.success"));
      setSuccess(true);
    } else {
      setText(
        t("verification.error")
      );
      setSuccess(false);
    }
  }, [data, error, isLoading]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>{t("verification.title")}</h1>
        <p>{text}</p>
        {success && (
          <>
            <p>
              {t("verification.redirecting")}
            </p>
            <Link href="/sign-up">{t("verification.create_account")}</Link>
          </>
        )}
      </div>
    </main>
  );
}
