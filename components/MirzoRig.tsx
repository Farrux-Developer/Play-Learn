/**
 * Living Mirzo SVG rig (< 20 KB) implementing the MirzoController contract.
 * Layers: body, collar, orange 8-point pin, neck, head, ears, sclera, pupils,
 * eyelids, brows, 4 mouth forms, cheeks, duppi base & embroidery glint.
 */
'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { MirzoController, MirzoMood } from '@/lib/engine/mirzo';

export interface MirzoRigProps {
  mood?: MirzoMood;
  speaking?: boolean;
  liteMode?: boolean;
  motionPaused?: boolean;
  lookOffset?: { x: number; y: number };
  onSay?: (text: string) => void;
  size?: number;
  className?: string;
}

export const MirzoRig = forwardRef<MirzoController, MirzoRigProps>(function MirzoRig(
  {
    mood: externalMood = 'idle',
    speaking = false,
    liteMode = false,
    motionPaused = false,
    lookOffset,
    onSay,
    size = 184,
    className = '',
  },
  ref
) {
  const [mood, setMood] = useState<MirzoMood>(externalMood);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);
  const [mouthFrame, setMouthFrame] = useState(0);
  const [embroideryGlint, setEmbroideryGlint] = useState(false);
  const [bounceClass, setBounceClass] = useState('');
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    setMood(externalMood);
  }, [externalMood]);

  useEffect(() => {
    if (!lookOffset || liteMode || motionPaused) {
      setPupil({ x: 0, y: 0 });
      return;
    }
    const clamp = (v: number) => Math.max(-3, Math.min(3, v * 3));
    setPupil({ x: clamp(lookOffset.x), y: clamp(lookOffset.y) });
  }, [lookOffset, liteMode, motionPaused]);

  // Random blinking (2.5 - 6 s) with occasional double-blink
  useEffect(() => {
    if (motionPaused) return;
    let alive = true;
    const scheduleBlink = () => {
      const wait = 2500 + Math.random() * 3500;
      const id = window.setTimeout(() => {
        if (!alive) return;
        setBlinking(true);
        const closeId = window.setTimeout(() => {
          if (!alive) return;
          setBlinking(false);
          if (Math.random() < 0.22) {
            const dbl = window.setTimeout(() => {
              if (!alive) return;
              setBlinking(true);
              window.setTimeout(() => alive && setBlinking(false), 110);
            }, 130);
            timersRef.current.push(dbl);
          }
          scheduleBlink();
        }, 120);
        timersRef.current.push(closeId);
      }, wait);
      timersRef.current.push(id);
    };
    scheduleBlink();
    return () => {
      alive = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [motionPaused]);

  // Duppi embroidery glint every ~9s (skipped in lite/paused mode)
  useEffect(() => {
    if (liteMode || motionPaused) return;
    const id = window.setInterval(() => {
      setEmbroideryGlint(true);
      window.setTimeout(() => setEmbroideryGlint(false), 750);
    }, 9000);
    return () => clearInterval(id);
  }, [liteMode, motionPaused]);

  // Lip-sync mouth shape cycling while speech bubble types
  useEffect(() => {
    if (!speaking || motionPaused) {
      setMouthFrame(0);
      return;
    }
    const id = window.setInterval(() => {
      setMouthFrame((prev) => (prev + 1) % 3);
    }, 115);
    return () => clearInterval(id);
  }, [speaking, motionPaused]);

  useImperativeHandle(
    ref,
    () => ({
      setMood: (nextMood: MirzoMood) => {
        setMood(nextMood);
        if (!motionPaused && (nextMood === 'happy' || nextMood === 'cheer')) {
          setBounceClass('scale-y-[0.95] translate-y-1');
          window.setTimeout(() => setBounceClass('scale-y-[1.05] -translate-y-2'), 90);
          window.setTimeout(() => setBounceClass(''), 320);
        }
      },
      lookAt: (nx: number, ny: number) => {
        if (liteMode || motionPaused) return;
        const clamp = (v: number) => Math.max(-3, Math.min(3, v * 3));
        setPupil({ x: clamp(nx), y: clamp(ny) });
      },
      say: (text: string) => {
        onSay?.(text);
      },
      celebrate: (_level: number) => {
        setMood('cheer');
        if (!motionPaused) {
          setBounceClass('scale-y-[1.06] -translate-y-2.5');
          window.setTimeout(() => setBounceClass(''), 420);
        }
      },
    }),
    [liteMode, motionPaused, onSay]
  );

  const headTilt =
    mood === 'oops' ? -6 : mood === 'think' ? 4 : mood === 'cheer' ? -2 : 0;

  const mouthPath =
    speaking && mouthFrame === 1
      ? 'M89 124 Q100 132 111 124 Q100 129 89 124 Z'
      : speaking && mouthFrame === 2
        ? 'M92 124 Q100 135 108 124 Q100 122 92 124 Z'
        : mood === 'happy' || mood === 'cheer'
          ? 'M86 121 Q100 136 114 121'
          : mood === 'oops'
            ? 'M93 128 Q100 121 107 128'
            : 'M91 124 Q100 130 109 124';

  const browOffsetLeft = mood === 'oops' ? -3 : mood === 'think' ? -2 : 0;
  const browOffsetRight = mood === 'oops' ? -3 : mood === 'think' ? 1 : 0;
  const breatheActive = !liteMode && !motionPaused;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 210"
      fill="none"
      role="img"
      aria-label="Mirzo — Algoritm ustaxonasi qahramoni"
      className={`select-none transition-transform duration-200 ws-mirzo-shared ${bounceClass} ${className}`}
      style={{
        transformOrigin: '50% 85%',
        animation: breatheActive ? 'ws-mirzo-breathe 4s ease-in-out infinite' : undefined,
      }}
    >
      <style>{`
        @keyframes ws-mirzo-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.015); }
        }
      `}</style>

      {/* Subtle shadow on niche floor */}
      <ellipse cx="100" cy="196" rx="52" ry="8" fill="#07264B" fillOpacity="0.45" />

      {/* Body & cobalt workshop jacket */}
      <g id="mirzo-body">
        <path
          d="M46 192 C46 156 68 144 100 144 C132 144 154 156 154 192 Z"
          fill="#0F4C81"
          stroke="#EAF2FF"
          strokeWidth="2.5"
        />
        {/* Collar */}
        <path
          id="mirzo-collar"
          d="M78 145 L100 164 L122 145 L112 138 H88 Z"
          fill="#EAF2FF"
          stroke="#0F1E3A"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Orange 8-point enamel pin on Mirzo's jacket */}
        <g id="mirzo-pin" transform="translate(122 161)">
          <polygon
            points="9,0 11.2,3.6 15.2,2.4 14,6.4 17.6,8.6 14,10.8 15.2,14.8 11.2,13.6 9,17.2 6.8,13.6 2.8,14.8 4,10.8 0.4,8.6 4,6.4 2.8,2.4 6.8,3.6"
            fill="#F5A800"
            stroke="#0F1E3A"
            strokeWidth="1.4"
          />
          {mood === 'happy' || mood === 'cheer' ? (
            <circle cx="9" cy="8.6" r="2.2" fill="#FFFDF7" />
          ) : null}
        </g>
      </g>

      {/* Neck */}
      <rect
        id="mirzo-neck"
        x="88"
        y="128"
        width="24"
        height="22"
        rx="8"
        fill="#F2C094"
        stroke="#0F1E3A"
        strokeWidth="2"
      />

      {/* Head assembly with tilt */}
      <g
        id="mirzo-head-group"
        style={{
          transformOrigin: '100px 115px',
          transform: `rotate(${headTilt}deg)`,
          transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Ears */}
        <circle cx="52" cy="96" r="10" fill="#F2C094" stroke="#0F1E3A" strokeWidth="2.2" />
        <circle cx="148" cy="96" r="10" fill="#F2C094" stroke="#0F1E3A" strokeWidth="2.2" />

        {/* Face */}
        <rect
          id="mirzo-head"
          x="56"
          y="50"
          width="88"
          height="90"
          rx="38"
          fill="#FAD1A8"
          stroke="#0F1E3A"
          strokeWidth="2.4"
        />

        {/* Hair fringe */}
        <path
          d="M58 76 C62 56 80 50 100 50 C120 50 138 56 142 76 C132 68 114 66 100 69 C86 66 68 68 58 76 Z"
          fill="#1B273E"
        />

        {/* Cheeks */}
        <ellipse
          id="mirzo-cheeks-left"
          cx="73"
          cy="112"
          rx="8"
          ry="4.5"
          fill="#E4572E"
          fillOpacity={mood === 'happy' || mood === 'cheer' ? 0.34 : 0.18}
        />
        <ellipse
          id="mirzo-cheeks-right"
          cx="127"
          cy="112"
          rx="8"
          ry="4.5"
          fill="#E4572E"
          fillOpacity={mood === 'happy' || mood === 'cheer' ? 0.34 : 0.18}
        />

        {/* Eyes: sclera + tracked pupils + blink eyelids */}
        <g id="mirzo-eyes">
          <ellipse cx="80" cy="94" rx="10" ry="11" fill="#FFFFFF" stroke="#0F1E3A" strokeWidth="1.8" />
          <ellipse cx="120" cy="94" rx="10" ry="11" fill="#FFFFFF" stroke="#0F1E3A" strokeWidth="1.8" />

          {!blinking ? (
            <g
              id="mirzo-pupils"
              style={{
                transform: `translate(${pupil.x}px, ${pupil.y}px)`,
                transition: 'transform 90ms linear',
              }}
            >
              <circle cx="80" cy="95" r="5" fill="#0F1E3A" />
              <circle cx="82" cy="93" r="1.7" fill="#FFFFFF" />
              <circle cx="120" cy="95" r="5" fill="#0F1E3A" />
              <circle cx="122" cy="93" r="1.7" fill="#FFFFFF" />
            </g>
          ) : (
            <g id="mirzo-eyelids">
              <path d="M70 94 Q80 100 90 94" stroke="#0F1E3A" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M110 94 Q120 100 130 94" stroke="#0F1E3A" strokeWidth="2.6" strokeLinecap="round" />
            </g>
          )}
        </g>

        {/* Brows */}
        <path
          d={`M70 ${79 + browOffsetLeft} Q80 ${75 + browOffsetLeft} 90 ${79 + browOffsetLeft}`}
          stroke="#1B273E"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d={`M110 ${79 + browOffsetRight} Q120 ${75 + browOffsetRight} 130 ${79 + browOffsetRight}`}
          stroke="#1B273E"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Nose */}
        <path d="M99 102 L97 110 L103 111" stroke="#C98A5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Mouth */}
        <path
          id="mirzo-mouth"
          d={mouthPath}
          fill={speaking && mouthFrame > 0 ? '#8C2D19' : 'none'}
          stroke="#0F1E3A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gentle oops sweat drop */}
        {mood === 'oops' ? (
          <path
            d="M142 74 C146 80 146 86 142 87 C138 86 138 80 142 74 Z"
            fill="#19B7A6"
            stroke="#0F1E3A"
            strokeWidth="1.4"
          />
        ) : null}

        {/* Uzbek Traditional Duppi (base + chevron embroidery + periodic glint) */}
        <g id="mirzo-duppi">
          <path
            d="M54 62 L62 28 C78 21 122 21 138 28 L146 62 C126 55 74 55 54 62 Z"
            fill="#0F1E3A"
            stroke="#EAF2FF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M66 52 L75 40 L84 51 L93 39 L100 49 L107 39 L116 51 L125 40 L134 52"
            stroke={embroideryGlint ? '#F5A800' : '#EAF2FF'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'stroke 320ms ease' }}
          />
          <circle cx="100" cy="31" r="2.6" fill="#19B7A6" />
        </g>
      </g>
    </svg>
  );
});
