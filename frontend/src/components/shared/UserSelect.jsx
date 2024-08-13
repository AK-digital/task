import React from "react";
import Select from "react-select";

function UserSelect({ users, value = "", onChange, className }) {
  const options_users = users.map((user) => ({
    value: user.id,
    label: user.name,
    profilePicture: user.profile_picture || "default-profile-pic.svg",
  }));

  const selectedUser = options_users.find((option) => option.value === value);

  const customStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      width: "250px",
      backgroundColor: "var(--third-background-color) !important",
      borderColor: state.isFocused
        ? "var(--accent-color) !important"
        : "var(--border-color) !important",
      boxShadow: state.isFocused
        ? `0 0 0 1px var(--accent-color) !important`
        : "none !important",
    }),
    singleValue: (baseStyles, { data }) => ({
      ...baseStyles,
      width: "250px",
      color: "white !important",
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: "var(--third-background-color) !important",
    }),
  };

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
      styles={customStyles}
    />
  );
}

export default UserSelect;
