/**
 * Curriculum content decoupled from UI logic.
 * Targets 12-year-old learners with no prior coding background.
 * 3 skill nodes, 3 diagnostic items, 30 mini-game tasks (10 per game) with twin repair tasks,
 * unified pseudocode + Python parity, misconception tags, and 6 badges.
 */

import { lt, type LocalizedText } from '../engine/i18n';

export type SkillId = 'algoritmlar' | 'mantiq' | 'sikllar';
export type DifficultyLevel = 1 | 2 | 3;

export interface MisconceptionMeta {
  id: string;
  label: LocalizedText;
  teacherNote: LocalizedText;
  recommendedSkill: SkillId;
}

export const MISCONCEPTION_CATALOG: Record<string, MisconceptionMeta> = {
  'order-doesnt-matter': {
    id: 'order-doesnt-matter',
    label: lt('Qadamlar tartibini aralashtirish', 'Қадамлар тартибини аралаштириш'),
    teacherNote: lt(
      'Oʻquvchi qadamlar ketma-ketligi natijani oʻzgartirishini unutmoqda.',
      'Ўқувчи қадамлар кетма-кетлиги натижани ўзгартиришини унутмоқда.'
    ),
    recommendedSkill: 'algoritmlar',
  },
  'computer-guesses': {
    id: 'computer-guesses',
    label: lt('Kompyuter oʻzi taxmin qiladi deb oʻylash', 'Компьютер ўзи тахмин қилади деб ўйлаш'),
    teacherNote: lt(
      'Oʻquvchi mashina noaniq buyruqni toʻgʻrilaydi deb kutmoqda.',
      'Ўқувчи машина ноаниқ буйруқни тўғрилайди деб кутмоқда.'
    ),
    recommendedSkill: 'algoritmlar',
  },
  'overwrite-adds': {
    id: 'overwrite-adds',
    label: lt('Yangi qiymat eskisiga qoʻshiladi deb oʻylash', 'Янги қиймат эскисига қўшилади деб ўйлаш'),
    teacherNote: lt(
      'Oʻzgaruvchi yangilanganda eski qiymat oʻchishini takrorlash foydali.',
      'Ўзгарувчи янгиланганда эски қиймат ўчишини такрорлаш фойдали.'
    ),
    recommendedSkill: 'mantiq',
  },
  'copy-links-forever': {
    id: 'copy-links-forever',
    label: lt('a = b qutilarni abadiy bogʻlaydi deb oʻylash', 'a = b қутиларни абадий боғлайди деб ўйлаш'),
    teacherNote: lt(
      'Qiymat bir marta nusxalanishini Trace Machine orqali koʻrsatish kerak.',
      'Қиймат бир марта нусхаланишини Trace Machine орқали кўрсатиш керак.'
    ),
    recommendedSkill: 'mantiq',
  },
  'boundary-strict-vs-equal': {
    id: 'boundary-strict-vs-equal',
    label: lt('Chegarada > va >= ni adashtirish', 'Чегарада > ва >= ни адаштириш'),
    teacherNote: lt(
      'Tenglik belgisi (=) chegaradagi sonni kiritishini mashq qilish lozim.',
      'Тенглик белгиси (=) чегарадаги сонни киритишини машқ қилиш лозим.'
    ),
    recommendedSkill: 'mantiq',
  },
  'both-branches-run': {
    id: 'both-branches-run',
    label: lt('agar va aks holda ikkalasi ham ishlaydi deb oʻylash', 'agar ва aks holda иккаласи ҳам ишлайди деб ўйлаш'),
    teacherNote: lt(
      'Tarmoqlanishda faqat bitta yoʻl tanlanishini taʼkidlash kerak.',
      'Тармоқланишда фақат битта йўл танланишини таъкидлаш керак.'
    ),
    recommendedSkill: 'mantiq',
  },
  'natural-and-means-or': {
    id: 'natural-and-means-or',
    label: lt('VA (&&) va YOKI (||) operatorlarini almashtirish', 'ВА (&&) ва ЁКИ (||) операторларини алмаштириш'),
    teacherNote: lt(
      'Ikkalasidan biri yetarli boʻlganda || ishlatilishini ikki kalit misolida eslatish kerak.',
      'Иккаласидан бири етарли бўлганда || ишлатилишини икки калит мисолида эслатиш керак.'
    ),
    recommendedSkill: 'mantiq',
  },
  'off-by-one': {
    id: 'off-by-one',
    label: lt('Bitta kam yoki ortiq sanash (< vs <=)', 'Битта кам ёки ортиқ санаш (< vs <=)'),
    teacherNote: lt(
      'Sikl chegarasidagi oxirgi qadamni qogʻozda sanab tekshirish foydali.',
      'Цикл чегарасидаги охирги қадамни қоғозда санаб текшириш фойдали.'
    ),
    recommendedSkill: 'sikllar',
  },
  'counter-never-moves': {
    id: 'counter-never-moves',
    label: lt('Hisoblagich oʻzgarishini unutish (cheksiz sikl)', 'Ҳисоблагич ўзгаришини унутиш (чексиз цикл)'),
    teacherNote: lt(
      'Sikl toʻxtashi uchun hisoblagich shart chegarasiga yaqinlashishi shart.',
      'Цикл тўхташи учун ҳисоблагич шарт чегарасига яқинлашиши шарт.'
    ),
    recommendedSkill: 'sikllar',
  },
  'only-in-computers': {
    id: 'only-in-computers',
    label: lt('Algoritm faqat kompyuterda boʻladi deb oʻylash', 'Алгоритм фақат компьютерда бўлади деб ўйлаш'),
    teacherNote: lt(
      'Kundalik hayotdagi retsept va rejalarni kod bilan bogʻlab koʻrsatish foydali.',
      'Кундалик ҳаётдаги рецепт ва режаларни код билан боғлаб кўрсатиш фойдали.'
    ),
    recommendedSkill: 'algoritmlar',
  },
  'self-update-impossible': {
    id: 'self-update-impossible',
    label: lt('x = x + 1 ni matematika tenglamasi deb oʻylash', 'x = x + 1 ни математика тенгламаси деб ўйлаш'),
    teacherNote: lt(
      'Tenglik belgisi buyruq ekanini: avval oʻng tomon hisoblanib chapga saqlanishini koʻrsating.',
      'Тенглик белгиси буйруқ эканини: аввал ўнг томон ҳисобланиб чапга сақланишини кўрсатинг.'
    ),
    recommendedSkill: 'mantiq',
  },
  'computer-is-wrong': {
    id: 'computer-is-wrong',
    label: lt('Xatoni kompyuterdan izlash', 'Хатони компьютердан излаш'),
    teacherNote: lt(
      'Mashina faqat yozilgan koʻrsatmani bajarishini Koʻr -> Taxmin -> Tekshir -> Tuzat orqali koʻrsating.',
      'Машина фақат ёзилган кўрсатмани бажаришини Кўр -> Тахмин -> Текшир -> Тузат орқали кўрсатинг.'
    ),
    recommendedSkill: 'sikllar',
  },
  slip: {
    id: 'slip',
    label: lt('Shoshilish yoki hisobdagi tasodifiy xato', 'Шошилиш ёки ҳисобдаги тасодифий хато'),
    teacherNote: lt(
      'Qoidani tushungan, faqat hisoblashda shoshilgan.',
      'Қоидани тушунган, фақат ҳисоблашда шошилган.'
    ),
    recommendedSkill: 'mantiq',
  },
};

export interface TwinQuestion {
  prompt: LocalizedText;
  code?: string;
  pythonCode?: string;
  options: LocalizedText[];
  correctIndex: number;
  explanation: LocalizedText;
}

export interface SkillNode {
  id: SkillId;
  order: number;
  title: LocalizedText;
  cityTag: LocalizedText;
  bloomLevel: LocalizedText;
  prerequisite: SkillId | null;
  learningObjective: LocalizedText;
  topicTag: LocalizedText;
  gameType: 'sequence' | 'logic' | 'loop-bug';
  gameTitle: LocalizedText;
  gameRule: LocalizedText;
  takeaways: [LocalizedText, LocalizedText, LocalizedText];
}

export interface DiagnosticQuestion {
  id: string;
  skillId: SkillId;
  prompt: LocalizedText;
  code?: string;
  pythonCode?: string;
  options: LocalizedText[];
  correctIndex: number;
  misconceptionIds: string[];
  explanation: LocalizedText;
}

export interface SequenceTask {
  id: string;
  skillId: 'algoritmlar';
  difficulty: DifficultyLevel;
  title: LocalizedText;
  prompt: LocalizedText;
  correctSteps: LocalizedText[];
  hints: [LocalizedText, LocalizedText, LocalizedText];
  explanation: LocalizedText;
  misconceptionId: string;
  twin: TwinQuestion;
}

export interface LogicTask {
  id: string;
  skillId: 'mantiq';
  difficulty: DifficultyLevel;
  title: LocalizedText;
  prompt: LocalizedText;
  code: string;
  pythonCode: string;
  options: string[];
  correctIndex: number;
  misconceptionIds: string[];
  optionExplanations: LocalizedText[];
  hints: [LocalizedText, LocalizedText, LocalizedText];
  explanation: LocalizedText;
  traceId: string;
  twin: TwinQuestion;
}

export interface LoopBugTask {
  id: string;
  skillId: 'sikllar';
  difficulty: DifficultyLevel;
  mode: 'bug-line' | 'trace-output';
  title: LocalizedText;
  prompt: LocalizedText;
  codeLines: string[];
  pythonLines: string[];
  correctLine?: number;
  lineMisconceptions?: string[];
  options?: LocalizedText[];
  correctOptionIndex?: number;
  optionMisconceptions?: string[];
  hints: [LocalizedText, LocalizedText, LocalizedText];
  explanation: LocalizedText;
  traceId: string;
  twin: TwinQuestion;
}

export interface BadgeDefinition {
  id: string;
  title: LocalizedText;
  criteria: LocalizedText;
  iconKey: 'compass' | 'cpu' | 'bug' | 'flame' | 'award' | 'sparkles';
}

