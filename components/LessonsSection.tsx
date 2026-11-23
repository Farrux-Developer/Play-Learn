'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  HelpCircle,
  Lightbulb,
  Play,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { LESSONS, type LessonDefinition, type LessonId } from '@/lib/data/lessons';
import { MISCONCEPTION_CATALOG, type SkillId } from '@/lib/data/curriculum';
import { TRACE_PROGRAMS } from '@/lib/data/traces';
import {
  LUGAT_TERMS,
  pickText,
  type LocaleScript,
  type UiDictionary,
} from '@/lib/engine/i18n';
import type { ProgressState } from '@/lib/engine/mastery';
import { TraceMachine } from './TraceMachine';

interface LessonsSectionProps {
  t: UiDictionary;
  progress: ProgressState;
  activeLessonId: LessonId;
  onChangeLesson: (lessonId: LessonId) => void;
  onLessonSeen: (lessonId: LessonId) => void;
  onLessonExplained: (lessonId: LessonId) => void;
  onRecordMisconception: (misconceptionId: string) => void;
  onToggleRealCode: () => void;
  onOpenCheatSheet: () => void;
  onGoToWorkshop: (skillId: SkillId) => void;
}

const TEA_CORRECT_STEPS = [
  {
    id: 'water',
    latn: 'Choynakka toza suv quy',
    cyrl: 'Чойнакка тоза сув қуй',
  },
  {
    id: 'boil',
    latn: 'Suvni qaynat',
    cyrl: 'Сувни қайнат',
  },
  {
    id: 'steep',
    latn: 'Quruq choy solib damla',
    cyrl: 'Қуруқ чой солиб дамла',
  },
];

