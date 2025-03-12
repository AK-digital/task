"use client";
import styles from "@/styles/components/notifications/notifications.module.css";
import socket from "@/utils/socket";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import NoPicture from "../User/NoPicture";
import moment from "moment";
import Link from "next/link";
import { markAsRead, markAllAsRead } from "@/api/notification";
import { useRouter } from "next/navigation";

export default function Notifications({ setNotifOpen, notifications, mutate }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  // Calculer le nombre de notifications non lues
  const unreadCount = useMemo(() => {
    return notifications?.filter(notif => !notif.read).length || 0;
  }, [notifications]);

  useEffect(() => {
    const getUnreadNotifications = () => {
      return notifications?.filter((notif) => !notif.read);
    };

    const unread = getUnreadNotifications();

    if (notifications?.some((notif) => !notif.read)) {
      socket.emit("unread notifications", unread);
    }

    const handleReadNotifications = () => {
      mutate();
    };

    socket.on("notifications read", handleReadNotifications);

    return () => {
      socket.off("unread notifications", unread);
      socket.off("notifications read", handleReadNotifications);
    };
  }, [socket]);

  // Fonction pour gérer le clic sur une notification
  const handleNotificationClick = async (notification, e) => {
    e.preventDefault();
    
    if (!notification.read) {
      setProcessing(true);
      try {
        const result = await markAsRead(notification._id);
        
        if (result.success) {
          // Actualiser les notifications
          mutate();
          
          // Émettre un événement pour informer les autres clients
          socket.emit("notification read", notification._id);
        }
      } catch (error) {
        console.error("Erreur lors du marquage de la notification comme lue:", error);
      } finally {
        setProcessing(false);
      }
    }
    
    // Rediriger vers la page cible
    router.push(notification.link);
    setNotifOpen(false);
  };

  // Fonction pour marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    setProcessing(true);
    try {
      const result = await markAllAsRead();
      
      if (result.success) {
        // Actualiser les notifications
        mutate();
        
        // Émettre un événement pour informer les autres clients
        socket.emit("all notifications read");
      }
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className={styles.container} id="popover">
        <div className={styles.header}>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <div className={styles.headerActions}>
              <div className={styles.unreadCount}>
                {unreadCount} non {unreadCount === 1 ? 'lue' : 'lues'}
              </div>
              <button 
                className={styles.readAllButton}
                onClick={handleMarkAllAsRead}
                disabled={processing}
              >
                Tout marquer comme lu
              </button>
            </div>
          )}
        </div>
        {!isNotEmpty(notifications) ? (
          <div className={styles.empty}>
            <span>Vous n'avez aucune notification pour le moment</span>
          </div>
        ) : (
          <ul className={styles.notifications}>
            {notifications?.map((notif, idx) => {
              const dateFromNow = moment(notif?.createdAt).fromNow();
              const isLastItem = idx === notifications.length - 1;

              return (
                <li
                  className={`${styles.notification} ${!notif.read ? styles.unread : ''}`}
                  key={idx}
                >
                  <a 
                    href={notif?.link} 
                    onClick={(e) => handleNotificationClick(notif, e)}
                  >
                    <div className={styles.left}>
                      {notif?.senderId?.picture ? (
                        <Image
                          src={notif?.senderId?.picture}
                          width={30}
                          height={30}
                          alt={`Photo de profil de ${notif?.senderId?.firstName}`}
                          style={{ borderRadius: "50%" }}
                        />
                      ) : (
                        <NoPicture
                          user={notif?.senderId}
                          width={"30px"}
                          height={"30px"}
                        />
                      )}
                      <div className={styles.message}>
                        <div className={styles.title}>
                          <span>{notif?.message?.title}</span>
                        </div>
                        <div className={styles.content}>
                          {notif?.message?.content}
                        </div>
                      </div>
                    </div>
                    <div className={styles.right}>
                      <div className={styles.date}>{dateFromNow}</div>
                      {!notif.read && <div className={styles.bullet}></div>}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div id="modal-layout-opacity" onClick={(e) => setNotifOpen(false)}></div>
    </>
  );
}
