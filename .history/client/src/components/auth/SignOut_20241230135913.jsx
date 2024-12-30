import { logout } from "@/api/auth";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SignOut() {
  return (
    <>
      <FontAwesomeIcon onClick={logout} icon={faRightFromBracket} />
    </>
  );
}
