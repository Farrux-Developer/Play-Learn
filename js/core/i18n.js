/**
 * Uzbek internationalization layer (uz-Latn default, uz-Cyrl toggle),
 * strict U+02BB / U+02BC apostrophe orthography, and input normalization.
 */
(function (root) {
  'use strict';

  var PL = (root.PL = root.PL || {});

  var DICT = {
    'uz-Latn': {
      brandName: 'Oʻyna va oʻrgan',
      brandTag: 'Algoritm Ustaxonasi',
      skipToMain: 'Asosiy qismga oʻtish',
      introTitle: 'Kod — mantiq oʻyini',
      introSub: 'Avval oʻyna, kuzat va natijani oʻzing boshqar',
      introSkip: 'Oʻtkazib yuborish',
      searchPlaceholder: 'Oʻyin yoki tushuncha qidirish…',
      dockHome: 'Bosh sahifa',
      dockGalaxy: 'Galaktika',
      dockGames: 'Oʻyinlar',
      dockRewards: 'Yutuqlar',
      dockWhy: 'Nima uchun?',
      heroEyebrow: '80% amaliy oʻyin · 20% aniq tushuncha',
      heroTitle: 'Dasturlashni oʻynab his qil',
      heroSub:
        'Har bir topshiriqda kod qanday ishlashini oʻz qoʻling bilan sinab koʻrasan. Harflar ortida tirik mantiq bor.',
      heroPrimary: 'Oʻynashni boshlash',
      heroContinue: 'Davom ettirish',
      heroGalaxyBtn: 'Galaktika xaritasi',
      coreReady: 'Core tayyor · Sinxron',
      coreCaption: 'Jonli mantiq yadrosi',
      gamesHeading: 'Oltita dasturlash oʻyini',
      gamesLead: 'Har biri 5 ta bosqich va haqiqiy Python kodi bilan.',
      playNow: 'Ochish',
      comingStage: 'Yaqinda ishga tushadi',
      soundOn: 'Ovoz yoniq',
      soundOff: 'Ovoz oʻchiq',
      xpLabel: 'XP',
      streakLabel: 'kun',
      resetTitle: 'Qaytadan boshlaymizmi?',
      resetBody:
        'Barcha XP, yulduzlar va ochilgan Python kodlari tozalanadi. Bu amalni ortga qaytarib boʻlmaydi.',
      resetConfirm: 'Ha, tozalash',
      resetCancel: 'Bekor qilish',
      resetDone: 'Progress tozalandi. Yangi start!',
      holdHint: 'Logotipni 3 soniya bosib tursang, progress tozalanadi',
      galaxyHeading: 'Bilim Galaktikasi',
      galaxyLead: 'Uchta yulduz turkumi boʻylab yoʻlingni och.',
      rewardsHeading: 'Yutuqlar va nishonlar',
      rewardsLead: 'Har bir gʻalaba, xatoni tuzatish va sinov senga nishon beradi.',
      whyHeading: 'Nima uchun bu usul ishlaydi?',
      whyLead: 'Oʻqish emas — bashorat qilish, sinash va darhol natijani koʻrish.',
      backHome: 'Bosh sahifaga qaytish',
    },
    'uz-Cyrl': {
      brandName: 'Ўйна ва ўрган',
      brandTag: 'Алгоритм Устахонаси',
      skipToMain: 'Асосий қисмга ўтиш',
      introTitle: 'Код — мантиқ ўйини',
      introSub: 'Аввал ўйна, кузат ва натижани ўзинг бошқар',
      introSkip: 'Ўтказиб юбориш',
      searchPlaceholder: 'Ўйин ёки тушунча қидириш…',
      dockHome: 'Бош саҳифа',
      dockGalaxy: 'Галактика',
      dockGames: 'Ўйинлар',
      dockRewards: 'Ютуқлар',
      dockWhy: 'Нима учун?',
      heroEyebrow: '80% амалий ўйин · 20% аниқ тушунча',
      heroTitle: 'Дастурлашни ўйнаб ҳис қил',
      heroSub:
        'Ҳар бир топшириқда код қандай ишлашини ўз қўлинг билан синаб кўрасан. Ҳарфлар ортида тирик мантиқ бор.',
      heroPrimary: 'Ўйнашни бошлаш',
      heroContinue: 'Давом эттириш',
      heroGalaxyBtn: 'Галактика харитаси',
      coreReady: 'Core тайёр · Синхрон',
      coreCaption: 'Жонли мантиқ ядроси',
      gamesHeading: 'Олтита дастурлаш ўйини',
      gamesLead: 'Ҳар бири 5 та босқич ва ҳақиқий Python коди билан.',
      playNow: 'Очиш',
      comingStage: 'Яқинда ишга тушади',
      soundOn: 'Овоз ёниқ',
      soundOff: 'Овоз ўчиқ',
      xpLabel: 'XP',
      streakLabel: 'кун',
      resetTitle: 'Қайтадан бошлаймизми?',
      resetBody:
        'Барча XP, юлдузлар ва очилган Python кодлари тозаланади. Бу амални ортга қайтариб бўлмайди.',
      resetConfirm: 'Ҳа, тозалаш',
      resetCancel: 'Бекор қилиш',
      resetDone: 'Прогресс тозаланди. Янги старт!',
      holdHint: 'Логотипни 3 сония босиб турсанг, прогресс тозаланади',
      galaxyHeading: 'Билим Галактикаси',
      galaxyLead: 'Учта юлдуз туркуми бўйлаб йўлингни оч.',
      rewardsHeading: 'Ютуқлар ва нишонлар',
      rewardsLead: 'Ҳар бир ғалаба, хатони тузатиш ва синов сенга нишон беради.',
      whyHeading: 'Нима учун бу усул ишлайди?',
      whyLead: 'Ўқиш эмас — башорат қилиш, синаш ва дарҳол натижани кўриш.',
      backHome: 'Бош саҳифага қайтиш',
    },
  };

  function getScript() {
    if (PL.store && PL.store.get) {
      return PL.store.get().script || 'uz-Latn';
    }
    return 'uz-Latn';
  }

  function pick(value) {
    if (typeof value === 'string') return value;
    if (!value) return '';
    var script = getScript();
    return value[script === 'uz-Cyrl' ? 'cyrl' : 'latn'] || value.latn || '';
  }

  function t(key) {
    var script = getScript();
    var table = DICT[script] || DICT['uz-Latn'];
    return table[key] || DICT['uz-Latn'][key] || key;
  }

  function normalizeSearch(raw) {
    return String(raw || '')
      .trim()
      .toLowerCase()
      .replace(/[\u0027\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g, "'")
      .replace(/\s+/g, ' ');
  }

  function applyStaticText(container) {
    var scope = container || document;
    var nodes = scope.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i += 1) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    }
    document.documentElement.lang = getScript() === 'uz-Cyrl' ? 'uz-Cyrl' : 'uz';
  }

  PL.i18n = {
    t: t,
    pick: pick,
    getScript: getScript,
    normalizeSearch: normalizeSearch,
    applyStaticText: applyStaticText,
  };
})(window);
