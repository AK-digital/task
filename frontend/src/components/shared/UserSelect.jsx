import React from "react";
import Select from "react-select";

function UserSelect({ users, value = "", onChange, className }) {
  const options_users = users.map((user) => ({
    value: user.id,
    label: user.name,
    profilePicture: user.profile_picture || "default-profile-pic.svg",
  }));

  const selectedUser = options_users.find((option) => option.value === value);

  // Fonction pour formater l'affichage des options avec image et nom
  const formatOptionLabel = ({ label, profilePicture }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {profilePicture && (
        <img
          src={`/src/assets/img/${profilePicture}`}
          alt={label}
          style={{ width: 20, height: 20, borderRadius: "50%" }}
        />
      )}
      <span style={{ marginLeft: 10 }}>{label}</span>
    </div>
  );

  return (
    <Select
      value={selectedUser}
      menuPortalTarget={document.body}
      onChange={(selectedOption) => onChange(selectedOption?.value || "")}
      options={options_users}
      className={`select-user ${className}`}
      classNamePrefix="select-user"
      formatOptionLabel={formatOptionLabel} // Ajoute l'option formatée
    />
  );
}

export default UserSelect;
