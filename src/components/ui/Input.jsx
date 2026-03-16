const Input = ({ label, type = 'text', value, onChange, placeholder, required, name, maxLength, className = '' }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        name={name}
        maxLength={maxLength}
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-colors ${className}`}
      />
    </div>
  );
};

export default Input;
