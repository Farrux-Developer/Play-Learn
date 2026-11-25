/**
 * Surface-aware workshop container card:
 * - "paper": warm archival card with ink border and tinted shadow
 * - "blueprint": beveled cobalt blueprint sheet
 * Supports interactive states: default, active, disabled, softError, success.
 */
'use client';

import React from 'react';
import type { SurfaceMode } from '@/lib/engine/store';

interface WorkshopCardProps {
  surface?: SurfaceMode;
  variant?: 'elevated' | 'inset';
  state?: 'default' | 'active' | 'disabled' | 'error' | 'success';
  className?: string;
  children: React.ReactNode;
}

export function WorkshopCard({
  surface,
  variant = 'elevated',
  state = 'default',
  className = '',
  children,
}: WorkshopCardProps) {
  const surfaceAttr = surface ? { 'data-surface': surface } : {};

  const stateBorder =
    state === 'active'
      ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/25'
      : state === 'success'
      ? 'border-[var(--ok)] ring-2 ring-[var(--ok)]/25'
      : state === 'error'
      ? 'border-[var(--warn)] ws-soft-nudge'
      : state === 'disabled'
      ? 'border-[var(--line)] opacity-65'
      : 'border-[var(--line-strong)]';

  const bgClass =
    variant === 'inset'
      ? 'bg-[var(--surface-inset)] shadow-[var(--sh-inset)]'
      : 'bg-[var(--surface-raised)] shadow-[var(--sh-2)]';

  return (
    <div
      {...surfaceAttr}
      className={`rounded-[18px] border-2 p-4 sm:p-5 transition-[border-color,box-shadow,transform] duration-200 ${bgClass} ${stateBorder} ${className}`}
    >
      {children}
    </div>
  );
}
