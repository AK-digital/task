export default function Checkbox({ 
  id, 
  name, 
  value, 
  checked, 
  onChange, 
  disabled = false,
  className = "",
  ...props 
}) {
  return (
    <input
      type="checkbox"
      id={id}
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`${className}`}
      {...props}
    />
  );
}