export const SKILL_NODES: SkillNode[] = [
  {
    id: 'algoritmlar',
    order: 1,
    title: lt('Algoritmlar va ketma-ketlik', 'Алгоритмлар ва кетма-кетлик'),
    cityTag: lt('Samarqand ustaxonasi', 'Самарқанд устахонаси'),
    bloomLevel: lt('Qoʻllash', 'Қўллаш'),
    prerequisite: null,
    learningObjective: lt(
      'Vazifani aniq qadamlarga ajratib, toʻgʻri tartibda tuzish.',
      'Вазифани аниқ қадамларга ажратиб, тўғри тартибда тузиш.'
    ),
    topicTag: lt('5–6-sinf mavzulari: Algoritm va ijrochi', '5–6-синф мавзулари: Алгоритм ва ижрочи'),
    gameType: 'sequence',
    gameTitle: lt('Algoritm Zanjiri', 'Алгоритм Занжири'),
    gameRule: lt(
      'Aralashgan buyruqlarni mantiqiy tartibga keltir.',
      'Аралашган буйруқларни мантиқий тартибга келтир.'
    ),
    takeaways: [
      lt('Qadamlar tartibi buzilsa, kompyuter kutilgan natijani bermaydi.', 'Қадамлар тартиби бузилса, компьютер кутилган натижани бермайди.'),
      lt('Ikki qiymatni almashtirish uchun uchinchi boʻsh quti kerak.', 'Икки қийматни алмаштириш учун учинчи бўш қути керак.'),
      lt('Katta muammoni kichik aniq qadamlarga boʻlish osonroq.', 'Катта муаммони кичик аниқ қадамларга бўлиш осонроқ.'),
    ],
  },
  {
    id: 'mantiq',
    order: 2,
    title: lt('Oʻzgaruvchi va shartli mantiq', 'Ўзгарувчи ва шартли мантиқ'),
    cityTag: lt('Buxoro rasadxonasi', 'Бухоро расадхонаси'),
    bloomLevel: lt('Tahlil', 'Таҳлил'),
    prerequisite: 'algoritmlar',
    learningObjective: lt(
      'Qutilar qiymatini kuzatib, agar / aks holda natijasini oldindan topish.',
      'Қутилар қийматини кузатиб, agar / aks holda натижасини олдиндан топиш.'
    ),
    topicTag: lt('5–6-sinf mavzulari: Tarmoqlanuvchi algoritmlar', '5–6-синф мавзулари: Тармоқланувчи алгоритмлар'),
    gameType: 'logic',
    gameTitle: lt('Mantiq Qopqoni', 'Мантиқ Қопқони'),
    gameRule: lt(
      'Kodni qatorma-qator oʻqi va chopEt natijasini top.',
      'Кодни қаторма-қатор ўқи ва chopEt натижасини топ.'
    ),
    takeaways: [
      lt('agar yolgʻon boʻlgandagina aks holda bloki ishlaydi.', 'agar ёлғон бўлгандагина aks holda блоки ишлайди.'),
      lt('&& ikkalasi rostini, || kamida bitta rostini talab qiladi.', '&& иккаласи ростини, || камида битта ростини талаб қилади.'),
      lt('% qoldigʻi sonning juft yoki toq ekanini aniqlaydi.', '% қолдиғи соннинг жуфт ёки тоқ эканини аниқлайди.'),
    ],
  },
  {
    id: 'sikllar',
    order: 3,
    title: lt('Sikllar va xato ovlash', 'Цикллар ва хато овлаш'),
    cityTag: lt('Toshkent laboratoriyasi', 'Тошкент лабораторияси'),
    bloomLevel: lt('Baholash', 'Баҳолаш'),
    prerequisite: 'mantiq',
    learningObjective: lt(
      'Sikl aylanishini sanash va koddagi xato qatorini topib tuzatish.',
      'Цикл айланишини санаш ва коддаги хато қаторини топиб тузатиш.'
    ),
    topicTag: lt('5–6-sinf mavzulari: Takrorlanuvchi jarayonlar', '5–6-синф мавзулари: Такрорланувчи жараёнлар'),
    gameType: 'loop-bug',
    gameTitle: lt('Sikl va Xato Ovchisi', 'Цикл ва Хато Овчиси'),
    gameRule: lt(
      'Xato qatorni bos yoki sikl chiqaradigan natijani hisobla.',
      'Хато қаторни бос ёки цикл чиқарадиган натижани ҳисобла.'
    ),
    takeaways: [
      lt('Hisoblagich teskari yursa yoki oʻzgarmasa, cheksiz sikl chiqadi.', 'Ҳисоблагич тескари юрса ёки ўзгармаса, чексиз цикл чиқади.'),
      lt('< va <= orasidagi farq bitta qadamni oʻzgartiradi.', '< ва <= орасидаги фарқ битта қадамни ўзгартиради.'),
      lt('Xatoni topish uchun kodni qatorma-qator kuzatish kifoya.', 'Хатони топиш учун кодни қаторма-қатор кузатиш кифоя.'),
    ],
  },
];

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag-1',
    skillId: 'algoritmlar',
    prompt: lt(
      'Choy damlash algoritmida birinchi va ikkinchi qadam qaysi tartibda boʻlishi shart?',
      'Чой дамлаш алгоритмида биринчи ва иккинчи қадам қайси тартибда бўлиши шарт?'
    ),
    options: [
      lt('Avval choynakka suv quyiladi, keyin suv qaynatiladi', 'Аввал чойнакка сув қуйилади, кейин сув қайнатилади'),
      lt('Avval choy ichiladi, keyin suv qaynatiladi', 'Аввал чой ичилади, кейин сув қайнатилади'),
      lt('Tartibning farqi yoʻq, kompyuter oʻzi tushunadi', 'Тартибнинг фарқи йўқ, компьютер ўзи тушунади'),
    ],
    correctIndex: 0,
    misconceptionIds: ['ok', 'order-doesnt-matter', 'computer-guesses'],
    explanation: lt(
      'Algoritmda qadamlar qatʼiy ketma-ketlikda bajariladi.',
      'Алгоритмда қадамлар қатъий кетма-кетликда бажарилади.'
    ),
  },
  {
    id: 'diag-2',
    skillId: 'mantiq',
    prompt: lt('Ushbu kod bajarilganda ekranga nima chiqadi?', 'Ушбу код бажарилганда экранга нима чиқади?'),
    code: 'ball = 75\nagar (ball >= 60) {\n  chopEt("Oʻtdi")\n} aks holda {\n  chopEt("Qayta urin")\n}',
    pythonCode: 'ball = 75\nif ball >= 60:\n    print("Oʻtdi")\nelse:\n    print("Qayta urin")',
    options: [lt('"Oʻtdi"', '"Oʻtdi"'), lt('"Qayta urin"', '"Qayta urin"'), lt('Ikkalasi ham chiqadi', 'Иккаласи ҳам чиқади')],
    correctIndex: 0,
    misconceptionIds: ['ok', 'boundary-strict-vs-equal', 'both-branches-run'],
    explanation: lt(
      '75 >= 60 sharti rost, shuning uchun faqat birinchi tarmoq ishlaydi.',
      '75 >= 60 шарти рост, шунинг учун фақат биринчи тармоқ ишлайди.'
    ),
  },
  {
    id: 'diag-3',
    skillId: 'sikllar',
    prompt: lt('Bu sikl tugagach, sanoq qiymati nechaga teng boʻladi?', 'Бу цикл тугагач, sanoq қиймати нечага тенг бўлади?'),
    code: 'sanoq = 0\n4 marta takrorla {\n  sanoq = sanoq + 2\n}\nchopEt(sanoq)',
    pythonCode: 'sanoq = 0\nfor _ in range(4):\n    sanoq = sanoq + 2\nprint(sanoq)',
    options: [lt('6', '6'), lt('8', '8'), lt('4', '4')],
    correctIndex: 1,
    misconceptionIds: ['off-by-one', 'ok', 'slip'],
    explanation: lt(
      'Sikl 4 marta aylanib, har safar 2 qoʻshadi: 0 + 2 + 2 + 2 + 2 = 8.',
      'Цикл 4 марта айланиб, ҳар сафар 2 қўшади: 0 + 2 + 2 + 2 + 2 = 8.'
    ),
  },
];

