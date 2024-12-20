import React from "react";
import Select from "react-select";

const options_status = [
  { value: "idle", label: "À faire", color: "#3e86aa" },
  { value: "processing", label: "En cours", color: "#535aaa" },
  { value: "testing", label: "A tester", color: "#9e9a60" },
  { value: "completed", label: "Terminée", color: "#588967" },
  { value: "blocked", label: "Bloquée", color: "#864f35" },
];

function StatusSelect({ value = "idle", onChange, className }) {
  const selectedStatus =
    options_status.find((option) => option.value === value) ||
    options_status[0];

  const customStyles = {
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: `${state.data.color} !important`,
      color: "white !important",
      ":hover": {
        backgroundColor: `${state.data.color}90 !important`,
      },
    }),
    control: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: `${state.selectProps.value.color} !important`,
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
