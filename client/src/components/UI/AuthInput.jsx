import React from "react";

export default function AuthInput({
    id,
    label,
    icon: Icon,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    required = false,
    autoComplete,
    rightElement,
    error,
    disabled = false,
    className = ""
}) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label
                    htmlFor={id || name}
                    className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]"
                >
                    {label}
                </label>
            )}

            <div className="relative flex items-center w-full">
                {/* Left Icon */}
                {Icon && (
                    <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none text-[var(--text-muted)]">
                        <Icon className="w-4 h-4 shrink-0" />
                    </div>
                )}

                {/* Input Control using theme tokens */}
                <input
                    id={id || name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    className={`input-clean ${
                        Icon ? "!pl-11" : "!pl-3.5"
                    } ${rightElement ? "!pr-11" : "!pr-3.5"} ${
                        error ? "!border-[var(--danger)] focus:!ring-[var(--danger)]/20" : ""
                    }`}
                />

                {/* Right Action */}
                {rightElement && (
                    <div className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-[var(--text-muted)]">
                        {rightElement}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs font-semibold text-[var(--danger)] mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
