type Props = {
  message: string;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="font-semibold text-red-700 hover:text-red-900"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
