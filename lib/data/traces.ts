/**
 * Data-driven execution traces for "Mirzo mashinasi" (TraceMachine).
 * Zero runtime eval/interpreter: every frame is authored in data and verified by node:test execution parity.
 */

import { lt, type LocalizedText } from '../engine/i18n';

export type TraceVarValue = string | number | boolean;

export interface TracePredictionGate {
  prompt: LocalizedText;
  varName: string;
  options: string[];
  correctValue: string;
}

export interface TraceFrame {
  /** 1-based line number in codeLines */
  line: number;
  vars: Record<string, TraceVarValue>;
  changedVars: string[];
  output: string[];
  note: LocalizedText;
  predictionGate?: TracePredictionGate;
}

export interface TraceProgram {
  id: string;
  title: LocalizedText;
  codeLines: string[];
  pythonLines: string[];
  frames: TraceFrame[];
}

export const TRACE_PROGRAMS: Record<string, TraceProgram> = {
  'trace-var-overwrite': {
    id: 'trace-var-overwrite',
    title: lt('Quti qiymatining yangilanishi', 'Қути қийматининг янгиланиши'),
    codeLines: ['x = 5', 'x = 8', 'chopEt(x)'],
    pythonLines: ['x = 5', 'x = 8', 'print(x)'],
    frames: [
      {
        line: 1,
        vars: { x: 5 },
        changedVars: ['x'],
        output: [],
        note: lt(
          'x nomli qutiga 5 soni joylandi.',
          'x номли қутига 5 сони жойланди.'
        ),
        predictionGate: {
          prompt: lt('2-qatordan keyin x qutisida nima boʻladi?', '2-қатордан кейин x қутисида нима бўлади?'),
          varName: 'x',
          options: ['5', '8', '13'],
          correctValue: '8',
        },
      },
      {
        line: 2,
        vars: { x: 8 },
        changedVars: ['x'],
        output: [],
        note: lt(
          'Eski 5 chiqib ketdi, oʻrniga 8 yozildi.',
          'Эски 5 чиқиб кетди, ўрнига 8 ёзилди.'
        ),
      },
      {
        line: 3,
        vars: { x: 8 },
        changedVars: [],
        output: ['8'],
        note: lt(
          'chopEt(x) ekranga oxirgi qiymatni — 8 ni chiqaradi.',
          'chopEt(x) экранга охирги қийматни — 8 ни чиқаради.'
        ),
      },
    ],
  },

  'trace-var-copy': {
    id: 'trace-var-copy',
    title: lt('Nusxa koʻchirish: a = b', 'Нусха кўчириш: a = b'),
    codeLines: ['a = 10', 'b = 20', 'a = b', 'b = 99', 'chopEt(a)'],
    pythonLines: ['a = 10', 'b = 20', 'a = b', 'b = 99', 'print(a)'],
    frames: [
      {
        line: 1,
        vars: { a: 10 },
        changedVars: ['a'],
        output: [],
        note: lt('a qutisiga 10 qoʻyildi.', 'a қутисига 10 қўйилди.'),
      },
      {
        line: 2,
        vars: { a: 10, b: 20 },
        changedVars: ['b'],
        output: [],
        note: lt('b qutisiga 20 qoʻyildi.', 'b қутисига 20 қўйилди.'),
      },
      {
        line: 3,
        vars: { a: 20, b: 20 },
        changedVars: ['a'],
        output: [],
        note: lt(
          'b ning qiymati (20) a ga bir marta nusxalandi.',
          'b нинг қиймати (20) a га бир марта нусхаланди.'
        ),
        predictionGate: {
          prompt: lt('b = 99 boʻlgach, a nechaga teng boʻladi?', 'b = 99 бўлгач, a нечага тенг бўлади?'),
          varName: 'a',
          options: ['10', '20', '99'],
          correctValue: '20',
        },
      },
      {
        line: 4,
        vars: { a: 20, b: 99 },
        changedVars: ['b'],
        output: [],
        note: lt(
          'Faqat b oʻzgardi. a qutisi b ga bogʻlanib qolmagan!',
          'Фақат b ўзгарди. a қутиси b га боғланиб қолмаган!'
        ),
      },
      {
        line: 5,
        vars: { a: 20, b: 99 },
        changedVars: [],
        output: ['20'],
        note: lt('Ekranga 20 chiqadi.', 'Экранга 20 чиқади.'),
      },
    ],
  },

  'trace-var-increment': {
    id: 'trace-var-increment',
    title: lt('Oʻzini yangilash: x = x + 1', 'Ўзини янгилаш: x = x + 1'),
    codeLines: ['x = 4', 'x = x + 1', 'chopEt(x)'],
    pythonLines: ['x = 4', 'x = x + 1', 'print(x)'],
    frames: [
      {
        line: 1,
        vars: { x: 4 },
        changedVars: ['x'],
        output: [],
        note: lt('x qutisida hozir 4 bor.', 'x қутисида ҳозир 4 бор.'),
        predictionGate: {
          prompt: lt('x = x + 1 bajarilgach, x nechaga teng boʻladi?', 'x = x + 1 бажарилгач, x нечага тенг бўлади?'),
          varName: 'x',
          options: ['4', '5', 'Xato beradi'],
          correctValue: '5',
        },
      },
      {
        line: 2,
        vars: { x: 5 },
        changedVars: ['x'],
        output: [],
        note: lt(
          'Avval oʻng tomon hisoblanadi: 4 + 1 = 5. Soʻng x ga yoziladi.',
          'Аввал ўнг томон ҳисобланади: 4 + 1 = 5. Сўнг x га ёзилади.'
        ),
      },
      {
        line: 3,
        vars: { x: 5 },
        changedVars: [],
        output: ['5'],
        note: lt('Natija: 5.', 'Натижа: 5.'),
      },
    ],
  },

  'trace-log-1': {
    id: 'trace-log-1',
    title: lt('x = x + 3 qadam-ba-qadam', 'x = x + 3 қадам-ба-қадам'),
    codeLines: ['x = 5', 'x = x + 3', 'chopEt(x)'],
    pythonLines: ['x = 5', 'x = x + 3', 'print(x)'],
    frames: [
      {
        line: 1,
        vars: { x: 5 },
        changedVars: ['x'],
        output: [],
        note: lt('x qutisiga 5 yozildi.', 'x қутисига 5 ёзилди.'),
      },
      {
        line: 2,
        vars: { x: 8 },
        changedVars: ['x'],
        output: [],
        note: lt('5 + 3 = 8 hisoblanib, x ga saqlandi.', '5 + 3 = 8 ҳисобланиб, x га сақланди.'),
      },
      {
        line: 3,
        vars: { x: 8 },
        changedVars: [],
        output: ['8'],
        note: lt('chopEt(x) ekranga 8 chiqaradi.', 'chopEt(x) экранга 8 чиқаради.'),
      },
    ],
  },

  'trace-if-boundary': {
    id: 'trace-if-boundary',
    title: lt('Chegara sharti: yosh >= 12', 'Чегара шарти: yosh >= 12'),
    codeLines: [
      'yosh = 12',
      'agar (yosh >= 12) {',
      '  chopEt("Ruxsat")',
      '} aks holda {',
      '  chopEt("Kuting")',
      '}',
    ],
    pythonLines: [
      'yosh = 12',
      'if yosh >= 12:',
      '    print("Ruxsat")',
      'else:',
      '    print("Kuting")',
      '# shart tugadi',
    ],
    frames: [
      {
        line: 1,
        vars: { yosh: 12 },
        changedVars: ['yosh'],
        output: [],
        note: lt('yosh qutisi 12 ga teng.', 'yosh қутиси 12 га тенг.'),
      },
      {
        line: 2,
        vars: { yosh: 12 },
        changedVars: [],
        output: [],
        note: lt('12 >= 12 rost! Ikkinchi tarmoq tashlab ketiladi.', '12 >= 12 рост! Иккинчи тармоқ ташлаб кетилади.'),
      },
      {
        line: 3,
        vars: { yosh: 12 },
        changedVars: [],
        output: ['Ruxsat'],
        note: lt('Faqat "Ruxsat" chop etiladi.', 'Фақат "Ruxsat" чоп этилади.'),
      },
    ],
  },

  'trace-log-3': {
    id: 'trace-log-3',
    title: lt('Aks holda tarmogʻi', 'Акс ҳолда тармоғи'),
    codeLines: [
      'ball = 45',
      'agar (ball >= 50) {',
      '  chopEt("Oʻtdi")',
      '} aks holda {',
      '  chopEt("Qayta urin")',
      '}',
    ],
    pythonLines: [
      'ball = 45',
      'if ball >= 50:',
      '    print("Oʻtdi")',
      'else:',
      '    print("Qayta urin")',
      '# tugadi',
    ],
    frames: [
      {
        line: 1,
        vars: { ball: 45 },
        changedVars: ['ball'],
        output: [],
        note: lt('ball qutisiga 45 yozildi.', 'ball қутисига 45 ёзилди.'),
      },
      {
        line: 2,
        vars: { ball: 45 },
        changedVars: [],
        output: [],
        note: lt('45 >= 50 yolgʻon! Mashina aks holda ga sakraydi.', '45 >= 50 ёлғон! Машина акс ҳолда га сакрайди.'),
      },
      {
        line: 5,
        vars: { ball: 45 },
        changedVars: [],
        output: ['Qayta urin'],
        note: lt('"Qayta urin" chop etiladi.', '"Qayta urin" чоп этилади.'),
      },
    ],
  },

  'trace-log-4': {
    id: 'trace-log-4',
    title: lt('VA (&&) sharti', 'ВА (&&) шарти'),
    codeLines: [
      'yomgir = true',
      'soyabon = false',
      'agar (yomgir && soyabon) {',
      '  chopEt("Quruq")',
      '} aks holda {',
      '  chopEt("Nam")',
      '}',
    ],
    pythonLines: [
      'yomgir = True',
      'soyabon = False',
      'if yomgir and soyabon:',
      '    print("Quruq")',
      'else:',
      '    print("Nam")',
      '# tugadi',
    ],
    frames: [
      {
        line: 1,
        vars: { yomgir: true },
        changedVars: ['yomgir'],
        output: [],
        note: lt('yomgir qutisi true.', 'yomgir қутиси true.'),
      },
      {
        line: 2,
        vars: { yomgir: true, soyabon: false },
        changedVars: ['soyabon'],
        output: [],
        note: lt('soyabon qutisi false.', 'soyabon қутиси false.'),
      },
      {
        line: 3,
        vars: { yomgir: true, soyabon: false },
        changedVars: [],
        output: [],
        note: lt(
          '&& ikkalasi ham true boʻlishini soʻraydi. Biri false — demak yolgʻon!',
          '&& иккаласи ҳам true бўлишини сўрайди. Бири false — демак ёлғон!'
        ),
      },
      {
        line: 6,
        vars: { yomgir: true, soyabon: false },
        changedVars: [],
        output: ['Nam'],
        note: lt('aks holda ishlab, "Nam" chiqadi.', 'акс ҳолда ишлаб, "Nam" чиқади.'),
      },
    ],
  },

  'trace-log-5': {
    id: 'trace-log-5',
    title: lt('YOKI (||) sharti', 'ЁКИ (||) шарти'),
    codeLines: [
      'damOlish = false',
      'bayram = true',
      'agar (damOlish || bayram) {',
      '  chopEt("Taʼtil")',
      '} aks holda {',
      '  chopEt("Dars")',
      '}',
    ],
    pythonLines: [
      'dam_olish = False',
      'bayram = True',
      'if dam_olish or bayram:',
      '    print("Taʼtil")',
      'else:',
      '    print("Dars")',
      '# tugadi',
    ],
    frames: [
      {
        line: 1,
        vars: { damOlish: false },
        changedVars: ['damOlish'],
        output: [],
        note: lt('damOlish = false.', 'damOlish = false.'),
      },
      {
        line: 2,
        vars: { damOlish: false, bayram: true },
        changedVars: ['bayram'],
        output: [],
        note: lt('bayram = true.', 'bayram = true.'),
      },
      {
        line: 3,
        vars: { damOlish: false, bayram: true },
        changedVars: [],
        output: [],
        note: lt(
          '|| uchun kamida bitta true yetarli. bayram = true, demak rost!',
          '|| учун камида битта true етарли. bayram = true, демак рост!'
        ),
      },
      {
        line: 4,
        vars: { damOlish: false, bayram: true },
        changedVars: [],
        output: ['Taʼtil'],
        note: lt('"Taʼtil" chop etiladi.', '"Taʼtil" чоп этилади.'),
      },
    ],
  },

  'trace-log-6': {
    id: 'trace-log-6',
    title: lt('Qoldiq (%) tekshiruvi', 'Қолдиқ (%) текшируви'),
    codeLines: [
      'son = 14',
      'agar (son % 2 == 0) {',
      '  chopEt("Juft")',
      '} aks holda {',
      '  chopEt("Toq")',
      '}',
    ],
    pythonLines: [
      'son = 14',
      'if son % 2 == 0:',
      '    print("Juft")',
      'else:',
      '    print("Toq")',
      '# tugadi',
    ],
    frames: [
      {
        line: 1,
        vars: { son: 14 },
        changedVars: ['son'],
        output: [],
        note: lt('son qutisida 14 bor.', 'son қутисида 14 бор.'),
      },
      {
        line: 2,
        vars: { son: 14 },
        changedVars: [],
        output: [],
        note: lt('14 ni 2 ga boʻlganda qoldiq 0 chiqadi. 0 == 0 rost!', '14 ни 2 га бўлганда қолдиқ 0 чиқади. 0 == 0 рост!'),
      },
      {
        line: 3,
        vars: { son: 14 },
        changedVars: [],
        output: ['Juft'],
        note: lt('"Juft" chop etiladi.', '"Juft" чоп этилади.'),
      },
    ],
  },

  'trace-log-7': {
    id: 'trace-log-7',
    title: lt('Shart ichida oʻzgarish', 'Шарт ичида ўзгариш'),
    codeLines: [
      'a = 10',
      'b = 20',
      'agar (a > 5) {',
      '  a = a + b',
      '}',
      'chopEt(a)',
    ],
    pythonLines: [
      'a = 10',
      'b = 20',
      'if a > 5:',
      '    a = a + b',
      '# shart tugadi',
      'print(a)',
    ],
    frames: [
      {
        line: 1,
        vars: { a: 10 },
        changedVars: ['a'],
        output: [],
        note: lt('a = 10.', 'a = 10.'),
      },
      {
        line: 2,
        vars: { a: 10, b: 20 },
        changedVars: ['b'],
        output: [],
        note: lt('b = 20.', 'b = 20.'),
      },
      {
        line: 3,
        vars: { a: 10, b: 20 },
        changedVars: [],
        output: [],
        note: lt('10 > 5 rost. Blok ichiga kiramiz.', '10 > 5 рост. Блок ичига кирамиз.'),
      },
      {
        line: 4,
        vars: { a: 30, b: 20 },
        changedVars: ['a'],
        output: [],
        note: lt('a = 10 + 20 = 30.', 'a = 10 + 20 = 30.'),
      },
      {
        line: 6,
        vars: { a: 30, b: 20 },
        changedVars: [],
        output: ['30'],
        note: lt('a ning yangi qiymati 30 chiqadi.', 'a нинг янги қиймати 30 чиқади.'),
      },
    ],
  },

  'trace-log-8': {
    id: 'trace-log-8',
    title: lt('Zanjirli shartlar', 'Занжирли шартлар'),
    codeLines: [
      'harorat = 32',
      'agar (harorat > 35) {',
      '  chopEt("Juda issiq")',
      '} aks holda agar (harorat > 20) {',
      '  chopEt("Iliq")',
      '} aks holda {',
      '  chopEt("Salqin")',
      '}',
    ],
    pythonLines: [
      'harorat = 32',
      'if harorat > 35:',
      '    print("Juda issiq")',
      'elif harorat > 20:',
      '    print("Iliq")',
      'else:',
      '    print("Salqin")',
      '# tugadi',
    ],
    frames: [
      {
        line: 1,
        vars: { harorat: 32 },
        changedVars: ['harorat'],
        output: [],
        note: lt('harorat = 32.', 'harorat = 32.'),
      },
      {
        line: 2,
        vars: { harorat: 32 },
        changedVars: [],
        output: [],
        note: lt('32 > 35 yolgʻon. Keyingi shartga oʻtamiz.', '32 > 35 ёлғон. Кейинги шартга ўтамиз.'),
      },
      {
        line: 4,
        vars: { harorat: 32 },
        changedVars: [],
        output: [],
        note: lt('32 > 20 rost! Shu tarmoq tanlanadi, qolgani oʻtiladi.', '32 > 20 рост! Шу тармоқ танланади, қолгани ўтилади.'),
      },
      {
        line: 5,
        vars: { harorat: 32 },
        changedVars: [],
        output: ['Iliq'],
        note: lt('"Iliq" chop etiladi.', '"Iliq" чоп этилади.'),
      },
    ],
  },

  'trace-log-9': {
    id: 'trace-log-9',
    title: lt('Ketma-ket tanga amallari', 'Кетма-кет танга амаллари'),
    codeLines: ['tanga = 10', 'tanga *= 2', 'tanga -= 5', 'chopEt(tanga)'],
    pythonLines: ['tanga = 10', 'tanga *= 2', 'tanga -= 5', 'print(tanga)'],
    frames: [
      {
        line: 1,
        vars: { tanga: 10 },
        changedVars: ['tanga'],
        output: [],
        note: lt('tanga = 10.', 'tanga = 10.'),
      },
      {
        line: 2,
        vars: { tanga: 20 },
        changedVars: ['tanga'],
        output: [],
        note: lt('10 * 2 = 20.', '10 * 2 = 20.'),
      },
      {
        line: 3,
        vars: { tanga: 15 },
        changedVars: ['tanga'],
        output: [],
        note: lt('20 - 5 = 15.', '20 - 5 = 15.'),
      },
      {
        line: 4,
        vars: { tanga: 15 },
        changedVars: [],
        output: ['15'],
        note: lt('Yakuniy qiymat: 15.', 'Якуний қиймат: 15.'),
      },
    ],
  },

  'trace-log-10': {
    id: 'trace-log-10',
    title: lt('Inkor operatori (!)', 'Инкор оператори (!)'),
    codeLines: ['qulflangan = false', 'kirish = !qulflangan', 'chopEt(kirish)'],
    pythonLines: ['qulflangan = False', 'kirish = not qulflangan', 'print(kirish)'],
    frames: [
      {
        line: 1,
        vars: { qulflangan: false },
        changedVars: ['qulflangan'],
        output: [],
        note: lt('qulflangan = false.', 'qulflangan = false.'),
      },
      {
        line: 2,
        vars: { qulflangan: false, kirish: true },
        changedVars: ['kirish'],
        output: [],
        note: lt('!false teskarisiga aylanib true boʻladi.', '!false тескарисига айланиб true бўлади.'),
      },
      {
        line: 3,
        vars: { qulflangan: false, kirish: true },
        changedVars: [],
        output: ['true'],
        note: lt('Ekranga true chiqadi.', 'Экранга true чиқади.'),
      },
    ],
  },

  'trace-loop-1': {
    id: 'trace-loop-1',
    title: lt('3 marta sanash sikli', '3 марта санаш цикли'),
    codeLines: [
      'sanoq = 0',
      '3 marta takrorla {',
      '  sanoq = sanoq + 1',
      '}',
      'chopEt(sanoq)',
    ],
    pythonLines: [
      'sanoq = 0',
      'for _ in range(3):',
      '    sanoq = sanoq + 1',
      '# sikl tugadi',
      'print(sanoq)',
    ],
    frames: [
      {
        line: 1,
        vars: { sanoq: 0 },
        changedVars: ['sanoq'],
        output: [],
        note: lt('Boshlangʻich qiymat 0.', 'Бошланғич қиймат 0.'),
      },
      {
        line: 3,
        vars: { sanoq: 1 },
        changedVars: ['sanoq'],
        output: [],
        note: lt('1-aylanish: sanoq = 1.', '1-айланиш: sanoq = 1.'),
      },
      {
        line: 3,
        vars: { sanoq: 2 },
        changedVars: ['sanoq'],
        output: [],
        note: lt('2-aylanish: sanoq = 2.', '2-айланиш: sanoq = 2.'),
      },
      {
        line: 3,
        vars: { sanoq: 3 },
        changedVars: ['sanoq'],
        output: [],
        note: lt('3-aylanish: sanoq = 3.', '3-айланиш: sanoq = 3.'),
      },
      {
        line: 5,
        vars: { sanoq: 3 },
        changedVars: [],
        output: ['3'],
        note: lt('Sikl tugadi, ekranga 3 chiqadi.', 'Цикл тугади, экранга 3 чиқади.'),
      },
    ],
  },

  'trace-loop-infinite': {
    id: 'trace-loop-infinite',
    title: lt('Cheksiz sikl nega toʻxtamaydi?', 'Чексиз цикл нега тўхтамайди?'),
    codeLines: [
      'i = 1',
      'toki (i <= 5) {',
      '  chopEt(i)',
      '  i = i - 1',
      '}',
    ],
    pythonLines: [
      'i = 1',
      'while i <= 5:',
      '    print(i)',
      '    i = i - 1',
      '# hech qachon tugamaydi!',
    ],
    frames: [
      {
        line: 1,
        vars: { i: 1 },
        changedVars: ['i'],
        output: [],
        note: lt('i = 1 bilan boshlandi.', 'i = 1 билан бошланди.'),
      },
      {
        line: 3,
        vars: { i: 1 },
        changedVars: [],
        output: ['1'],
        note: lt('1 <= 5 rost, 1 chop etildi.', '1 <= 5 рост, 1 чоп этилди.'),
      },
      {
        line: 4,
        vars: { i: 0 },
        changedVars: ['i'],
        output: ['1'],
        note: lt('Xato qator! i koʻpayish oʻrniga 0 ga kamaydi.', 'Хато қатор! i кўпайиш ўрнига 0 га камайди.'),
      },
      {
        line: 3,
        vars: { i: 0 },
        changedVars: [],
        output: ['1', '0'],
        note: lt('0 <= 5 ham rost! Sikl 5 ga yetmay, manfiyga ketaveradi.', '0 <= 5 ҳам рост! Цикл 5 га етмай, манфийга кетаверади.'),
      },
      {
        line: 4,
        vars: { i: -1 },
        changedVars: ['i'],
        output: ['1', '0'],
        note: lt('Toʻxtatish uchun 4-qator i = i + 1 boʻlishi kerak edi.', 'Тўхтатиш учун 4-қатор i = i + 1 бўлиши керак эди.'),
      },
    ],
  },

  'trace-loop-sum': {
    id: 'trace-loop-sum',
    title: lt('1 dan 4 gacha yigʻindi', '1 дан 4 гача йиғинди'),
    codeLines: [
      'yigindi = 0',
      'uchun i = 1 dan 4 gacha {',
      '  yigindi = yigindi + i',
      '}',
      'chopEt(yigindi)',
    ],
    pythonLines: [
      'yigindi = 0',
      'for i in range(1, 5):',
      '    yigindi = yigindi + i',
      '# sikl tugadi',
      'print(yigindi)',
    ],
    frames: [
      {
        line: 1,
        vars: { yigindi: 0 },
        changedVars: ['yigindi'],
        output: [],
        note: lt('yigindi = 0.', 'yigindi = 0.'),
      },
      {
        line: 3,
        vars: { yigindi: 1, i: 1 },
        changedVars: ['yigindi', 'i'],
        output: [],
        note: lt('i = 1: 0 + 1 = 1.', 'i = 1: 0 + 1 = 1.'),
      },
      {
        line: 3,
        vars: { yigindi: 3, i: 2 },
        changedVars: ['yigindi', 'i'],
        output: [],
        note: lt('i = 2: 1 + 2 = 3.', 'i = 2: 1 + 2 = 3.'),
      },
      {
        line: 3,
        vars: { yigindi: 6, i: 3 },
        changedVars: ['yigindi', 'i'],
        output: [],
        note: lt('i = 3: 3 + 3 = 6.', 'i = 3: 3 + 3 = 6.'),
        predictionGate: {
          prompt: lt('Oxirgi qadamda i = 4 qoʻshilgach, yigindi nechchi boʻladi?', 'Охирги қадамда i = 4 қўшилгач, yigindi неччи бўлади?'),
          varName: 'yigindi',
          options: ['6', '9', '10'],
          correctValue: '10',
        },
      },
      {
        line: 3,
        vars: { yigindi: 10, i: 4 },
        changedVars: ['yigindi', 'i'],
        output: [],
        note: lt('i = 4: 6 + 4 = 10.', 'i = 4: 6 + 4 = 10.'),
      },
      {
        line: 5,
        vars: { yigindi: 10, i: 4 },
        changedVars: [],
        output: ['10'],
        note: lt('chopEt(yigindi) ekranga 10 chiqaradi.', 'chopEt(yigindi) экранга 10 чиқаради.'),
      },
    ],
  },

  'trace-loop-4': {
    id: 'trace-loop-4',
    title: lt('Nega toq sonlar chiqib qoldi?', 'Нега тоқ сонлар чиқиб қолди?'),
    codeLines: [
      'uchun son = 1 dan 4 gacha {',
      '  agar (son % 2 == 1) {',
      '    chopEt(son)',
      '  }',
      '}',
    ],
    pythonLines: [
      'for son in range(1, 5):',
      '    if son % 2 == 1:',
      '        print(son)',
      '    # tekshiruv tugadi',
      '# sikl tugadi',
    ],
    frames: [
      {
        line: 2,
        vars: { son: 1 },
        changedVars: ['son'],
        output: [],
        note: lt('son = 1: 1 % 2 = 1. Shart rost!', 'son = 1: 1 % 2 = 1. Шарт рост!'),
      },
      {
        line: 3,
        vars: { son: 1 },
        changedVars: [],
        output: ['1'],
        note: lt('1 — toq son, lekin ekranga chiqdi!', '1 — тоқ сон, лекин экранга чиқди!'),
      },
      {
        line: 2,
        vars: { son: 2 },
        changedVars: ['son'],
        output: ['1'],
        note: lt('son = 2: 2 % 2 = 0. 0 == 1 yolgʻon — juft son tashlab ketildi!', 'son = 2: 2 % 2 = 0. 0 == 1 ёлғон — жуфт сон ташлаб кетилди!'),
      },
      {
        line: 2,
        vars: { son: 3 },
        changedVars: ['son'],
        output: ['1'],
        note: lt('son = 3: 3 % 2 = 1. Shart yana rost!', 'son = 3: 3 % 2 = 1. Шарт яна рост!'),
      },
      {
        line: 3,
        vars: { son: 3 },
        changedVars: [],
        output: ['1', '3'],
        note: lt('3 ham toq son, ekranga 1 va 3 chiqdi!', '3 ҳам тоқ сон, экранга 1 ва 3 чиқди!'),
      },
      {
        line: 2,
        vars: { son: 4 },
        changedVars: ['son'],
        output: ['1', '3'],
        note: lt('son = 4: 4 % 2 = 0 — juft son yana chiqmadi. Demak == 1 oʻrniga == 0 kerak!', 'son = 4: 4 % 2 = 0 — жуфт сон яна чиқмади. Демак == 1 ўрнига == 0 керак!'),
      },
    ],
  },

  'trace-loop-5': {
    id: 'trace-loop-5',
    title: lt('Ikki barobar oʻsish', 'Икки баробар ўсиш'),
    codeLines: [
      'natija = 2',
      '3 marta takrorla {',
      '  natija = natija * 2',
      '}',
      'chopEt(natija)',
    ],
    pythonLines: [
      'natija = 2',
      'for _ in range(3):',
      '    natija = natija * 2',
      '# sikl tugadi',
      'print(natija)',
    ],
    frames: [
      {
        line: 1,
        vars: { natija: 2 },
        changedVars: ['natija'],
        output: [],
        note: lt('natija = 2.', 'natija = 2.'),
      },
      {
        line: 3,
        vars: { natija: 4 },
        changedVars: ['natija'],
        output: [],
        note: lt('1-aylanish: 2 * 2 = 4.', '1-айланиш: 2 * 2 = 4.'),
      },
      {
        line: 3,
        vars: { natija: 8 },
        changedVars: ['natija'],
        output: [],
        note: lt('2-aylanish: 4 * 2 = 8.', '2-айланиш: 4 * 2 = 8.'),
      },
      {
        line: 3,
        vars: { natija: 16 },
        changedVars: ['natija'],
        output: [],
        note: lt('3-aylanish: 8 * 2 = 16.', '3-айланиш: 8 * 2 = 16.'),
      },
      {
        line: 5,
        vars: { natija: 16 },
        changedVars: [],
        output: ['16'],
        note: lt('Natija: 16.', 'Натижа: 16.'),
      },
    ],
  },

  'trace-loop-6': {
    id: 'trace-loop-6',
    title: lt('Teskari chegirma belgisi', 'Тескари чегирма белгиси'),
    codeLines: [
      'narx = 120',
      'agar (narx < 100) {',
      '  narx = narx - 20',
      '}',
      'chopEt(narx)',
    ],
    pythonLines: [
      'narx = 120',
      'if narx < 100:',
      '    narx = narx - 20',
      '# tugadi',
      'print(narx)',
    ],
    frames: [
      {
        line: 1,
        vars: { narx: 120 },
        changedVars: ['narx'],
        output: [],
        note: lt('narx = 120.', 'narx = 120.'),
      },
      {
        line: 2,
        vars: { narx: 120 },
        changedVars: [],
        output: [],
        note: lt('120 < 100 yolgʻon! Chegirma berilmadi.', '120 < 100 ёлғон! Чегирма берилмади.'),
      },
      {
        line: 5,
        vars: { narx: 120 },
        changedVars: [],
        output: ['120'],
        note: lt('Xato 2-qatorda: > 100 yozish kerak edi.', 'Хато 2-қаторда: > 100 ёзиш керак эди.'),
      },
    ],
  },

  'trace-loop-7': {
    id: 'trace-loop-7',
    title: lt('Toki sikli qadamlarini sanash', 'Токи цикли қадамларини санаш'),
    codeLines: [
      'qadam = 10',
      'toki (qadam > 4) {',
      '  qadam = qadam - 3',
      '}',
      'chopEt(qadam)',
    ],
    pythonLines: [
      'qadam = 10',
      'while qadam > 4:',
      '    qadam = qadam - 3',
      '# sikl tugadi',
      'print(qadam)',
    ],
    frames: [
      {
        line: 1,
        vars: { qadam: 10 },
        changedVars: ['qadam'],
        output: [],
        note: lt('qadam = 10.', 'qadam = 10.'),
      },
      {
        line: 3,
        vars: { qadam: 7 },
        changedVars: ['qadam'],
        output: [],
        note: lt('1-aylanish (10 > 4 rost): 10 - 3 = 7.', '1-айланиш (10 > 4 рост): 10 - 3 = 7.'),
      },
      {
        line: 3,
        vars: { qadam: 4 },
        changedVars: ['qadam'],
        output: [],
        note: lt('2-aylanish (7 > 4 rost): 7 - 3 = 4.', '2-айланиш (7 > 4 рост): 7 - 3 = 4.'),
      },
      {
        line: 2,
        vars: { qadam: 4 },
        changedVars: [],
        output: [],
        note: lt('Tekshiruv: 4 > 4 yolgʻon! Sikl 2 marta aylanib toʻxtadi.', 'Текширув: 4 > 4 ёлғон! Цикл 2 марта айланиб тўхтади.'),
      },
      {
        line: 5,
        vars: { qadam: 4 },
        changedVars: [],
        output: ['4'],
        note: lt('Oxirida qadam = 4.', 'Охирида qadam = 4.'),
      },
    ],
  },

  'trace-loop-8': {
    id: 'trace-loop-8',
    title: lt('Nolga boʻlish xatosi', 'Нолга бўлиш хатоси'),
    codeLines: [
      'jami = 100',
      'boluvchi = 0',
      'javob = jami / boluvchi',
      'chopEt(javob)',
    ],
    pythonLines: [
      'jami = 100',
      'boluvchi = 0',
      'javob = jami / boluvchi',
      'print(javob)',
    ],
    frames: [
      {
        line: 1,
        vars: { jami: 100 },
        changedVars: ['jami'],
        output: [],
        note: lt('jami = 100.', 'jami = 100.'),
      },
      {
        line: 2,
        vars: { jami: 100, boluvchi: 0 },
        changedVars: ['boluvchi'],
        output: [],
        note: lt('boluvchi = 0.', 'boluvchi = 0.'),
      },
      {
        line: 3,
        vars: { jami: 100, boluvchi: 0 },
        changedVars: [],
        output: ['Xato: 0 ga boʻlib boʻlmaydi'],
        note: lt('3-qatorda 100 / 0 amali bajarilib dastur toʻxtadi.', '3-қаторда 100 / 0 амали бажарилиб дастур тўхтади.'),
      },
    ],
  },

  'trace-loop-9': {
    id: 'trace-loop-9',
    title: lt('Ichma-ich sikl (2 × 3)', 'Ичма-ич цикл (2 × 3)'),
    codeLines: [
      'jami = 0',
      '2 marta takrorla {',
      '  3 marta takrorla {',
      '    jami = jami + 1',
      '  }',
      '}',
      'chopEt(jami)',
    ],
    pythonLines: [
      'jami = 0',
      'for _ in range(2):',
      '    for _ in range(3):',
      '        jami = jami + 1',
      '    # ichki sikl tugadi',
      '# tashqi sikl tugadi',
      'print(jami)',
    ],
    frames: [
      {
        line: 1,
        vars: { jami: 0 },
        changedVars: ['jami'],
        output: [],
        note: lt('jami = 0.', 'jami = 0.'),
      },
      {
        line: 4,
        vars: { jami: 3 },
        changedVars: ['jami'],
        output: [],
        note: lt('Tashqi sikl 1-marta: ichki sikl 3 qoʻshdi (jami = 3).', 'Ташқи цикл 1-марта: ички цикл 3 қўшди (jami = 3).'),
      },
      {
        line: 4,
        vars: { jami: 6 },
        changedVars: ['jami'],
        output: [],
        note: lt('Tashqi sikl 2-marta: yana 3 qoʻshildi (jami = 6).', 'Ташқи цикл 2-марта: яна 3 қўшилди (jami = 6).'),
      },
      {
        line: 7,
        vars: { jami: 6 },
        changedVars: [],
        output: ['6'],
        note: lt('Jami 2 × 3 = 6 chiqadi.', 'Жами 2 × 3 = 6 чиқади.'),
      },
    ],
  },

  'trace-loop-10': {
    id: 'trace-loop-10',
    title: lt('Bitta kam xatosi (< vs <=)', 'Битта кам хатоси (< vs <=)'),
    codeLines: [
      'yigindi = 0',
      'uchun i = 1 dan 5 gacha (i < 5) {',
      '  yigindi = yigindi + i',
      '}',
      'chopEt(yigindi)',
    ],
    pythonLines: [
      'yigindi = 0',
      'for i in range(1, 5):  # 5 kirmaydi',
      '    yigindi = yigindi + i',
      '# sikl tugadi',
      'print(yigindi)',
    ],
    frames: [
      {
        line: 1,
        vars: { yigindi: 0 },
        changedVars: ['yigindi'],
        output: [],
        note: lt('yigindi = 0.', 'yigindi = 0.'),
      },
      {
        line: 3,
        vars: { yigindi: 10, i: 4 },
        changedVars: ['yigindi', 'i'],
        output: [],
        note: lt('1 + 2 + 3 + 4 = 10 hisoblandi.', '1 + 2 + 3 + 4 = 10 ҳисобланди.'),
      },
      {
        line: 2,
        vars: { yigindi: 10, i: 5 },
        changedVars: ['i'],
        output: [],
        note: lt('i = 5 boʻlganda 5 < 5 yolgʻon! 5 qoʻshilmay qoldi.', 'i = 5 бўлганда 5 < 5 ёлғон! 5 қўшилмай қолди.'),
      },
      {
        line: 5,
        vars: { yigindi: 10, i: 5 },
        changedVars: [],
        output: ['10'],
        note: lt('15 oʻrniga 10 chiqdi. <= belgisi kerak edi.', '15 ўрнига 10 чиқди. <= белгиси керак эди.'),
      },
    ],
  },
};
