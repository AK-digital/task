import styles from "@/styles/components/timeTrackings/time-tracking.module.css";
import { formatTime } from "@/utils/utils";
import Image from "next/image";

export default function TimeTracking({ tracker }) {
  return (
    <div className={styles.container}>
      {/* Element selection */}
      <div>
        <input type="checkbox" />
      </div>
      {/* Task text */}
      <div className={styles.text}>
        <span>{tracker?.taskId?.text}</span>
      </div>
      {/* user */}
      <div>
        <span>
          {tracker?.userId?.picture && (
            <Image
              src={tracker?.userId?.picture}
              alt={tracker?.userId?.firstName}
              style={{
                borderRadius: "50%",
              }}
              width={22}
              height={22}
            />
          )}
          {tracker?.userId?.firstName + " " + tracker?.userId?.lastName}
        </span>
      </div>
      {/* Duration */}
      <div>
        <span>{formatTime(Math.floor(tracker?.duration / 1000))}</span>
      </div>
    </div>
  );
}
