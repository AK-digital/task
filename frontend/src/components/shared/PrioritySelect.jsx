// src/components/shared/PrioritySelect.jsx
import React from "react";
import Select from "react-select";
import { useSelector } from "react-redux";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Basse", color: "#5e5887" },
  { value: "medium", label: "Moyenne", color: "#50448a" },
  { value: "high", label: "Élevée", color: "#4b3486" },
  { value: "urgent", label: "⚠️ Urgente", color: "#5e34a6" },
];

function PrioritySelect({ value = "medium", onChange, className }) {
  const theme = useSelector(state => state.ui?.theme) || 'light';

  const selectedPriority = PRIORITY_OPTIONS.find(
    (option) => option.value === value
  ) || PRIORITY_OPTIONS[1];

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
    singleValue: (baseStyles) => ({
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
      value={selectedPriority}
      menuPortalTarget={document.body}
      onChange={(selectedOption) => onChange(selectedOption?.value || "medium")}
      options={PRIORITY_OPTIONS}
      className={`select-priority ${className}`}
      classNamePrefix="select-priority"
      styles={customStyles}
    />
  );
}

export default PrioritySelect;