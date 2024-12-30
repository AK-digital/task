import { logout } from "@/api/auth";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SignOut() {

  async function handleLogout(export default (first) => {second}) {
    e.preventDefault()
    await logout()
  }
  return (
    <>
      <FontAwesomeIcon onClick={logout} icon={faRightFromBracket} />
    </>
  );
}
