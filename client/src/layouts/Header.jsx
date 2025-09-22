"use client";

import Notifications from "@/components/Notifications/Notifications";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import { Bell, CheckSquare, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { usePathname, useParams } from "next/navigation";
import useSWR from "swr";
import { getNotifications } from "@/api/notification";
import { useViewContext } from "@/context/ViewContext";
import { useSideNavContext } from "@/context/SideNavContext";

export default function Header() {
  const { user } = useContext(AuthContext);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const { currentView, setCurrentView } = useViewContext();
  const { isMenuOpen } = useSideNavContext();

  // Détecter si nous sommes sur une page de projet
  const isProjectPage = pathname?.startsWith('/projects/') && params?.slug && params.slug[0];

  const { data, isLoading, mutate } = useSWR(
    "/notification",
    getNotifications
  );
  const notificationsData = data?.data;

  useEffect(() => {
    const handleNewNotification = () => {
      mutate();
    };

    socket.on("new notification", handleNewNotification);

    return () => {
      socket.off("new notification", handleNewNotification);
    };
  }, [mutate]);

  // Count the number of unread notifications
  const unreadNotifications = notificationsData?.filter((notif) => !notif.read);
  const unreadCount = unreadNotifications?.length;

  return (
    <header className={`py-2 ml-auto h-header-height transition-all duration-150 ease-linear ${
      isMenuOpen ? 'w-[calc(100%-145px)]' : 'w-full'
    }`}>
      <nav className="flex justify-between items-center h-full ml-24 mr-10">
        {/* View Switcher - Only show on project pages */}
        {isProjectPage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('tasks')}
              className={`secondary-button  gap-2 px-3 py-1.5 rounded-[5px] text-sm font-medium transition-colors ${
                currentView === 'tasks'
                ? 'bg-secondary text-text-darker-color hover:bg-accent-color-light hover:text-white'
                  : ''
              }`}
              title="Vue tâches"
            >
              <CheckSquare size={16} />
              <span>Tâches</span>
            </button>
            <button
              onClick={() => setCurrentView('time')}
              className={`secondary-button gap-2 px-3 py-1.5  rounded-[5px] text-sm font-medium transition-colors ${
                currentView === 'time'
                ? 'bg-secondary text-text-darker-color hover:bg-accent-color-light hover:text-white'
                  : ''
              }`}
              title="Temps du projet"
            >
              <Clock size={16} />
              <span>Temps</span>
            </button>
          </div>
        )}
        
        {/* Right side content */}
        <div className="flex items-center ml-auto">
          <ul className="relative flex items-center gap-6 overflow-visible">
          <li className="relative flex justify-center items-center h-full overflow-visible">
            <button
              onClick={(e) => setNotifOpen(true)}
              title="Vos notifications"
              className="group relative px-0.5 h-full bg-transparent overflow-visible shadow-none select-none"
            >
              <Bell
                size={22}
                data-open={notifOpen}
                className="group-hover:fill-text-darker-color  data-[open=true]:fill-text-darker-color text-text-darker-color select-none"
              />
              {/* {unreadCount > 0 && (
                <div className="absolute w-[11px] h-[11px] top-3 right-0 rounded-full bg-red-500 animate-ping"></div>
              )} */}
              {unreadCount > 0 && (
                <div className="absolute w-[11px] h-[11px] top-3 right-0 rounded-full bg-text-color-red select-none"></div>
              )}
            </button>
            {notifOpen && (
              <Notifications
                setNotifOpen={setNotifOpen}
                notifications={notificationsData}
                unreadNotifications={unreadNotifications}
                unreadCount={unreadCount}
                mutate={mutate}
              />
            )}
          </li>
          <li>
            <Link href={"/profile"}>
              <Image
                src={user?.picture || "/default/default-pfp.webp"}
                alt={`Photo de profil de ${user?.firstName}`}
                width={38}
                height={38}
                quality={100}
                className="rounded-full max-h-[38px] max-w-[38px] object-cover select-none"
              />
            </Link>
          </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
