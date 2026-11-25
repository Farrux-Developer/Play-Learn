/**
 * Uzbek Latin localization dictionary preserving original product copy
 * alongside documented workshop/accessibility strings for native review.
 */

export const WORKSHOP_STRINGS = {
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
  /* New accessibility / mode / interactive section strings flagged for native Uzbek review */
  reviewStrings: {
    surfacePaper: 'Tushunish varagʻi',
    surfaceBlueprint: 'Oʻyin chizmasi',
    pauseMotion: 'Animatsiyalarni toʻxtatish',
    resumeMotion: 'Animatsiyalarni yoqish',
    liteModeOn: 'Yengil rejim yoniq',
    liteModeOff: 'Yengil rejim oʻchiq',
    skipTyping: 'Matnni toʻliq koʻrish',
    xpScaleNote: 'Har bir boʻlinma: 10 XP',
    lessonsTitle: 'Darslar: avval tushun',
    lessonsSubtitle:
      'Har bir darsda kodni ishga tushirishdan oldin natijasini taxmin qil. Soʻng izohni koʻrib +20 XP ol.',
    predictPromptLabel: 'Avval taxmin qil:',
    lessonCompletedBadge: 'Oʻzlashtirildi',
    lessonCheckSuccess: 'Toʻgʻri taxmin! +20 XP kolbaga tushdi.',
    lessonRetryHint: 'Xato boʻlsa ham davom et: qadamni qayta koʻrib boshqa javobni tanla.',
    mapTitle: 'Bilim xaritasi: Samarqanddan Toshkentgacha',
    mapSubtitle:
      'Har bir shahar yangi ustaxonani ochadi. Kerakli XP yigʻilgach Mirzo keyingi bekatga oʻtadi.',
    mapUnlockedLabel: 'Ochiq bekat',
    mapLockedLabel: 'Qulflangan bekat',
    gamesTitle: 'Uchta ustaxona: amalda sinab koʻr',
    gamesSubtitle:
      'Xatoni top, toʻgʻri buyruqni tanla va konveyerni ishga tushir.',
    fixYourselfHint: 'Oʻzing tuzat:',
    workshopSolvedBadge: 'Ustaxona yakunlandi!',
    workshopRewardNote: 'Barcha vazifalar bajarildi. Keyingi ustaxonaga oʻtishing mumkin.',
    lockedEmptyTitle: 'Bu ustaxona hali qulflangan',
    lockedEmptyBody: 'Avvalgi darslar yoki 1-ustaxonada XP toʻpla va darvoza ochiladi.',
    backToLessonsBtn: 'Darslarga qaytish',
    principlesTitle: 'Nima uchun bu usul ishlaydi?',
    principlesSubtitle:
      'Uchta oddiy tamoyil kodni yodlash oʻrniga tushunib boshqarishga yordam beradi.',
    diagTitle: 'Qisqa sinov: 3 ta savol',
    diagSubtitle: 'Darajangni aniqlab, senga mos ustaxonani tanlab beramiz.',
    diagNextBtn: 'Keyingi savol',
    diagFinishBtn: 'Natijani koʻrish',
    diagDoneTitle: 'Sinov yakunlandi!',
    diagGoWorkshop: 'Tavsiya etilgan ustaxonaga oʻtish',
    closeModal: 'Yopish',
    resetProgress: 'Natijani nolga tushirish',
    resetConfirm: 'Ha, qaytadan boshlash',
    resetCancel: 'Bekor qilish',
  },
} as const;

/**
 * Normalizes apostrophe variants (U+02BB, U+02BC, U+2018, U+2019, ') for user input checks.
 */
export function normalizeUzbekInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\u0027\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g, "'")
    .replace(/\s+/g, ' ');
}
