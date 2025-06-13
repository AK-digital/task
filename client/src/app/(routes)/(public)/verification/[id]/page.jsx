"use client";
import { verification } from "@/api/auth";
import Link from "next/link";
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
    <main className="flex justify-center items-center mx-10 mb-10 h-[100svh]">
      <div className="text-center">
        <h1 className="text-[2.5rem] mb-5 font-bold">
          {t("verification.title")}
        </h1>
        <p className="mb-8">{text}</p>
        {success && (
          <Link
            href="/"
            className="p-4 bg-accent-color text-white rounded-4xl no-underline hover:bg-accent-color-hover transition-all duration-200 ease-in-out"
          >
            {t("verification.redirecting")}
          </Link>
        )}
      </div>
    </main>
  );
}
