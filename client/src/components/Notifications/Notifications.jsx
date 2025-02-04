import styles from "@/styles/components/notifications/notifications.module.css";
import useSWR from "swr";

export default function Notifications({ setNotifOpen }) {
  const { data } = useSWR("");

  return (
    <div className={styles.container} id="popover">
      <div>
        <span>Notifications</span>
      </div>
    </div>
  );
}
