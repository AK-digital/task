import React from "react";
import Select from "react-select";

const options_priority = [
  { value: "low", label: "Basse" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Élevée" },
];

function PrioritySelect({ value = "medium", onChange, className }) {
  const selectedPriority = options_priority.find(
    (option) => option.value === value
  );

  return (
    <Select
      value={selectedPriority}
      menuPortalTarget={document.body}
      onChange={(selectedOption) => onChange(selectedOption?.value || "medium")}
      options={options_priority}
      className={`select-priority ${className}`}
      classNamePrefix="select-priority"
    />
  );
}

export default PrioritySelect;
