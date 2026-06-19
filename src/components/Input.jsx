export default function Input({ label, error, id, className = '', ...props }) {
  const inputId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <input id={inputId} className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
