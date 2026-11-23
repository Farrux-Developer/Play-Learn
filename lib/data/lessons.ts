/**
 * 4 structured mini-lessons ("Dars") following the 12 Explainer Standard rules:
 * Predict -> Observe -> Explain, <= 12-word core idea, worked -> faded -> independent,
 * named misconceptions ("Mirzoning xatosi"), teach-back ("Mirzoga tushuntir"), and transfer.
 */

import { lt, type LocalizedText } from '../engine/i18n';
import type { SkillId } from './curriculum';

export type LessonId = 'L1' | 'L2' | 'L3' | 'L4';

export type LessonInteractiveType =
  | 'tea-robot'
  | 'trace'
  | 'va-yoki-switches'
  | 'debug-4step';

export interface LessonQuizItem {
  id: string;
  prompt: LocalizedText;
  code?: string;
  options: LocalizedText[];
  correctIndex: number;
  misconceptionIds: string[];
  explanation: LocalizedText;
}

export interface LessonScreen {
  id: string;
  kind:
    | 'hook-predict'
    | 'interactive'
    | 'worked-faded'
    | 'misconceptions'
    | 'teach-back'
    | 'transfer';
  title: LocalizedText;
  /** Core idea in <= 12 words */
  coreIdea: LocalizedText;
  body: LocalizedText;
  analogyBreak?: LocalizedText;
  interactiveType?: LessonInteractiveType;
  traceId?: string;
  /** Used for hook-predict, worked-faded, teach-back, transfer */
  question?: {
    prompt: LocalizedText;
    code?: string;
    pythonCode?: string;
    options: LocalizedText[];
    correctIndex: number;
    optionFeedback: LocalizedText[];
  };
  /** Used for misconceptions screen ("Mirzoning xatosi") */
  misconceptionCards?: {
    id: string;
    wrongClaim: LocalizedText;
    mirzoAttempt: LocalizedText;
    whyWrong: LocalizedText;
  }[];
  /** Optional takeaway & bridge on the final screen */
  takeaway?: LocalizedText;
  bridge?: LocalizedText;
}

export interface LessonDefinition {
  id: LessonId;
  order: number;
  skillId: SkillId;
  title: LocalizedText;
  goal: LocalizedText;
  targetWorkshopTitle: LocalizedText;
  /** Terms highlighted for tap-to-define inside the lesson */
  glossaryIds: string[];
  screens: LessonScreen[];
  /** 3-question check for "Men buni bilaman" */
  knowItCheck: LessonQuizItem[];
}