export const SEQUENCE_TASKS: SequenceTask[] = [
  {
    id: 'seq-1',
    skillId: 'algoritmlar',
    difficulty: 1,
    title: lt('Robotning ilk qadami', 'Роботнинг илк қадами'),
    prompt: lt('Robot bayroqni olishi uchun buyruqlarni toʻgʻri tartibla:', 'Робот байроқни олиши учун буйруқларни тўғри тартибла:'),
    correctSteps: [
      lt('Robotni ishga tushir', 'Роботни ишга тушир'),
      lt('2 katak oldinga yur', '2 катак олдинга юр'),
      lt('Bayroqni koʻtar', 'Байроқни кўтар'),
    ],
    hints: [
      lt('Robot yurishi uchun avval nima qilish kerak?', 'Робот юриши учун аввал нима қилиш керак?'),
      lt('Bayroq robotdan 2 katak oldinda turibdi.', 'Байроқ роботдан 2 катак олдинда турибди.'),
      lt('Eng oxirgi harakat bayroqni koʻtarish boʻladi.', 'Энг охирги ҳаракат байроқни кўтариш бўлади.'),
    ],
    explanation: lt(
      'Avval robot ishga tushadi, manzilga yuradi va keyin bayroqni oladi.',
      'Аввал робот ишга тушади, манзилга юради ва кейин байроқни олади.'
    ),
    misconceptionId: 'order-doesnt-matter',
    twin: {
      prompt: lt('Chiroq yoqish algoritmida qaysi tartib toʻgʻri?', 'Чироқ ёқиш алгоритмида қайси тартиб тўғри?'),
      options: [
        lt('Xonaga kir → Kalitni bos → Kitob oʻqi', 'Хонага кир → Калитни бос → Китоб ўқи'),
        lt('Kitob oʻqi → Xonaga kir → Kalitni bos', 'Китоб ўқи → Хонага кир → Калитни бос'),
        lt('Kalitni bos → Xonaga kirma', 'Калитни бос → Хонага кирма'),
      ],
      correctIndex: 0,
      explanation: lt(
        'Yorugʻlikda oʻqish uchun avval kirib, kalitni bosish kerak.',
        'Ёруғликда ўқиш учун аввал кириб, калитни босиш керак.'
      ),
    },
  },
  {
    id: 'seq-2',
    skillId: 'algoritmlar',
    difficulty: 1,
    title: lt('Oʻzbek choyi algoritmi', 'Ўзбек чойи алгоритми'),
    prompt: lt('Choy damlash qadamlarini toʻgʻri tartibga keltir:', 'Чой дамлаш қадамларини тўғри тартибга келтир:'),
    correctSteps: [
      lt('Choynakka toza suv quy', 'Чойнакка тоза сув қуй'),
      lt('Suvni qaynat', 'Сувни қайнат'),
      lt('Quruq choy solib damla', 'Қуруқ чой солиб дамла'),
    ],
    hints: [
      lt('Boʻsh choynakni qizdirsa nima boʻladi?', 'Бўш чойнакни қиздирса нима бўлади?'),
      lt('Quruq choy qaynoq suvga solinadi.', 'Қуруқ чой қайноқ сувга солинади.'),
      lt('Birinchi qadam — choynakka suv quyish.', 'Биринчи қадам — чойнакка сув қуйиш.'),
    ],
    explanation: lt(
      'Har bir qadam oldingisining natijasiga tayangan.',
      'Ҳар бир қадам олдингисининг натижасига таянган.'
    ),
    misconceptionId: 'order-doesnt-matter',
    twin: {
      prompt: lt('Xat yuborish uchun qaysi tartib toʻgʻri?', 'Хат юбориш учун қайси тартиб тўғри?'),
      options: [
        lt('Matnni yoz → Manzilni kirit → Yubor tugmasini bos', 'Матнни ёз → Манзилни кирит → Юбор тугмасини бос'),
        lt('Yubor tugmasini bos → Matnni yoz', 'Юбор тугмасини бос → Матнни ёз'),
        lt('Manzil kiritmasdan yubor', 'Манзил киритмасдан юбор'),
      ],
      correctIndex: 0,
      explanation: lt('Yozmasdan turib xatni yuborib boʻlmaydi.', 'Ёзмасдан туриб хатни юбориб бўлмайди.'),
    },
  },
  {
    id: 'seq-3',
    skillId: 'algoritmlar',
    difficulty: 1,
    title: lt('Ikki sonni qoʻshish', 'Икки сонни қўшиш'),
    prompt: lt('4 va 6 sonlarini qoʻshib ekranga chiqarish tartibini tuz:', '4 ва 6 сонларини қўшиб экранга чиқариш тартибини туз:'),
    correctSteps: [
      lt('a = 4 va b = 6 qutilarini yarat', 'a = 4 ва b = 6 қутиларини ярат'),
      lt('yigindi = a + b ni hisobla', 'yigindi = a + b ни ҳисобла'),
      lt('chopEt(yigindi) bilan natijani chiqar', 'chopEt(yigindi) билан натижани чиқар'),
    ],
    hints: [
      lt('Kompyuter hisoblashdan oldin sonlarni qutiga solishi kerak.', 'Компьютер ҳисоблашдан олдин сонларни қутига солиши керак.'),
      lt('Hisoblanmagan yigʻindini chopEt chiqara olmaydi.', 'Ҳисобланмаган йиғиндини chopEt чиқара олмайди.'),
      lt('Oxirgi qadam natijani ekranga chiqarish.', 'Охирги қадам натижани экранга чиқариш.'),
    ],
    explanation: lt(
      'Kiritish → hisoblash → chopEt(natija) — dasturning uch qadami.',
      'Киритиш → ҳисоблаш → chopEt(натижа) — дастурнинг уч қадами.'
    ),
    misconceptionId: 'order-doesnt-matter',
    twin: {
      prompt: lt('Narxni 2 ga koʻpaytirish dasturi qanday boshlanadi?', 'Нархни 2 га кўпайтириш дастури қандай бошланади?'),
      options: [
        lt('Avval narx qutisiga son yoziladi, keyin koʻpaytiriladi', 'Аввал narx қутисига сон ёзилади, кейин кўпайтирилади'),
        lt('Avval chopEt(jami) chaqiriladi', 'Аввал chopEt(jami) чақирилади'),
        lt('Tartib muhim emas', 'Тартиб муҳим эмас'),
      ],
      correctIndex: 0,
      explanation: lt('Avval maʼlumot qutiga yoziladi, keyin hisoblanadi.', 'Аввал маълумот қутига ёзилади, кейин ҳисобланади.'),
    },
  },
  {
    id: 'seq-4',
    skillId: 'algoritmlar',
    difficulty: 1,
    title: lt('Yomgʻir tekshiruvi', 'Ёмғир текшируви'),
    prompt: lt('Maktabga chiqishdan oldingi shartli qadamlarni tartibla:', 'Мактабга чиқишдан олдинги шартли қадамларни тартибла:'),
    correctSteps: [
      lt('Derazadan yomgʻir bormi tekshir', 'Деразадан ёмғир борми текшир'),
      lt('Agar yomgʻir boʻlsa, soyabonni ol', 'Агар ёмғир бўлса, соябонни ол'),
      lt('Tashqariga yoʻl ol', 'Ташқарига йўл ол'),
    ],
    hints: [
      lt('Soyabon kerakligini bilish uchun avval nima qilasan?', 'Соябон кераклигини билиш учун аввал нима қиласан?'),
      lt('Uydan chiqib ketgandan keyin soyabon olish kech boʻladi.', 'Уйдан чиқиб кетгандан кейин соябон олиш кеч бўлади.'),
      lt('Tashqariga chiqish eng oxirgi qadam.', 'Ташқарига чиқиш энг охирги қадам.'),
    ],
    explanation: lt(
      'Tekshiruv har doim qaror va harakatdan oldin keladi.',
      'Текширув ҳар доим қарор ва ҳаракатдан олдин келади.'
    ),
    misconceptionId: 'order-doesnt-matter',
    twin: {
      prompt: lt('Yoʻldan oʻtishdan oldin nima birinchi qilinadi?', 'Йўлдан ўтишдан олдин нима биринчи қилинади?'),
      options: [
        lt('Svetofor rangini tekshirish → Yashil boʻlsa yurish', 'Светофор рангини текшириш → Яшил бўлса юриш'),
        lt('Yurish → Keyin svetoforga qarash', 'Юриш → Кейин светофорга қараш'),
        lt('Svetoforga qaramay yugurish', 'Светофорга қарамай югуриш'),
      ],
      correctIndex: 0,
      explanation: lt('Avval shart tekshiriladi, keyin harakat qilinadi.', 'Аввал шарт текширилади, кейин ҳаракат қилинади.'),
    },
  },
  {
    id: 'seq-5',
    skillId: 'algoritmlar',
    difficulty: 2,
    title: lt('Toʻrtburchak perimetri', 'Тўртбурчак периметри'),
    prompt: lt('Perimetrni hisoblash algoritmini yigʻ:', 'Периметрни ҳисоблаш алгоритмини йиғ:'),
    correctSteps: [
      lt('Boʻyi a va eni b ni kirit', 'Бўйи a ва эни b ни кирит'),
      lt('tomonlar = a + b ni hisobla', 'tomonlar = a + b ни ҳисобла'),
      lt('perimetr = 2 * tomonlar ni top', 'perimetr = 2 * tomonlar ни топ'),
      lt('chopEt(perimetr) ni bajar', 'chopEt(perimetr) ни бажар'),
    ],
    hints: [
      lt('Formula: P = 2 * (a + b). Qaysi qism birinchi hisoblanadi?', 'Формула: P = 2 * (a + b). Қайси қисм биринчи ҳисобланади?'),
      lt('Avval a va b qiymatlari kiritilishi shart.', 'Аввал a ва b қийматлари киритилиши шарт.'),
      lt('chopEt(perimetr) eng oxirida keladi.', 'chopEt(perimetr) энг охирида келади.'),
    ],
    explanation: lt(
      'Avval tomonlar qoʻshiladi, keyin 2 ga koʻpaytiriladi va chop etiladi.',
      'Аввал томонлар қўшилади, кейин 2 га кўпайтирилади ва чоп этилади.'
    ),
    misconceptionId: 'order-doesnt-matter',
    twin: {
      prompt: lt('Kvadrat yuzini topishda (S = a * a) qaysi tartib toʻgʻri?', 'Квадрат юзини топишда (S = a * a) қайси тартиб тўғри?'),
      options: [
        lt('Tomon a ni ol → yuza = a * a → chopEt(yuza)', 'Томон a ни ол → yuza = a * a → chopEt(yuza)'),
        lt('chopEt(yuza) → yuza = a * a', 'chopEt(yuza) → yuza = a * a'),
        lt('yuza = a * a → a = 5', 'yuza = a * a → a = 5'),
      ],
      correctIndex: 0,
      explanation: lt('a berilmasdan turib a * a ni hisoblab boʻlmaydi.', 'a берилмасдан туриб a * a ни ҳисоблаб бўлмайди.'),
    },
  },
  {
    id: 'seq-6',
    skillId: 'algoritmlar',
    difficulty: 2,
    title: lt('Ikki qutini almashtirish (Swap)', 'Икки қутини алмаштириш (Swap)'),
    prompt: lt('A = 10 va B = 25 qiymatlarini yoʻqotmasdan almashtir:', 'A = 10 ва B = 25 қийматларини йўқотмасдан алмаштир:'),
    correctSteps: [
      lt('vaqtincha = A (A ni saqla)', 'vaqtincha = A (A ни сақла)'),
      lt('A = B (B ni A ga yoz)', 'A = B (B ни A га ёз)'),
      lt('B = vaqtincha (saqlanganni B ga yoz)', 'B = vaqtincha (сақланганни B га ёз)'),
    ],
    hints: [
      lt('Toʻgʻridan-toʻgʻri A = B desang, A dagi 10 nima boʻladi?', 'Тўғридан-тўғри A = B десанг, A даги 10 нима бўлади?'),
      lt('Boʻsh vaqtincha qutiga avval A ni olib qoʻy.', 'Бўш vaqtincha қутига аввал A ни олиб қўй.'),
      lt('Eng oxirida saqlangan qiymat B ga oʻtadi.', 'Энг охирида сақланган қиймат B га ўтади.'),
    ],
    explanation: lt(
      'Uchinchi qutisiz A ning eski qiymati oʻchib ketadi.',
      'Учинчи қутисиз A нинг эски қиймати ўчиб кетади.'
    ),
    misconceptionId: 'overwrite-adds',
    twin: {
      prompt: lt('Agar C qutisiga X ni saqlamasdan X = Y desak nima boʻladi?', 'Агар C қутисига X ни сақламасдан X = Y десак нима бўлади?'),
      options: [
        lt('X ning eski qiymati yoʻqoladi', 'X нинг эски қиймати йўқолади'),
        lt('X va Y avtomatik almashadi', 'X ва Y автоматик алмашади'),
        lt('Y ning qiymati X ga qoʻshiladi', 'Y нинг қиймати X га қўшилади'),
      ],
      correctIndex: 0,
      explanation: lt('Yangi yozuv qutidagi eski qiymatni oʻchiradi.', 'Янги ёзув қутидаги эски қийматни ўчиради.'),
    },
  },
  {
    id: 'seq-7',
    skillId: 'algoritmlar',
    difficulty: 2,
    title: lt('Eng katta sonni topish', 'Энг катта сонни топиш'),
    prompt: lt('Roʻyxatdan eng katta sonni topish tartibini tuz:', 'Рўйхатдан энг катта сонни топиш тартибини туз:'),
    correctSteps: [
      lt('engKatta = birinchi son deb ol', 'engKatta = биринчи сон деб ол'),
      lt('Keyingi sonni engKatta bilan solishtir', 'Кейинги сонни engKatta билан солиштир'),
      lt('Katta boʻlsa, engKatta ni yangila', 'Катта бўлса, engKatta ни янгила'),
      lt('Roʻyxat tugagach, engKatta ni qaytar', 'Рўйхат тугагач, engKatta ни қайтар'),
    ],
    hints: [
      lt('Solishtirishni boshlash uchun engKatta da biror son boʻlishi kerak.', 'Солиштиришни бошлаш учун engKatta да бирор сон бўлиши керак.'),
      lt('Hamma son koʻrilmasdan javob chiqarilmaydi.', 'Ҳамма сон кўрилмасдан жавоб чиқарилмайди.'),
      lt('Natija eng oxirida qaytariladi.', 'Натижа энг охирида қайтарилади.'),
    ],
    explanation: lt(
      'Birinchi element boshlangʻich chempion boʻladi, qolganlari u bilan solishtiriladi.',
      'Биринчи элемент бошланғич чемпион бўлади, қолганлари у билан солиштирилади.'
    ),
    misconceptionId: 'order-doesnt-matter',
    twin: {
      prompt: lt('Eng kichik sonni topishda birinchi qadam qaysi?', 'Энг кичик сонни топишда биринчи қадам қайси?'),
      options: [
        lt('engKichik = birinchi element deb olish', 'engKichik = биринчи элемент деб олиш'),
        lt('Darrov engKichik ni chopEt qilish', 'Дарров engKichik ни chopEt қилиш'),
        lt('Oxirgi sonni oʻchirish', 'Охирги сонни ўчириш'),
      ],
      correctIndex: 0,
      explanation: lt('Avval boshlangʻich nomzodni tanlab, keyin qolganlari bilan solishtiramiz.', 'Аввал бошланғич номзодни танлаб, кейин қолганлари билан солиштирамиз.'),
    },
  },
  {
    id: 'seq-8',
    skillId: 'algoritmlar',
    difficulty: 2,
    title: lt('Parol tekshiruvi', 'Парол текшируви'),
    prompt: lt('Parolni tekshirish tizimi tartibini yigʻ:', 'Паролни текшириш тизими тартибини йиғ:'),
    correctSteps: [
      lt('Foydalanuvchi parolini qabul qil', 'Фойдаланувчи паролини қабул қил'),
      lt('Uzunligi kamida 8 belgi ekanini tekshir', 'Узунлиги камида 8 белги эканини текшир'),
      lt('Ichida raqam borligini tekshir', 'Ичида рақам борлигини текшир'),
      lt('Ikkalasi rost boʻlsa, ruxsat ber', 'Иккаласи рост бўлса, рухсат бер'),
    ],
    hints: [
      lt('Tekshirishdan oldin parol kiritilgan boʻlishi kerak.', 'Текширишдан олдин парол киритилган бўлиши керак.'),
      lt('Ruxsat qachon beriladi?', 'Рухсат қачон берилади?'),
      lt('Oxirgi qadam — ruxsat berish.', 'Охирги қадам — рухсат бериш.'),
    ],
    explanation: lt(
      'Barcha shartlar tekshirilgandan keyingina ruxsat beriladi.',
      'Барча шартлар текширилгандан кейингина рухсат берилади.'
    ),
    misconceptionId: 'order-doesnt-matter',
    twin: {
      prompt: lt('Kirish eshigida karta tekshiruvi qanday tartibda ishlaydi?', 'Кириш эшигида карта текшируви қандай тартибда ишлайди?'),
      options: [
        lt('Kartani oʻqi → Roʻyxatda bormi tekshir → Eshikni och', 'Картани ўқи → Рўйхатда борми текшир → Эшикни оч'),
        lt('Eshikni och → Kartani oʻqi', 'Эшикни оч → Картани ўқи'),
        lt('Tekshirmasdan och', 'Текширмасдан оч'),
      ],
      correctIndex: 0,
      explanation: lt('Tekshirish har doim eshikni ochishdan oldin bajariladi.', 'Текшириш ҳар доим эшикни очишдан олдин бажарилади.'),
    },
  },
  {
    id: 'seq-9',
    skillId: 'algoritmlar',
    difficulty: 3,
    title: lt('Ikkilik qidiruv qadami', 'Иккилик қидирув қадами'),
    prompt: lt('Tartiblangan roʻyxatda sonni tez topish qadamlarini tartibla:', 'Тартибланган рўйхатда сонни тез топиш қадамларини тартибла:'),
    correctSteps: [
      lt('Roʻyxat oʻrtasidagi sonni ol', 'Рўйхат ўртасидаги сонни ол'),
      lt('Qidirilayotgan son bilan solishtir', 'Қидирилаётган сон билан солиштир'),
      lt('Keraksiz yarmini chiqarib tashla', 'Кераксиз ярмини чиқариб ташла'),
      lt('Qolgan yarmida qidirishni davom ettir', 'Қолган ярмида қидиришни давом эттир'),
    ],
    hints: [
      lt('Ikkilik qidiruv avval qaysi elementga qaraydi?', 'Иккилик қидирув аввал қайси элементга қарайди?'),
      lt('Solishtirmasdan qaysi yarmini tashlashni bilib boʻlmaydi.', 'Солиштирмасдан қайси ярмини ташлашни билиб бўлмайди.'),
      lt('Keyingi urinish qolgan yarmida boʻladi.', 'Кейинги уриниш қолган ярмида бўлади.'),
    ],
    explanation: lt(
      'Har safar roʻyxat oʻrtadan boʻlinadi va keraksiz yarmi tashlanadi.',
      'Ҳар сафар рўйхат ўртадан бўлинади ва кераксиз ярми ташланади.'
    ),
    misconceptionId: 'order-doesnt-matter',
    twin: {
      prompt: lt('Kitobdan 120-betni tez topish uchun birinchi nima qilasan?', 'Китобдан 120-бетни тез топиш учун биринчи нима қиласан?'),
      options: [
        lt('Kitobni oʻrtasidan ochib, 120 dan kattami-kichikmi tekshiraman', 'Китобни ўртасидан очиб, 120 дан каттами-кичикми текшираман'),
        lt('1-betdan boshlab bittalab varaqlayman', '1-бетдан бошлаб битталаб варақлайман'),
        lt('Tasodifiy betni yirtaman', 'Тасодифий бетни йиртаман'),
      ],
      correctIndex: 0,
      explanation: lt('Oʻrtadan boshlash yarim kitobni bir zumda chetga chiqaradi.', 'Ўртадан бошлаш ярим китобни бир зумда четга чиқаради.'),
    },
  },
  {
    id: 'seq-10',
    skillId: 'algoritmlar',
    difficulty: 3,
    title: lt('Funksiya yaratish va chaqirish', 'Функция яратиш ва чақириш'),
    prompt: lt('Funksiya qanday tartibda ishlatilishini tuz:', 'Функция қандай тартибда ишлатилишини туз:'),
    correctSteps: [
      lt('funksiya salom(ism) ni eʼlon qil', 'funksiya salom(ism) ни эълон қил'),
      lt('Ichida "Salom, " + ism ni tayyorla', 'Ичида "Salom, " + ism ни тайёрла'),
      lt('Dasturda salom("Madina") deb chaqir', 'Дастурда salom("Madina") деб чақир'),
      lt('"Salom, Madina" natijasini ol', '"Salom, Madina" натижасини ол'),
    ],
    hints: [
      lt('Chaqirishdan oldin funksiya yaratilgan boʻlishi kerak.', 'Чақиришдан олдин функция яратилган бўлиши керак.'),
      lt('Natija funksiya chaqirilgach qaytadi.', 'Натижа функция чақирилгач қайтади.'),
      lt('Oxirgi qadam — tayyor natijani olish.', 'Охирги қадам — тайёр натижани олиш.'),
    ],
    explanation: lt(
      'Avval funksiya taʼriflanadi, soʻng chaqirilib natija olinadi.',
      'Аввал функция таърифланади, сўнг чақирилиб натижа олинади.'
    ),
    misconceptionId: 'order-doesnt-matter',
    twin: {
      prompt: lt('Yaratilmagan funksiyani chaqirsa nima boʻladi?', 'Яратилмаган функцияни чақирса нима бўлади?'),
      options: [
        lt('Kompyuter uni topa olmay xato beradi', 'Компьютер уни топа олмай хато беради'),
        lt('Kompyuter oʻzi yozib oladi', 'Компьютер ўзи ёзиб олади'),
        lt('Hech narsa boʻlmaydi, oʻzi ishlaydi', 'Ҳеч нарса бўлмайди, ўзи ишлайди'),
      ],
      correctIndex: 0,
      explanation: lt('Mashina avval eʼlon qilinmagan buyruqni tanimaydi.', 'Машина аввал эълон қилинмаган буйруқни танимайди.'),
    },
  },
];

