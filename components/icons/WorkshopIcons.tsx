/**
 * Phosphor utility icons (bold/duotone) paired with 8 bespoke brand workshop SVGs:
 * EmberIcon, PinStarIcon, GearIcon, FlaskIcon, ToggleLedIcon,
 * WorkshopTokenIcon, DuppiChevronIcon, MechLockIcon.
 */
'use client';

import React from 'react';
import {
  Play,
  BookOpenText,
  Compass,
  Wrench,
  SpeakerHigh,
  SpeakerSlash,
  ClosedCaptioning,
  CheckCircle,
  WarningCircle,
  Pause,
  Lightning,
  ListChecks,
  Cpu,
} from '@phosphor-icons/react';

export {
  Play as PhPlay,
  BookOpenText as PhLessons,
  Compass as PhMap,
  Wrench as PhWorkshop,
  SpeakerHigh as PhSoundOn,
  SpeakerSlash as PhSoundOff,
  ClosedCaptioning as PhSubtitles,
  CheckCircle as PhCheck,
  WarningCircle as PhWarn,
  Pause as PhPause,
  Lightning as PhLightning,
  ListChecks as PhChecklist,
  Cpu as PhMachine,
};

interface SvgProps {
  className?: string;
  size?: number;
}

/** 1. Seriya ember icon: glows softly at 0, ignites on streak >= 1 */
export function EmberIcon({
  size = 20,
  active = false,
  className = '',
}: SvgProps & { active?: boolean }) {
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
        d="M12.6 2.5C13.2 6.1 10.2 7.8 9.2 10.7C8.4 13.1 9.6 15.8 12 16.5C14.7 17.2 16.8 14.9 16.5 12.1C16.3 10.3 15.3 9.1 15.1 7.4C17.8 9.1 19.5 11.9 19.2 15.1C18.8 19.1 15.4 21.8 11.6 21.5C7.6 21.2 4.8 17.9 5 13.9C5.2 9.4 8.7 5.7 12.6 2.5Z"
        fill={active ? '#E4572E' : 'currentColor'}
        fillOpacity={active ? 1 : 0.45}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="15.2"
        r="2.4"
        fill={active ? '#F5A800' : 'currentColor'}
        fillOpacity={active ? 0.95 : 0.35}
      />
    </svg>
  );
}

/** 2. Enamel 8-point girih level pin (matching orange star pin on Mirzo's jacket) */
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

/** 3. Mechanical workshop gear for Tamoyillar */
export function GearIcon({ size = 28, className = '' }: SvgProps) {
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

/** 7. Uzbek duppi embroidery chevron divider/marker */
export function DuppiChevronIcon({ size = 18, className = '' }: SvgProps) {
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

/** 8. Mechanical lock with rotating shackle state */
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
        d={
          unlocked
            ? 'M8 11V7.5C8 5.3 9.8 3.5 12 3.5C13.9 3.5 15.5 4.8 15.9 6.5'
            : 'M8 11V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V11'
        }
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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