export const LESSONS: LessonDefinition[] = [
  {
    id: 'L1',
    order: 1,
    skillId: 'algoritmlar',
    title: lt('1-dars: Algoritm nima?', '1-дарс: Алгоритм нима?'),
    goal: lt(
      'Men kundalik ishni aniq qadamlarga boʻlib, tartibini tekshira olaman.',
      'Мен кундалик ишни аниқ қадамларга бўлиб, тартибини текшира оламан.'
    ),
    targetWorkshopTitle: lt('Algoritm Zanjiri', 'Алгоритм Занжири'),
    glossaryIds: ['algoritm'],
    screens: [
      {
        id: 'l1-hook',
        kind: 'hook-predict',
        title: lt('Robot choy damlay oladimi?', 'Робот чой дамлай оладими?'),
        coreIdea: lt(
          'Kompyuter taxmin qilmaydi — faqat yozilganini bajaradi.',
          'Компьютер тахмин қилмайди — фақат ёзилганини бажаради.'
        ),
        body: lt(
          'Mirzo robotga: "1. Choy sol. 2. Choynakka suv quy." deb yozdi. Robot qanday ishlaydi?',
          'Мирзо роботга: "1. Чой сол. 2. Чойнакка сув қуй." деб ёзди. Робот қандай ишлайди?'
        ),
        question: {
          prompt: lt('Taxmin qil: robot nima qiladi?', 'Тахмин қил: робот нима қилади?'),
          options: [
            lt(
              'Oʻzi tushunib, avval suv quyadi',
              'Ўзи тушуниб, аввал сув қуяди'
            ),
            lt(
              'Avval quruq choynakka choy soladi, tartibni toʻgʻrilamaydi',
              'Аввал қуруқ чойнакка чой солади, тартибни тўғриламайди'
            ),
            lt(
              'Tartibning farqi yoʻq, baribir choy chiqadi',
              'Тартибнинг фарқи йўқ, барибир чой чиқади'
            ),
          ],
          correctIndex: 1,
          optionFeedback: [
            lt(
              'Robot aqlli boʻlib koʻrinsa ham, buyruq tartibini oʻzgartira olmaydi.',
              'Робот ақлли бўлиб кўринса ҳам, буйруқ тартибини ўзгартира олмайди.'
            ),
            lt(
              'Toʻgʻri! Robot 1-qatordan 2-qatorga koʻr-koʻrona yuradi.',
              'Тўғри! Робот 1-қатордан 2-қаторга кўр-кўрона юради.'
            ),
            lt(
              'Agar qaynoq suvdan oldin sovuq choynakka solinsa, taʼmi ham, harorati ham boshqa boʻladi.',
              'Агар қайноқ сувдан олдин совуқ чойнакка солинса, таъми ҳам, ҳарорати ҳам бошқа бўлади.'
            ),
          ],
        },
      },
      {
        id: 'l1-interactive',
        kind: 'interactive',
        title: lt('Tajriba: Robotga aniq buyruq ber', 'Тажриба: Роботга аниқ буйруқ бер'),
        coreIdea: lt(
          'Algoritm — maqsadga olib boruvchi aniq va tartibli qadamlar.',
          'Алгоритм — мақсадга олиб борувчи аниқ ва тартибли қадамлар.'
        ),
        body: lt(
          'Qadamlarni toʻgʻri tartibda sinab koʻr va oʻxshatish qayerda buzilishini kuzat.',
          'Қадамларни тўғри тартибда синаб кўр ва ўхшатиш қаерда бузилишини кузат.'
        ),
        analogyBreak: lt(
          'Retseptda "taʼbga koʻra tuz sol" deyish mumkin. Kompyuter esa tatib koʻra olmaydi — unga "1 choy qoshiq" kabi aniq son kerak.',
          'Рецептда "таъбга кўра туз сол" дейиш мумкин. Компьютер эса татиб кўра олмайди — унга "1 чой қошиқ" каби аниқ сон керак.'
        ),
        interactiveType: 'tea-robot',
      },
      {
        id: 'l1-worked',
        kind: 'worked-faded',
        title: lt('Namuna: Yoʻlni qadamga boʻlish', 'Намуна: Йўлни қадамга бўлиш'),
        coreIdea: lt(
          'Katta ishni kichik, tekshirsa boʻladigan qadamlarga boʻl.',
          'Катта ишни кичик, текширса бўладиган қадамларга бўл.'
        ),
        body: lt(
          'Mirzo maktab sumkasini yigʻish algoritmini yozdi: 1. Dars jadvaliga qara. 2. [ ___ ]. 3. Sumkani yop.',
          'Мирзо мактаб сумкасини йиғиш алгоритмини ёзди: 1. Дарс жадвалига қара. 2. [ ___ ]. 3. Сумкани ёп.'
        ),
        question: {
          prompt: lt('2-qadamga qaysi aniq buyruq tushadi?', '2-қадамга қайси аниқ буйруқ тушади?'),
          options: [
            lt('Kerakli kitoblarni sol', 'Керакли китобларни сол'),
            lt('Ertalab uyga qayt', 'Эрталаб уйга қайт'),
            lt('Sumkani yopib, keyin kitob sol', 'Сумкани ёпиб, кейин китоб сол'),
          ],
          correctIndex: 0,
          optionFeedback: [
            lt(
              'Ajoyib! Jadvalga qarab, sumkani yopishdan oldin kitoblarni solish mantiqiy.',
              'Ажойиб! Жадвалга қараб, сумкани ёпишдан олдин китобларни солиш мантиқий.'
            ),
            lt(
              'Bu qadam sumka yigʻish maqsadiga tegishli emas.',
              'Бу қадам сумка йиғиш мақсадига тегишли эмас.'
            ),
            lt(
              'Yopilgan sumkaga kitob solib boʻlmaydi — qadamlar teskari!',
              'Ёпилган сумкага китоб солиб бўлмайди — қадамлар тескари!'
            ),
          ],
        },
      },
      {
        id: 'l1-misconceptions',
        kind: 'misconceptions',
        title: lt('Mirzoning 3 ta keng tarqalgan xatosi', 'Мирзонинг 3 та кенг тарқалган хатоси'),
        coreIdea: lt(
          'Algoritm faqat kompyuterda emas — har bir aniq rejada bor.',
          'Алгоритм фақат компьютерда эмас — ҳар бир аниқ режада бор.'
        ),
        body: lt(
          'Mana yangi boshlaganlar eng koʻp adashadigan 3 ta fikr. Har birini oʻqib koʻr:',
          'Мана янги бошлаганлар энг кўп адашадиган 3 та фикр. Ҳар бирини ўқиб кўр:'
        ),
        misconceptionCards: [
          {
            id: 'order-doesnt-matter',
            wrongClaim: lt('"Tartibning farqi yoʻq"', '"Тартибнинг фарқи йўқ"'),
            mirzoAttempt: lt('Avval poyabzal kiyish, keyin paypoq kiyish.', 'Аввал пойабзал кийиш, кейин пайпоқ кийиш.'),
            whyWrong: lt(
              'Natija butunlay oʻzgaradi. Qadamlar ketma-ketligi algoritmning yuragi.',
              'Натижа бутунлай ўзгаради. Қадамлар кетма-кетлиги алгоритмнинг юраги.'
            ),
          },
          {
            id: 'computer-guesses',
            wrongClaim: lt('"Kompyuter maʼnosini oʻzi tushunadi"', '"Компьютер маъносини ўзи тушунади"'),
            mirzoAttempt: lt('"Biroz yur" deb yozish.', '"Бироз юр" деб ёзиш.'),
            whyWrong: lt(
              '"Biroz" qancha? 1 qadammi yoki 100? Mashinaga aniq oʻlchov kerak.',
              '"Бироз" қанча? 1 қадамми ёки 100? Машинага аниқ ўлчов керак.'
            ),
          },
          {
            id: 'only-in-computers',
            wrongClaim: lt('"Algoritm faqat dasturchilarga kerak"', '"Алгоритм фақат дастурчиларга керак"'),
            mirzoAttempt: lt('Retsept va yoʻl xaritasini algoritm deb hisoblamaslik.', 'Рецепт ва йўл харитасини алгоритм деб ҳисобламаслик.'),
            whyWrong: lt(
              'Tish yuvish, palov pishirish va svetofordan oʻtish ham kundalik algoritmlardir.',
              'Тиш ювиш, палов пишириш ва светофордан ўтиш ҳам кундалик алгоритмлардир.'
            ),
          },
        ],
      },
      {
        id: 'l1-teachback',
        kind: 'teach-back',
        title: lt('Mirzoga tushuntir', 'Мирзога тушунтир'),
        coreIdea: lt(
          'Oʻz soʻzing bilan tushuntira olsang — mavzuni egallading.',
          'Ўз сўзинг билан тушунтира олсанг — мавзуни эгалладинг.'
        ),
        body: lt(
          'Kichik ukang: "Algoritm nima uchun bunchalik aniq boʻlishi kerak?" deb soʻradi. Eng toʻgʻri javobni tanla:',
          'Кичик уканг: "Алгоритм нима учун бунчалик аниқ бўлиши керак?" деб сўради. Энг тўғри жавобни танла:'
        ),
        question: {
          prompt: lt('Qaysi tushuntirish eng aniq?', 'Қайси тушунтириш энг аниқ?'),
          options: [
            lt(
              'Chunki kompyuter oʻzi aqlli boʻlib, tartib xatosini avtomatik tuzatadi.',
              'Чунки компьютер ўзи ақлли бўлиб, тартиб хатосини автоматик тузатади.'
            ),
            lt(
              'Chunki kompyuter nima nazarda tutganingni taxmin qilmaydi, yozilgan qadamni tartib bilan bajaradi.',
              'Чунки компьютер нима назарда тутганингни тахмин қилмайди, ёзилган қадамни тартиб билан бажаради.'
            ),
            lt(
              'Chunki algoritm faqat kompyuter ekrani ichida ishlaydigan maxsus kod.',
              'Чунки алгоритм фақат компьютер экрани ичида ишлайдиган махсус код.'
            ),
          ],
          correctIndex: 1,
          optionFeedback: [
            lt(
              'Ehtiyot boʻl: mashina taxmin qilmaydi va tartibni oʻzi tuzatmaydi.',
              'Эҳтиёт бўл: машина тахмин қилмайди ва тартибни ўзи тузатмайди.'
            ),
            lt(
              'Barakalla! Sen ham tartib, ham aniqlik sababini toʻgʻri aytding.',
              'Баракалла! Сен ҳам тартиб, ҳам аниқлик сабабини тўғри айтдинг.'
            ),
            lt(
              'Algoritm hayotda ham ishlaydi — kod uning kompyuterdagi koʻrinishi xolos.',
              'Алгоритм ҳаётда ҳам ишлайди — код унинг компьютердаги кўриниши холос.'
            ),
          ],
        },
      },
      {
        id: 'l1-transfer',
        kind: 'transfer',
        title: lt('Yangi vaziyatda qoʻlla', 'Янги вазиятда қўлла'),
        coreIdea: lt(
          'Tartib xatosini yangi vaziyatda ham darhol payqa.',
          'Тартиб хатосини янги вазиятда ҳам дарҳол пайқа.'
        ),
        body: lt(
          'Velosiped shinasini yamash algoritmiga qara: 1. Teshikni top. 2. Yamoq yopishtir. 3. Gʻildirakni yech. 4. Havo ur.',
          'Велосипед шинасини ямаш алгоритмига қара: 1. Тешикни топ. 2. Ямоқ ёпиштир. 3. Ғилдиракни еч. 4. Ҳаво ур.'
        ),
        question: {
          prompt: lt('Bu yerda nima notoʻgʻri yozilgan?', 'Бу ерда нима нотўғри ёзилган?'),
          options: [
            lt(
              '4-qadam ("Havo ur") eng boshida turishi kerak',
              '4-қадам ("Ҳаво ур") энг бошида туриши керак'
            ),
            lt(
              'Hammasi toʻgʻri, hech narsani oʻzgartirish shart emas',
              'Ҳаммаси тўғри, ҳеч нарсани ўзгартириш шарт эмас'
            ),
            lt(
              '3-qadam ("Gʻildirakni yech") 1-qadamdan oldin boʻlishi kerak',
              '3-қадам ("Ғилдиракни еч") 1-қадамдан олдин бўлиши керак'
            ),
          ],
          correctIndex: 2,
          optionFeedback: [
            lt(
              'Yamoq yopishtirmasdan havo ursang, havo chiqib ketaveradi.',
              'Ямоқ ёпиштирмасдан ҳаво урсанг, ҳаво чиқиб кетаверади.'
            ),
            lt(
              'Diqqat qil: 3-qadam joyida emas — gʻildirak oxirida emas, boshida yechiladi.',
              'Диққат қил: 3-қадам жойида эмас — ғилдирак охирида эмас, бошида ечилади.'
            ),
            lt(
              'Toʻgʻri! Gʻildirakni yechmasdan teshikni topish va yamash qiyin.',
              'Тўғри! Ғилдиракни ечмасдан тешикни топиш ва ямаш қийин.'
            ),
          ],
        },
        takeaway: lt(
          'Algoritm — maqsadga olib boradigan aniq va qatʼiy tartibli qadamlar zanjiri.',
          'Алгоритм — мақсадга олиб борадиган аниқ ва қатъий тартибли қадамлар занжири.'
        ),
        bridge: lt(
          'Keyingi darsda kompyuter bu qadamlarda sonlarni qanday eslab qolishini koʻramiz.',
          'Кейинги дарсда компьютер бу қадамларда сонларни қандай эслаб қолишини кўрамиз.'
        ),
      },
    ],
    knowItCheck: [
      {
        id: 'l1-k1',
        prompt: lt('Kompyuter algoritmdagi tartibi almashgan qadamlarni nima qiladi?', 'Компьютер алгоритмдаги тартиби алмашган қадамларни нима қилади?'),
        options: [
          lt('Oʻzi toʻgʻrilab bajaradi', 'Ўзи тўғрилаб бажаради'),
          lt('Yozilgan tartibda xato natija beradi', 'Ёзилган тартибда хато натижа беради'),
          lt('Faqat oxirgi qadamni bajaradi', 'Фақат охирги қадамни бажаради'),
        ],
        correctIndex: 1,
        misconceptionIds: ['computer-guesses', 'ok', 'order-doesnt-matter'],
        explanation: lt(
          'Kompyuter buyruqlarni yozilgan tartibda bajaradi va oʻzi taxmin qilmaydi.',
          'Компьютер буйруқларни ёзилган тартибда бажаради ва ўзи тахмин қилмайди.'
        ),
      },
      {
        id: 'l1-k2',
        prompt: lt('Qaysi buyruq kompyuter uchun yetarlicha aniq?', 'Қайси буйруқ компьютер учун етарлича аниқ?'),
        options: [
          lt('"Ozroq tuz sol"', '"Озроқ туз сол"'),
          lt('"Oldinga 3 katak yur"', '"Олдинга 3 катак юр"'),
          lt('"Chiroyli qilib chiz"', '"Чиройли қилиб чиз"'),
        ],
        correctIndex: 1,
        misconceptionIds: ['computer-guesses', 'ok', 'computer-guesses'],
        explanation: lt(
          'Aniq son va harakat ("3 katak yur") mashinaga tushunarli.',
          'Аниқ сон ва ҳаракат ("3 катак юр") машинага тушунарли.'
        ),
      },
      {
        id: 'l1-k3',
        prompt: lt('Qaysi biri kundalik hayotdagi algoritm hisoblanadi?', 'Қайси бири кундалик ҳаётдаги алгоритм ҳисобланади?'),
        options: [
          lt('Choy damlash qadamlari', 'Чой дамлаш қадамлари'),
          lt('Faqat Python dasturi', 'Фақат Python дастури'),
          lt('Tasodifiy sakrash', 'Тасодифий сакраш'),
        ],
        correctIndex: 0,
        misconceptionIds: ['ok', 'only-in-computers', 'order-doesnt-matter'],
        explanation: lt(
          'Choy damlash aniq maqsad va ketma-ket qadamlarga ega.',
          'Чой дамлаш аниқ мақсад ва кетма-кет қадамларга эга.'
        ),
      },
    ],
  },

  {
    id: 'L2',
    order: 2,
    skillId: 'mantiq',
    title: lt('2-dars: Oʻzgaruvchi va xotira qutilari', '2-дарс: Ўзгарувчи ва хотира қутилари'),
    goal: lt(
      'Men har bir qatordan keyin oʻzgaruvchi qutisida nima turishini ayta olaman.',
      'Мен ҳар бир қатордан кейин ўзгарувчи қутисида нима туришини айта оламан.'
    ),
    targetWorkshopTitle: lt('Mantiq Qopqoni', 'Мантиқ Қопқони'),
    glossaryIds: ['ozgaruvchi'],
    screens: [
      {
        id: 'l2-hook',
        kind: 'hook-predict',
        title: lt('Qutining ichida nima qoldi?', 'Қутининг ичида нима қолди?'),
        coreIdea: lt(
          'Oʻzgaruvchi bitta qiymat saqlaydi; yangisi eskisini almashtiradi.',
          'Ўзгарувчи битта қиймат сақлайди; янгиси эскисини алмаштиради.'
        ),
        body: lt(
          'Mirzo mashinasida har bir oʻzgaruvchi — nomli quti. Mana shu 3 qator bajarilsa, ekranga nima chiqadi?',
          'Мирзо машинасида ҳар бир ўзгарувчи — номли қути. Мана шу 3 қатор бажарилса, экранга нима чиқади?'
        ),
        question: {
          prompt: lt('Taxmin qil: chopEt(x) nimani chiqaradi?', 'Тахмин қил: chopEt(x) нимани чиқаради?'),
          code: 'x = 5\nx = 8\nchopEt(x)',
          pythonCode: 'x = 5\nx = 8\nprint(x)',
          options: [lt('5', '5'), lt('8', '8'), lt('13', '13')],
          correctIndex: 1,
          optionFeedback: [
            lt(
              '5 birinchi qatorda bor edi, lekin 2-qator uni almashtirib yubordi.',
              '5 биринчи қаторда бор эди, лекин 2-қатор уни алмаштириб юборди.'
            ),
            lt(
              'Toʻgʻri! Qutida faqat oxirgi yozilgan qiymat — 8 qoladi.',
              'Тўғри! Қутида фақат охирги ёзилган қиймат — 8 қолади.'
            ),
            lt(
              'x = 8 qoʻshish emas, eski qiymat oʻrniga yangisini yozish buyrugʻi.',
              'x = 8 қўшиш эмас, эски қиймат ўрнига янгисини ёзиш буйруғи.'
            ),
          ],
        },
      },
      {
        id: 'l2-interactive',
        kind: 'interactive',
        title: lt('Kuzat: Mirzo mashinasida quti qanday oʻzgaradi?', 'Кузат: Мирзо машинасида қути қандай ўзгаради?'),
        coreIdea: lt(
          'Mashina kodni yuqoridan pastga qatorma-qator oʻqiydi.',
          'Машина кодни юқоридан пастга қаторма-қатор ўқийди.'
        ),
        body: lt(
          'Qadam-ba-qadam yurib, x qutisidagi qiymat qanday almashishini koʻr.',
          'Қадам-ба-қадам юриб, x қутисидаги қиймат қандай алмашишини кўр.'
        ),
        interactiveType: 'trace',
        traceId: 'trace-var-overwrite',
      },
      {
        id: 'l2-worked',
        kind: 'worked-faded',
        title: lt('Sirli qator: x = x + 1', 'Сирли қатор: x = x + 1'),
        coreIdea: lt(
          'Tenglikning oʻng tomoni hisoblanib, chapdagi qutiga yoziladi.',
          'Тенгликнинг ўнг томони ҳисобланиб, чапдаги қутига ёзилади.'
        ),
        body: lt(
          'Matematikada x = x + 1 xato koʻrinadi. Kodda esa u: "Hozirgi x ni ol, 1 qoʻsh, yana x qutisiga sol" degani.',
          'Математикада x = x + 1 хато кўринади. Кодда эса у: "Ҳозирги x ни ол, 1 қўш, яна x қутисига сол" дегани.'
        ),
        interactiveType: 'trace',
        traceId: 'trace-var-increment',
      },
      {
        id: 'l2-misconceptions',
        kind: 'misconceptions',
        title: lt('Oʻzgaruvchidagi 3 ta tuzoq', 'Ўзгарувчидаги 3 та тузоқ'),
        coreIdea: lt(
          'a = b qiymatni bir marta nusxalaydi, abadiy bogʻlamaydi.',
          'a = b қийматни бир марта нусхалайди, абадий боғламайди.'
        ),
        body: lt(
          'Yangi dasturchilar koʻpincha shu uch joyda adashadi:',
          'Янги дастурчилар кўпинча шу уч жойда адашади:'
        ),
        misconceptionCards: [
          {
            id: 'overwrite-adds',
            wrongClaim: lt('"Yangi son eskisiga qoʻshiladi"', '"Янги сон эскисига қўшилади"'),
            mirzoAttempt: lt('x = 5; x = 8 dan keyin x = 13 deb oʻylash.', 'x = 5; x = 8 дан кейин x = 13 деб ўйлаш.'),
            whyWrong: lt(
              'Qutiga faqat bitta narsa sigʻadi. 8 kirganda 5 chiqib ketadi.',
              'Қутига фақат битта нарса сиғади. 8 кирганда 5 чиқиб кетади.'
            ),
          },
          {
            id: 'copy-links-forever',
            wrongClaim: lt('"a = b boʻlsa, b oʻzgarsa a ham oʻzgaradi"', '"a = b бўлса, b ўзгарса a ҳам ўзгаради"'),
            mirzoAttempt: lt('a = b; b = 99 dan keyin a = 99 deb oʻylash.', 'a = b; b = 99 дан кейин a = 99 деб ўйлаш.'),
            whyWrong: lt(
              'Nusxa bir marta olinadi. Keyin b oʻzgarsa, a oʻzining eski nusxasini saqlab qoladi.',
              'Нусха бир марта олинади. Кейин b ўзгарса, a ўзининг эски нусхасини сақлаб қолади.'
            ),
          },
          {
            id: 'self-update-impossible',
            wrongClaim: lt('"x = x + 1 mumkin emas"', '"x = x + 1 мумкин эмас"'),
            mirzoAttempt: lt('Uni matematika tenglamasi deb tushunish.', 'Уни математика тенгламаси деб тушуниш.'),
            whyWrong: lt(
              'Bu tenglama emas, buyruq: eski qiymatdan yangisini yasash.',
              'Бу тенглама эмас, буйруқ: эски қийматдан янгисини ясаш.'
            ),
          },
        ],
      },
      {
        id: 'l2-teachback',
        kind: 'teach-back',
        title: lt('Mirzoga tushuntir', 'Мирзога тушунтир'),
        coreIdea: lt(
          'Nusxa koʻchirish va bogʻlanish bir narsa emas.',
          'Нусха кўчириш ва боғланиш бир нарса эмас.'
        ),
        body: lt(
          'a = 10; b = 20; a = b; b = 99 dan keyin nega a = 20 boʻlib qolishini doʻstingga qanday tushuntirasan?',
          'a = 10; b = 20; a = b; b = 99 дан кейин нега a = 20 бўлиб қолишини дўстингга қандай тушунтирасан?'
        ),
        question: {
          prompt: lt('Eng toʻgʻri tushuntirishni tanla:', 'Энг тўғри тушунтиришни танла:'),
          options: [
            lt(
              'a = b qatori b ning oʻsha paytdagi qiymati 20 ni a qutisiga bir marta nusxalaydi; keyin b mustaqil oʻzgaradi.',
              'a = b қатори b нинг ўша пайтдаги қиймати 20 ни a қутисига бир марта нусхалайди; кейин b мустақил ўзгаради.'
            ),
            lt(
              'a qutisi doim b ga bogʻliq boʻlib qoladi, shuning uchun 99 ga aylanishi kerak edi.',
              'a қутиси доим b га боғлиқ бўлиб қолади, шунинг учун 99 га айланиши керак эди.'
            ),
            lt(
              'Kompyuter oxirgi b = 99 qatorini oʻqimasdan tashlab ketadi.',
              'Компьютер охирги b = 99 қаторини ўқимасдан ташлаб кетади.'
            ),
          ],
          correctIndex: 0,
          optionFeedback: [
            lt(
              'Zoʻr! Qiymat bir marta nusxalanadi, qutilar bir-biriga bogʻlanib qolmaydi.',
              'Зўр! Қиймат бир марта нусхаланади, қутилар бир-бирига боғланиб қолмайди.'
            ),
            lt(
              'Yoʻq, a = b ip bilan bogʻlash emas, faqat sonni koʻchirib qoʻyish.',
              'Йўқ, a = b ип билан боғлаш эмас, фақат сонни кўчириб қўйиш.'
            ),
            lt(
              'Mashina har bir qatorni oʻqiydi — b = 99 boʻldi, lekin u faqat b qutisiga tegdi.',
              'Машина ҳар бир қаторни ўқийди — b = 99 бўлди, лекин у фақат b қутисига тегди.'
            ),
          ],
        },
      },
      {
        id: 'l2-transfer',
        kind: 'transfer',
        title: lt('Yangi vaziyat: Ikkita qutini almashtirish', 'Янги вазият: Иккита қутини алмаштириш'),
        coreIdea: lt(
          'Almashtirish uchun uchinchi boʻsh quti kerak.',
          'Алмаштириш учун учинчи бўш қути керак.'
        ),
        body: lt(
          'Choy piyolasi va suv piyolasini toʻkmasdan almashtirish uchun uchinchi boʻsh piyola kerak. Qutilarda ham shunday!',
          'Чой пиёласи ва сув пиёласини тўкмасдан алмаштириш учун учинчи бўш пиёла керак. Қутиларда ҳам шундай!'
        ),
        question: {
          prompt: lt('A = 3 va B = 7 qiymatlarini yoʻqotmasdan almashtirish uchun qaysi kod toʻgʻri?', 'A = 3 ва B = 7 қийматларини йўқотмасдан алмаштириш учун қайси код тўғри?'),
          options: [
            lt('A = B; B = A', 'A = B; B = A'),
            lt('vaqtincha = A; A = B; B = vaqtincha', 'vaqtincha = A; A = B; B = vaqtincha'),
            lt('A = A + B', 'A = A + B'),
          ],
          correctIndex: 1,
          optionFeedback: [
            lt(
              'A = B qilishing bilan A dagi 3 oʻchib ketadi va ikkalasi ham 7 boʻlib qoladi.',
              'A = B қилишинг билан A даги 3 ўчиб кетади ва иккаласи ҳам 7 бўлиб қолади.'
            ),
            lt(
              'Toʻgʻri! vaqtincha 3 ni saqlab turadi, A ga 7 kiradi, keyin B ga 3 qaytadi.',
              'Тўғри! vaqtincha 3 ни сақлаб туради, A га 7 киради, кейин B га 3 қайтади.'
            ),
            lt(
              'Bu A ni 10 ga aylantiradi, lekin B hali ham 7 ligicha qoladi.',
              'Бу A ни 10 га айлантиради, лекин B ҳали ҳам 7 лигича қолади.'
            ),
          ],
        },
        takeaway: lt(
          'Oʻzgaruvchi — oxirgi qiymatni saqlovchi nomli quti; yangi yozuv eskisini almashtiradi.',
          'Ўзгарувчи — охирги қийматни сақловчи номли қути; янги ёзув эскисини алмаштиради.'
        ),
        bridge: lt(
          'Endi qutidagi qiymatlarni solishtirib, qaror qabul qilishni oʻrganamiz.',
          'Энди қутидаги қийматларни солиштириб, қарор қабул қилишни ўрганамиз.'
        ),
      },
    ],
    knowItCheck: [
      {
        id: 'l2-k1',
        prompt: lt('p = 2; p = 9; chopEt(p) ekranga nima chiqaradi?', 'p = 2; p = 9; chopEt(p) экранга нима чиқаради?'),
        options: [lt('2', '2'), lt('9', '9'), lt('11', '11')],
        correctIndex: 1,
        misconceptionIds: ['order-doesnt-matter', 'ok', 'overwrite-adds'],
        explanation: lt(
          '9 eski 2 ning oʻrnini egallaydi.',
          '9 эски 2 нинг ўрнини эгаллайди.'
        ),
      },
      {
        id: 'l2-k2',
        prompt: lt('a = 4; b = 7; a = b; b = 10 dan keyin a nechaga teng?', 'a = 4; b = 7; a = b; b = 10 дан кейин a нечага тенг?'),
        options: [lt('4', '4'), lt('7', '7'), lt('10', '10')],
        correctIndex: 1,
        misconceptionIds: ['slip', 'ok', 'copy-links-forever'],
        explanation: lt(
          'a = b paytida 7 nusxalandi; keyin faqat b oʻzgardi.',
          'a = b пайтида 7 нусхаланди; кейин фақат b ўзгарди.'
        ),
      },
      {
        id: 'l2-k3',
        prompt: lt('k = 6; k = k + 2 dan keyin k nimaga teng?', 'k = 6; k = k + 2 дан кейин k нимага тенг?'),
        options: [lt('6', '6'), lt('8', '8'), lt('Xato beradi', 'Хато беради')],
        correctIndex: 1,
        misconceptionIds: ['slip', 'ok', 'self-update-impossible'],
        explanation: lt(
          'Oʻng tomon: 6 + 2 = 8, soʻng k ga saqlanadi.',
          'Ўнг томон: 6 + 2 = 8, сўнг k га сақланади.'
        ),
      },
    ],
  },

  {
    id: 'L3',
    order: 3,
    skillId: 'mantiq',
    title: lt('3-dars: Shart va mantiqiy kalitlar', '3-дарс: Шарт ва мантиқий калитлар'),
    goal: lt(
      'Men qaysi tarmoq ishlashini, chegara sonlarini va VA/YOKI farqini ayta olaman.',
      'Мен қайси тармоқ ишлашини, чегара сонларини ва ВА/ЁКИ фарқини айта оламан.'
    ),
    targetWorkshopTitle: lt('Mantiq Qopqoni', 'Мантиқ Қопқони'),
    glossaryIds: ['shart'],
    screens: [
      {
        id: 'l3-hook',
        kind: 'hook-predict',
        title: lt('Chipta kassasidagi chegara', 'Чипта кассасидаги чегара'),
        coreIdea: lt(
          'agar rost boʻlsa birinchi yoʻl, aks holda ikkinchisi tanlanadi.',
          'агар рост бўлса биринчи йўл, акс ҳолда иккинчиси танланади.'
        ),
        body: lt(
          'Attraksion qoidasi: agar (yosh >= 12) "Kirish mumkin", aks holda "Kattalar bilan". Sardor roppa-rosa 12 yoshda!',
          'Аттракцион қоидаси: агар (yosh >= 12) "Кириш мумкин", акс ҳолда "Катталар билан". Сардор роппа-роса 12 ёшда!'
        ),
        question: {
          prompt: lt('Taxmin qil: yosh > 12 va yosh >= 12 oʻrtasida farq bormi?', 'Тахмин қил: yosh > 12 ва yosh >= 12 ўртасида фарқ борми?'),
          code: 'yosh = 12\nagar (yosh > 12) { chopEt("A") } aks holda { chopEt("B") }',
          pythonCode: 'yosh = 12\nif yosh > 12:\n    print("A")\nelse:\n    print("B")',
          options: [
            lt('"A" chiqadi (12 > 12 rost)', '"A" чиқади (12 > 12 рост)'),
            lt('"B" chiqadi (12 > 12 yolgʻon, tenglik yoʻq)', '"B" чиқади (12 > 12 ёлғон, тенглик йўқ)'),
            lt('Ikkalasi ham chiqadi ("A" va "B")', 'Иккаласи ҳам чиқади ("A" ва "B")'),
          ],
          correctIndex: 1,
          optionFeedback: [
            lt(
              '12 soni 12 dan qatʼiy katta emas, ular teng. Shuning uchun > yolgʻon.',
              '12 сони 12 дан қатъий катта эмас, улар тенг. Шунинг учун > ёлғон.'
            ),
            lt(
              'Aniq! > tenglikni olmaydi, >= esa 12 ni ham qabul qiladi.',
              'Аниқ! > тенгликни олмайди, >= эса 12 ни ҳам қабул қилади.'
            ),
            lt(
              'Hech qachon ikkala tarmoq birdan ishlamaydi — faqat bittasi tanlanadi.',
              'Ҳеч қачон иккала тармоқ бирдан ишламайди — фақат биттаси танланади.'
            ),
          ],
        },
      },
      {
        id: 'l3-interactive',
        kind: 'interactive',
        title: lt('Tajriba: VA (&&) va YOKI (||) chirogʻi', 'Тажриба: ВА (&&) ва ЁКИ (||) чироғи'),
        coreIdea: lt(
          'VA ikkalasi rostini soʻraydi, YOKI uchun bittasi yetarli.',
          'ВА иккаласи ростини сўрайди, ЁКИ учун биттаси етарли.'
        ),
        body: lt(
          'Ikkita kalitni yoqib-oʻchirib koʻr: qachon chiroq yonishini kuzat.',
          'Иккита калитни ёқиб-ўчириб кўр: қачон чироқ ёнишини кузат.'
        ),
        analogyBreak: lt(
          'Kundalik nutqda: "Bolalar va keksalar uchun chegirma" deymiz. Kodda esa odam bir vaqtning oʻzida ham bola, ham keksa boʻla olmaydi — shuning uchun YOKI (||) kerak!',
          'Кундалик нутқда: "Болалар ва кексалар учун чегирма" деймиз. Кодда эса одам бир вақтнинг ўзида ҳам бола, ҳам кекса бўла олмайди — шунинг учун ЁКИ (||) керак!'
        ),
        interactiveType: 'va-yoki-switches',
      },
      {
        id: 'l3-worked',
        kind: 'worked-faded',
        title: lt('Zanjirdagi birinchi gʻolib', 'Занжирдаги биринчи ғолиб'),
        coreIdea: lt(
          'Shartlar zanjirida birinchi rost chiqqan tarmoq gʻolib boʻladi.',
          'Шартлар занжирида биринчи рост чиққан тармоқ ғолиб бўлади.'
        ),
        body: lt(
          'Mirzo kodni yuqoridan oʻqiydi: harorat = 38. Avval > 35 tekshiriladi — rost! Shunda > 20 ga qaraydimi?',
          'Мирзо кодни юқоридан ўқийди: harorat = 38. Аввал > 35 текширилади — рост! Шунда > 20 га қарайдими?'
        ),
        question: {
          prompt: lt('harorat = 38 boʻlsa, ekranga nima chiqadi?', 'harorat = 38 бўлса, экранга нима чиқади?'),
          code: 'harorat = 38\nagar (harorat > 35) {\n  chopEt("Issiq")\n} aks holda agar (harorat > 20) {\n  chopEt("Iliq")\n}',
          pythonCode: 'harorat = 38\nif harorat > 35:\n    print("Issiq")\nelif harorat > 20:\n    print("Iliq")',
          options: [
            lt('Faqat "Issiq"', 'Фақат "Issiq"'),
            lt('"Issiq" va "Iliq" ikkalasi ham', '"Issiq" ва "Iliq" иккаласи ҳам'),
            lt('Faqat "Iliq"', 'Фақат "Iliq"'),
          ],
          correctIndex: 0,
          optionFeedback: [
            lt(
              'Toʻgʻri! Birinchi shart rost boʻlgani uchun qolgan tarmoqlar tashlab ketiladi.',
              'Тўғри! Биринчи шарт рост бўлгани учун қолган тармоқлар ташлаб кетилади.'
            ),
            lt(
              'aks holda agar faqat yuqoridagi shart yolgʻon boʻlsagina tekshiriladi.',
              'акс ҳолда агар фақат юқоридаги шарт ёлғон бўлсагина текширилади.'
            ),
            lt(
              '38 > 35 allaqachon rost, shuning uchun mashina 2-shartga tushmaydi.',
              '38 > 35 аллақачон рост, шунинг учун машина 2-шартга тушмайди.'
            ),
          ],
        },
      },
      {
        id: 'l3-misconceptions',
        kind: 'misconceptions',
        title: lt('Mantiqdagi 3 ta chalgʻituvchi joy', 'Мантиқдаги 3 та чалғитувчи жой'),
        coreIdea: lt(
          'Chegara, bogʻlovchi va bitta tarmoq qoidasini tekshir.',
          'Чегара, боғловчи ва битта тармоқ қоидасини текшир.'
        ),
        body: lt(
          'Mirzo shu 3 ta vaziyatda xato qilgan edi:',
          'Мирзо шу 3 та вазиятда хато қилган эди:'
        ),
        misconceptionCards: [
          {
            id: 'both-branches-run',
            wrongClaim: lt('"Ikkala tarmoq ham ishlaydi"', '"Иккала тармоқ ҳам ишлайди"'),
            mirzoAttempt: lt('agar va aks holda ikkalasidan ham javob kutish.', 'агар ва акс ҳолда иккаласидан ҳам жавоб кутиш.'),
            whyWrong: lt(
              'agar / aks holda — chorraha: sen faqat chapga yoki oʻngga burilasan.',
              'агар / акс ҳолда — чорраҳа: сен фақат чапга ёки ўнгга буриласан.'
            ),
          },
          {
            id: 'boundary-strict-vs-equal',
            wrongClaim: lt('"> bilan >= bir xil"', '"> билан >= бир хил"'),
            mirzoAttempt: lt('yosh = 12 uchun yosh > 12 ni rost deb olish.', 'yosh = 12 учун yosh > 12 ни рост деб олиш.'),
            whyWrong: lt(
              'Chegara soni oʻzida ham kirishi uchun = belgisi (>=) boʻlishi shart.',
              'Чегара сони ўзида ҳам кириши учун = белгиси (>=) бўлиши шарт.'
            ),
          },
          {
            id: 'natural-and-means-or',
            wrongClaim: lt('"Gapdagi \'va\' doim && boʻladi"', '"Гапдаги \'ва\' доим && бўлади"'),
            mirzoAttempt: lt('yosh < 7 && yosh > 60 deb yozish.', 'yosh < 7 && yosh > 60 деб ёзиш.'),
            whyWrong: lt(
              'Bir kishi bir paytda ham 7 dan kichik, ham 60 dan katta boʻla olmaydi! Bu yerda || kerak.',
              'Бир киши бир пайтда ҳам 7 дан кичик, ҳам 60 дан катта бўла олмайди! Бу ерда || керак.'
            ),
          },
        ],
      },
      {
        id: 'l3-teachback',
        kind: 'teach-back',
        title: lt('Mirzoga tushuntir', 'Мирзога тушунтир'),
        coreIdea: lt(
          '"va" soʻzini kodga oʻgirishdan oldin maʼnosini tekshir.',
          '"ва" сўзини кодга ўгиришдан олдин маъносини текшир.'
        ),
        body: lt(
          'Sinfdoshing: "Maktab chegirmasi 10 yoshdan kichiklar va aʼlochi oʻquvchilar uchun" degan gapga && yozdi. Unga nega || kerakligini tushuntir:',
          'Синфдошинг: "Мактаб чегирмаси 10 ёшдан кичиклар ва аълочи ўқувчилар учун" деган гапга && ёзди. Унга нега || кераклигини тушунтир:'
        ),
        question: {
          prompt: lt('Qaysi javob aniq tushuntiradi?', 'Қайси жавоб аниқ тушунтиради?'),
          options: [
            lt(
              '&& ikkala shart birdan bajarilishini talab qiladi; bu yerda esa ikki toifadan biriga kirish yetarli, shuning uchun || kerak.',
              '&& иккала шарт бирдан бажарилишини талаб қилади; бу ерда эса икки тоифадан бирига кириш етарли, шунинг учун || керак.'
            ),
            lt(
              'Chunki dasturlashda && belgisi faqat sonlarni qoʻshish uchun ishlatiladi.',
              'Чунки дастурлашда && белгиси фақат сонларни қўшиш учун ишлатилади.'
            ),
            lt(
              'Chunki har qanday shartda || va && bir xil natija beradi.',
              'Чунки ҳар қандай шартда || ва && бир хил натижа беради.'
            ),
          ],
          correctIndex: 0,
          optionFeedback: [
            lt(
              'Judayam aniq! "Ikkisidan biri yetarli" degani doim YOKI (||) boʻladi.',
              'Жудаям аниқ! "Иккисидан бири етарли" дегани доим ЁКИ (||) бўлади.'
            ),
            lt(
              '&& qoʻshish emas, mantiqiy VA operatori.',
              '&& қўшиш эмас, мантиқий ВА оператори.'
            ),
            lt(
              'true && false → false, lekin true || false → true. Ular keskin farq qiladi!',
              'true && false → false, лекин true || false → true. Улар кескин фарқ қилади!'
            ),
          ],
        },
      },
      {
        id: 'l3-transfer',
        kind: 'transfer',
        title: lt('Yangi vaziyat: Kutubxona ruxsati', 'Янги вазият: Кутубхона рухсати'),
        coreIdea: lt(
          'Soʻz bilan berilgan qoidani aniq shartga aylantir.',
          'Сўз билан берилган қоидани аниқ шартга айлантир.'
        ),
        body: lt(
          'Kutubxona qoidasi: "Kitobni kamida 10 ball toʻplagan YOKI ustoz xati bor oʻquvchi olishi mumkin."',
          'Кутубхона қоидаси: "Китобни камида 10 балл тўплаган ЁКИ устоз хати бор ўқувчи олиши мумкин."'
        ),
        question: {
          prompt: lt('Qaysi kod bu qoidani toʻgʻri ifodalaydi?', 'Қайси код бу қоидани тўғри ифодалайди?'),
          options: [
            lt('agar (ball > 10 || ustozXati)', 'agar (ball > 10 || ustozXati)'),
            lt('agar (ball >= 10 && ustozXati)', 'agar (ball >= 10 && ustozXati)'),
            lt('agar (ball >= 10 || ustozXati)', 'agar (ball >= 10 || ustozXati)'),
          ],
          correctIndex: 2,
          optionFeedback: [
            lt(
              '> 10 yozilsa, roppa-rosa 10 ball olgan oʻquvchi kitob ololmay qoladi!',
              '> 10 ёзилса, роппа-роса 10 балл олган ўқувчи китоб ололмай қолади!'
            ),
            lt(
              '&& ikkalasini birdan soʻraydi — qoidada esa bittasi yetarli.',
              '&& иккаласини бирдан сўрайди — қоидада эса биттаси етарли.'
            ),
            lt(
              'Toʻgʻri! "Kamida 10" bu >= 10, "YOKI" esa || operatori.',
              'Тўғри! "Камида 10" бу >= 10, "ЁКИ" эса || оператори.'
            ),
          ],
        },
        takeaway: lt(
          'Shart bitta yoʻlni tanlaydi; chegara (>= vs >) va bogʻlovchi natijani hal qiladi.',
          'Шарт битта йўлни танлайди; чегара (>= vs >) ва боғловчи натижани ҳал қилади.'
        ),
        bridge: lt(
          'Oxirgi darsda bitta harakatni yuz marta yozmaslik uchun sikllarni oʻrganamiz.',
          'Охирги дарсда битта ҳаракатни юз марта ёзмаслик учун циклларни ўрганамиз.'
        ),
      },
    ],
    knowItCheck: [
      {
        id: 'l3-k1',
        prompt: lt('yosh = 15 boʻlsa, agar (yosh > 15) rostmi?', 'yosh = 15 бўлса, agar (yosh > 15) ростми?'),
        options: [
          lt('Ha, rost', 'Ҳа, рост'),
          lt('Yoʻq, yolgʻon (15 > 15 emas)', 'Йўқ, ёлғон (15 > 15 эмас)'),
          lt('Ikkala tarmoq ham ishlaydi', 'Иккала тармоқ ҳам ишлайди'),
        ],
        correctIndex: 1,
        misconceptionIds: ['boundary-strict-vs-equal', 'ok', 'both-branches-run'],
        explanation: lt(
          '> tenglikni olmaydi; 15 kirishi uchun >= kerak.',
          '> тенгликни олмайди; 15 кириши учун >= керак.'
        ),
      },
      {
        id: 'l3-k2',
        prompt: lt('a = true, b = false. (a || b) nimani beradi?', 'a = true, b = false. (a || b) нимани беради?'),
        options: [lt('true', 'true'), lt('false', 'false'), lt('Xato', 'Хато')],
        correctIndex: 0,
        misconceptionIds: ['ok', 'natural-and-means-or', 'slip'],
        explanation: lt(
          '|| uchun kamida bitta true yetarli.',
          '|| учун камида битта true етарли.'
        ),
      },
      {
        id: 'l3-k3',
        prompt: lt('agar / aks holda blokida nechta tarmoq bajariladi?', 'agar / aks holda блокида нечта тармоқ бажарилади?'),
        options: [
          lt('Faqat bittasi', 'Фақат биттаси'),
          lt('Ikkalasi ham', 'Иккаласи ҳам'),
          lt('Hech biri', 'Ҳеч бири'),
        ],
        correctIndex: 0,
        misconceptionIds: ['ok', 'both-branches-run', 'slip'],
        explanation: lt(
          'Shart rost boʻlsa birinchi, boʻlmasa aks holda tarmogʻi ishlaydi.',
          'Шарт рост бўлса биринчи, бўлмаса акс ҳолда тармоғи ишлайди.'
        ),
      },
    ],
  },

  {
    id: 'L4',
    order: 4,
    skillId: 'sikllar',
    title: lt('4-dars: Sikllar va xato qidirish', '4-дарс: Цикллар ва хато қидириш'),
    goal: lt(
      'Men sikl necha marta aylanishini sanab, 4 qadamda xatoni tuzata olaman.',
      'Мен цикл неча марта айланишини санаб, 4 қадамда хатони тузата оламан.'
    ),
    targetWorkshopTitle: lt('Sikl va Xato Ovchisi', 'Цикл ва Хато Овчиси'),
    glossaryIds: ['sikl', 'xato'],
    screens: [
      {
        id: 'l4-hook',
        kind: 'hook-predict',
        title: lt('"Salom" soʻzini 100 marta yozish', '"Салом" сўзини 100 марта ёзиш'),
        coreIdea: lt(
          'Sikl bir xil ishni sanoqli qator bilan koʻp marta bajaradi.',
          'Цикл бир хил ишни саноқли қатор билан кўп марта бажаради.'
        ),
        body: lt(
          'Mirzo 1 dan 4 gacha sonlarni qoʻshmoqchi. Mana bu sikl necha marta aylanadi?',
          'Мирзо 1 дан 4 гача сонларни қўшмоқчи. Мана бу цикл неча марта айланади?'
        ),
        question: {
          prompt: lt('Taxmin qil: sikl oxirida yigindi nechchi boʻladi?', 'Тахмин қил: цикл охирида yigindi неччи бўлади?'),
          code: 'yigindi = 0\nuchun i = 1 dan 4 gacha {\n  yigindi = yigindi + i\n}\nchopEt(yigindi)',
          pythonCode: 'yigindi = 0\nfor i in range(1, 5):\n    yigindi = yigindi + i\nprint(yigindi)',
          options: [lt('4', '4'), lt('6', '6'), lt('10', '10')],
          correctIndex: 2,
          optionFeedback: [
            lt(
              '4 — bu faqat oxirgi i ning qiymati, yigʻindi esa hammasini qoʻshadi.',
              '4 — бу фақат охирги i нинг қиймати, йиғинди эса ҳаммасини қўшади.'
            ),
            lt(
              '6 faqat 1 + 2 + 3 boʻladi; i = 4 ham qoʻshilishi kerak.',
              '6 фақат 1 + 2 + 3 бўлади; i = 4 ҳам қўшилиши керак.'
            ),
            lt(
              'Toʻgʻri! 1 + 2 + 3 + 4 = 10.',
              'Тўғри! 1 + 2 + 3 + 4 = 10.'
            ),
          ],
        },
      },
      {
        id: 'l4-interactive',
        kind: 'interactive',
        title: lt('Kuzat: Sikl ichida quti qanday oʻsadi?', 'Кузат: Цикл ичида қути қандай ўсади?'),
        coreIdea: lt(
          'Har bir aylanishda shart va hisoblagich qayta tekshiriladi.',
          'Ҳар бир айланишда шарт ва ҳисоблагич қайта текширилади.'
        ),
        body: lt(
          'Qadam-ba-qadam yigindi va i qutilari qanday oʻzgarishini kuzat.',
          'Қадам-ба-қадам yigindi ва i қутилари қандай ўзгаришини кузат.'
        ),
        interactiveType: 'trace',
        traceId: 'trace-loop-sum',
      },
      {
        id: 'l4-worked',
        kind: 'worked-faded',
        title: lt('Xato topishning 4 qadami', 'Хато топишнинг 4 қадами'),
        coreIdea: lt(
          'Koʻr → Taxmin qil → Tekshir → Tuzat usuli xatoni tez topadi.',
          'Кўр → Тахмин қил → Текшир → Тузат усули хатони тез топади.'
        ),
        body: lt(
          'Kompyuter adashmaydi — u faqat yozilganini qiladi. 4 qadamlik usulni sinab koʻr:',
          'Компьютер адашмайди — у фақат ёзилганини қилади. 4 қадамлик усулни синаб кўр:'
        ),
        interactiveType: 'debug-4step',
        traceId: 'trace-loop-infinite',
      },
      {
        id: 'l4-misconceptions',
        kind: 'misconceptions',
        title: lt('Sikldagi 3 ta asosiy xato', 'Циклдаги 3 та асосий хато'),
        coreIdea: lt(
          'Chegara, hisoblagich yoʻnalishi va shartni tekshir.',
          'Чегара, ҳисоблагич йўналиши ва шартни текшир.'
        ),
        body: lt(
          'Koʻpincha sikllar shu 3 sababdan kutilganidek ishlamaydi:',
          'Кўпинча цикллар шу 3 сабабдан кутилганидек ишламайди:'
        ),
        misconceptionCards: [
          {
            id: 'off-by-one',
            wrongClaim: lt('"i < 5 va i <= 5 bir xil son chiqaradi"', '"i < 5 ва i <= 5 бир хил сон чиқаради"'),
            mirzoAttempt: lt('1 dan 5 gacha qoʻshishda i < 5 yozib 5 ni unutish.', '1 дан 5 гача қўшишда i < 5 ёзиб 5 ни унутиш.'),
            whyWrong: lt(
              'i < 5 faqat 4 gacha boradi. Bitta son kam qoladi (off-by-one).',
              'i < 5 фақат 4 гача боради. Битта сон кам қолади (off-by-one).'
            ),
          },
          {
            id: 'counter-never-moves',
            wrongClaim: lt('"Sikl oʻzi qachondir toʻxtaydi"', '"Цикл ўзи қачондир тўхтайди"'),
            mirzoAttempt: lt('toki (i <= 5) ichida i = i - 1 yozish.', 'toki (i <= 5) ичида i = i - 1 ёзиш.'),
            whyWrong: lt(
              'Hisoblagich maqsadga qarab yurmasa, shart doim rost qoladi va sikl tugamaydi.',
              'Ҳисоблагич мақсадга қараб юрмаса, шарт доим рост қолади ва цикл тугамайди.'
            ),
          },
          {
            id: 'computer-is-wrong',
            wrongClaim: lt('"Kompyuter xato hisoblayapti"', '"Компьютер хато ҳисоблаяпти"'),
            mirzoAttempt: lt('Xatoni mashinadan izlash.', 'Хатони машинадан излаш.'),
            whyWrong: lt(
              'Mashina faqat biz yozgan koʻrsatmani bajaradi — xatoni koddagi qatordan izlash kerak.',
              'Машина фақат биз ёзган кўрсатмани бажаради — хатони коддаги қатордан излаш керак.'
            ),
          },
        ],
      },
      {
        id: 'l4-teachback',
        kind: 'teach-back',
        title: lt('Mirzoga tushuntir', 'Мирзога тушунтир'),
        coreIdea: lt(
          'Har bir sikl qachon va nega toʻxtashini oldindan bilish kerak.',
          'Ҳар бир цикл қачон ва нега тўхташини олдиндан билиш керак.'
        ),
        body: lt(
          'Mirzoning toki (i <= 5) sikli hech qachon toʻxtamayapti, chunki ichida i = i - 1 yozilgan. Unga qisqa tushuntir:',
          'Мирзонинг toki (i <= 5) цикли ҳеч қачон тўхтамаяпти, чунки ичида i = i - 1 ёзилган. Унга қисқа тушунтир:'
        ),
        question: {
          prompt: lt('Qaysi tushuntirish aniq?', 'Қайси тушунтириш аниқ?'),
          options: [
            lt(
              'Chunki kompyuter sekinlashib qolgan va 5 gacha sanay olmayapti.',
              'Чунки компьютер секинлашиб қолган ва 5 гача санай олмаяпти.'
            ),
            lt(
              'i har safar kamayib 5 dan uzoqlashyapti, shuning uchun i <= 5 sharti doimo rost qolyapti; i = i + 1 boʻlishi kerak.',
              'i ҳар сафар камайиб 5 дан узоқлашяпти, шунинг учун i <= 5 шарти доимо рост қоляпти; i = i + 1 бўлиши керак.'
            ),
            lt(
              'Chunki toki sikli har doim cheksiz boʻladi.',
              'Чунки toki цикли ҳар доим чексиз бўлади.'
            ),
          ],
          correctIndex: 1,
          optionFeedback: [
            lt(
              'Kompyuter aybdor emas — buyruqning oʻzi uni orqaga yurgizyapti.',
              'Компьютер айбдор эмас — буйруқнинг ўзи уни орқага юргизяпти.'
            ),
            lt(
              'Zoʻr! Endi sen ham cheksiz siklni oldindan koʻra olasan.',
              'Зўр! Энди сен ҳам чексиз циклни олдиндан кўра оласан.'
            ),
            lt(
              'Toʻgʻri yoʻnalishda hisoblagich oʻzgarsa, toki sikli aniq joyda toʻxtaydi.',
              'Тўғри йўналишда ҳисоблагич ўзгарса, toki цикли аниқ жойда тўхтайди.'
            ),
          ],
        },
      },
      {
        id: 'l4-transfer',
        kind: 'transfer',
        title: lt('Yangi vaziyat: Xatoni top', 'Янги вазият: Хатони топ'),
        coreIdea: lt(
          'Kutilgan natija bilan kodni solishtirib, xato qatorni aniqlash.',
          'Кутилган натижа билан кодни солиштириб, хато қаторни аниқлаш.'
        ),
        body: lt(
          'Dastur 10, 8, 6 sonlarini chiqarishi kerak edi. Lekin u faqat 10 ni chiqardi. Qaysi qator xato?',
          'Дастур 10, 8, 6 сонларини чиқариши керак эди. Лекин у фақат 10 ни чиқарди. Қайси қатор хато?'
        ),
        question: {
          prompt: lt('Xato qator va sababni top:', 'Хато қатор ва сабабни топ:'),
          code: '1: n = 10\n2: toki (n >= 6) {\n3:   chopEt(n)\n4:   n = n - 6\n5: }',
          pythonCode: 'n = 10\nwhile n >= 6:\n    print(n)\n    n = n - 6',
          options: [
            lt(
              '4-qator xato: 2 oʻrniga 6 ayirilgani uchun n birdan 4 ga tushib toʻxtagan',
              '4-қатор хато: 2 ўрнига 6 айирилгани учун n бирдан 4 га тушиб тўхтаган'
            ),
            lt(
              '2-qator xato: n >= 6 oʻrniga n < 6 boʻlishi kerak edi',
              '2-қатор хато: n >= 6 ўрнига n < 6 бўлиши керак эди'
            ),
            lt(
              '1-qator xato: n = 0 dan boshlanishi kerak edi',
              '1-қатор хато: n = 0 дан бошланиши керак эди'
            ),
          ],
          correctIndex: 0,
          optionFeedback: [
            lt(
              'Ajoyib! 10 - 6 = 4, 4 >= 6 yolgʻon boʻlib sikl 1 marta ishlagan xolos. n = n - 2 kerak!',
              'Ажойиб! 10 - 6 = 4, 4 >= 6 ёлғон бўлиб цикл 1 марта ишлаган холос. n = n - 2 керак!'
            ),
            lt(
              'n < 6 boʻlsa 10 bilan umuman boshlanmasdi (10 < 6 yolgʻon).',
              'n < 6 бўлса 10 билан умуман бошланмасди (10 < 6 ёлғон).'
            ),
            lt(
              'Kutilgan natija 10 dan boshlanadi, demak n = 10 toʻgʻri.',
              'Кутилган натижа 10 дан бошланади, демак n = 10 тўғри.'
            ),
          ],
        },
        takeaway: lt(
          'Sikl xatosini topish uchun har aylanishdagi hisoblagichni kuzatib, Koʻr → Taxmin → Tekshir → Tuzat qil.',
          'Цикл хатосини топиш учун ҳар айланишдаги ҳисоблагични кузатиб, Кўр → Тахмин → Текшир → Тузат қил.'
        ),
        bridge: lt(
          'Endi barcha 3 ustaxonada bilimingni amalda sinashga tayyorsan!',
          'Энди барча 3 устахонада билимингни амалда синашга тайёрсан!'
        ),
      },
    ],
    knowItCheck: [
      {
        id: 'l4-k1',
        prompt: lt('s = 0; 5 marta takrorla { s = s + 2 } — yakunda s nechchi?', 's = 0; 5 марта такрорла { s = s + 2 } — якунда s неччи?'),
        options: [lt('7', '7'), lt('10', '10'), lt('5', '5')],
        correctIndex: 1,
        misconceptionIds: ['slip', 'ok', 'off-by-one'],
        explanation: lt(
          '5 marta 2 qoʻshilsa 10 boʻladi.',
          '5 марта 2 қўшилса 10 бўлади.'
        ),
      },
      {
        id: 'l4-k2',
        prompt: lt('i = 1; toki (i <= 3) ichida i = i - 1 yozilsa nima boʻladi?', 'i = 1; toki (i <= 3) ичида i = i - 1 ёзилса нима бўлади?'),
        options: [
          lt('3 marta aylanib toʻxtaydi', '3 марта айланиб тўхтайди'),
          lt('Cheksiz aylanadi (i doim <= 3 qoladi)', 'Чексиз айланади (i доим <= 3 қолади)'),
          lt('Umuman ishlamaydi', 'Умуман ишламайди'),
        ],
        correctIndex: 1,
        misconceptionIds: ['off-by-one', 'ok', 'computer-is-wrong'],
        explanation: lt(
          'i kamaygani sari <= 3 sharti doim rost boʻlaveradi.',
          'i камайгани сари <= 3 шарти доим рост бўлаверади.'
        ),
      },
      {
        id: 'l4-k3',
        prompt: lt('1 dan 5 gacha sonlarni qoʻshishda i < 5 yozilsa nechta son qoʻshiladi?', '1 дан 5 гача сонларни қўшишда i < 5 ёзилса нечта сон қўшилади?'),
        options: [lt('4 ta (1, 2, 3, 4)', '4 та (1, 2, 3, 4)'), lt('5 ta (1..5)', '5 та (1..5)'), lt('6 ta', '6 та')],
        correctIndex: 0,
        misconceptionIds: ['ok', 'off-by-one', 'slip'],
        explanation: lt(
          '5 < 5 yolgʻon boʻlgani uchun 5 kirmay qoladi.',
          '5 < 5 ёлғон бўлгани учун 5 кирмай қолади.'
        ),
      },
    ],
  },
];
