import React from "react";
import Select from "react-select";

const options_status = [
  { value: "idle", label: "À faire", color: "#f0ad4e" },
  { value: "processing", label: "En cours", color: "#5bc0de" },
  { value: "testing", label: "A tester", color: "#f7e358" },
  { value: "completed", label: "Terminée", color: "#5cb85c" },
  { value: "blocked", label: "Bloquée", color: "#d9534f" },
];

function StatusSelect({ value = "idle", onChange, className }) {
  const selectedStatus =
    options_status.find((option) => option.value === value) ||
    options_status[0];

  const customStyles = {
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: `${state.data.color}80 !important`,
      color: "white !important",
      ":hover": {
        backgroundColor: `${state.data.color} !important`,
      },
    }),
    control: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: `${state.selectProps.value.color}80 !important`,
      borderColor: state.isFocused
        ? "var(--accent-color) !important"
        : "var(--border-color) !important",
      boxShadow: state.isFocused
        ? `0 0 0 1px var(--accent-color) !important`
        : "none !important",
    }),
    singleValue: (baseStyles, { data }) => ({
      ...baseStyles,
      color: "white !important",
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: "var(--third-background-color) !important",
    }),
    indicatorSeparator: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: "white !important",
    }),
    dropdownIndicator: (baseStyles) => ({
      ...baseStyles,
      color: "white !important",
    }),
  };

  return (
    <Select
      menuPortalTarget={document.body}
      value={selectedStatus}
      onChange={(selectedOption) => onChange(selectedOption?.value || "idle")}
      options={options_status}
      className={`select-status ${className}`}
      classNamePrefix="select-status"
      styles={customStyles}
    />
  );
}

export default StatusSelect;
