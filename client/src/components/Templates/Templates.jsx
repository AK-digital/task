"use client";
import { isNotEmpty } from "@/utils/utils";
import Template from "./Template";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function Templates({ templates }) {
  const { t } = useTranslation();
  const data = templates?.data;
  const router = useRouter();

  const handleGoBack = (e) => {
    e.preventDefault();
    router.back();
  };

  return (
    <div className="flex flex-col justify-around items-center h-full w-full">
      {/* Filters */}
      {/* <div></div> */}
      {/* Templates */}
      {isNotEmpty(data) ? (
        <div className="flex flex-col gap-3">
          {data.map((elt) => {
            return <Template elt={elt} key={elt?._id} />;
          })}
        </div>
      ) : (
        <div>
          <p>{t("templates.no_template_found")}</p>
        </div>
      )}

      {/* buttons */}

      <button
        type="button"
        onClick={handleGoBack}
        className="bg-transparent shadow-none max-w-fit hover:bg-transparent hover:shadow-none hover:text-accent-color-light"
      >
        {t("templates.back")}
      </button>
    </div>
  );
}
