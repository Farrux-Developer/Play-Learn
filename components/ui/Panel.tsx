/**
 * Chamfered & surface-aware Panel primitive ("paper" vs "blueprint").
 * Supports default, active, success, warning, danger, and disabled states.
 */
'use client';

import React from 'react';
import type { SurfaceMode } from '@/lib/engine/store';

export type PanelVariant = 'elevated' | 'inset' | 'chamfered';
export type PanelState =
  | 'default'
  | 'active'
  | 'success'
  | 'warning'
  | 'danger'
  | 'disabled';

export interface PanelProps {
  surface?: SurfaceMode;
  variant?: PanelVariant;
  state?: PanelState;
  className?: string;
  children: React.ReactNode;
}

export function Panel({
  surface,
  variant = 'elevated',
  state = 'default',
  className = '',
  children,
}: PanelProps) {
  const surfaceAttr = surface ? { 'data-surface': surface } : {};

  const stateStyles: Record<PanelState, string> = {
    default: 'border-[var(--line-strong)]',
    active: 'border-[var(--accent)] ring-2 ring-[var(--accent)]/25',
    success: 'border-[var(--ok)] ring-2 ring-[var(--ok)]/25',
    warning: 'border-[var(--warning)] ring-2 ring-[var(--warning)]/25',
    danger: 'border-[var(--danger)] ring-2 ring-[var(--danger)]/25',
    disabled: 'border-[var(--line)] opacity-65',
  };

  const variantStyles: Record<PanelVariant, string> = {
    elevated:
      'rounded-[var(--r-panel)] border-2 bg-[var(--surface-raised)] shadow-[var(--sh-2)]',
    inset:
      'rounded-[var(--r-card)] border-2 bg-[var(--surface-inset)] shadow-[var(--sh-inset)]',
    chamfered:
      'ws-chamfer border-2 bg-[var(--surface-raised)] shadow-[var(--sh-3)]',
  };

  return (
    <div
      {...surfaceAttr}
      aria-disabled={state === 'disabled' || undefined}
      className={`relative p-4 text-[var(--on-surface)] sm:p-5 transition-[border-color,box-shadow] duration-200 ${variantStyles[variant]} ${stateStyles[state]} ${className}`}
    >
      {variant === 'chamfered' ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1.5 left-4 h-1.5 w-6 bg-[var(--accent)] opacity-75"
        />
      ) : null}
      {children}
    </div>
  );
}