export const LOGIC_TASKS: LogicTask[] = [
  {
    id: 'log-1',
    skillId: 'mantiq',
    difficulty: 1,
    title: lt('Oʻzgaruvchi yangilanishi', 'Ўзгарувчи янгиланиши'),
    prompt: lt('Ushbu kod bajarilgach, chopEt(x) nimani chiqaradi?', 'Ушбу код бажарилгач, chopEt(x) нимани чиқаради?'),
    code: 'x = 5\nx = x + 3\nchopEt(x)',
    pythonCode: 'x = 5\nx = x + 3\nprint(x)',
    options: ['5', '8', '53'],
    correctIndex: 1,
    misconceptionIds: ['self-update-impossible', 'ok', 'overwrite-adds'],
    optionExplanations: [
      lt('5 eski qiymat edi; 2-qator uni 5 + 3 bilan almashtirdi.', '5 эски қиймат эди; 2-қатор уни 5 + 3 билан алмаштирди.'),
      lt('Toʻgʻri! 5 + 3 = 8 hisoblanib x ga yozildi.', 'Тўғри! 5 + 3 = 8 ҳисобланиб x га ёзилди.'),
      lt('53 matn qoʻshishda chiqardi, bu yerda esa sonlar qoʻshildi.', '53 матн қўшишда чиқарди, бу ерда эса сонлар қўшилди.'),
    ],
    hints: [
      lt('1-qatordan keyin x qutisida necha bor?', '1-қатордан кейин x қутисида неча бор?'),
      lt('2-qatorda oʻng tomon: eski x + 3.', '2-қаторда ўнг томон: эски x + 3.'),
      lt('5 va 3 ni qoʻshib koʻr.', '5 ва 3 ни қўшиб кўр.'),
    ],
    explanation: lt(
      'Oʻng tomon hisoblanib (5 + 3 = 8), x qutisiga saqlandi.',
      'Ўнг томон ҳисобланиб (5 + 3 = 8), x қутисига сақланди.'
    ),
    traceId: 'trace-log-1',
    twin: {
      prompt: lt('y = 10; y = y + 4; chopEt(y) — ekranga nima chiqadi?', 'y = 10; y = y + 4; chopEt(y) — экранга нима чиқади?'),
      code: 'y = 10\ny = y + 4\nchopEt(y)',
      pythonCode: 'y = 10\ny = y + 4\nprint(y)',
      options: [lt('10', '10'), lt('14', '14'), lt('104', '104')],
      correctIndex: 1,
      explanation: lt('10 + 4 = 14 boʻlib y qutisiga yoziladi.', '10 + 4 = 14 бўлиб y қутисига ёзилади.'),
    },
  },
  {
    id: 'log-2',
    skillId: 'mantiq',
    difficulty: 1,
    title: lt('Chegara sharti (>=)', 'Чегара шарти (>=)'),
    prompt: lt('yosh = 12 boʻlganda ekranga nima chiqadi?', 'yosh = 12 бўлганда экранга нима чиқади?'),
    code: 'yosh = 12\nagar (yosh >= 12) {\n  chopEt("Ruxsat")\n} aks holda {\n  chopEt("Kuting")\n}',
    pythonCode: 'yosh = 12\nif yosh >= 12:\n    print("Ruxsat")\nelse:\n    print("Kuting")',
    options: ['"Ruxsat"', '"Kuting"', '"Ruxsat" va "Kuting"'],
    correctIndex: 0,
    misconceptionIds: ['ok', 'boundary-strict-vs-equal', 'both-branches-run'],
    optionExplanations: [
      lt('Toʻgʻri! >= belgisi tenglikni (12 == 12) ham rost deb oladi.', 'Тўғри! >= белгиси тенгликни (12 == 12) ҳам рост деб олади.'),
      lt('Agar yosh > 12 boʻlganida "Kuting" chiqardi, lekin bu yerda >= bor.', 'Агар yosh > 12 бўлганида "Kuting" чиқарди, лекин бу ерда >= бор.'),
      lt('agar / aks holda dan faqat bitta tarmoq ishlaydi.', 'agar / aks holda дан фақат битта тармоқ ишлайди.'),
    ],
    hints: [
      lt('>= belgisi nimani anglatadi?', '>= белгиси нимани англатади?'),
      lt('12 soni 12 ga tengmi?', '12 сони 12 га тенгми?'),
      lt('Rost boʻlsa, birinchi blok ichidagi chopEt ishlaydi.', 'Рост бўлса, биринчи блок ичидаги chopEt ишлайди.'),
    ],
    explanation: lt(
      '12 >= 12 rost boʻlgani uchun faqat "Ruxsat" chop etiladi.',
      '12 >= 12 рост бўлгани учун фақат "Ruxsat" чоп этилади.'
    ),
    traceId: 'trace-if-boundary',
    twin: {
      prompt: lt('Agar yosh = 12 boʻlib, shart yosh > 12 (tengliksiz) boʻlsa nima chiqadi?', 'Агар yosh = 12 бўлиб, шарт yosh > 12 (тенгликсиз) бўлса нима чиқади?'),
      code: 'yosh = 12\nagar (yosh > 12) {\n  chopEt("Ruxsat")\n} aks holda {\n  chopEt("Kuting")\n}',
      options: [lt('"Ruxsat"', '"Ruxsat"'), lt('"Kuting"', '"Kuting"'), lt('Ikkalasi ham', 'Иккаласи ҳам')],
      correctIndex: 1,
      explanation: lt('12 > 12 yolgʻon, shuning uchun aks holda — "Kuting" ishlaydi.', '12 > 12 ёлғон, шунинг учун aks holda — "Kuting" ишлайди.'),
    },
  },
  {
    id: 'log-3',
    skillId: 'mantiq',
    difficulty: 1,
    title: lt('Aks holda tarmogʻi', 'Акс ҳолда тармоғи'),
    prompt: lt('ball = 45 boʻlsa, natija qanday boʻladi?', 'ball = 45 бўлса, натижа қандай бўлади?'),
    code: 'ball = 45\nagar (ball >= 50) {\n  chopEt("Oʻtdi")\n} aks holda {\n  chopEt("Qayta urin")\n}',
    pythonCode: 'ball = 45\nif ball >= 50:\n    print("Oʻtdi")\nelse:\n    print("Qayta urin")',
    options: ['"Oʻtdi"', '"Qayta urin"', 'Ikkalasi ham chiqadi'],
    correctIndex: 1,
    misconceptionIds: ['slip', 'ok', 'both-branches-run'],
    optionExplanations: [
      lt('45 soni 50 dan kichik, shuning uchun birinchi blok tashlab ketiladi.', '45 сони 50 дан кичик, шунинг учун биринчи блок ташлаб кетилади.'),
      lt('Toʻgʻri! 45 >= 50 yolgʻon, shuning uchun aks holda ishlaydi.', 'Тўғри! 45 >= 50 ёлғон, шунинг учун aks holda ишлайди.'),
      lt('Mashina faqat bitta yoʻlni tanlaydi.', 'Машина фақат битта йўлни танлайди.'),
    ],
    hints: [
      lt('45 soni 50 dan katta yoki tengmi?', '45 сони 50 дан катта ёки тенгми?'),
      lt('Shart yolgʻon boʻlsa, qaysi blok ishga tushadi?', 'Шарт ёлғон бўлса, қайси блок ишга тушади?'),
      lt('aks holda ichidagi matnga qara.', 'aks holda ичидаги матнга қара.'),
    ],
    explanation: lt(
      '45 >= 50 yolgʻon boʻlgani uchun mashina aks holda tarmogʻiga oʻtadi.',
      '45 >= 50 ёлғон бўлгани учун машина aks holda тармоғига ўтади.'
    ),
    traceId: 'trace-log-3',
    twin: {
      prompt: lt('pul = 3000; agar (pul >= 5000) { chopEt("Ol") } aks holda { chopEt("Yetmaydi") } — nima chiqadi?', 'pul = 3000; agar (pul >= 5000) { chopEt("Ol") } aks holda { chopEt("Yetmaydi") } — нима чиқади?'),
      options: [lt('"Ol"', '"Ol"'), lt('"Yetmaydi"', '"Yetmaydi"'), lt('Hech narsa', 'Ҳеч нарса')],
      correctIndex: 1,
      explanation: lt('3000 >= 5000 yolgʻon, demak "Yetmaydi" chiqadi.', '3000 >= 5000 ёлғон, демак "Yetmaydi" чиқади.'),
    },
  },
  {
    id: 'log-4',
    skillId: 'mantiq',
    difficulty: 2,
    title: lt('Mantiqiy VA (&&)', 'Мантиқий ВА (&&)'),
    prompt: lt('Yomgʻir bor, lekin soyabon yoʻq. Ekranga nima chiqadi?', 'Ёмғир бор, лекин соябон йўқ. Экранга нима чиқади?'),
    code: 'yomgir = true\nsoyabon = false\nagar (yomgir && soyabon) {\n  chopEt("Quruq")\n} aks holda {\n  chopEt("Nam")\n}',
    pythonCode: 'yomgir = True\nsoyabon = False\nif yomgir and soyabon:\n    print("Quruq")\nelse:\n    print("Nam")',
    options: ['"Quruq"', '"Nam"', 'true'],
    correctIndex: 1,
    misconceptionIds: ['natural-and-means-or', 'ok', 'slip'],
    optionExplanations: [
      lt('"Quruq" faqat YOKI (||) boʻlganda chiqardi; && ikkalasi true boʻlishini soʻraydi.', '"Quruq" фақат ЁКИ (||) бўлганда чиқарди; && иккаласи true бўлишини сўрайди.'),
      lt('Toʻgʻri! true && false → false, shuning uchun aks holda ishlaydi.', 'Тўғри! true && false → false, шунинг учун aks holda ишлайди.'),
      lt('chopEt matn chiqaryapti, true qiymatini emas.', 'chopEt матн чиқаряпти, true қийматини эмас.'),
    ],
    hints: [
      lt('&& operatori nechta rost qiymat talab qiladi?', '&& оператори нечта рост қиймат талаб қилади?'),
      lt('Bu yerda soyabon = false.', 'Бу ерда soyabon = false.'),
      lt('Demak shart yolgʻon va aks holda bajariladi.', 'Демак шарт ёлғон ва aks holda бажарилади.'),
    ],
    explanation: lt(
      'VA (&&) uchun ikkala tomon ham true boʻlishi shart; bitta false ham natijani false qiladi.',
      'ВА (&&) учун иккала томон ҳам true бўлиши шарт; битта false ҳам натижани false қилади.'
    ),
    traceId: 'trace-log-4',
    twin: {
      prompt: lt('kalit = true; eshikOchiq = false; agar (kalit && eshikOchiq) { chopEt("Kir") } aks holda { chopEt("Kut") }', 'kalit = true; eshikOchiq = false; agar (kalit && eshikOchiq) { chopEt("Kir") } aks holda { chopEt("Kut") }'),
      options: [lt('"Kir"', '"Kir"'), lt('"Kut"', '"Kut"'), lt('true', 'true')],
      correctIndex: 1,
      explanation: lt('true && false yolgʻon boʻlgani uchun "Kut" chiqadi.', 'true && false ёлғон бўлгани учун "Kut" чиқади.'),
    },
  },
  {
    id: 'log-5',
    skillId: 'mantiq',
    difficulty: 2,
    title: lt('Mantiqiy YOKI (||)', 'Мантиқий ЁКИ (||)'),
    prompt: lt('damOlish = false, bayram = true. Qaysi xabar chiqadi?', 'damOlish = false, bayram = true. Қайси хабар чиқади?'),
    code: 'damOlish = false\nbayram = true\nagar (damOlish || bayram) {\n  chopEt("Taʼtil")\n} aks holda {\n  chopEt("Dars")\n}',
    pythonCode: 'dam_olish = False\nbayram = True\nif dam_olish or bayram:\n    print("Taʼtil")\nelse:\n    print("Dars")',
    options: ['"Taʼtil"', '"Dars"', 'Hech narsa'],
    correctIndex: 0,
    misconceptionIds: ['ok', 'natural-and-means-or', 'slip'],
    optionExplanations: [
      lt('Toʻgʻri! || uchun kamida bitta true boʻlishi yetarli.', 'Тўғри! || учун камида битта true бўлиши етарли.'),
      lt('"Dars" faqat && boʻlganda yoki ikkalasi ham false boʻlganda chiqardi.', '"Dars" фақат && бўлганда ёки иккаласи ҳам false бўлганда чиқарди.'),
      lt('Ikki tarmoqdan biri albatta ishlaydi.', 'Икки тармоқдан бири албатта ишлайди.'),
    ],
    hints: [
      lt('|| operatori qanday ishlaydi?', '|| оператори қандай ишлайди?'),
      lt('bayram qutisi ichida true bor.', 'bayram қутиси ичида true бор.'),
      lt('Kamida bitta true boʻlsa, birinchi tarmoq tanlanadi.', 'Камида битта true бўлса, биринчи тармоқ танланади.'),
    ],
    explanation: lt(
      'YOKI (||) operatori bitta rost qiymat topsa ham shartni rost deb hisoblaydi.',
      'ЁКИ (||) оператори битта рост қиймат топса ҳам шартни рост деб ҳисоблайди.'
    ),
    traceId: 'trace-log-5',
    twin: {
      prompt: lt('bilet = false; taklifnoma = true; agar (bilet || taklifnoma) { chopEt("Kir") } aks holda { chopEt("Yoʻq") }', 'bilet = false; taklifnoma = true; agar (bilet || taklifnoma) { chopEt("Kir") } aks holda { chopEt("Yoʻq") }'),
      options: [lt('"Kir"', '"Kir"'), lt('"Yoʻq"', '"Yoʻq"'), lt('false', 'false')],
      correctIndex: 0,
      explanation: lt('taklifnoma = true boʻlgani uchun || sharti rost boʻlib "Kir" chiqadi.', 'taklifnoma = true бўлгани учун || шарти рост бўлиб "Kir" чиқади.'),
    },
  },
  {
    id: 'log-6',
    skillId: 'mantiq',
    difficulty: 2,
    title: lt('Qoldiq amali (%)', 'Қолдиқ амали (%)'),
    prompt: lt('son = 14 boʻlsa, ekranda nima koʻrinadi?', 'son = 14 бўлса, экранда нима кўринади?'),
    code: 'son = 14\nagar (son % 2 == 0) {\n  chopEt("Juft")\n} aks holda {\n  chopEt("Toq")\n}',
    pythonCode: 'son = 14\nif son % 2 == 0:\n    print("Juft")\nelse:\n    print("Toq")',
    options: ['"Juft"', '"Toq"', '7'],
    correctIndex: 0,
    misconceptionIds: ['ok', 'slip', 'slip'],
    optionExplanations: [
      lt('Toʻgʻri! 14 / 2 boʻlinganda qoldiq 0 ga teng.', 'Тўғри! 14 / 2 бўлинганда қолдиқ 0 га тенг.'),
      lt('Toq sonlar 2 ga boʻlinganda 1 qoldiq qoladi, 14 da esa 0.', 'Тоқ сонлар 2 га бўлинганда 1 қолдиқ қолади, 14 да эса 0.'),
      lt('7 — boʻlinma, lekin % belgisi qoldiqni beradi va chopEt matn chiqaradi.', '7 — бўлинма, лекин % белгиси қолдиқни беради ва chopEt матн чиқаради.'),
    ],
    hints: [
      lt('% belgisi boʻlishdan qolgan qoldiqni topadi.', '% белгиси бўлишдан қолган қолдиқни топади.'),
      lt('14 ni 2 ga boʻlganda qoldiq necha chiqadi?', '14 ни 2 га бўлганда қолдиқ неча чиқади?'),
      lt('0 == 0 rost, demak birinchi tarmoq tanlanadi.', '0 == 0 рост, демак биринчи тармоқ танланади.'),
    ],
    explanation: lt(
      '14 % 2 = 0 boʻlgani uchun 0 == 0 sharti rost va "Juft" chiqadi.',
      '14 % 2 = 0 бўлгани учун 0 == 0 шарти рост ва "Juft" чиқади.'
    ),
    traceId: 'trace-log-6',
    twin: {
      prompt: lt('son = 9; agar (son % 2 == 0) { chopEt("Juft") } aks holda { chopEt("Toq") }', 'son = 9; agar (son % 2 == 0) { chopEt("Juft") } aks holda { chopEt("Toq") }'),
      options: [lt('"Juft"', '"Juft"'), lt('"Toq"', '"Toq"'), lt('1', '1')],
      correctIndex: 1,
      explanation: lt('9 % 2 = 1. 1 == 0 yolgʻon, shuning uchun "Toq" chiqadi.', '9 % 2 = 1. 1 == 0 ёлғон, шунинг учун "Toq" чиқади.'),
    },
  },
  {
    id: 'log-7',
    skillId: 'mantiq',
    difficulty: 2,
    title: lt('Shart ichidagi amal', 'Шарт ичидаги амал'),
    prompt: lt('Kod oxirida a ning qiymati nechaga teng boʻladi?', 'Код охирида a нинг қиймати нечага тенг бўлади?'),
    code: 'a = 10\nb = 20\nagar (a > 5) {\n  a = a + b\n}\nchopEt(a)',
    pythonCode: 'a = 10\nb = 20\nif a > 5:\n    a = a + b\nprint(a)',
    options: ['10', '20', '30'],
    correctIndex: 2,
    misconceptionIds: ['slip', 'overwrite-adds', 'ok'],
    optionExplanations: [
      lt('10 > 5 rost boʻlgani uchun blok ichidagi a = a + b ishladi.', '10 > 5 рост бўлгани учун блок ичидаги a = a + b ишлади.'),
      lt('Bu b ning qiymati; 4-qator esa a ga a + b ni yozadi.', 'Бу b нинг қиймати; 4-қатор эса a га a + b ни ёзади.'),
      lt('Toʻgʻri! 10 + 20 = 30 hisoblanib a ga yozildi.', 'Тўғри! 10 + 20 = 30 ҳисобланиб a га ёзилди.'),
    ],
    hints: [
      lt('Avval shartni tekshir: 10 > 5 rostmi?', 'Аввал шартни текшир: 10 > 5 ростми?'),
      lt('Rost boʻlsa, blok ichidagi qator bajariladi.', 'Рост бўлса, блок ичидаги қатор бажарилади.'),
      lt('10 + 20 ni hisobla.', '10 + 20 ни ҳисобла.'),
    ],
    explanation: lt(
      '10 > 5 rost boʻlgani uchun a = 10 + 20 = 30 ga yangilandi.',
      '10 > 5 рост бўлгани учун a = 10 + 20 = 30 га янгиланди.'
    ),
    traceId: 'trace-log-7',
    twin: {
      prompt: lt('a = 3; b = 20; agar (a > 5) { a = a + b }; chopEt(a) — nima chiqadi?', 'a = 3; b = 20; agar (a > 5) { a = a + b }; chopEt(a) — нима чиқади?'),
      options: [lt('3', '3'), lt('23', '23'), lt('20', '20')],
      correctIndex: 0,
      explanation: lt('3 > 5 yolgʻon, shuning uchun blok ishlamaydi va a = 3 qoladi.', '3 > 5 ёлғон, шунинг учун блок ишламайди ва a = 3 қолади.'),
    },
  },
  {
    id: 'log-8',
    skillId: 'mantiq',
    difficulty: 3,
    title: lt('Koʻp tarmoqli shart', 'Кўп тармоқли шарт'),
    prompt: lt('harorat = 32 boʻlganda qaysi soʻz chop etiladi?', 'harorat = 32 бўлганда қайси сўз чоп этилади?'),
    code: 'harorat = 32\nagar (harorat > 35) {\n  chopEt("Juda issiq")\n} aks holda agar (harorat > 20) {\n  chopEt("Iliq")\n} aks holda {\n  chopEt("Salqin")\n}',
    pythonCode: 'harorat = 32\nif harorat > 35:\n    print("Juda issiq")\nelif harorat > 20:\n    print("Iliq")\nelse:\n    print("Salqin")',
    options: ['"Juda issiq"', '"Iliq"', '"Salqin"'],
    correctIndex: 1,
    misconceptionIds: ['slip', 'ok', 'both-branches-run'],
    optionExplanations: [
      lt('32 soni 35 dan katta emas, shuning uchun birinchi tarmoq oʻtadi.', '32 сони 35 дан катта эмас, шунинг учун биринчи тармоқ ўтади.'),
      lt('Toʻgʻri! 32 > 35 yolgʻon, keyingi 32 > 20 esa rost.', 'Тўғри! 32 > 35 ёлғон, кейинги 32 > 20 эса рост.'),
      lt('32 > 20 rost boʻlgani uchun oxirgi aks holda ga yetib bormaydi.', '32 > 20 рост бўлгани учун охирги aks holda га етиб бормайди.'),
    ],
    hints: [
      lt('Yuqoridan pastga tekshir: 32 > 35 rostmi?', 'Юқоридан пастга текшир: 32 > 35 ростми?'),
      lt('Yolgʻon boʻlsa, navbatdagi aks holda agar ga oʻt.', 'Ёлғон бўлса, навбатдаги aks holda agar га ўт.'),
      lt('32 > 20 shartini tekshir.', '32 > 20 шартини текшир.'),
    ],
    explanation: lt(
      'Birinchi shart yolgʻon chiqqach, ikkinchi shart (32 > 20) rost boʻlib "Iliq" chiqdi.',
      'Биринчи шарт ёлғон чиққач, иккинчи шарт (32 > 20) рост бўлиб "Iliq" чиқди.'
    ),
    traceId: 'trace-log-8',
    twin: {
      prompt: lt('harorat = 15 boʻlsa, xuddi shu zanjir nimani chiqaradi?', 'harorat = 15 бўлса, худди шу занжир нимани чиқаради?'),
      options: [lt('"Juda issiq"', '"Juda issiq"'), lt('"Iliq"', '"Iliq"'), lt('"Salqin"', '"Salqin"')],
      correctIndex: 2,
      explanation: lt('15 > 35 va 15 > 20 ikkalasi ham yolgʻon, shuning uchun "Salqin" chiqadi.', '15 > 35 ва 15 > 20 иккаласи ҳам ёлғон, шунинг учун "Salqin" чиқади.'),
    },
  },
  {
    id: 'log-9',
    skillId: 'mantiq',
    difficulty: 3,
    title: lt('Qisqa amallar (*= va -=)', 'Қисқа амаллар (*= ва -=)'),
    prompt: lt('Kodni oʻqib, tanga qutisidagi yakuniy sonni top:', 'Кодни ўқиб, tanga қутисидаги якуний сонни топ:'),
    code: 'tanga = 10\ntanga *= 2\ntanga -= 5\nchopEt(tanga)',
    pythonCode: 'tanga = 10\ntanga *= 2\ntanga -= 5\nprint(tanga)',
    options: ['15', '17', '25'],
    correctIndex: 0,
    misconceptionIds: ['ok', 'slip', 'overwrite-adds'],
    optionExplanations: [
      lt('Toʻgʻri! 10 * 2 = 20, keyin 20 - 5 = 15.', 'Тўғри! 10 * 2 = 20, кейин 20 - 5 = 15.'),
      lt('Qatorlarni tartib bilan bajar: avval koʻpaytir, keyin ayir.', 'Қаторларни тартиб билан бажар: аввал кўпайтир, кейин айир.'),
      lt('25 boʻlishi uchun oxirida + 5 yozilishi kerak edi, bu yerda -= 5 bor.', '25 бўлиши учун охирида + 5 ёзилиши керак эди, бу ерда -= 5 бор.'),
    ],
    hints: [
      lt('tanga *= 2 degani tanga = tanga * 2 demak.', 'tanga *= 2 дегани tanga = tanga * 2 демак.'),
      lt('2-qatordan keyin tanga = 20 boʻladi.', '2-қатордан кейин tanga = 20 бўлади.'),
      lt('Endi 20 dan 5 ni ayir.', 'Энди 20 дан 5 ни айир.'),
    ],
    explanation: lt(
      'Avval 10 ikki barobar oshib 20 boʻldi, keyin 5 ayirilib 15 qoldi.',
      'Аввал 10 икки баробар ошиб 20 бўлди, кейин 5 айирилиб 15 қолди.'
    ),
    traceId: 'trace-log-9',
    twin: {
      prompt: lt('ochko = 6; ochko *= 3; ochko -= 4; chopEt(ochko) — nima chiqadi?', 'ochko = 6; ochko *= 3; ochko -= 4; chopEt(ochko) — нима чиқади?'),
      options: [lt('14', '14'), lt('18', '18'), lt('22', '22')],
      correctIndex: 0,
      explanation: lt('6 * 3 = 18, keyin 18 - 4 = 14.', '6 * 3 = 18, кейин 18 - 4 = 14.'),
    },
  },
  {
    id: 'log-10',
    skillId: 'mantiq',
    difficulty: 3,
    title: lt('Inkor operatori (!)', 'Инкор оператори (!)'),
    prompt: lt('qulflangan = false. !qulflangan nimaga teng boʻladi?', 'qulflangan = false. !qulflangan нимага тенг бўлади?'),
    code: 'qulflangan = false\nkirish = !qulflangan\nchopEt(kirish)',
    pythonCode: 'qulflangan = False\nkirish = not qulflangan\nprint(kirish)',
    options: ['false', 'true', '0'],
    correctIndex: 1,
    misconceptionIds: ['slip', 'ok', 'slip'],
    optionExplanations: [
      lt('! belgisi qiymatni oʻzgarishsiz qoldirmaydi, teskarisiga oʻgiradi.', '! белгиси қийматни ўзгаришсиз қолдирмайди, тескарисига ўгиради.'),
      lt('Toʻgʻri! false ning teskarisi — true.', 'Тўғри! false нинг тескариси — true.'),
      lt('Bu mantiqiy amal, natija son emas (true/false).', 'Бу мантиқий амал, натижа сон эмас (true/false).'),
    ],
    hints: [
      lt('! belgisi "EMAS" maʼnosini beradi.', '! белгиси "ЭМАС" маъносини беради.'),
      lt('qulflangan qutisida false turibdi.', 'qulflangan қутисида false турибди.'),
      lt('false ning teskarisi nima?', 'false нинг тескариси нима?'),
    ],
    explanation: lt(
      '! operatori yolgʻonni (false) rostga (true) aylantiradi.',
      '! оператори ёлғонни (false) ростга (true) айлантиради.'
    ),
    traceId: 'trace-log-10',
    twin: {
      prompt: lt('tayyor = true; kutyapti = !tayyor; chopEt(kutyapti) — nima chiqadi?', 'tayyor = true; kutyapti = !tayyor; chopEt(kutyapti) — нима чиқади?'),
      options: [lt('true', 'true'), lt('false', 'false'), lt('1', '1')],
      correctIndex: 1,
      explanation: lt('true ning teskarisi — false.', 'true нинг тескариси — false.'),
    },
  },
];

