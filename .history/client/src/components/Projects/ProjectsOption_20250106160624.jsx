import { instrumentSans } from "@/utils/font";

export default function ProjectsOption({ content, projectId }) {
  function handleDeleteProject(e) {
    e.preventDefault();
  }
  return <button className={instrumentSans.className}>{content}</button>;
}
