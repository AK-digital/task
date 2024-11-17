// src/components/shared/UserSelect.jsx
import React from "react";
import Select from "react-select";
import { useSelector } from "react-redux";

function UserSelect({ value = "", onChange, className }) {
  const users = useSelector(state => state.projects.users);
  const theme = useSelector(state => state.ui?.theme) || 'light';

  const options_users = users.map((user) => ({
    value: user.id,
    label: user.name,
    profilePicture: user.profilePicture || "default-profile-pic.svg",
  }));

  const selectedUser = options_users.find((option) => option.value === value);

  const customStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: "var(--third-background-color) !important",
      borderColor: state.isFocused
        ? "var(--accent-color) !important"
        : "var(--border-color) !important",
      boxShadow: state.isFocused
        ? `0 0 0 1px var(--accent-color) !important`
        : "none !important",
    }),
    singleValue: (baseStyles) => ({
      ...baseStyles,
      color: "var(--text-color) !important",
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: "var(--third-background-color) !important",
    }),
  };

  const formatOptionLabel = ({ label, profilePicture }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {profilePicture && (
        <img
          src={`/assets/img/${profilePicture}`}
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
      formatOptionLabel={formatOptionLabel}
      placeholder="Responsable"
      styles={customStyles}
    />
  );
}

export default UserSelect;