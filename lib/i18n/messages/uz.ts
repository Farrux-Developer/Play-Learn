/**
 * Primary Uzbek Latin UI dictionary (ʻ U+02BB for oʻ/gʻ, ʼ U+02BC for tutuq belgisi).
 * Consistent verbs: "Bosib koʻr", "Tekshir", "1 takt bos", "Orqaga qaytar".
 */
export const UZ_MESSAGES = {
  meta: {
    localeName: 'Oʻzbekcha',
    reviewStatus: 'draft' as const,
  },
  nav: {
    brand: 'Oʻyna va oʻrgan',
    lessons: 'Darslar',
    map: 'Xarita',
    games: 'Oʻyinlar',
    principles: 'Tamoyillar',
    start: 'Boshlash',
    openMenu: 'Menyuni ochish',
    closeMenu: 'Menyuni yopish',
  },
  actions: {
    tryIt: 'Bosib koʻr',
    check: 'Tekshir',
    stepTick: '1 takt bos',
    play: 'Ishga tushir',
    fastForward: 'Tezlashtir',
    rewind: 'Orqaga qaytar',
    reset: 'Qaytadan boshla',
    close: 'Yopish',
    save: 'Saqlash',
    exportBackup: 'Nusxa yuklab olish',
    importBackup: 'Nusxani tiklash',
    copyCode: 'Koddan nusxa olish',
    applyCode: 'Kodni qoʻllash',
    updateNow: 'Yangilash',
  },
  workshops: {
    'kompyuter-ichida': 'Kompyuter ichida',
    'bit-bayt': 'Bit va bayt',
    'matn-rasm': 'Matn va rasm',
    mantiq: 'Mantiq',
    algoritm: 'Algoritm',
    protsessor: 'Mashina qanday ishlaydi',
    tarmoq: 'Tarmoq va Internet',
    'xavfsizlik-ai': 'Xavfsizlik, maʼlumot va AI',
    'kompyuter-yasa': 'Kompyuter yasa',
  },
  mastery: {
    new: 'Yangi',
    introduced: 'Tanishildi',
    practicing: 'Mashqda',
    mastered: 'Oʻzlashtirildi',
    retained: 'Mustahkamlandi',
    repairDay: 'Taʼmirlash kuni',
    dueCount: '{count, plural, =0 {Bugun takror yoʻq} one {# ta koʻnikma takrorga tayyor} other {# ta koʻnikma takrorga tayyor}}',
  },
  ui: {
    starsLabel: '{stars} ta yulduz (3 tadan)',
    termExplainTitle: 'Atama izohi',
    termReadGlossary: 'Lugʻatda oʻqish',
    loading: 'Ustaxona tayyorlanmoqda...',
    swUpdateReady: 'Yangi versiya tayyor — yangilab olamizmi?',
    storageWarning: 'Brauzer maʼlumotni oʻchirishi mumkin. Natijangni saqlab qoʻy.',
    dyslexiaLabel: 'Oʻqishni yengillashtirish (keng shrift)',
    motionLabel: 'Animatsiyalarni pauza qilish',
    soundLabel: 'Ustaxona ovozlari',
    subtitlesLabel: 'Mirzo subtitrlari',
  },
  privacy: {
    title: 'Maxfiylik va xavfsizlik',
    summary:
      'Roʻyxatdan oʻtish yoʻq. Cookie va kuzatuvchilar yoʻq. Barcha natija faqat qurilmangda saqlanadi.',
  },
} as const;

export type LocaleDictionary = {
  meta: { localeName: string; reviewStatus: 'draft' | 'reviewed' };
  nav: Record<keyof typeof UZ_MESSAGES.nav, string>;
  actions: Record<keyof typeof UZ_MESSAGES.actions, string>;
  workshops: Record<keyof typeof UZ_MESSAGES.workshops, string>;
  mastery: Record<keyof typeof UZ_MESSAGES.mastery, string>;
  ui: Record<keyof typeof UZ_MESSAGES.ui, string>;
  privacy: Record<keyof typeof UZ_MESSAGES.privacy, string>;
};
