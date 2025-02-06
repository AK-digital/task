import { isNotEmpty } from "@/utils/utils";

export default function TaggedUsersModal({ project }) {
  return (
    <div>
      <ul>
        {isNotEmpty(project) &&
          project?.guests.map((guest) => {
            return <li>{guest?.firstName + " " + guest?.lastName}</li>;
          })}
      </ul>
    </div>
  );
}
