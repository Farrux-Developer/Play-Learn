/**
 * Below-the-fold & modal workshop SVG icons split from WorkshopIcons
 * so landing First-Load JS stays <= 120 KB gz.
 */
'use client';

import React from 'react';

interface PhosphorCompatProps {
  size?: number;
  weight?: 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}

function IconBase({
  size = 20,
  className = '',
  children,
}: {
  size?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function PhLessons({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <path d="M12 6.5C10 5 7 4.5 3.5 5.2V18.5C7 17.8 10 18.3 12 19.8C14 18.3 17 17.8 20.5 18.5V5.2C17 4.5 14 5 12 6.5Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      <path d="M12 6.5V19.8" stroke="currentColor" strokeWidth={sw} />
    </IconBase>
  );
}

export function PhMap({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={sw} />
      <polygon points="15.5,8.5 13.4,13.4 8.5,15.5 10.6,10.6" fill="currentColor" />
    </IconBase>
  );
}

export function PhWorkshop({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <path d="M14.5 6.5A4.5 4.5 0 0 0 8.8 12.2L4.2 16.8A1.8 1.8 0 0 0 6.8 19.4L11.4 14.8A4.5 4.5 0 0 0 17.5 9.5L14.8 12.2L11.8 9.2L14.5 6.5Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
    </IconBase>
  );
}

export function PhCheck({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <circle cx="12" cy="12" r="9" fill={weight === 'fill' ? 'currentColor' : 'none'} fillOpacity={weight === 'fill' ? 0.18 : 0} stroke="currentColor" strokeWidth={sw} />
      <path d="M8 12.2L10.8 15L16.2 9.4" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function PhWarn({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={sw} />
      <path d="M12 7.5V12.8" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx="12" cy="16.2" r="1.2" fill="currentColor" />
    </IconBase>
  );
}

export function PhLightning({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <path d="M13.5 3L5.5 13.5H12L10.5 21L18.5 10.5H12L13.5 3Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
    </IconBase>
  );
}

/** Mechanical workshop gear */
export function GearIcon({ size = 28, className = '' }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M14 2.5H18L18.9 5.8C19.8 6.1 20.6 6.4 21.4 6.9L24.3 5.2L27.1 8L25.4 10.9C25.9 11.7 26.2 12.5 26.5 13.4L29.8 14.3V18.3L26.5 19.2C26.2 20.1 25.9 20.9 25.4 21.7L27.1 24.6L24.3 27.4L21.4 25.7C20.6 26.2 19.8 26.5 18.9 26.8L18 30.1H14L13.1 26.8C12.2 26.5 11.4 26.2 10.6 25.7L7.7 27.4L4.9 24.6L6.6 21.7C6.1 20.9 5.8 20.1 5.5 19.2L2.2 18.3V14.3L5.5 13.4C5.8 12.5 6.1 11.7 6.6 10.9L4.9 8L7.7 5.2L10.6 6.9C11.4 6.4 12.2 6.1 13.1 5.8L14 2.5Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16.3" r="4.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/** A20: Interlocked rotating gear loader (CSS linear infinite) */
export function GearLoader({ label }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 text-[14px] font-semibold text-[var(--on-surface-muted)]">
      <span className="inline-flex items-center" aria-hidden="true">
        <span className="ws-gear-spin inline-block text-[var(--accent)]">
          <GearIcon size={24} />
        </span>
        <span className="ws-gear-spin--reverse -ml-1.5 mt-2 inline-block text-[var(--ok)]">
          <GearIcon size={18} />
        </span>
      </span>
      {label ? <span>{label}</span> : null}
    </div>
  );
}

/** Uzbek duppi embroidery chevron divider/marker */
export function DuppiChevronIcon({ size = 18, className = '' }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 15L12 7L20 15"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 18L12 14L16 18"
        stroke="#19B7A6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
