import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string;
}

export function FormField({ label, hint, error, className = "", id, ...inputProps }: Props) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={fieldId} className="block text-sm font-medium">
      {label}
      <input
        id={fieldId}
        className={`auth-input mt-1 ${error ? "auth-input--error" : ""} ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...inputProps}
      />
      {hint && (
        <span id={`${fieldId}-hint`} className="mt-1 block text-xs text-muted">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${fieldId}-error`} className="mt-1 block text-xs font-medium text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}
