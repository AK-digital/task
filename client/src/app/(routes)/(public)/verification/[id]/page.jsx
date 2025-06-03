"use client";
import styles from "@/styles/pages/verification.module.css";
import { verification } from "@/api/auth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

export default function Verification() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [success, setSuccess] = useState(false);
  const [text, setText] = useState(t("verification.verifying"));
  const router = useRouter();

  const { data, error, isLoading } = useSWR(
    `${process.env.API_URL}/auth/verification/${id}`,
    () => verification(id)
  );

  useEffect(() => {
    if (isLoading) {
      setText(t("verification.verifying"));
      return;
    }

    if (error) {
      setText(t("verification.error"));
      setSuccess(false);
      return;
    }

    if (data?.success) {
      setSuccess(true);
      setText(t("verification.success"));

      const timeout = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(timeout);
    } else {
      setText(t("verification.error"));
      setSuccess(false);
    }
  }, [data, error, isLoading, router, t]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>{t("verification.title")}</h1>
        <p>{text}</p>
        {success && <p>{t("verification.redirecting")}</p>}
      </div>
    </main>
  );
}