export function LessonsSection({
  t,
  progress,
  activeLessonId,
  onChangeLesson,
  onLessonSeen,
  onLessonExplained,
  onRecordMisconception,
  onToggleRealCode,
  onOpenCheatSheet,
  onGoToWorkshop,
}: LessonsSectionProps) {
  const script: LocaleScript = progress.preferences.script;
  const showRealCode = progress.preferences.showRealCode;
  const reducedMotion = progress.preferences.reducedMotion;

  const [screenIdx, setScreenIdx] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});
  const [solvedScreens, setSolvedScreens] = useState<Record<string, boolean>>({});
  const [revealedMisconceptions, setRevealedMisconceptions] = useState<Record<string, boolean>>({});
  const [activeGlossaryId, setActiveGlossaryId] = useState<string | null>(null);

  // L1 tea-robot interactive state
  const [teaOrder, setTeaOrder] = useState<string[]>(['boil', 'steep', 'water']);
  const [teaResult, setTeaResult] = useState<{ ok: boolean; text: string } | null>(null);

  // L3 VA / YOKI switches state
  const [switchA, setSwitchA] = useState(true);
  const [switchB, setSwitchB] = useState(false);

  // L4 4-step debug checklist & fixed trace toggle
  const [debugStepDone, setDebugStepDone] = useState<number>(1);
  const [showFixedLoopTrace, setShowFixedLoopTrace] = useState(false);

  // "Men buni bilaman" 3-question check modal state
  const [knowItOpen, setKnowItOpen] = useState(false);
  const [knowItIdx, setKnowItIdx] = useState(0);
  const [knowItChoice, setKnowItChoice] = useState<number | null>(null);
  const [knowItChecked, setKnowItChecked] = useState(false);
  const [knowItCorrectCount, setKnowItCorrectCount] = useState(0);
  const [knowItFinished, setKnowItFinished] = useState(false);

  const lesson: LessonDefinition =
    LESSONS.find((l) => l.id === activeLessonId) ?? LESSONS[0];
  const screen = lesson.screens[screenIdx] ?? lesson.screens[0];

  const lessonGlossary = LUGAT_TERMS.filter((term) =>
    lesson.glossaryIds.includes(term.id)
  );

  const ui =
    script === 'uz-Cyrl'
      ? {
          goalLabel: 'Мақсад:',
          knowItBtn: 'Мен буни биламан (3 савол)',
          screenCounter: 'Қадам',
          prevBtn: 'Олдинги босқич',
          nextBtn: 'Кейинги босқич',
          seenTag: 'Кўрилди',
          explainedTag: 'Тушунтирилди',
          newTag: 'Янги',
          analogyTitle: 'Ўхшатиш чегараси:',
          glossaryHint: 'Атамани босиб, қисқа таърифини кўр:',
          mixupLabel: 'Кўп учрайдиган чалкашлик:',
          teaRun: 'Роботни ишга тушир',
          teaReset: 'Тартибни тиклаш',
          switchALabel: 'Калит A (10 ёшдан кичик)',
          switchBLabel: 'Калит B (Аълочи ўқувчи)',
          switchOn: 'ЁНИҚ (true)',
          switchOff: 'ЎЧИҚ (false)',
          andLamp: 'ВА (&&) чироғи',
          orLamp: 'ЁКИ (||) чироғи',
          lampLit: 'ЁНДИ',
          lampDark: 'ЎЧИҚ',
          debugSteps: [
            '1. Кўр: Натижа нега бундай чиққанини кузат',
            '2. Тахмин қил: Қайси қатор айбдор?',
            '3. Текшир: Мирзо машинасида i қийматини кўр',
            '4. Тузат: i = i - 1 ўрнига i = i + 1 қўй',
          ],
          debugShowBroken: 'Хато кодни кўриш (i = i - 1)',
          debugShowFixed: 'Тузатилган кодни кўриш (i = i + 1)',
          misconceptionReveal: 'Нима учун хато?',
          misconceptionWrongPrefix: 'Мирзонинг уриниши:',
          takeawayLabel: 'Асосий хулоса',
          workshopCta: 'Устахонада машқ қилиш',
          explainedSuccess: 'Аъло! Сен бу дарсни ҳам тушундинг, ҳам тушунтириб бердинг (+25 XP).',
          explainFirstNote: 'Дарсни якунлаш учун "Мирзога тушунтир" ва "Янги вазият" саволларини тўғри еч.',
          knowItTitle: 'Мен буни биламан — 3 та текширув саволи',
          knowItSub: 'Дарсни ўтказиб юбориш учун барча 3 та саволга тўғри жавоб бериш керак.',
          knowItCheckBtn: 'Текшириш',
          knowItNextBtn: 'Кейинги савол',
          knowItPass: 'Табриклаймиз! 3/3 тўғри. Бу мавзу "Тушунтирилди" деб белгиланди.',
          knowItFail: 'Бир нечта нозик жой бор экан — 5 дақиқалик дарсни кўриб чиқиш жуда фойдали бўлади.',
          closeBtn: 'Ёпиш',
        }
      : {
          goalLabel: 'Maqsad:',
          knowItBtn: 'Men buni bilaman (3 savol)',
          screenCounter: 'Qadam',
          prevBtn: 'Oldingi bosqich',
          nextBtn: 'Keyingi bosqich',
          seenTag: 'Koʻrildi',
          explainedTag: 'Tushuntirildi',
          newTag: 'Yangi',
          analogyTitle: 'Oʻxshatish chegarasi:',
          glossaryHint: 'Atamani bosib, qisqa taʼrifini koʻr:',
          mixupLabel: 'Koʻp uchraydigan chalkashlik:',
          teaRun: 'Robotni ishga tushir',
          teaReset: 'Tartibni tiklash',
          switchALabel: 'Kalit A (10 yoshdan kichik)',
          switchBLabel: 'Kalit B (Aʼlochi oʻquvchi)',
          switchOn: 'YONIQ (true)',
          switchOff: 'OʻCHIQ (false)',
          andLamp: 'VA (&&) chirogʻi',
          orLamp: 'YOKI (||) chirogʻi',
          lampLit: 'YONDI',
          lampDark: 'OʻCHIQ',
          debugSteps: [
            '1. Koʻr: Natija nega bunday chiqqanini kuzat',
            '2. Taxmin qil: Qaysi qator aybdor?',
            '3. Tekshir: Mirzo mashinasida i qiymatini koʻr',
            '4. Tuzat: i = i - 1 oʻrniga i = i + 1 qoʻy',
          ],
          debugShowBroken: 'Xato kodni koʻrish (i = i - 1)',
          debugShowFixed: 'Tuzatilgan kodni koʻrish (i = i + 1)',
          misconceptionReveal: 'Nima uchun xato?',
          misconceptionWrongPrefix: 'Mirzoning urinishi:',
          takeawayLabel: 'Asosiy xulosa',
          workshopCta: 'Ustaxonada mashq qilish',
          explainedSuccess: 'Aʼlo! Sen bu darsni ham tushunding, ham tushuntirib berding (+25 XP).',
          explainFirstNote: 'Darsni yakunlash uchun "Mirzoga tushuntir" va "Yangi vaziyat" savollarini toʻgʻri yech.',
          knowItTitle: 'Men buni bilaman — 3 ta tekshiruv savoli',
          knowItSub: 'Darsni oʻtkazib yuborish uchun barcha 3 ta savolga toʻgʻri javob berish kerak.',
          knowItCheckBtn: 'Tekshirish',
          knowItNextBtn: 'Keyingi savol',
          knowItPass: 'Tabriklaymiz! 3/3 toʻgʻri. Bu mavzu "Tushuntirildi" deb belgilandi.',
          knowItFail: 'Bir nechta nozik joy bor ekan — 5 daqiqalik darsni koʻrib chiqish juda foydali boʻladi.',
          closeBtn: 'Yopish',
        };

  const selectLesson = (id: LessonId) => {
    onChangeLesson(id);
    onLessonSeen(id);
    setScreenIdx(0);
    setActiveGlossaryId(null);
    setTeaResult(null);
  };

  const goScreen = (nextIdx: number) => {
    const clamped = Math.max(0, Math.min(lesson.screens.length - 1, nextIdx));
    setScreenIdx(clamped);
    onLessonSeen(lesson.id);
  };

  const moveTeaStep = (idx: number, delta: -1 | 1) => {
    const target = idx + delta;
    if (target < 0 || target >= teaOrder.length) return;
    setTeaOrder((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setTeaResult(null);
  };

  const runTeaRobot = () => {
    onLessonSeen(lesson.id);
    const waterIdx = teaOrder.indexOf('water');
    const boilIdx = teaOrder.indexOf('boil');
    const steepIdx = teaOrder.indexOf('steep');

    if (boilIdx < waterIdx) {
      setTeaResult({
        ok: false,
        text:
          script === 'uz-Cyrl'
            ? 'Хато: робот бўш чойнакни қиздирди! Сув ҳали қуйилмаган эди.'
            : 'Xato: robot boʻsh choynakni qizdirdi! Suv hali quyilmagan edi.',
      });
    } else if (steepIdx < boilIdx) {
      setTeaResult({
        ok: false,
        text:
          script === 'uz-Cyrl'
            ? 'Хато: қуруқ чой совуқ сувга тушди — чой дамланмади!'
            : 'Xato: quruq choy sovuq suvga tushdi — choy damlanmadi!',
      });
    } else {
      setTeaResult({
        ok: true,
        text:
          script === 'uz-Cyrl'
            ? 'Аъло! Робот аввал сув қуйди, кейин қайнатди ва иссиқ чой дамлади.'
            : 'Aʼlo! Robot avval suv quydi, keyin qaynatdi va issiq choy damladi.',
      });
    }
  };

  const handleSelectScreenOption = (optIdx: number) => {
    if (!screen.question) return;
    onLessonSeen(lesson.id);
    setSelectedChoices((prev) => ({ ...prev, [screen.id]: optIdx }));

    const isRight = optIdx === screen.question.correctIndex;
    const nextSolved = { ...solvedScreens, [screen.id]: isRight };
    setSolvedScreens(nextSolved);

    // If both teach-back and transfer for this lesson are solved, mark lesson explained
    const teachScreen = lesson.screens.find((s) => s.kind === 'teach-back');
    const transferScreen = lesson.screens.find((s) => s.kind === 'transfer');
    const teachDone = teachScreen ? Boolean(nextSolved[teachScreen.id]) : true;
    const transferDone = transferScreen ? Boolean(nextSolved[transferScreen.id]) : true;

    if (teachDone && transferDone) {
      onLessonExplained(lesson.id);
    }
  };

  const openKnowItModal = () => {
    setKnowItOpen(true);
    setKnowItIdx(0);
    setKnowItChoice(null);
    setKnowItChecked(false);
    setKnowItCorrectCount(0);
    setKnowItFinished(false);
  };

  const activeKnowItem = lesson.knowItCheck[knowItIdx];

  const handleCheckKnowIt = () => {
    if (knowItChoice === null || !activeKnowItem) return;
    setKnowItChecked(true);
    if (knowItChoice === activeKnowItem.correctIndex) {
      setKnowItCorrectCount((c) => c + 1);
    } else {
      const miscId = activeKnowItem.misconceptionIds[knowItChoice];
      if (miscId && miscId !== 'ok') {
        onRecordMisconception(miscId);
      }
    }
  };

  const handleNextKnowIt = () => {
    if (knowItIdx + 1 < lesson.knowItCheck.length) {
      setKnowItIdx((i) => i + 1);
      setKnowItChoice(null);
      setKnowItChecked(false);
    } else {
      setKnowItFinished(true);
      if (knowItCorrectCount === lesson.knowItCheck.length) {
        onLessonExplained(lesson.id);
      }
    }
  };

  const currentChoice = selectedChoices[screen.id];
  const isLessonExplained = progress.explainedLessons.includes(lesson.id);

  return (
    <section
      id="darslar"
      className="scroll-mt-16 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8 border-b border-[#D5CEC0]"
    >
      {/* Section Heading & Global Lesson Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#122033]">
            {t.lessonsTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#43536B]">{t.lessonsSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleRealCode}
            aria-pressed={showRealCode}
            className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[42px] rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              showRealCode
                ? 'bg-[#0F4C81] border-[#0F4C81] text-white'
                : 'bg-white border-[#D5CEC0] hover:border-[#0F4C81] text-[#122033]'
            }`}
          >
            <Code2 className="w-4 h-4" aria-hidden="true" />
            <span>{t.realCodeLabel}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCheatSheet}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[42px] rounded-xl bg-white border border-[#D5CEC0] hover:border-[#0F4C81] text-xs sm:text-sm font-semibold text-[#122033] cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#9A5B00]" aria-hidden="true" />
            <span>{t.cheatSheetBtn}</span>
          </button>
        </div>
      </div>

      {/* 4 Lesson Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LESSONS.map((l) => {
          const active = l.id === lesson.id;
          const isExp = progress.explainedLessons.includes(l.id);
          const isSeen = progress.seenLessons.includes(l.id);
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => selectLesson(l.id)}
              aria-current={active ? 'page' : undefined}
              className={`text-left rounded-2xl p-4 border transition-colors cursor-pointer ${
                active
                  ? 'bg-[#0F4C81] border-[#0F4C81] text-white shadow-[var(--shadow-card)]'
                  : 'bg-white border-[#D5CEC0] hover:border-[#0F4C81] text-[#122033]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={active ? 'text-[#BAE6FD] font-semibold' : 'text-[#5C6B80] font-semibold'}>
                  {l.id}
                </span>
                <span
                  className={`font-semibold ${
                    isExp
                      ? active
                        ? 'text-[#6EE7B7]'
                        : 'text-[#047857]'
                      : isSeen
                      ? active
                        ? 'text-[#FDE68A]'
                        : 'text-[#9A5B00]'
                      : active
                      ? 'text-[#E2E8F0]'
                      : 'text-[#5C6B80]'
                  }`}
                >
                  {isExp ? ui.explainedTag : isSeen ? ui.seenTag : ui.newTag}
                </span>
              </div>
              <p className="mt-1.5 font-display text-sm sm:text-base font-bold leading-snug">
                {pickText(l.title, script)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Lesson Card */}
      <div className="rounded-2xl bg-white border border-[#D5CEC0] p-5 sm:p-8 shadow-[var(--shadow-card)] space-y-6">
        {/* Lesson Goal + Know-it check + Glossary Chips */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE5DA] pb-5">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#0F4C81]">
              {ui.goalLabel}{' '}
              <span className="text-[#122033] font-medium">
                {pickText(lesson.goal, script)}
              </span>
            </p>
            {lessonGlossary.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-[#5C6B80]">{ui.glossaryHint}</span>
                {lessonGlossary.map((term) => {
                  const open = activeGlossaryId === term.id;
                  return (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => setActiveGlossaryId(open ? null : term.id)}
                      aria-expanded={open}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        open
                          ? 'bg-[#0F4C81] border-[#0F4C81] text-white'
                          : 'bg-[#F6F4EE] border-[#D5CEC0] hover:border-[#0F4C81] text-[#0F4C81]'
                      }`}
                    >
                      {pickText(term.term, script)} ?
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={openKnowItModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] hover:border-[#0F4C81] text-xs sm:text-sm font-semibold text-[#122033] cursor-pointer shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-[#9A5B00]" aria-hidden="true" />
            <span>{ui.knowItBtn}</span>
          </button>
        </div>

        {/* Tap-to-define inline Glossary card */}
        {activeGlossaryId && (
          <div className="rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] p-4 space-y-2 text-sm">
            {lessonGlossary
              .filter((item) => item.id === activeGlossaryId)
              .map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display font-bold text-[#0F4C81]">
                      {pickText(item.term, script)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveGlossaryId(null)}
                      aria-label={ui.closeBtn}
                      className="p-1 rounded-lg hover:bg-[#E0F2FE] cursor-pointer"
                    >
                      <X className="w-4 h-4 text-[#075985]" />
                    </button>
                  </div>
                  <p className="text-[#122033]">{pickText(item.definition, script)}</p>
                  <div className={`grid grid-cols-1 ${showRealCode ? 'sm:grid-cols-2' : ''} gap-2`}>
                    <pre className="rounded-lg bg-[#0E1A2B] text-[#F4F6FA] px-3 py-2 text-xs font-code overflow-x-auto">
                      <code>{item.example}</code>
                    </pre>
                    {showRealCode && (
                      <pre className="rounded-lg bg-[#17273E] text-[#BAE6FD] px-3 py-2 text-xs font-code overflow-x-auto">
                        <code>{item.pythonExample}</code>
                      </pre>
                    )}
                  </div>
                  <p className="text-xs text-[#9A5B00] font-medium">
                    {ui.mixupLabel} {pickText(item.commonMixup, script)}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* Screen Stepper Dots */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-label="Dars bosqichlari">
            {lesson.screens.map((s, idx) => {
              const isCurr = idx === screenIdx;
              const isSolved = Boolean(solvedScreens[s.id]);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goScreen(idx)}
                  aria-label={`${idx + 1}-qadam: ${pickText(s.title, script)}`}
                  className={`h-8 min-w-[32px] px-2.5 rounded-lg text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                    isCurr
                      ? 'bg-[#0F4C81] text-white'
                      : isSolved
                      ? 'bg-[#047857] text-white'
                      : 'bg-[#F6F4EE] border border-[#D5CEC0] text-[#43536B] hover:border-[#0F4C81]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <span className="text-xs font-semibold text-[#5C6B80] tabular-nums">
            {ui.screenCounter} {screenIdx + 1} / {lesson.screens.length}
          </span>
        </div>

        {/* Active Screen Content */}
        <div className="space-y-5">
          <div className="space-y-2">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#122033]">
              {pickText(screen.title, script)}
            </h3>

            {/* 1-sentence <=12-word Core Idea */}
            <p className="rounded-xl bg-[#F6F4EE] border-l-4 border-[#0F4C81] px-4 py-2.5 text-sm sm:text-base font-bold text-[#0F4C81]">
              {pickText(screen.coreIdea, script)}
            </p>

            <p className="text-sm sm:text-base text-[#43536B] leading-relaxed">
              {pickText(screen.body, script)}
            </p>
          </div>

          {/* Where the Analogy Breaks */}
          {screen.analogyBreak && (
            <div className="rounded-xl bg-[#FEF3C7]/60 border border-[#F59E0B]/60 p-4 flex items-start gap-3 text-xs sm:text-sm text-[#78350F]">
              <AlertTriangle className="w-5 h-5 text-[#9A5B00] shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                <strong className="font-bold">{ui.analogyTitle}</strong>{' '}
                {pickText(screen.analogyBreak, script)}
              </p>
            </div>
          )}

          {/* INTERACTIVE: L1 Tea Robot */}
          {screen.interactiveType === 'tea-robot' && (
            <div className="rounded-2xl bg-[#F6F4EE] border border-[#D5CEC0] p-4 sm:p-5 space-y-4">
              <div className="space-y-2.5">
                {teaOrder.map((stepId, idx) => {
                  const stepObj = TEA_CORRECT_STEPS.find((s) => s.id === stepId)!;
                  const label = script === 'uz-Cyrl' ? stepObj.cyrl : stepObj.latn;
                  return (
                    <div
                      key={stepId}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white border border-[#D5CEC0] px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#0F4C81] text-white text-xs font-bold flex items-center justify-center tabular-nums">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-[#122033]">{label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveTeaStep(idx, -1)}
                          aria-label={`${label} yuqoriga`}
                          className="p-2 min-w-[36px] min-h-[36px] rounded-lg bg-[#F6F4EE] border border-[#D5CEC0] disabled:opacity-35 cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === teaOrder.length - 1}
                          onClick={() => moveTeaStep(idx, 1)}
                          aria-label={`${label} pastga`}
                          className="p-2 min-w-[36px] min-h-[36px] rounded-lg bg-[#F6F4EE] border border-[#D5CEC0] disabled:opacity-35 cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={runTeaRobot}
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl bg-[#0F4C81] hover:bg-[#0B3A63] text-white text-sm font-semibold cursor-pointer"
                >
                  <Play className="w-4 h-4" aria-hidden="true" />
                  <span>{ui.teaRun}</span>
                </button>
              </div>

              {teaResult && (
                <div
                  role="status"
                  className={`rounded-xl p-3.5 text-sm font-medium border ${
                    teaResult.ok
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                  }`}
                >
                  {teaResult.text}
                </div>
              )}
            </div>
          )}

          {/* INTERACTIVE: L2/L4 TraceMachine */}
          {screen.interactiveType === 'trace' && screen.traceId && TRACE_PROGRAMS[screen.traceId] && (
            <TraceMachine
              program={TRACE_PROGRAMS[screen.traceId]}
              script={script}
              showRealCode={showRealCode}
              onToggleRealCode={onToggleRealCode}
              reducedMotion={reducedMotion}
            />
          )}

          {/* INTERACTIVE: L3 VA & YOKI Switches */}
          {screen.interactiveType === 'va-yoki-switches' && (
            <div className="rounded-2xl bg-[#0E1A2B] text-white border border-[#243957] p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSwitchA((v) => !v)}
                  aria-pressed={switchA}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    switchA
                      ? 'bg-[#047857]/30 border-[#34D399]'
                      : 'bg-[#17273E] border-[#243957]'
                  }`}
                >
                  <p className="text-xs text-[#B8C4D6]">{ui.switchALabel}</p>
                  <p className="font-code text-base font-bold mt-1">
                    {switchA ? ui.switchOn : ui.switchOff}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSwitchB((v) => !v)}
                  aria-pressed={switchB}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    switchB
                      ? 'bg-[#047857]/30 border-[#34D399]'
                      : 'bg-[#17273E] border-[#243957]'
                  }`}
                >
                  <p className="text-xs text-[#B8C4D6]">{ui.switchBLabel}</p>
                  <p className="font-code text-base font-bold mt-1">
                    {switchB ? ui.switchOn : ui.switchOff}
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`rounded-xl p-4 border ${
                    switchA && switchB
                      ? 'bg-[#FEF3C7] text-[#78350F] border-[#F59E0B]'
                      : 'bg-[#17273E] text-[#94A3B8] border-[#243957]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm">{ui.andLamp}</span>
                    <Lightbulb className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <p className="font-code text-xs mt-1">
                    {String(switchA)} && {String(switchB)} →{' '}
                    <strong>{switchA && switchB ? ui.lampLit : ui.lampDark}</strong>
                  </p>
                </div>

                <div
                  className={`rounded-xl p-4 border ${
                    switchA || switchB
                      ? 'bg-[#FEF3C7] text-[#78350F] border-[#F59E0B]'
                      : 'bg-[#17273E] text-[#94A3B8] border-[#243957]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm">{ui.orLamp}</span>
                    <Lightbulb className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <p className="font-code text-xs mt-1">
                    {String(switchA)} || {String(switchB)} →{' '}
                    <strong>{switchA || switchB ? ui.lampLit : ui.lampDark}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* INTERACTIVE: L4 4-Step Debug Protocol */}
          {screen.interactiveType === 'debug-4step' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {ui.debugSteps.map((label, idx) => {
                  const stepNo = idx + 1;
                  const active = stepNo <= debugStepDone;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setDebugStepDone(stepNo);
                        if (stepNo === 4) setShowFixedLoopTrace(true);
                      }}
                      className={`text-left rounded-xl p-3 border text-xs font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#ECFDF5] border-[#047857] text-[#065F46]'
                          : 'bg-[#F6F4EE] border-[#D5CEC0] text-[#43536B]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowFixedLoopTrace(false)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                    !showFixedLoopTrace
                      ? 'bg-[#B91C1C] border-[#B91C1C] text-white'
                      : 'bg-[#F6F4EE] border-[#D5CEC0] text-[#122033]'
                  }`}
                >
                  {ui.debugShowBroken}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFixedLoopTrace(true);
                    setDebugStepDone(4);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                    showFixedLoopTrace
                      ? 'bg-[#047857] border-[#047857] text-white'
                      : 'bg-[#F6F4EE] border-[#D5CEC0] text-[#122033]'
                  }`}
                >
                  {ui.debugShowFixed}
                </button>
              </div>

              <TraceMachine
                program={
                  TRACE_PROGRAMS[
                    showFixedLoopTrace ? 'trace-loop-1' : 'trace-loop-infinite'
                  ]
                }
                script={script}
                showRealCode={showRealCode}
                onToggleRealCode={onToggleRealCode}
                reducedMotion={reducedMotion}
              />
            </div>
          )}

          {/* MISCONCEPTIONS SCREEN ("Mirzoning xatosi") */}
          {screen.kind === 'misconceptions' && screen.misconceptionCards && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {screen.misconceptionCards.map((card) => {
                const opened = Boolean(revealedMisconceptions[card.id]);
                return (
                  <div
                    key={card.id}
                    className="rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <p className="font-display text-base font-bold text-[#991B1B]">
                        {pickText(card.wrongClaim, script)}
                      </p>
                      <p className="text-xs text-[#43536B]">
                        <strong>{ui.misconceptionWrongPrefix}</strong>{' '}
                        {pickText(card.mirzoAttempt, script)}
                      </p>
                    </div>

                    {opened ? (
                      <div className="rounded-lg bg-white border border-[#A7F3D0] p-3 text-xs sm:text-sm text-[#065F46]">
                        {pickText(card.whyWrong, script)}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedMisconceptions((prev) => ({
                            ...prev,
                            [card.id]: true,
                          }))
                        }
                        className="w-full py-2 px-3 min-h-[40px] rounded-lg bg-white border border-[#0F4C81] text-xs font-semibold text-[#0F4C81] hover:bg-[#F0F9FF] cursor-pointer"
                      >
                        {ui.misconceptionReveal}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* QUESTION BLOCK (hook-predict, worked-faded, teach-back, transfer) */}
          {screen.question && (
            <div className="space-y-4">
              {screen.question.code && (
                <div className={`grid grid-cols-1 ${showRealCode && screen.question.pythonCode ? 'sm:grid-cols-2' : ''} gap-3`}>
                  <pre className="rounded-xl bg-[#0E1A2B] text-[#F4F6FA] p-4 text-xs sm:text-sm font-code overflow-x-auto">
                    <code>{screen.question.code}</code>
                  </pre>
                  {showRealCode && screen.question.pythonCode && (
                    <pre className="rounded-xl bg-[#17273E] text-[#BAE6FD] p-4 text-xs sm:text-sm font-code overflow-x-auto">
                      <code>{screen.question.pythonCode}</code>
                    </pre>
                  )}
                </div>
              )}

              <p className="text-sm sm:text-base font-bold text-[#122033]">
                {pickText(screen.question.prompt, script)}
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {screen.question.options.map((opt, idx) => {
                  const chosen = currentChoice === idx;
                  const isRight = idx === screen.question!.correctIndex;
                  return (
                    <button
                      key={`${screen.id}-opt-${idx}`}
                      type="button"
                      onClick={() => handleSelectScreenOption(idx)}
                      className={`w-full text-left px-4 py-3 min-h-[48px] rounded-xl border text-sm sm:text-base transition-colors cursor-pointer ${
                        chosen
                          ? isRight
                            ? 'bg-[#ECFDF5] border-[#047857] text-[#065F46] font-semibold'
                            : 'bg-[#FEF2F2] border-[#B91C1C] text-[#991B1B] font-semibold'
                          : 'bg-[#F6F4EE] border-[#D5CEC0] hover:border-[#0F4C81] text-[#122033]'
                      }`}
                    >
                      {pickText(opt, script)}
                    </button>
                  );
                })}
              </div>

              {currentChoice !== undefined && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`rounded-xl p-4 text-sm flex items-start gap-2.5 border ${
                    currentChoice === screen.question.correctIndex
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#F0F9FF] border-[#BAE6FD] text-[#075985]'
                  }`}
                >
                  {currentChoice === screen.question.correctIndex ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <p>
                    {pickText(screen.question.optionFeedback[currentChoice], script)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Takeaway & Bridge on final screen */}
          {(screen.takeaway || screen.bridge) && (
            <div className="rounded-2xl bg-[#F6F4EE] border border-[#D5CEC0] p-4 sm:p-5 space-y-3">
              {screen.takeaway && (
                <div>
                  <p className="text-xs font-bold text-[#0F4C81]">{ui.takeawayLabel}</p>
                  <p className="text-sm sm:text-base font-semibold text-[#122033]">
                    {pickText(screen.takeaway, script)}
                  </p>
                </div>
              )}
              {screen.bridge && (
                <p className="text-xs sm:text-sm text-[#43536B]">
                  {pickText(screen.bridge, script)}
                </p>
              )}

              <div
                className={`rounded-xl p-3 text-xs sm:text-sm font-medium ${
                  isLessonExplained
                    ? 'bg-[#ECFDF5] text-[#065F46]'
                    : 'bg-[#FEF3C7]/70 text-[#78350F]'
                }`}
              >
                {isLessonExplained ? ui.explainedSuccess : ui.explainFirstNote}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#EAE5DA]">
          <button
            type="button"
            disabled={screenIdx === 0}
            onClick={() => goScreen(screenIdx - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] hover:border-[#0F4C81] disabled:opacity-40 text-sm font-semibold text-[#122033] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span>{ui.prevBtn}</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {screenIdx < lesson.screens.length - 1 ? (
              <button
                type="button"
                onClick={() => goScreen(screenIdx + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0F4C81] hover:bg-[#0B3A63] text-white text-sm font-semibold cursor-pointer"
              >
                <span>{ui.nextBtn}</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onGoToWorkshop(lesson.skillId)}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#047857] hover:bg-[#065F46] text-white text-sm font-semibold cursor-pointer"
              >
                <span>
                  {ui.workshopCta}: {pickText(lesson.targetWorkshopTitle, script)}
                </span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* "Men buni bilaman" 3-Question Verification Modal */}
      {knowItOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="know-it-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1A2B]/75 p-4"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white text-[#122033] border border-[#D5CEC0] p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="know-it-title" className="font-display text-lg sm:text-xl font-bold">
                  {ui.knowItTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#43536B] mt-0.5">{ui.knowItSub}</p>
              </div>
              <button
                type="button"
                onClick={() => setKnowItOpen(false)}
                aria-label={ui.closeBtn}
                className="p-2 rounded-xl hover:bg-[#EAE5DA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!knowItFinished && activeKnowItem ? (
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#0F4C81] tabular-nums">
                  {knowItIdx + 1} / {lesson.knowItCheck.length}
                </p>
                <p className="text-base font-semibold">
                  {pickText(activeKnowItem.prompt, script)}
                </p>

                <div className="space-y-2">
                  {activeKnowItem.options.map((opt, idx) => (
                    <button
                      key={`${activeKnowItem.id}-opt-${idx}`}
                      type="button"
                      disabled={knowItChecked}
                      onClick={() => setKnowItChoice(idx)}
                      className={`w-full text-left px-4 py-3 min-h-[46px] rounded-xl border text-sm transition-colors cursor-pointer ${
                        knowItChoice === idx
                          ? 'border-[#0F4C81] bg-[#F0F9FF] text-[#075985] font-semibold'
                          : 'border-[#D5CEC0] bg-[#F6F4EE] hover:border-[#0F4C81]'
                      }`}
                    >
                      {pickText(opt, script)}
                    </button>
                  ))}
                </div>

                {knowItChecked && (
                  <div
                    role="status"
                    className={`rounded-xl p-3.5 text-sm ${
                      knowItChoice === activeKnowItem.correctIndex
                        ? 'bg-[#ECFDF5] text-[#065F46]'
                        : 'bg-[#FEF2F2] text-[#991B1B]'
                    }`}
                  >
                    <p>{pickText(activeKnowItem.explanation, script)}</p>
                    {knowItChoice !== activeKnowItem.correctIndex &&
                      activeKnowItem.misconceptionIds[knowItChoice ?? 0] &&
                      MISCONCEPTION_CATALOG[
                        activeKnowItem.misconceptionIds[knowItChoice ?? 0]
                      ] && (
                        <p className="text-xs mt-1 font-semibold">
                          {pickText(
                            MISCONCEPTION_CATALOG[
                              activeKnowItem.misconceptionIds[knowItChoice ?? 0]
                            ].label,
                            script
                          )}
                        </p>
                      )}
                  </div>
                )}

                <div className="flex justify-end">
                  {!knowItChecked ? (
                    <button
                      type="button"
                      disabled={knowItChoice === null}
                      onClick={handleCheckKnowIt}
                      className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0F4C81] disabled:opacity-45 text-white text-sm font-semibold cursor-pointer"
                    >
                      {ui.knowItCheckBtn}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextKnowIt}
                      className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#047857] text-white text-sm font-semibold cursor-pointer"
                    >
                      {ui.knowItNextBtn}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`rounded-xl p-4 text-sm font-medium ${
                    knowItCorrectCount === lesson.knowItCheck.length
                      ? 'bg-[#ECFDF5] text-[#065F46]'
                      : 'bg-[#FEF3C7] text-[#78350F]'
                  }`}
                >
                  <p className="font-bold text-base mb-1 tabular-nums">
                    {knowItCorrectCount} / {lesson.knowItCheck.length}
                  </p>
                  <p>
                    {knowItCorrectCount === lesson.knowItCheck.length
                      ? ui.knowItPass
                      : ui.knowItFail}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setKnowItOpen(false)}
                    className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0F4C81] text-white text-sm font-semibold cursor-pointer"
                  >
                    {ui.closeBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
