import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ButtonVariant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'danger-outline'
  | 'ghost-blue'
  | 'ghost-red';

export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType;
  label: string;
  /**
   * When true the label is hidden on mobile (< sm) and visible on sm+.
   * The button switches to a compact square pad on mobile.
   */
  hideLabel?: boolean;
  /**
   * When true the label is always visually hidden (sr-only).
   * Use this for icon-only table-row action buttons.
   */
  alwaysIconOnly?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:          'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm',
  success:          'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  danger:           'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-100',
  'danger-outline': 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200',
  'ghost-blue':     'text-blue-600 hover:bg-blue-50',
  'ghost-red':      'text-rose-500 hover:bg-rose-50',
};

function getSizeClass(size: ButtonSize, hideLabel: boolean, alwaysIconOnly: boolean): string {
  if (alwaysIconOnly) {
    return size === 'md'
      ? 'p-2 rounded-lg gap-2 text-sm'
      : 'p-1.5 rounded-md gap-1.5 text-xs';
  }
  if (hideLabel) {
    return size === 'md'
      ? 'p-2 sm:px-4 sm:py-2 rounded-xl gap-2 text-sm'
      : 'p-1.5 sm:px-3 sm:py-1.5 rounded-lg gap-1.5 text-xs';
  }
  return size === 'md'
    ? 'px-4 py-2 rounded-xl gap-2 text-sm'
    : 'px-3 py-1.5 rounded-lg gap-1.5 text-xs';
}

const Button = ({
  icon: Icon,
  label,
  hideLabel = false,
  alwaysIconOnly = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) => {
  const iconSize = size === 'sm' ? 14 : 16;
  const labelClass = alwaysIconOnly
    ? 'sr-only'
    : hideLabel
    ? 'hidden sm:inline'
    : undefined;

  return (
    <button
      {...props}
      disabled={disabled || loading}
      title={hideLabel || alwaysIconOnly ? label : props.title}
      className={cn(
        'inline-flex items-center font-bold transition-colors active:scale-[0.98]',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        VARIANT_STYLES[variant],
        getSizeClass(size, hideLabel, alwaysIconOnly),
        className
      )}
    >
      {loading
        ? <Loader2 size={iconSize} className="animate-spin" />
        : Icon && <Icon size={iconSize} />
      }
      {!loading && <span className={labelClass}>{label}</span>}
    </button>
  );
};

export default Button;
