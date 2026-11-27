/**
 * Minimal above-the-fold UI copy for Header, Hero, and Workshop HUD
 * so full section/modal copy stays in lazy chunks.
 */

export const HERO_STRINGS = {
  brandName: 'Oʻyna va oʻrgan',
  nav: {
    lessons: 'Darslar',
    map: 'Xarita',
    games: 'Oʻyinlar',
    principles: 'Tamoyillar',
    start: 'Boshlash',
  },
  hero: {
    audienceTag: '5–6-sinf oʻquvchilari uchun',
    headline: 'Avval tushun, keyin oʻyna va kodni oʻzing boshqar',
    subtitle:
      'Qisqa darslarda Mirzo mashinasi qadam-baqadam qanday ishlashini koʻr. Keyin uchta ustaxonada bilimingni sinab, xatolarni oʻzing tuzat.',
    primaryCta: 'Boshlash',
    secondaryCta: 'Qisqa sinov',
    promises: [
      { id: 'noreg', label: 'Roʻyxatdan oʻtishsiz' },
      { id: 'local', label: 'Brauzerda saqlanadi' },
      { id: 'offline', label: 'Internet talab qilmaydi' },
    ],
  },
  hud: {
    levelLabel: 'Daraja',
    xpUnit: 'XP',
    xpTarget: 120,
    streakUnit: 'ta ketma-ket',
    soundOn: 'Ovoz yoqilgan',
    soundOff: 'Ovoz oʻchirilgan',
    subtitlesOn: 'Subtitrlar yoqilgan',
    subtitlesOff: 'Subtitrlar oʻchirilgan',
    machineTitle: 'Mirzo mashinasi',
    machineStepBtn: '1 takt bos',
    workshopsLabel: 'Uchta ustaxona',
    defaultSay: 'Salom! Birinchi qadamni bosib koʻramizmi?',
  },
  header: {
    surfacePaper: 'Tushunish varagʻi',
    surfaceBlueprint: 'Oʻyin chizmasi',
    pauseMotion: 'Animatsiyalarni toʻxtatish',
    resumeMotion: 'Animatsiyalarni yoqish',
    skipTyping: 'Matnni toʻliq koʻrish',
    openMenu: 'Menyuni ochish',
    closeMenu: 'Menyuni yopish',
  },
} as const;
