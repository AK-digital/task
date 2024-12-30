import { logout } from "@/api/auth";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SignOut() {
  async function handleLogout(e) {
    e.preventDefault();
    await logout();
  }
  return (
    <>
      <FontAwesomeIcon onClick={handleLogout} icon={faRightFromBracket} />
    </>
  );
}
