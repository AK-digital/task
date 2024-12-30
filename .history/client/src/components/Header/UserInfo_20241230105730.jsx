export default function UserInfo() {
    return (
        <div>
            <span>{user?.firstName}</span>
            <Image src={user?.picture || "/default-pfp.webp"} alt={`Photo de profil de ${user?.firstName}`} width={30} height={30} />
        </div>
    )
}