export const LOOP_BUG_TASKS: LoopBugTask[] = [
  {
    id: 'loop-1',
    skillId: 'sikllar',
    difficulty: 1,
    mode: 'trace-output',
    title: lt('Oddiy takrorlash', 'Оддий такрорлаш'),
    prompt: lt('Sikl tugagandan keyin sanoq nechaga teng boʻladi?', 'Цикл тугагандан кейин sanoq нечага тенг бўлади?'),
    codeLines: ['sanoq = 0', '3 marta takrorla {', '  sanoq = sanoq + 1', '}', 'chopEt(sanoq)'],
    pythonLines: ['sanoq = 0', 'for _ in range(3):', '    sanoq = sanoq + 1', '# tugadi', 'print(sanoq)'],
    options: [lt('1', '1'), lt('3', '3'), lt('4', '4')],
    correctOptionIndex: 1,
    optionMisconceptions: ['slip', 'ok', 'off-by-one'],
    hints: [
      lt('Boshlanishda sanoq = 0.', 'Бошланишда sanoq = 0.'),
      lt('Sikl 3 marta aylanadi, har safar 1 qoʻshiladi.', 'Цикл 3 марта айланади, ҳар сафар 1 қўшилади.'),
      lt('0 + 1 + 1 + 1 ni hisobla.', '0 + 1 + 1 + 1 ни ҳисобла.'),
    ],
    explanation: lt(
      '3 marta takrorlanadigan sikl sanoqni 0 dan 3 ga oshiradi.',
      '3 марта такрорланадиган цикл sanoqни 0 дан 3 га оширади.'
    ),
    traceId: 'trace-loop-1',
    twin: {
      prompt: lt('s = 2; 3 marta takrorla { s = s + 1 }; chopEt(s) — natija nechchi?', 's = 2; 3 марта такрорла { s = s + 1 }; chopEt(s) — натижа неччи?'),
      options: [lt('3', '3'), lt('5', '5'), lt('6', '6')],
      correctIndex: 1,
      explanation: lt('2 + 1 + 1 + 1 = 5.', '2 + 1 + 1 + 1 = 5.'),
    },
  },
  {
    id: 'loop-2',
    skillId: 'sikllar',
    difficulty: 1,
    mode: 'bug-line',
    title: lt('Cheksiz sikl tuzogʻi', 'Чексиз цикл тузоғи'),
    prompt: lt('Dastur 1 dan 5 gacha sanashi kerak, lekin toʻxtamayapti! Xato qatorni bos:', 'Дастур 1 дан 5 гача санаши керак, лекин тўхтамаяпти! Хато қаторни бос:'),
    codeLines: ['i = 1', 'toki (i <= 5) {', '  chopEt(i)', '  i = i - 1', '}'],
    pythonLines: ['i = 1', 'while i <= 5:', '    print(i)', '    i = i - 1', '# cheksiz!'],
    correctLine: 4,
    lineMisconceptions: ['slip', 'off-by-one', 'slip', 'counter-never-moves', 'slip'],
    hints: [
      lt('Sikl i <= 5 boʻlganda toʻxtashi uchun i kattalashishi kerak.', 'Цикл i <= 5 бўлганда тўхташи учун i катталашиши керак.'),
      lt('i ning qiymatini oʻzgartiruvchi qatorga qara.', 'i нинг қийматини ўзгартирувчи қаторга қара.'),
      lt('4-qatorda i kamayyaptimi yoki ortyaptimi?', '4-қаторда i камаяптими ёки ортяптими?'),
    ],
    explanation: lt(
      '4-qatorda i = i - 1 yozilgani uchun i kamayib, i <= 5 doim rost qoladi.',
      '4-қаторда i = i - 1 ёзилгани учун i камайиб, i <= 5 доим рост қолади.'
    ),
    traceId: 'trace-loop-infinite',
    twin: {
      prompt: lt('i = 10; toki (i >= 1) { i = i + 1 } nega toʻxtamaydi?', 'i = 10; toki (i >= 1) { i = i + 1 } нега тўхтамайди?'),
      options: [
        lt('Chunki i kamayish oʻrniga ortib ketyapti (i >= 1 doim rost)', 'Чунки i камайиш ўрнига ортиб кетяпти (i >= 1 доим рост)'),
        lt('Chunki 10 >= 1 yolgʻon', 'Чунки 10 >= 1 ёлғон'),
        lt('Kompyuter toki siklini oʻqiy olmaydi', 'Компьютер toki циклини ўқий олмайди'),
      ],
      correctIndex: 0,
      explanation: lt('i = i - 1 boʻlgandagina 1 ga yaqinlashib toʻxtardi.', 'i = i - 1 бўлгандагина 1 га яқинлашиб тўхтарди.'),
    },
  },
  {
    id: 'loop-3',
    skillId: 'sikllar',
    difficulty: 1,
    mode: 'trace-output',
    title: lt('1 dan 4 gacha yigʻindi', '1 дан 4 гача йиғинди'),
    prompt: lt('Sikl yakunida yigindi qutisida qaysi son boʻladi?', 'Цикл якунида yigindi қутисида қайси сон бўлади?'),
    codeLines: ['yigindi = 0', 'uchun i = 1 dan 4 gacha {', '  yigindi = yigindi + i', '}', 'chopEt(yigindi)'],
    pythonLines: ['yigindi = 0', 'for i in range(1, 5):', '    yigindi = yigindi + i', '# tugadi', 'print(yigindi)'],
    options: [lt('4', '4'), lt('6', '6'), lt('10', '10')],
    correctOptionIndex: 2,
    optionMisconceptions: ['slip', 'off-by-one', 'ok'],
    hints: [
      lt('i ketma-ket 1, 2, 3, 4 qiymatlarini oladi.', 'i кетма-кет 1, 2, 3, 4 қийматларини олади.'),
      lt('Har bir aylanishda yigindiga i ni qoʻsh.', 'Ҳар бир айланишда yigindiга i ни қўш.'),
      lt('1 + 2 + 3 + 4 ni hisobla.', '1 + 2 + 3 + 4 ни ҳисобла.'),
    ],
    explanation: lt(
      '1 dan 4 gacha sonlar yigʻindisi 1 + 2 + 3 + 4 = 10.',
      '1 дан 4 гача сонлар йиғиндиси 1 + 2 + 3 + 4 = 10.'
    ),
    traceId: 'trace-loop-sum',
    twin: {
      prompt: lt('yigindi = 0; uchun i = 1 dan 3 gacha { yigindi = yigindi + i } — natija nechchi?', 'yigindi = 0; uchun i = 1 dan 3 gacha { yigindi = yigindi + i } — натижа неччи?'),
      options: [lt('3', '3'), lt('6', '6'), lt('10', '10')],
      correctIndex: 1,
      explanation: lt('1 + 2 + 3 = 6.', '1 + 2 + 3 = 6.'),
    },
  },
  {
    id: 'loop-4',
    skillId: 'sikllar',
    difficulty: 2,
    mode: 'bug-line',
    title: lt('Juft sonlar oʻrniga toqlar', 'Жуфт сонлар ўрнига тоқлар'),
    prompt: lt('Dastur faqat juft sonlarni chiqarishi kerak edi, ammo toqlarni chiqaryapti. Xato qatorni bos:', 'Дастур фақат жуфт сонларни чиқариши керак эди, аммо тоқларни чиқаряпти. Хато қаторни бос:'),
    codeLines: ['uchun son = 1 dan 6 gacha {', '  agar (son % 2 == 1) {', '    chopEt(son)', '  }', '}'],
    pythonLines: ['for son in range(1, 7):', '    if son % 2 == 1:', '        print(son)', '    # tugadi', '# tugadi'],
    correctLine: 2,
    lineMisconceptions: ['off-by-one', 'boundary-strict-vs-equal', 'slip', 'slip', 'slip'],
    hints: [
      lt('Qaysi qator sonning juft yoki toqligini tekshiryapti?', 'Қайси қатор соннинг жуфт ёки тоқлигини текширяпти?'),
      lt('Juft son 2 ga boʻlinganda qoldiq 0 boʻladi.', 'Жуфт сон 2 га бўлинганда қолдиқ 0 бўлади.'),
      lt('2-qatordagi == 1 ga diqqat qil.', '2-қатордаги == 1 га диққат қил.'),
    ],
    explanation: lt(
      '2-qatordagi son % 2 == 1 toq sonlarni tanlaydi; juft uchun == 0 boʻlishi kerak.',
      '2-қатордаги son % 2 == 1 тоқ сонларни танлайди; жуфт учун == 0 бўлиши керак.'
    ),
    traceId: 'trace-loop-4',
    twin: {
      prompt: lt('Faqat toq sonlarni topish uchun qaysi shart toʻgʻri?', 'Фақат тоқ сонларни топиш учун қайси шарт тўғри?'),
      options: [lt('son % 2 == 1', 'son % 2 == 1'), lt('son % 2 == 0', 'son % 2 == 0'), lt('son == 2', 'son == 2')],
      correctIndex: 0,
      explanation: lt('Toq son 2 ga boʻlinganda doim 1 qoldiq qoladi.', 'Тоқ сон 2 га бўлинганда доим 1 қолдиқ қолади.'),
    },
  },
  {
    id: 'loop-5',
    skillId: 'sikllar',
    difficulty: 2,
    mode: 'trace-output',
    title: lt('Ikki barobar oʻsish', 'Икки баробар ўсиш'),
    prompt: lt('3 marta koʻpaytirishdan keyin natija nechaga teng boʻladi?', '3 марта кўпайтиришдан кейин натижа нечага тенг бўлади?'),
    codeLines: ['natija = 2', '3 marta takrorla {', '  natija = natija * 2', '}', 'chopEt(natija)'],
    pythonLines: ['natija = 2', 'for _ in range(3):', '    natija = natija * 2', '# tugadi', 'print(natija)'],
    options: [lt('6', '6'), lt('8', '8'), lt('16', '16')],
    correctOptionIndex: 2,
    optionMisconceptions: ['slip', 'off-by-one', 'ok'],
    hints: [
      lt('1-aylanishdan keyin: 2 * 2 = 4.', '1-айланишдан кейин: 2 * 2 = 4.'),
      lt('2-aylanishdan keyin: 4 * 2 = 8.', '2-айланишдан кейин: 4 * 2 = 8.'),
      lt('3-aylanishda 8 ni yana 2 ga koʻpaytir.', '3-айланишда 8 ни яна 2 га кўпайтир.'),
    ],
    explanation: lt(
      'Boshlangʻich 2 soni 3 marta 2 ga koʻpaytiriladi: 2 → 4 → 8 → 16.',
      'Бошланғич 2 сони 3 марта 2 га кўпайтирилади: 2 → 4 → 8 → 16.'
    ),
    traceId: 'trace-loop-5',
    twin: {
      prompt: lt('x = 1; 3 marta takrorla { x = x * 3 }; chopEt(x) — natija nechchi?', 'x = 1; 3 марта такрорла { x = x * 3 }; chopEt(x) — натижа неччи?'),
      options: [lt('9', '9'), lt('27', '27'), lt('3', '3')],
      correctIndex: 1,
      explanation: lt('1 → 3 → 9 → 27.', '1 → 3 → 9 → 27.'),
    },
  },
  {
    id: 'loop-6',
    skillId: 'sikllar',
    difficulty: 2,
    mode: 'bug-line',
    title: lt('Teskariga ketgan chegirma', 'Тескарига кетган чегирма'),
    prompt: lt('Narx 100 dan katta boʻlsa 20 ayirilishi kerak, lekin 120 oʻzgarmayapti! Xato qatorni bos:', 'Нарх 100 дан катта бўлса 20 айирилиши керак, лекин 120 ўзгармаяпти! Хато қаторни бос:'),
    codeLines: ['narx = 120', 'agar (narx < 100) {', '  narx = narx - 20', '}', 'chopEt(narx)'],
    pythonLines: ['narx = 120', 'if narx < 100:', '    narx = narx - 20', '# tugadi', 'print(narx)'],
    correctLine: 2,
    lineMisconceptions: ['slip', 'boundary-strict-vs-equal', 'slip', 'slip', 'slip'],
    hints: [
      lt('Taqqoslash belgisiga (< yoki >) qara.', 'Таққослаш белгисига (< ёки >) қара.'),
      lt('120 < 100 rostmi yoki yolgʻon?', '120 < 100 ростми ёки ёлғон?'),
      lt('2-qatordagi shart teskari yozilgan.', '2-қатордаги шарт тескари ёзилган.'),
    ],
    explanation: lt(
      '2-qatorda narx < 100 oʻrniga narx > 100 boʻlishi kerak edi.',
      '2-қаторда narx < 100 ўрнига narx > 100 бўлиши керак эди.'
    ),
    traceId: 'trace-loop-6',
    twin: {
      prompt: lt('Tezlik 60 dan oshsa ogohlantirish chiqishi uchun qaysi shart toʻgʻri?', 'Тезлик 60 дан ошса огоҳлантириш чиқиши учун қайси шарт тўғри?'),
      options: [lt('agar (tezlik > 60)', 'agar (tezlik > 60)'), lt('agar (tezlik < 60)', 'agar (tezlik < 60)'), lt('agar (tezlik == 0)', 'agar (tezlik == 0)')],
      correctIndex: 0,
      explanation: lt('"60 dan oshsa" bu > 60.', '"60 дан ошса" бу > 60.'),
    },
  },
  {
    id: 'loop-7',
    skillId: 'sikllar',
    difficulty: 3,
    mode: 'trace-output',
    title: lt('Toki sikli qadamlarini sanash', 'Токи цикли қадамларини санаш'),
    prompt: lt('Ushbu toki sikli ichidagi amal jami necha marta bajariladi?', 'Ушбу toki цикли ичидаги амал жами неча марта бажарилади?'),
    codeLines: ['qadam = 10', 'toki (qadam > 4) {', '  qadam = qadam - 3', '}', 'chopEt(qadam)'],
    pythonLines: ['qadam = 10', 'while qadam > 4:', '    qadam = qadam - 3', '# tugadi', 'print(qadam)'],
    options: [lt('2 marta', '2 марта'), lt('3 marta', '3 марта'), lt('4 marta', '4 марта')],
    correctOptionIndex: 0,
    optionMisconceptions: ['ok', 'off-by-one', 'slip'],
    hints: [
      lt('1-marta: 10 > 4 rost → qadam = 7.', '1-марта: 10 > 4 рост → qadam = 7.'),
      lt('2-marta: 7 > 4 rost → qadam = 4.', '2-марта: 7 > 4 рост → qadam = 4.'),
      lt('Endi 4 > 4 rostmi yoki yolgʻon?', 'Энди 4 > 4 ростми ёки ёлғон?'),
    ],
    explanation: lt(
      'qadam 10 → 7 → 4 ga tushadi; 4 > 4 yolgʻon boʻlib sikl 2 martada toʻxtaydi.',
      'qadam 10 → 7 → 4 га тушади; 4 > 4 ёлғон бўлиб цикл 2 мартада тўхтайди.'
    ),
    traceId: 'trace-loop-7',
    twin: {
      prompt: lt('k = 9; toki (k > 3) { k = k - 3 } — necha marta aylanadi?', 'k = 9; toki (k > 3) { k = k - 3 } — неча марта айланади?'),
      options: [lt('2 marta (9 → 6 → 3)', '2 марта (9 → 6 → 3)'), lt('3 marta', '3 марта'), lt('1 marta', '1 марта')],
      correctIndex: 0,
      explanation: lt('3 > 3 yolgʻon, demak 2 marta aylanib toʻxtaydi.', '3 > 3 ёлғон, демак 2 марта айланиб тўхтайди.'),
    },
  },
  {
    id: 'loop-8',
    skillId: 'sikllar',
    difficulty: 3,
    mode: 'bug-line',
    title: lt('Nolga boʻlish xatosi', 'Нолга бўлиш хатоси'),
    prompt: lt('Dastur matematik xato berib toʻxtayapti. Muammoli hisob qatorini bos:', 'Дастур математик хато бериб тўхтаяпти. Муаммоли ҳисоб қаторини бос:'),
    codeLines: ['jami = 100', 'boluvchi = 0', 'javob = jami / boluvchi', 'chopEt(javob)'],
    pythonLines: ['jami = 100', 'boluvchi = 0', 'javob = jami / boluvchi', 'print(javob)'],
    correctLine: 3,
    lineMisconceptions: ['slip', 'slip', 'slip', 'slip'],
    hints: [
      lt('Matematikada qaysi songa boʻlish mumkin emas?', 'Математикада қайси сонга бўлиш мумкин эмас?'),
      lt('boluvchi qutisida 0 turibdi.', 'boluvchi қутисида 0 турибди.'),
      lt('Boʻlish amali bajarilgan qatorni bos.', 'Бўлиш амали бажарилган қаторни бос.'),
    ],
    explanation: lt(
      '3-qatorda 100 / 0 bajarilgan — nolga boʻlish dasturni toʻxtatadi.',
      '3-қаторда 100 / 0 бажарилган — нолга бўлиш дастурни тўхтатади.'
    ),
    traceId: 'trace-loop-8',
    twin: {
      prompt: lt('Boʻlishdan oldin nolga teng emasligini qaysi shart tekshiradi?', 'Бўлишдан олдин нолга тенг эмаслигини қайси шарт текширади?'),
      options: [lt('agar (boluvchi != 0)', 'agar (boluvchi != 0)'), lt('agar (boluvchi == 0)', 'agar (boluvchi == 0)'), lt('agar (jami == 0)', 'agar (jami == 0)')],
      correctIndex: 0,
      explanation: lt('!= 0 belgisi nolga teng emasligini tekshiradi.', '!= 0 белгиси нолга тенг эмаслигини текширади.'),
    },
  },
  {
    id: 'loop-9',
    skillId: 'sikllar',
    difficulty: 3,
    mode: 'trace-output',
    title: lt('Ichma-ich sikl', 'Ичма-ич цикл'),
    prompt: lt('Ikkita ichma-ich sikl tugagach, jami nechchi boʻladi?', 'Иккита ичма-ич цикл тугагач, jami неччи бўлади?'),
    codeLines: ['jami = 0', '2 marta takrorla {', '  3 marta takrorla { jami = jami + 1 }', '}', 'chopEt(jami)'],
    pythonLines: ['jami = 0', 'for _ in range(2):', '    for _ in range(3): jami += 1', '# tugadi', 'print(jami)'],
    options: [lt('5', '5'), lt('6', '6'), lt('9', '9')],
    correctOptionIndex: 1,
    optionMisconceptions: ['slip', 'ok', 'slip'],
    hints: [
      lt('Tashqi sikl 2 marta aylanadi.', 'Ташқи цикл 2 марта айланади.'),
      lt('Har birida ichki sikl 3 marta +1 qoʻshadi.', 'Ҳар бирида ички цикл 3 марта +1 қўшади.'),
      lt('2 * 3 ni hisobla.', '2 * 3 ни ҳисобла.'),
    ],
    explanation: lt(
      'Tashqi siklning har bir qadamida ichki sikl 3 marta ishlaydi: 2 × 3 = 6.',
      'Ташқи циклнинг ҳар бир қадамида ички цикл 3 марта ишлайди: 2 × 3 = 6.'
    ),
    traceId: 'trace-loop-9',
    twin: {
      prompt: lt('jami = 0; 3 marta takrorla { 4 marta takrorla { jami = jami + 1 } } — natija nechchi?', 'jami = 0; 3 марта такрорла { 4 марта такрорла { jami = jami + 1 } } — натижа неччи?'),
      options: [lt('7', '7'), lt('12', '12'), lt('16', '16')],
      correctIndex: 1,
      explanation: lt('3 × 4 = 12.', '3 × 4 = 12.'),
    },
  },
  {
    id: 'loop-10',
    skillId: 'sikllar',
    difficulty: 3,
    mode: 'bug-line',
    title: lt('Bitta kam xatosi (Off-by-one)', 'Битта кам хатоси (Off-by-one)'),
    prompt: lt('Dastur 1 dan 5 gacha qoʻshishi kerak, lekin 15 oʻrniga 10 chiqaryapti! Xato qatorni bos:', 'Дастур 1 дан 5 гача қўшиши керак, лекин 15 ўрнига 10 чиқаряпти! Хато қаторни бос:'),
    codeLines: ['yigindi = 0', 'uchun i = 1 dan 5 gacha (i < 5) {', '  yigindi = yigindi + i', '}', 'chopEt(yigindi)'],
    pythonLines: ['yigindi = 0', 'for i in range(1, 5):', '    yigindi = yigindi + i', '# tugadi', 'print(yigindi)'],
    correctLine: 2,
    lineMisconceptions: ['slip', 'off-by-one', 'slip', 'slip', 'slip'],
    hints: [
      lt('Shart qismidagi i < 5 ga diqqat qil.', 'Шарт қисмидаги i < 5 га диққат қил.'),
      lt('i = 5 boʻlganda 5 < 5 sharti rostmi?', 'i = 5 бўлганда 5 < 5 шарти ростми?'),
      lt('5 ham kirishi uchun i <= 5 kerak.', '5 ҳам кириши учун i <= 5 керак.'),
    ],
    explanation: lt(
      '2-qatordagi i < 5 faqat 1..4 ni oladi; 5 ni qoʻshish uchun i <= 5 kerak.',
      '2-қатордаги i < 5 фақат 1..4 ни олади; 5 ни қўшиш учун i <= 5 керак.'
    ),
    traceId: 'trace-loop-10',
    twin: {
      prompt: lt('1 dan 5 gacha barcha 5 ta sonni olish uchun qaysi shart toʻgʻri?', '1 дан 5 гача барча 5 та сонни олиш учун қайси шарт тўғри?'),
      options: [lt('i <= 5', 'i <= 5'), lt('i < 5', 'i < 5'), lt('i > 5', 'i > 5')],
      correctIndex: 0,
      explanation: lt('<= belgisi 5 ning oʻzini ham siklga kiritadi.', '<= белгиси 5 нинг ўзини ҳам циклга киритади.'),
    },
  },
];

