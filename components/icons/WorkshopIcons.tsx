/**
 * Phosphor utility icons (bold/duotone) paired with bespoke brand workshop SVGs:
 * EmberIcon (with MorphSVG ember->flame support), PinStarIcon, GearIcon,
 * GearLoader (A20 interlocked gears), FlaskIcon, ToggleLedIcon,
 * WorkshopTokenIcon, DuppiChevronIcon, MechLockIcon.
 */
'use client';

import React, { useEffect, useRef } from 'react';
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

export function PhPlay({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const filled = weight === 'fill';
  return (
    <IconBase size={size} className={className}>
      <path
        d="M7 5.2L19 12L7 18.8V5.2Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={weight === 'bold' ? 2.2 : 1.8}
        strokeLinejoin="round"
      />
    </IconBase>
  );
}


export function PhSoundOn({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <path d="M4 9.5H7.8L12.5 5.5V18.5L7.8 14.5H4V9.5Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      <path d="M16 9A4.5 4.5 0 0 1 16 15M18.6 6.5A8 8 0 0 1 18.6 17.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </IconBase>
  );
}

export function PhSoundOff({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <path d="M4 9.5H7.8L12.5 5.5V18.5L7.8 14.5H4V9.5Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      <path d="M16 9.5L20.5 14M20.5 9.5L16 14" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </IconBase>
  );
}

export function PhSubtitles({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth={sw} />
      <path d="M6.5 11.5H11M13.5 11.5H17.5M6.5 15H13.5M15.5 15H17.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </IconBase>
  );
}


export function PhPause({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <rect x="6.5" y="5.5" width="3.8" height="13" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth={sw} />
      <rect x="13.7" y="5.5" width="3.8" height="13" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth={sw} />
    </IconBase>
  );
}


export function PhChecklist({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <path d="M4.5 7.5L6.2 9.2L9.2 6.2M4.5 15.5L6.2 17.2L9.2 14.2M12 7.8H19.5M12 15.8H19.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function PhMachine({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth={sw} />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.8" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth={1.5} />
      <path d="M9 3V6M15 3V6M9 18V21M15 18V21M3 9H6M3 15H6M18 9H21M18 15H21" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </IconBase>
  );
}

export function PhMenu({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </IconBase>
  );
}

export function PhClose({ size = 20, weight = 'regular', className = '' }: PhosphorCompatProps) {
  const sw = weight === 'bold' ? 2.2 : 1.8;
  return (
    <IconBase size={size} className={className}>
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </IconBase>
  );
}

interface SvgProps {
  className?: string;
  size?: number;
}

const EMBER_PATH =
  'M12 10.5C14.2 10.5 16.5 12.6 16.5 15.2C16.5 18.1 14.5 20.4 12 20.4C9.5 20.4 7.5 18.1 7.5 15.2C7.5 12.6 9.8 10.5 12 10.5Z';
const FLAME_PATH =
  'M12.6 2.5C13.2 6.1 10.2 7.8 9.2 10.7C8.4 13.1 9.6 15.8 12 16.5C14.7 17.2 16.8 14.9 16.5 12.1C16.3 10.3 15.3 9.1 15.1 7.4C17.8 9.1 19.5 11.9 19.2 15.1C18.8 19.1 15.4 21.8 11.6 21.5C7.6 21.2 4.8 17.9 5 13.9C5.2 9.4 8.7 5.7 12.6 2.5Z';

/** 1. A08 Seriya ember icon: smolders at 0, MorphSVG ignites into flame at streak >= 1 */
export function EmberIcon({
  size = 20,
  active = false,
  className = '',
}: SvgProps & { active?: boolean }) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const prevActiveRef = useRef(active);

  useEffect(() => {
    const el = pathRef.current;
    if (!el || prevActiveRef.current === active) {
      prevActiveRef.current = active;
      return;
    }
    prevActiveRef.current = active;

    const reduced =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    if (reduced) {
      el.setAttribute('d', active ? FLAME_PATH : EMBER_PATH);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const [{ default: gsap }, { MorphSVGPlugin }] = await Promise.all([
          import('gsap'),
          import('gsap/MorphSVGPlugin'),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(MorphSVGPlugin);
        gsap.to(el, {
          morphSVG: active ? FLAME_PATH : EMBER_PATH,
          duration: active ? 0.42 : 0.6,
          ease: 'power2.inOut',
        });
      } catch {
        if (!cancelled) el.setAttribute('d', active ? FLAME_PATH : EMBER_PATH);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active]);

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
        ref={pathRef}
        d={active ? FLAME_PATH : EMBER_PATH}
        fill={active ? '#E4572E' : '#F5A800'}
        fillOpacity={active ? 1 : 0.72}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="15.4"
        r="2.4"
        fill={active ? '#F5A800' : '#E4572E'}
        fillOpacity={active ? 0.95 : 0.8}
      />
    </svg>
  );
}

/** 2. Enamel 8-point girih level pin */
export function PinStarIcon({ size = 32, className = '' }: SvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <polygon
        points="16,1 19.8,7.2 26.8,5.2 24.8,12.2 31,16 24.8,19.8 26.8,26.8 19.8,24.8 16,31 12.2,24.8 5.2,26.8 7.2,19.8 1,16 7.2,12.2 5.2,5.2 12.2,7.2"
        fill="#F5A800"
        stroke="#0F1E3A"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="7.5" fill="#FFFDF7" fillOpacity="0.24" />
    </svg>
  );
}


/** 4. Graduated XP flask glyph */
export function FlaskIcon({ size = 20, className = '' }: SvgProps) {
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
        d="M9 3H15M10 3V8.5L5.5 16.8C4.8 18.1 5.7 19.8 7.2 19.8H16.8C18.3 19.8 19.2 18.1 18.5 16.8L14 8.5V3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.5 14.5H16.5" stroke="#F5A800" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** 5. Hardware toggle LED indicator */
export function ToggleLedIcon({
  size = 14,
  lit = false,
  className = '',
}: SvgProps & { lit?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="8"
        cy="8"
        r="5.5"
        fill={lit ? '#19B7A6' : 'transparent'}
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {lit ? <circle cx="6.5" cy="6.5" r="1.4" fill="#EAF2FF" /> : null}
    </svg>
  );
}

/** 6. Ceramic Ustaxona token */
export function WorkshopTokenIcon({
  size = 22,
  unlocked = false,
  className = '',
}: SvgProps & { unlocked?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <polygon
        points="12,2 20,7 20,17 12,22 4,17 4,7"
        fill={unlocked ? '#19B7A6' : 'none'}
        fillOpacity={unlocked ? 0.25 : 0}
        stroke={unlocked ? '#19B7A6' : 'currentColor'}
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="3.2"
        fill={unlocked ? '#F5A800' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}


/** 8. A14 Mechanical lock with lifting shackle state */
export function MechLockIcon({
  size = 20,
  unlocked = false,
  className = '',
}: SvgProps & { unlocked?: boolean }) {
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
        d="M8 11V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{
          transform: unlocked ? 'translateY(-3.5px) rotate(-14deg)' : 'translateY(0)',
          transformOrigin: '8px 11px',
          transition: 'transform 260ms var(--spring-pop)',
        }}
      />
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="3"
        fill={unlocked ? '#19B7A6' : 'currentColor'}
        fillOpacity={unlocked ? 0.28 : 0.14}
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}
