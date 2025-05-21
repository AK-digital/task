import Image from "next/image";

export default function GoogleBtn() {
  async function handleGoogleAuth(e) {
    e.preventDefault();
    window.open(`http://localhost:5000/api/auth/google/`, "_self");
  }

  return (
    <div>
      <button onClick={handleGoogleAuth}>
        <Image src={"/google.svg"} alt="Logo Google" width={24} height={24} />
        Google
      </button>
    </div>
  );
}