export const BADGES: BadgeDefinition[] = [
  {
    id: 'ilk-qadam',
    title: lt('Ilk Qadam', 'Илк Қадам'),
    criteria: lt('Birinchi topshiriqni tushunib yechish', 'Биринчи топшириқни тушуниб ечиш'),
    iconKey: 'compass',
  },
  {
    id: 'algoritm-ustasi',
    title: lt('Algoritm Ustasi', 'Алгоритм Устаси'),
    criteria: lt('1-dars va Algoritm Zanjiri ustaxonasini egallash', '1-дарс ва Алгоритм Занжири устахонасини эгаллаш'),
    iconKey: 'cpu',
  },
  {
    id: 'mantiq-posboni',
    title: lt('Mantiq Posboni', 'Мантиқ Посбони'),
    criteria: lt('2–3-dars va Mantiq Qopqonini egallash', '2–3-дарс ва Мантиқ Қопқонини эгаллаш'),
    iconKey: 'sparkles',
  },
  {
    id: 'xato-ovchisi',
    title: lt('Xato Ovchisi', 'Хато Овчиси'),
    criteria: lt('4-dars va Sikl ustaxonasini egallash', '4-дарс ва Цикл устахонасини эгаллаш'),
    iconKey: 'bug',
  },
  {
    id: 'xato-tuzatuvchi',
    title: lt('Tuzatish Ustasi', 'Тузатиш Устаси'),
    criteria: lt('Xatodan keyin oʻxshash misolda tushunishni isbotlash', 'Хатодан кейин ўхшаш мисолда тушунишни исботлаш'),
    iconKey: 'flame',
  },
  {
    id: 'kod-meʼmori',
    title: lt('Buyuk Kod Meʼmori', 'Буюк Код Меъмори'),
    criteria: lt('Barcha 3 koʻnikmani ham qoʻllab, ham tushuntira olish', 'Барча 3 кўникмани ҳам қўллаб, ҳам тушунтира олиш'),
    iconKey: 'award',
  },
];

