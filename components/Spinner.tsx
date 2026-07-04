type SpinnerProps = {
  label?: string;
  className?: string;
};

export default function Spinner({
  label = "Loading…",
  className = "",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
        aria-hidden="true"
      />
      {label ? (
        <p className="text-sm text-slate-500" aria-hidden="true">
          {label}
        </p>
      ) : null}
    </div>
  );
}
