import styles from "@/styles/components/header/create-project.module.css";
import { instrumentSans } from "@/utils/font";

export default function CreateProject() {
  return (
    <div>
      <button className={instrumentSans.className}>Créer un projet</button>
    </div>
  );
}
