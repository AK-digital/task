import { instrumentSans } from "@/utils/font";

export default function ProjectsOption({ content, projectId }) {
  return <button className={instrumentSans.className}>{content}</button>;
}
