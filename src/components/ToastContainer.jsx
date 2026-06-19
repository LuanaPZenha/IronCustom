import { useToast } from '../contexts/ToastContext';

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${
            toast.type === 'error'
              ? 'border-red-500/50 bg-red-950/90 text-red-100'
              : 'border-emerald-500/50 bg-emerald-950/90 text-emerald-100'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