export interface CurriculumValidationResult {
  valid: boolean;
  errors: string[];
  totalTasks: number;
}

export function validateCurriculum(): CurriculumValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  if (SKILL_NODES.length !== 3) {
    errors.push(`Expected 3 skill nodes, found ${SKILL_NODES.length}`);
  }

  for (const node of SKILL_NODES) {
    if (node.takeaways.length !== 3) {
      errors.push(`Skill ${node.id} must have 3 takeaways`);
    }
  }

  for (const task of SEQUENCE_TASKS) {
    if (seenIds.has(task.id)) errors.push(`Duplicate task id: ${task.id}`);
    seenIds.add(task.id);
    if (task.correctSteps.length < 3) errors.push(`${task.id}: too few steps`);
    if (task.hints.length !== 3) errors.push(`${task.id}: must have 3 hints`);
  }

  for (const task of LOGIC_TASKS) {
    if (seenIds.has(task.id)) errors.push(`Duplicate task id: ${task.id}`);
    seenIds.add(task.id);
    if (task.correctIndex < 0 || task.correctIndex >= task.options.length) {
      errors.push(`${task.id}: invalid correctIndex`);
    }
    if (task.misconceptionIds.length !== task.options.length) {
      errors.push(`${task.id}: misconceptionIds count mismatch`);
    }
    if (task.hints.length !== 3) errors.push(`${task.id}: must have 3 hints`);
  }

  for (const task of LOOP_BUG_TASKS) {
    if (seenIds.has(task.id)) errors.push(`Duplicate task id: ${task.id}`);
    seenIds.add(task.id);
    if (task.mode === 'bug-line') {
      if (
        !task.correctLine ||
        task.correctLine < 1 ||
        task.correctLine > task.codeLines.length
      ) {
        errors.push(`${task.id}: invalid correctLine`);
      }
    } else {
      if (
        !task.options ||
        task.correctOptionIndex === undefined ||
        task.correctOptionIndex < 0 ||
        task.correctOptionIndex >= task.options.length
      ) {
        errors.push(`${task.id}: invalid trace options`);
      }
    }
    if (task.hints.length !== 3) errors.push(`${task.id}: must have 3 hints`);
  }

  return {
    valid: errors.length === 0,
    errors,
    totalTasks: SEQUENCE_TASKS.length + LOGIC_TASKS.length + LOOP_BUG_TASKS.length,
  };
}
