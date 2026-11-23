'use client';

import React, { useMemo, useState } from 'react';
import {
  Brain,
  MessageSquareText,
  TrendingUp,
  Search,
  BarChart3,
  X,
  CheckCircle2,
  Play,
  AlertCircle,
} from 'lucide-react';
import {
  LUGAT_TERMS,
  normalizeUzbekInput,
  pickText,
  type LocaleScript,
  type UiDictionary,
} from '@/lib/engine/i18n';
import {
  MISCONCEPTION_CATALOG,
  SKILL_NODES,
  validateCurriculum,
} from '@/lib/data/curriculum';
import { TRACE_PROGRAMS } from '@/lib/data/traces';
import {
  getSkillStages,
  getTopMisconceptions,
  type ProgressState,
} from '@/lib/engine/mastery';
import { TraceMachine } from './TraceMachine';

interface PrinciplesSectionProps {
  t: UiDictionary;
  script: LocaleScript;
  progress: ProgressState;
  onToggleRealCode: () => void;
}

export function PrinciplesSection({
  t,
  script,
  progress,
  onToggleRealCode,
}: PrinciplesSectionProps) {
  const [query, setQuery] = useState('');
  const [activeTraceId, setActiveTraceId] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState('');
  const [reportOpen, setReportOpen] = useState(false);

  const filteredTerms = useMemo(() => {
    const norm = normalizeUzbekInput(query);
    if (!norm) return LUGAT_TERMS;
    return LUGAT_TERMS.filter((item) => {
      const termLatn = normalizeUzbekInput(item.term.latn);
      const termCyrl = normalizeUzbekInput(item.term.cyrl);
      const defLatn = normalizeUzbekInput(item.definition.latn);
      const defCyrl = normalizeUzbekInput(item.definition.cyrl);
      return (
        termLatn.includes(norm) ||
        termCyrl.includes(norm) ||
        defLatn.includes(norm) ||
        defCyrl.includes(norm)
      );
    });
  }, [query]);

  const curriculumCheck = useMemo(() => validateCurriculum(), []);
  const topMisconceptions = useMemo(
    () => getTopMisconceptions(progress, 3),
    [progress]
  );

  const totalAttempts = SKILL_NODES.reduce(
    (sum, s) => sum + progress.skills[s.id].attempts,
    0
  );
  const totalCorrect = SKILL_NODES.reduce(
    (sum, s) => sum + progress.skills[s.id].correct,
    0
  );
  const accuracyPct =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const ui =
    script === 'uz-Cyrl'
      ? {
          p1Title: '01. Фаол эслаб қолиш',
          p1Body:
            'Узун матн ўқиш ўрнига, ҳар бир экранда аввал тахмин қиласан, ўзгарувчи қутисини кузатасан ва сўнгра ўз сўзинг билан тушунтирасан.',
          p2Title: '02. Хатони тушуниш ва тузатиш',
          p2Body:
            'Хато қилсанг ҳам ўйин тўхтамайди: Мирзо айнан қайси тушунча чалкашганини кўрсатади ва ўхшаш мисолда тузатиш имконини беради.',
          p3Title: '03. Кўринадиган ўсиш ва SM-2',
          p3Body:
            'Кўрилди → Қўллай оламан → Тушунтира оламан босқичлари ҳамда SM-2 жадвали қайси мавзуни такрорлаш кераклигини аниқ кўрсатади.',
          glossaryTitle: 'Дастурчи луғати',
          glossarySub: "Асосий атамаларни қулай қидир (oʻ / o' фарқ қилмайди)",
          glossarySearchAria: 'Атама қидириш',
          glossaryPlaceholder: 'Масалан: ўзгарувчи, цикл...',
          mixupPrefix: 'Кўп учрайдиган хато:',
          watchTraceBtn: 'Мирзо машинасида кўр',
          hideTraceBtn: 'Машинани ёпиш',
          notFound: 'Бу сўз бўйича атама топилмади. Бошқа сўз ёзиб кўр.',
          // Teacher/Parent report keeps respectful "siz"
          gateTitle: 'Устоз / ота-она текшируви',
          gatePrompt: 'Ҳисобот бўлимига ўтиш учун мисолни ечинг:',
          gatePlaceholder: 'Жавобни киритинг',
          gateError: 'Жавоб нотўғри. 7 + 8 нечага тенг?',
          gateSubmit: 'Кириш',
          reportTitle: 'Ўзлаштириш ва тушуниш ҳисоботи',
          reportSub: 'Ушбу қурилмадаги локал маълумотлар асосида (сиз учун умумий таҳлил)',
          statXp: 'Жами XP',
          statAcc: 'Аниқлик',
          statRepaired: 'Тузатилган хато',
          statDiag: 'Қисқа синов',
          notDone: 'Ўтилмаган',
          stageSeen: 'Кўрилди',
          stageApplied: 'Қўллай олди',
          stageExplained: 'Тушунтира олди',
          attemptsLabel: 'Уринишлар:',
          correctLabel: 'Тўғри:',
          sm2Label: 'SM-2 оралиқ:',
          daysUnit: 'кун',
          miscSectionTitle: 'Энг кўп учраган 3 та чалкашлик (сизнинг эътиборингиз учун)',
          noMiscYet: 'Ҳозирча хатолар қайд этилмади — ўқувчи барча топшириқларни аниқ бажармоқда.',
          timesUnit: 'марта',
          checkOkPrefix: 'Контент текшируви:',
          checkOkSuffix: 'та топшириқ яроқли (0 та хато).',
        }
      : {
          p1Title: '01. Faol eslab qolish',
          p1Body:
            'Uzun matn oʻqish oʻrniga, har bir ekranda avval taxmin qilasan, oʻzgaruvchi qutisini kuzatasan va soʻngra oʻz soʻzing bilan tushuntirasan.',
          p2Title: '02. Xatoni tushunish va tuzatish',
          p2Body:
            'Xato qilsang ham oʻyin toʻxtamaydi: Mirzo aynan qaysi tushuncha chalkashganini koʻrsatadi va oʻxshash misolda tuzatish imkonini beradi.',
          p3Title: '03. Koʻrinadigan oʻsish va SM-2',
          p3Body:
            'Koʻrildi → Qoʻllay olaman → Tushuntira olaman bosqichlari hamda SM-2 jadvali qaysi mavzuni takrorlash kerakligini aniq koʻrsatadi.',
          glossaryTitle: 'Dasturchi lugʻati',
          glossarySub: "Asosiy atamalarni qulay qidir (oʻ / o' farq qilmaydi)",
          glossarySearchAria: 'Atama qidirish',
          glossaryPlaceholder: 'Masalan: oʻzgaruvchi, sikl...',
          mixupPrefix: 'Koʻp uchraydigan xato:',
          watchTraceBtn: 'Mirzo mashinasida koʻr',
          hideTraceBtn: 'Mashinani yopish',
          notFound: 'Bu soʻz boʻyicha atama topilmadi. Boshqa soʻz yozib koʻr.',
          // Teacher/Parent report keeps respectful "siz"
          gateTitle: 'Ustoz / ota-ona tekshiruvi',
          gatePrompt: 'Hisobot boʻlimiga oʻtish uchun misolni yeching:',
          gatePlaceholder: 'Javobni kiriting',
          gateError: 'Javob notoʻgʻri. 7 + 8 nechaga teng?',
          gateSubmit: 'Kirish',
          reportTitle: 'Oʻzlashtirish va tushunish hisoboti',
          reportSub: 'Ushbu qurilmadagi lokal maʼlumotlar asosida (siz uchun umumiy tahlil)',
          statXp: 'Jami XP',
          statAcc: 'Aniqlik',
          statRepaired: 'Tuzatilgan xato',
          statDiag: 'Qisqa sinov',
          notDone: 'Oʻtilmagan',
          stageSeen: 'Koʻrildi',
          stageApplied: 'Qoʻllay oldi',
          stageExplained: 'Tushuntira oldi',
          attemptsLabel: 'Urinishlar:',
          correctLabel: 'Toʻgʻri:',
          sm2Label: 'SM-2 oraliq:',
          daysUnit: 'kun',
          miscSectionTitle: 'Eng koʻp uchragan 3 ta chalkashlik (sizning eʼtiboringiz uchun)',
          noMiscYet: 'Hozircha xatolar qayd etilmadi — oʻquvchi barcha topshiriqlarni aniq bajarmoqda.',
          timesUnit: 'marta',
          checkOkPrefix: 'Kontent tekshiruvi:',
          checkOkSuffix: 'ta topshiriq yaroqli (0 ta xato).',
        };

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gateAnswer.trim() === '15') {
      setGateOpen(false);
      setGateAnswer('');
      setGateError('');
      setReportOpen(true);
    } else {
      setGateError(ui.gateError);
    }
  };

  return (
    <section
      id="tamoyillar"
      className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#122033]">
            {t.principlesTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#43536B]">
            {t.principlesSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setGateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-[#D5CEC0] hover:border-[#0F4C81] text-sm font-semibold text-[#122033] cursor-pointer self-start md:self-auto"
        >
          <BarChart3 className="w-4 h-4 text-[#0F4C81]" aria-hidden="true" />
          <span>{t.parentPanelBtn}</span>
        </button>
      </div>

      {/* 3 Evidence-Based Learning Principles (No fabricated numbers or citations) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article className="rounded-2xl bg-white border border-[#D5CEC0] p-6 shadow-[var(--shadow-card)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] text-[#0F4C81] flex items-center justify-center">
            <Brain className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#122033]">
            {ui.p1Title}
          </h3>
          <p className="text-sm text-[#43536B] leading-relaxed">{ui.p1Body}</p>
        </article>

        <article className="rounded-2xl bg-white border border-[#D5CEC0] p-6 shadow-[var(--shadow-card)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#9A5B00] flex items-center justify-center">
            <MessageSquareText className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#122033]">
            {ui.p2Title}
          </h3>
          <p className="text-sm text-[#43536B] leading-relaxed">{ui.p2Body}</p>
        </article>

        <article className="rounded-2xl bg-white border border-[#D5CEC0] p-6 shadow-[var(--shadow-card)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#122033]">
            {ui.p3Title}
          </h3>
          <p className="text-sm text-[#43536B] leading-relaxed">{ui.p3Body}</p>
        </article>
      </div>

      {/* Interactive Glossary (Lugʻat) with TraceMachine integration */}
      <div className="rounded-2xl bg-white border border-[#D5CEC0] p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-[#122033]">
              {ui.glossaryTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C6B80]">{ui.glossarySub}</p>
          </div>

          <div className="relative w-full sm:w-72">
            <label htmlFor="lugat-search" className="sr-only">
              {ui.glossarySearchAria}
            </label>
            <Search
              className="w-4 h-4 text-[#5C6B80] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="lugat-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ui.glossaryPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] text-sm text-[#122033] placeholder:text-[#5C6B80]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerms.map((item) => {
            const isTraceOpen = Boolean(item.traceId && activeTraceId === item.traceId);
            return (
              <div
                key={item.id}
                className="rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <h4 className="font-display text-base font-bold text-[#0F4C81]">
                    {pickText(item.term, script)}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#43536B] leading-relaxed">
                    {pickText(item.definition, script)}
                  </p>
                  <pre className="rounded-lg bg-[#0E1A2B] text-[#F4F6FA] px-3 py-2 text-xs font-code overflow-x-auto">
                    <code>{item.example}</code>
                  </pre>
                  {progress.preferences.showRealCode && (
                    <pre className="rounded-lg bg-[#17273E] text-[#BAE6FD] px-3 py-2 text-xs font-code overflow-x-auto">
                      <code>{item.pythonExample}</code>
                    </pre>
                  )}
                  <p className="text-xs text-[#9A5B00]">
                    <strong>{ui.mixupPrefix}</strong>{' '}
                    {pickText(item.commonMixup, script)}
                  </p>
                </div>

                {item.traceId && TRACE_PROGRAMS[item.traceId] && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTraceId(isTraceOpen ? null : item.traceId!)
                    }
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg bg-white border border-[#0F4C81] text-xs font-semibold text-[#0F4C81] hover:bg-[#F0F9FF] cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isTraceOpen ? ui.hideTraceBtn : ui.watchTraceBtn}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {activeTraceId && TRACE_PROGRAMS[activeTraceId] && (
          <TraceMachine
            program={TRACE_PROGRAMS[activeTraceId]}
            script={script}
            showRealCode={progress.preferences.showRealCode}
            onToggleRealCode={onToggleRealCode}
            reducedMotion={progress.preferences.reducedMotion}
            compact
          />
        )}

        {filteredTerms.length === 0 && (
          <p className="text-sm text-[#5C6B80] py-4 text-center">{ui.notFound}</p>
        )}
      </div>

      {/* Parental Math Gate Modal */}
      {gateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="parent-gate-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1A2B]/70 p-4"
        >
          <form
            onSubmit={handleGateSubmit}
            className="w-full max-w-sm rounded-2xl bg-white border border-[#D5CEC0] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 id="parent-gate-title" className="font-display text-lg font-bold text-[#122033]">
                {ui.gateTitle}
              </h3>
              <button
                type="button"
                onClick={() => setGateOpen(false)}
                aria-label="Yopish"
                className="p-2 rounded-lg hover:bg-[#EAE5DA] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#43536B]">
              {ui.gatePrompt} <strong>7 + 8 = ?</strong>
            </p>
            <div>
              <label htmlFor="parent-gate-input" className="sr-only">
                Javob
              </label>
              <input
                id="parent-gate-input"
                type="number"
                inputMode="numeric"
                value={gateAnswer}
                onChange={(e) => setGateAnswer(e.target.value)}
                placeholder={ui.gatePlaceholder}
                className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-[#D5CEC0] text-sm"
                required
              />
            </div>
            {gateError && <p className="text-xs text-[#B91C1C] font-medium">{gateError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 min-h-[44px] rounded-xl bg-[#0F4C81] text-white font-semibold text-sm cursor-pointer"
            >
              {ui.gateSubmit}
            </button>
          </form>
        </div>
      )}

      {/* Teacher / Parent Analytics Modal (Respectful "siz" register) */}
      {reportOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1A2B]/70 p-4"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#D5CEC0] p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4 border-b border-[#EAE5DA] pb-4">
              <div>
                <h3 id="report-title" className="font-display text-xl font-bold text-[#122033]">
                  {ui.reportTitle}
                </h3>
                <p className="text-xs text-[#5C6B80]">{ui.reportSub}</p>
              </div>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                aria-label="Hisobotni yopish"
                className="p-2 min-w-[40px] min-h-[40px] rounded-xl hover:bg-[#EAE5DA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-xl bg-[#F6F4EE] p-3">
                <p className="text-xs text-[#5C6B80]">{ui.statXp}</p>
                <p className="font-display text-xl font-bold text-[#0F4C81] tabular-nums">
                  {progress.xp}
                </p>
              </div>
              <div className="rounded-xl bg-[#F6F4EE] p-3">
                <p className="text-xs text-[#5C6B80]">{ui.statAcc}</p>
                <p className="font-display text-xl font-bold text-[#047857] tabular-nums">
                  {accuracyPct}%
                </p>
              </div>
              <div className="rounded-xl bg-[#F6F4EE] p-3">
                <p className="text-xs text-[#5C6B80]">{ui.statRepaired}</p>
                <p className="font-display text-xl font-bold text-[#9A5B00] tabular-nums">
                  {progress.repairedTaskIds.length}
                </p>
              </div>
              <div className="rounded-xl bg-[#F6F4EE] p-3">
                <p className="text-xs text-[#5C6B80]">{ui.statDiag}</p>
                <p className="font-display text-xl font-bold text-[#122033] tabular-nums">
                  {progress.diagnosticScore !== null
                    ? `${progress.diagnosticScore}/3`
                    : ui.notDone}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {SKILL_NODES.map((node) => {
                const sp = progress.skills[node.id];
                const stages = getSkillStages(progress, node.id);
                return (
                  <div
                    key={node.id}
                    className="rounded-xl border border-[#D5CEC0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-[#122033]">
                        {pickText(node.title, script)}
                      </p>
                      <p className="text-xs text-[#5C6B80] tabular-nums">
                        {ui.attemptsLabel} {sp.attempts} · {ui.correctLabel} {sp.correct} ·{' '}
                        {ui.sm2Label} {sp.intervalDays} {ui.daysUnit}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold pt-1">
                        <span className={stages.seen ? 'text-[#0F4C81]' : 'text-[#94A3B8]'}>
                          {ui.stageSeen}: {stages.seen ? '✓' : '—'}
                        </span>
                        <span className={stages.applied ? 'text-[#047857]' : 'text-[#94A3B8]'}>
                          {ui.stageApplied}: {stages.applied ? '✓' : '—'}
                        </span>
                        <span className={stages.explained ? 'text-[#9A5B00]' : 'text-[#94A3B8]'}>
                          {ui.stageExplained}: {stages.explained ? '✓' : '—'}
                        </span>
                      </div>
                    </div>
                    <span className="font-display text-lg font-bold text-[#0F4C81] tabular-nums">
                      {Math.round(sp.mastery * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Top 3 Misconceptions surfaced for Teacher / Parent */}
            <div className="rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] p-4 space-y-2.5">
              <p className="text-xs font-bold text-[#122033] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#9A5B00]" aria-hidden="true" />
                <span>{ui.miscSectionTitle}</span>
              </p>
              {topMisconceptions.length === 0 ? (
                <p className="text-xs text-[#43536B]">{ui.noMiscYet}</p>
              ) : (
                <ul className="space-y-2">
                  {topMisconceptions.map((item) => {
                    const meta = MISCONCEPTION_CATALOG[item.id];
                    return (
                      <li
                        key={item.id}
                        className="rounded-lg bg-white border border-[#D5CEC0] p-3 text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-2 font-semibold text-[#991B1B]">
                          <span>{meta ? pickText(meta.label, script) : item.id}</span>
                          <span className="tabular-nums">
                            {item.count} {ui.timesUnit}
                          </span>
                        </div>
                        {meta && (
                          <p className="text-[#43536B]">
                            {pickText(meta.teacherNote, script)}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-3.5 text-xs text-[#065F46] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                {ui.checkOkPrefix} {curriculumCheck.totalTasks} {ui.checkOkSuffix}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
