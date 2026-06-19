export default function Textarea({ label, error, id, className = '', ...props }) {
  const textareaId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`input-field min-h-[80px] resize-y ${error ? 'border-red-500' : ''}`}
        {...props}
      />
    </div>
  );
}
