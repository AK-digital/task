import { AuthContext } from "@/context/auth";
import Image from "next/image";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

export default function PendingMessage({ message }) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col gap-2 opacity-75 transition-opacity duration-[50ms] ease-linear data-[loading=true]:opacity-[0.4] ">
      <div className="relative flex justify-between flex-col gap-3.5 py-4 px-6 bg-secondary rounded-lg transition-all duration-[50ms] ease-linear">
        {/* Header auteur */}
        <div className="flex items-center justify-between [&_svg]:cursor-pointer ">
          <div className="flex items-center gap-2 select-none">
            <Image
              src={user?.picture || "/default-pfp.webp"}
              width={35}
              height={35}
              alt={`${t("general.profile_picture_alt")} ${user?.firstName}`}
              className="rounded-full w-[35px] h-[35px] max-w-[35px] max-h-[35px]"
            />
            <span className="text-normal font-medium">
              {user?.firstName + " " + user?.lastName}
            </span>
          </div>
        </div>
        {/* Message */}
        <div className="text_Message">
          <div dangerouslySetInnerHTML={{ __html: message }} />
        </div>
      </div>
    </div>
  );
}
