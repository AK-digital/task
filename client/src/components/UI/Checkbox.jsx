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
      className={`w-4 h-4 p-0 cursor-pointer rounded-sm ${className}`}
      {...props}
    />
  );
}
