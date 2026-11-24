/**
 * Pure static curriculum and game catalog data (window.PL_DATA).
 * Zero JSON fetch() calls; directly compatible with file:// execution.
 */
(function (root) {
  'use strict';

  var GAMES = [
    {
      id: 'maze',
      constellation: 'algoritm',
      icon: 'compass',
      accent: 'cyan',
      levelsCount: 5,
      title: { latn: 'Algoritm labirinti', cyrl: 'Алгоритм лабиринти' },
      tagline: {
        latn: 'Mayoq chiroqlarini aniq qadamlar bilan yoq.',
        cyrl: 'Маёқ чироқларини аниқ қадамлар билан ёқ.',
      },
      concept: { latn: 'Ketma-ketlik · Funksiya', cyrl: 'Кетма-кетлик · Функция' },
      samplePy: 'oldinga(2)\nongga_buril()\nyoq()',
    },
    {
      id: 'loop',
      constellation: 'sikl',
      icon: 'repeat',
      accent: 'indigo',
      levelsCount: 5,
      title: { latn: 'Sikl fabrikasi', cyrl: 'Цикл фабрикаси' },
      tagline: {
        latn: 'Takroriy naqshni qisqa sikl bilan yigʻ.',
        cyrl: 'Такрорий нақшни қисқа цикл билан йиғ.',
      },
      concept: { latn: 'Takrorlash · Sikl', cyrl: 'Такрорлаш · Цикл' },
      samplePy: 'for i in range(4):\n    qoy("kok")',
    },
    {
      id: 'gates',
      constellation: 'mantiq',
      icon: 'git-branch',
      accent: 'violet',
      levelsCount: 5,
      title: { latn: 'Shart darvozalari', cyrl: 'Шарт дарвозалари' },
      tagline: {
        latn: 'Signalni toʻgʻri yoʻlakka shart orqali bur.',
        cyrl: 'Сигнални тўғри йўлакка шарт орқали бур.',
      },
      concept: { latn: 'Agar / Aks holda', cyrl: 'Агар / Акс ҳолда' },
      samplePy: 'if rang == "kok":\n    chapga()',
    },
    {
      id: 'vars',
      constellation: 'mantiq',
      icon: 'box',
      accent: 'emerald',
      levelsCount: 5,
      title: { latn: 'Oʻzgaruvchi qutilari', cyrl: 'Ўзгарувчи қутилари' },
      tagline: {
        latn: 'Shisha qutidagi qiymat qanday almashishini bashorat qil.',
        cyrl: 'Шиша қутидаги қиймат қандай алмашишини башорат қил.',
      },
      concept: { latn: 'Xotira · Qiymat', cyrl: 'Хотира · Қиймат' },
      samplePy: 'ball = 10\nball = ball + 5',
    },
    {
      id: 'bug',
      constellation: 'algoritm',
      icon: 'bug',
      accent: 'rose',
      levelsCount: 5,
      title: { latn: 'Xato ovchisi', cyrl: 'Хато овчиси' },
      tagline: {
        latn: 'Koddan xato qatorni qoʻling bilan tutib tuzat.',
        cyrl: 'Коддан хато қаторни қўлинг билан тутиб тузат.',
      },
      concept: { latn: 'Tahlil · Tuzatish', cyrl: 'Таҳлил · Тузатиш' },
      samplePy: 'for i in range(1, 6):\n    print(i)',
    },
    {
      id: 'binary',
      constellation: 'sikl',
      icon: 'cpu',
      accent: 'amber',
      levelsCount: 5,
      title: { latn: 'Bit reaktori', cyrl: 'Бит реактори' },
      tagline: {
        latn: '1 va 0 chiroqlarini yoqib kerakli sonni yigʻ.',
        cyrl: '1 ва 0 чироқларини ёқиб керакли сонни йиғ.',
      },
      concept: { latn: 'Ikkilik sanoq · Bit', cyrl: 'Иккилик саноқ · Бит' },
      samplePy: 'son = 0b00101010\nprint(son)  # 42',
    },
  ];

  var CONSTELLATIONS = [
    {
      id: 'algoritm',
      title: { latn: 'Algoritm yulduzlari', cyrl: 'Алгоритм юлдузлари' },
      desc: {
        latn: 'Qadamlar tartibi va koddagi xatoni topish sanʼati.',
        cyrl: 'Қадамлар тартиби ва коддаги хатони топиш санъати.',
      },
    },
    {
      id: 'mantiq',
      title: { latn: 'Mantiq va Xotira', cyrl: 'Мантиқ ва Хотира' },
      desc: {
        latn: 'Shart darvozalari hamda oʻzgaruvchi qutilari.',
        cyrl: 'Шарт дарвозалари ҳамда ўзгарувчи қутилари.',
      },
    },
    {
      id: 'sikl',
      title: { latn: 'Sikl va Bitlar', cyrl: 'Цикл ва Битлар' },
      desc: {
        latn: 'Qisqa takrorlashlar va kompyuterning 1/0 tili.',
        cyrl: 'Қисқа такрорлашлар ва компьютернинг 1/0 тили.',
      },
    },
  ];

  var PRINCIPLES = [
    {
      icon: 'eye',
      title: { latn: 'Avval bashorat, keyin tekshiruv', cyrl: 'Аввал башорат, кейин текширув' },
      body: {
        latn: 'Natijani oldindan taxmin qilish miyani faollashtiradi va eslab qolishni kuchaytiradi.',
        cyrl: 'Натижани олдиндан тахмин қилиш мияни фаоллаштиради ва эслаб қолишни кучайтиради.',
      },
    },
    {
      icon: 'zap',
      title: { latn: 'Darhol vizual javob', cyrl: 'Дарҳол визуал жавоб' },
      body: {
        latn: 'Xato boʻlsa ham jarayon toʻxtamaydi — aynan qaysi qadam sabab boʻlgani koʻrinadi.',
        cyrl: 'Хато бўлса ҳам жараён тўхтамайди — айнан қайси қадам сабаб бўлгани кўринади.',
      },
    },
    {
      icon: 'layers',
      title: { latn: 'Oʻyindan haqiqiy Python kodiga', cyrl: 'Ўйиндан ҳақиқий Python кодига' },
      body: {
        latn: 'Har bir bosqich yakunida yechiming haqiqiy Python kodiga aylanadi.',
        cyrl: 'Ҳар бир босқич якунида ечиминг ҳақиқий Python кодига айланади.',
      },
    },
  ];

  root.PL_DATA = {
    games: GAMES,
    constellations: CONSTELLATIONS,
    principles: PRINCIPLES,
  };
})(window);
