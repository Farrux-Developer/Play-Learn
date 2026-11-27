/**
 * Tactile Workshop Button primitive (WCAG 2.5.8 >= 48px target size).
 * Supports primary, secondary, ghost, and danger variants plus loading & disabled states.
 */
'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'border-2 border-[var(--accent-depth)] bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_4px_0_var(--accent-depth)] active:shadow-[0_0.5px_0_var(--accent-depth)]',
    secondary:
      'border-2 border-[var(--line-strong)] bg-[var(--surface-raised)] text-[var(--on-surface)] shadow-[0_4px_0_var(--line-strong)] active:shadow-[0_0.5px_0_var(--line-strong)]',
    ghost:
      'border-2 border-transparent bg-transparent text-[var(--on-surface)] hover:bg-[var(--surface-inset)] hover:border-[var(--line)]',
    danger:
      'border-2 border-[var(--c-coral-depth)] bg-[#BA2F0C] text-[#FFFFFF] shadow-[0_4px_0_var(--c-coral-depth)] active:shadow-[0_0.5px_0_var(--c-coral-depth)]',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    md: 'min-h-[48px] px-4 py-2.5 text-[15px]',
    lg: 'min-h-[54px] px-6 py-3 text-[17px]',
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-[var(--r-card)] font-[family-name:var(--font-display)] font-bold select-none transition-[transform,box-shadow,background-color,border-color,filter] duration-[var(--dur-fast)] ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${
        isDisabled
          ? 'cursor-not-allowed opacity-55 saturate-50'
          : 'cursor-pointer hover:-translate-y-0.5 hover:brightness-[1.03] active:translate-y-[3.5px]'
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : iconLeft ? (
        <span className="shrink-0" aria-hidden="true">
          {iconLeft}
        </span>
      ) : null}
      <span>{children}</span>
      {!loading && iconRight ? (
        <span className="shrink-0" aria-hidden="true">
          {iconRight}
        </span>
      ) : null}
    </button>
  );
}
