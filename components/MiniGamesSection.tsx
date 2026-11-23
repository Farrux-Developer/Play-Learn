'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertCircle,
  Bug,
  ArrowRight,
  Code2,
  BookOpen,
  CalendarCheck,
  Eye,
  Wrench,
} from 'lucide-react';
import {
  SEQUENCE_TASKS,
  LOGIC_TASKS,
  LOOP_BUG_TASKS,
  SKILL_NODES,
  BADGES,
  MISCONCEPTION_CATALOG,
  type SkillId,
  type SequenceTask,
  type LogicTask,
  type LoopBugTask,
} from '@/lib/data/curriculum';
import { TRACE_PROGRAMS } from '@/lib/data/traces';
import {
  buildDailyReviewQueue,
  getLevelFromXp,
  isSkillUnlocked,
  type DailyReviewItem,
  type ProgressState,
} from '@/lib/engine/mastery';
import { pickText, type UiDictionary } from '@/lib/engine/i18n';
import { playGameSound } from '@/lib/engine/sound';
import { MOTION_TOKENS, QUALITY_PRESETS } from '@/lib/motion/tokens';
import { TraceMachine } from './TraceMachine';

interface MiniGamesSectionProps {
  t: UiDictionary;
  progress: ProgressState;
  activeSkill: SkillId;
  onChangeSkill: (skillId: SkillId) => void;
  onToggleRealCode: () => void;
  onOpenCheatSheet: () => void;
  onTaskResult: (params: {
    skillId: SkillId;
    taskId: string;
    isCorrect: boolean;
    hintsUsed: number;
    misconceptionId?: string;
    explanation: string;
  }) => {
    xpEarned: number;
    newlyUnlockedBadges: string[];
    steppedDown: boolean;
  };
  onTwinRepair: (params: { taskId: string; isCorrect: boolean }) => {
    xpEarned: number;
    newlyUnlockedBadges: string[];
  };
}

function getShuffledIndices(length: number, seedStr: string): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.every((v, idx) => v === idx) && arr.length > 1) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export function MiniGamesSection({
  t,
  progress,
  activeSkill,
  onChangeSkill,
  onToggleRealCode,
  onOpenCheatSheet,
  onTaskResult,
  onTwinRepair,
}: MiniGamesSectionProps) {
  const script = progress.preferences.script;
  const showRealCode = progress.preferences.showRealCode;

  const [taskIndices, setTaskIndices] = useState<Record<SkillId, number>>({
    algoritmlar: 0,
    mantiq: 0,
    sikllar: 0,
  });

  // Daily Review ("Kunlik takror") 5-question mode
  const [dailyMode, setDailyMode] = useState(false);
  const [dailyQueue, setDailyQueue] = useState<DailyReviewItem[]>([]);
  const [dailyIdx, setDailyIdx] = useState(0);

  // Shared game-feel state
  const [hintsOpened, setHintsOpened] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    misconceptionId?: string;
    xpEarned?: number;
    steppedDown?: boolean;
  } | null>(null);
  const [showTraceReplay, setShowTraceReplay] = useState(false);
  const [twinChoice, setTwinChoice] = useState<number | null>(null);
  const [twinStatus, setTwinStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [twinXpNote, setTwinXpNote] = useState<number>(0);

  const [nudgeKey, setNudgeKey] = useState(0);
  const [floatingXp, setFloatingXp] = useState<{ id: number; amount: number } | null>(null);
  const [victoryModal, setVictoryModal] = useState<{
    skillId: SkillId;
    earnedBadges: string[];
  } | null>(null);
  const [tickXp, setTickXp] = useState(0);

  // Determine current skill & task (either from active workshop OR daily review item)
  const dailyItem = dailyMode ? dailyQueue[dailyIdx] : undefined;
  const effectiveSkill: SkillId = dailyItem ? dailyItem.skillId : activeSkill;

  const effectiveTaskIndex = useMemo(() => {
    if (dailyItem) {
      if (dailyItem.skillId === 'algoritmlar') {
        return Math.max(0, SEQUENCE_TASKS.findIndex((x) => x.id === dailyItem.taskId));
      }
      if (dailyItem.skillId === 'mantiq') {
        return Math.max(0, LOGIC_TASKS.findIndex((x) => x.id === dailyItem.taskId));
      }
      return Math.max(0, LOOP_BUG_TASKS.findIndex((x) => x.id === dailyItem.taskId));
    }
    return taskIndices[activeSkill];
  }, [dailyItem, taskIndices, activeSkill]);

  const currentSeqTask: SequenceTask =
    effectiveSkill === 'algoritmlar'
      ? SEQUENCE_TASKS[effectiveTaskIndex] ?? SEQUENCE_TASKS[0]
      : SEQUENCE_TASKS[taskIndices.algoritmlar];
  const currentLogicTask: LogicTask =
    effectiveSkill === 'mantiq'
      ? LOGIC_TASKS[effectiveTaskIndex] ?? LOGIC_TASKS[0]
      : LOGIC_TASKS[taskIndices.mantiq];
  const currentLoopTask: LoopBugTask =
    effectiveSkill === 'sikllar'
      ? LOOP_BUG_TASKS[effectiveTaskIndex] ?? LOOP_BUG_TASKS[0]
      : LOOP_BUG_TASKS[taskIndices.sikllar];

  const [seqIndices, setSeqIndices] = useState<number[]>(() =>
    getShuffledIndices(currentSeqTask.correctSteps.length, currentSeqTask.id)
  );
  const [selectedLogicOpt, setSelectedLogicOpt] = useState<number | null>(null);
  const [selectedLoopLine, setSelectedLoopLine] = useState<number | null>(null);
  const [selectedLoopOpt, setSelectedLoopOpt] = useState<number | null>(null);
  const [solvedCurrent, setSolvedCurrent] = useState(false);

  const resetTransientState = (seqTaskForShuffle?: SequenceTask) => {
    setHintsOpened(0);
    setFeedback(null);
    setShowTraceReplay(false);
    setTwinChoice(null);
    setTwinStatus('idle');
    setTwinXpNote(0);
    setSolvedCurrent(false);
    setSelectedLogicOpt(null);
    setSelectedLoopLine(null);
    setSelectedLoopOpt(null);
    if (seqTaskForShuffle) {
      setSeqIndices(
        getShuffledIndices(seqTaskForShuffle.correctSteps.length, seqTaskForShuffle.id)
      );
    }
  };

  const selectSkillTab = (skillId: SkillId) => {
    playGameSound('click', progress.preferences.soundEnabled);
    setDailyMode(false);
    onChangeSkill(skillId);
    const seqTask = SEQUENCE_TASKS[taskIndices.algoritmlar];
    resetTransientState(skillId === 'algoritmlar' ? seqTask : undefined);
  };

  const selectTaskIndex = (skillId: SkillId, nextIdx: number) => {
    setTaskIndices((prev) => ({ ...prev, [skillId]: nextIdx }));
    resetTransientState(skillId === 'algoritmlar' ? SEQUENCE_TASKS[nextIdx] : undefined);
  };

  const toggleDailyReview = () => {
    playGameSound('click', progress.preferences.soundEnabled);
    if (dailyMode) {
      setDailyMode(false);
      resetTransientState(
        activeSkill === 'algoritmlar' ? SEQUENCE_TASKS[taskIndices.algoritmlar] : undefined
      );
      return;
    }
    const queue = buildDailyReviewQueue(progress);
    setDailyQueue(queue);
    setDailyIdx(0);
    setDailyMode(true);
    const first = queue[0];
    const firstSeq =
      first?.skillId === 'algoritmlar'
        ? SEQUENCE_TASKS.find((x) => x.id === first.taskId)
        : undefined;
    resetTransientState(firstSeq);
  };

  // Pooled particle burst canvas
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const burstTriggerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const preset = QUALITY_PRESETS[progress.preferences.qualityTier];
    const poolSize = progress.preferences.reducedMotion ? 0 : preset.particleCount;
    const colors = ['#0F4C81', '#F59E0B', '#047857', '#38BDF8'];

    const pool = Array.from({ length: poolSize }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 40,
      color: colors[0],
      size: 6,
    }));

    let rafId = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyActive = false;

      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.active) continue;
        anyActive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life += 1;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        if (p.life >= p.maxLife) {
          p.active = false;
        }
      }
      ctx.globalAlpha = 1;

      if (anyActive) {
        rafId = window.requestAnimationFrame(draw);
      } else {
        rafId = 0;
      }
    };

    burstTriggerRef.current = () => {
      if (pool.length === 0) return;
      const cx = canvas.width * 0.5;
      const cy = canvas.height * 0.35;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        const angle = (Math.PI * 2 * i) / pool.length;
        const speed = 2.5 + (i % 5) * 1.1;
        p.active = true;
        p.x = cx;
        p.y = cy;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 2.5;
        p.life = 0;
        p.maxLife = 36 + (i % 12);
        p.color = colors[i % colors.length];
        p.size = 5 + (i % 4);
      }
      if (!rafId) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    return () => {
      ro.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
      burstTriggerRef.current = null;
    };
  }, [progress.preferences.qualityTier, progress.preferences.reducedMotion]);

  useEffect(() => {
    if (!victoryModal || progress.preferences.reducedMotion) return;
    const target = progress.xp;
    const start = Math.max(0, target - 80);
    let frame = 0;
    const totalFrames = 24;
    let rafId = 0;
    const step = () => {
      frame += 1;
      const ratio = Math.min(1, frame / totalFrames);
      setTickXp(Math.round(start + (target - start) * ratio));
      if (ratio < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };
    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [victoryModal, progress.xp, progress.preferences.reducedMotion]);

  const displayedVictoryXp = progress.preferences.reducedMotion ? progress.xp : tickXp;

  const activeNode = useMemo(
    () => SKILL_NODES.find((n) => n.id === effectiveSkill)!,
    [effectiveSkill]
  );

  const skillProgress = progress.skills[effectiveSkill];
  const levelInfo = getLevelFromXp(progress.xp);
  const isPrerequisiteMet = isSkillUnlocked(progress, effectiveSkill);

  const activeTask =
    effectiveSkill === 'algoritmlar'
      ? currentSeqTask
      : effectiveSkill === 'mantiq'
      ? currentLogicTask
      : currentLoopTask;

  const totalTasksInSkill = 10;

  const ui =
    script === 'uz-Cyrl'
      ? {
          tabsAria: 'Устахоналар',
          taskLabel: 'Топшириқ:',
          diffLabel: 'Қийинчилик:',
          diffSuffix: '-даража',
          comboLabel: 'Комбо:',
          levelLabel: 'Даража:',
          dailyBtn: 'Кунлик такрор (5)',
          dailyExit: 'Устахонага қайтиш',
          dailyBadge: 'Кунлик такрор',
          dailyReasons: {
            misconception: 'Аввалги хато бўйича',
            due: 'SM-2 такрорлаш вақти',
            fresh: 'Янги мустаҳкамлаш',
          },
          prereqHint:
            'Тавсия: аввалги устахонада камида 3 та топшириқ ечиш фойдали, лекин ҳозир ҳам бемалол машқ қила оласан.',
          pseudoTitle: 'Ўзбекча псевдокод',
          pythonTitle: 'Ҳақиқий код (Python)',
          checkBtn: 'Жавобни текшириш',
          nextBtn: 'Кейинги топшириқ',
          nextDailyBtn: 'Кейинги такрор',
          shuffleBtn: 'Қайта аралаштириш',
          summaryBtn: 'Хулоса ва натижани кўриш',
          successTitle: 'Баракалла!',
          errorTitle: 'Эътибор бер — хато сабабини бирга кўрамиз:',
          easierBtn: 'Осонроқ мисолда мустаҳкамлашга ўтиш →',
          mirzoShowBtn: 'Мирзо кўрсатади',
          mirzoHideBtn: 'Трассани ёпиш',
          mirzoSeqExplainTitle: 'Мирзо тартиб сабабини кўрсатади:',
          twinTitle: 'Энди ўхшаш мисолда тушунганингни исботла (+15 XP):',
          twinCheckBtn: 'Тузатишни текшириш',
          twinSuccessPrefix: 'Зўр! Хатони тузатдинг:',
          twinWrong: 'Ҳали ҳам нозик жой бор — юқоридаги тушунтиришга қараб яна уриниб кўр.',
          hintTitle: 'Ёрдам зинапояси',
          hintSub: 'Қийин туюлса, аввал 1-маслаҳатни оч. Ҳар бир маслаҳат жавобга яқинлаштиради.',
          hintLabels: ['1-маслаҳат', '2-йўналиш', '3-ечим калити'],
          hintLocked: 'Ҳали очилмаган',
          hintOpenBtn: 'Кейинги маслаҳатни очиш',
          victoryTag: 'Устахона натижаси',
          victorySuffix: '— Хулоса!',
          victorySolved: 'Ечилган топшириқлар:',
          victoryMastery: 'Ўзлаштириш:',
          victoryLearned: 'Нима ўргандинг?',
          victoryBadge: 'Янги нишон очилди:',
          victoryAgain: 'Яна бир бор',
          victoryNext: 'Кейинги устахона →',
        }
      : {
          tabsAria: 'Ustaxonalar',
          taskLabel: 'Topshiriq:',
          diffLabel: 'Qiyinchilik:',
          diffSuffix: '-daraja',
          comboLabel: 'Kombo:',
          levelLabel: 'Daraja:',
          dailyBtn: 'Kunlik takror (5)',
          dailyExit: 'Ustaxonaga qaytish',
          dailyBadge: 'Kunlik takror',
          dailyReasons: {
            misconception: 'Avvalgi xato boʻyicha',
            due: 'SM-2 takrorlash vaqti',
            fresh: 'Yangi mustahkamlash',
          },
          prereqHint:
            'Tavsiya: avvalgi ustaxonada kamida 3 ta topshiriq yechish foydali, lekin hozir ham bemalol mashq qila olasan.',
          pseudoTitle: 'Oʻzbekcha psevdokod',
          pythonTitle: 'Haqiqiy kod (Python)',
          checkBtn: 'Javobni tekshirish',
          nextBtn: 'Keyingi topshiriq',
          nextDailyBtn: 'Keyingi takror',
          shuffleBtn: 'Qayta aralashtirish',
          summaryBtn: 'Xulosa va natijani koʻrish',
          successTitle: 'Barakalla!',
          errorTitle: 'Eʼtibor ber — xato sababini birga koʻramiz:',
          easierBtn: 'Osonroq misolda mustahkamlashga oʻtish →',
          mirzoShowBtn: 'Mirzo koʻrsatadi',
          mirzoHideBtn: 'Trassani yopish',
          mirzoSeqExplainTitle: 'Mirzo tartib sababini koʻrsatadi:',
          twinTitle: 'Endi oʻxshash misolda tushunganingni isbotla (+15 XP):',
          twinCheckBtn: 'Tuzatishni tekshirish',
          twinSuccessPrefix: 'Zoʻr! Xatoni tuzatding:',
          twinWrong: 'Hali ham nozik joy bor — yuqoridagi tushuntirishga qarab yana urinib koʻr.',
          hintTitle: 'Yordam zinapoyasi',
          hintSub: 'Qiyin tuyulsa, avval 1-maslahatni och. Har bir maslahat javobga yaqinlashtiradi.',
          hintLabels: ['1-maslahat', '2-yoʻnalish', '3-yechim kaliti'],
          hintLocked: 'Hali ochilmagan',
          hintOpenBtn: 'Keyingi maslahatni ochish',
          victoryTag: 'Ustaxona natijasi',
          victorySuffix: '— Xulosa!',
          victorySolved: 'Yechilgan topshiriqlar:',
          victoryMastery: 'Oʻzlashtirish:',
          victoryLearned: 'Nima oʻrganding?',
          victoryBadge: 'Yangi nishon ochildi:',
          victoryAgain: 'Yana bir bor',
          victoryNext: 'Keyingi ustaxona →',
        };

  const triggerEvaluation = (params: {
    isCorrect: boolean;
    taskId: string;
    explanation: string;
    misconceptionId?: string;
    specificErrorMsg?: string;
  }) => {
    if (solvedCurrent) return;

    const outcome = onTaskResult({
      skillId: effectiveSkill,
      taskId: params.taskId,
      isCorrect: params.isCorrect,
      hintsUsed: hintsOpened,
      misconceptionId: params.misconceptionId,
      explanation: params.explanation,
    });

    if (params.isCorrect) {
      setSolvedCurrent(true);
      setShowTraceReplay(false);
      setFeedback({
        type: 'success',
        message: params.explanation,
        xpEarned: outcome.xpEarned,
      });
      setFloatingXp({ id: Date.now(), amount: outcome.xpEarned });
      playGameSound(
        progress.streak + 1 >= 3 ? 'combo' : 'success',
        progress.preferences.soundEnabled
      );
      burstTriggerRef.current?.();

      if (!dailyMode && effectiveTaskIndex === totalTasksInSkill - 1) {
        playGameSound('victory', progress.preferences.soundEnabled);
        setVictoryModal({
          skillId: effectiveSkill,
          earnedBadges: outcome.newlyUnlockedBadges,
        });
      }
    } else {
      setNudgeKey((k) => k + 1);
      playGameSound('nudge', progress.preferences.soundEnabled);
      setFeedback({
        type: 'error',
        misconceptionId: params.misconceptionId,
        message: params.specificErrorMsg ?? params.explanation,
        steppedDown: outcome.steppedDown,
      });
      setHintsOpened((h) => Math.min(3, h + 1));
    }
  };

  const moveStep = (index: number, delta: -1 | 1) => {
    if (solvedCurrent) return;
    const target = index + delta;
    if (target < 0 || target >= seqIndices.length) return;
    playGameSound('click', progress.preferences.soundEnabled);
    setSeqIndices((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const checkSequence = () => {
    const isCorrect = seqIndices.every((origIdx, pos) => origIdx === pos);
    const miscLabel = MISCONCEPTION_CATALOG[currentSeqTask.misconceptionId]?.label;
    const specificMsg = miscLabel
      ? `${pickText(miscLabel, script)}. ${pickText(currentSeqTask.hints[0], script)}`
      : pickText(currentSeqTask.hints[0], script);

    triggerEvaluation({
      isCorrect,
      taskId: currentSeqTask.id,
      explanation: pickText(currentSeqTask.explanation, script),
      misconceptionId: isCorrect ? undefined : currentSeqTask.misconceptionId,
      specificErrorMsg: specificMsg,
    });
  };

  const checkLogic = () => {
    if (selectedLogicOpt === null) return;
    const isCorrect = selectedLogicOpt === currentLogicTask.correctIndex;
    const miscId = currentLogicTask.misconceptionIds[selectedLogicOpt];
    const specificMsg = pickText(
      currentLogicTask.optionExplanations[selectedLogicOpt],
      script
    );
    triggerEvaluation({
      isCorrect,
      taskId: currentLogicTask.id,
      explanation: pickText(currentLogicTask.explanation, script),
      misconceptionId: isCorrect ? undefined : miscId,
      specificErrorMsg: specificMsg,
    });
  };

  const checkLoopBug = () => {
    if (currentLoopTask.mode === 'bug-line') {
      if (selectedLoopLine === null) return;
      const isCorrect = selectedLoopLine === currentLoopTask.correctLine;
      const miscId =
        currentLoopTask.lineMisconceptions?.[selectedLoopLine - 1] ?? 'slip';
      const miscLabel = MISCONCEPTION_CATALOG[miscId]?.label;
      const specificMsg = miscLabel
        ? `${pickText(miscLabel, script)}. ${pickText(currentLoopTask.hints[0], script)}`
        : pickText(currentLoopTask.hints[0], script);

      triggerEvaluation({
        isCorrect,
        taskId: currentLoopTask.id,
        explanation: pickText(currentLoopTask.explanation, script),
        misconceptionId: isCorrect ? undefined : miscId,
        specificErrorMsg: specificMsg,
      });
    } else {
      if (selectedLoopOpt === null) return;
      const isCorrect = selectedLoopOpt === currentLoopTask.correctOptionIndex;
      const miscId =
        currentLoopTask.optionMisconceptions?.[selectedLoopOpt] ?? 'slip';
      const miscLabel = MISCONCEPTION_CATALOG[miscId]?.label;
      const specificMsg = miscLabel
        ? `${pickText(miscLabel, script)}. ${pickText(currentLoopTask.hints[0], script)}`
        : pickText(currentLoopTask.hints[0], script);

      triggerEvaluation({
        isCorrect,
        taskId: currentLoopTask.id,
        explanation: pickText(currentLoopTask.explanation, script),
        misconceptionId: isCorrect ? undefined : miscId,
        specificErrorMsg: specificMsg,
      });
    }
  };

  const handleCheckTwin = () => {
    if (twinChoice === null) return;
    const isCorrect = twinChoice === activeTask.twin.correctIndex;
    if (isCorrect) {
      const res = onTwinRepair({ taskId: activeTask.id, isCorrect: true });
      setTwinStatus('correct');
      setTwinXpNote(res.xpEarned);
      setSolvedCurrent(true);
      burstTriggerRef.current?.();
      playGameSound('success', progress.preferences.soundEnabled);
    } else {
      setTwinStatus('wrong');
      playGameSound('nudge', progress.preferences.soundEnabled);
    }
  };

  const goNextTask = () => {
    if (dailyMode) {
      const nextDailyIdx = (dailyIdx + 1) % Math.max(1, dailyQueue.length);
      setDailyIdx(nextDailyIdx);
      const item = dailyQueue[nextDailyIdx];
      const nextSeq =
        item?.skillId === 'algoritmlar'
          ? SEQUENCE_TASKS.find((x) => x.id === item.taskId)
          : undefined;
      resetTransientState(nextSeq);
      return;
    }
    const nextIdx = (effectiveTaskIndex + 1) % totalTasksInSkill;
    selectTaskIndex(activeSkill, nextIdx);
  };

  const goToAdaptiveEasierTask = () => {
    setDailyMode(false);
    selectTaskIndex(effectiveSkill, 0);
  };

  const activeTraceId =
    effectiveSkill === 'mantiq'
      ? currentLogicTask.traceId
      : effectiveSkill === 'sikllar'
      ? currentLoopTask.traceId
      : undefined;

  return (
    <section
      id="oyinlar"
      className="scroll-mt-16 bg-[#0E1A2B] text-[#F4F6FA] py-14 sm:py-20 border-y border-[#243957] relative overflow-hidden"
    >
      <canvas
        ref={confettiCanvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full z-20"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header & Workshop Switcher + Tools */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {t.gamesTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#B8C4D6]">{t.gamesSubtitle}</p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
            <div
              role="tablist"
              aria-label={ui.tabsAria}
              className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-[#17273E] border border-[#243957]"
            >
              {SKILL_NODES.map((node) => {
                const selected = !dailyMode && node.id === activeSkill;
                return (
                  <button
                    key={node.id}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    onClick={() => selectSkillTab(node.id)}
                    className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      selected
                        ? 'bg-[#0F4C81] text-white shadow-sm'
                        : 'text-[#B8C4D6] hover:text-white hover:bg-[#223859]'
                    }`}
                  >
                    {node.order}. {pickText(node.gameTitle, script)}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleDailyReview}
                aria-pressed={dailyMode}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  dailyMode
                    ? 'bg-[#047857] border-[#34D399] text-white'
                    : 'bg-[#17273E] border-[#243957] hover:border-[#34D399] text-[#E2E8F0]'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{dailyMode ? ui.dailyExit : ui.dailyBtn}</span>
              </button>

              <button
                type="button"
                onClick={onToggleRealCode}
                aria-pressed={showRealCode}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  showRealCode
                    ? 'bg-[#0F4C81] border-[#38BDF8] text-white'
                    : 'bg-[#17273E] border-[#243957] hover:border-[#38BDF8] text-[#E2E8F0]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.realCodeLabel}</span>
              </button>

              <button
                type="button"
                onClick={onOpenCheatSheet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl bg-[#17273E] border border-[#243957] hover:border-[#F59E0B] text-xs font-semibold text-[#E2E8F0] cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
                <span>{t.cheatSheetBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Game HUD */}
        <div className="rounded-2xl bg-[#17273E] border border-[#243957] px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm tabular-nums">
            <div>
              <span className="text-[#B8C4D6]">
                {dailyMode ? `${ui.dailyBadge}: ` : `${ui.taskLabel} `}
              </span>
              <span className="font-bold text-white">
                {dailyMode
                  ? `${dailyIdx + 1} / ${dailyQueue.length}`
                  : `${effectiveTaskIndex + 1} / ${totalTasksInSkill}`}
              </span>
            </div>
            <div>
              <span className="text-[#B8C4D6]">{ui.diffLabel} </span>
              <span className="font-bold text-[#F59E0B]">
                {activeTask.difficulty}
                {ui.diffSuffix}
              </span>
            </div>
            <div>
              <span className="text-[#B8C4D6]">{ui.comboLabel} </span>
              <span className="font-bold text-[#34D399]">
                x{Math.max(1, progress.streak)}
              </span>
            </div>
            <div>
              <span className="text-[#B8C4D6]">{ui.levelLabel} </span>
              <span className="font-bold text-white">
                {levelInfo.level} ({progress.xp} XP)
              </span>
            </div>
          </div>

          {!dailyMode ? (
            <div className="flex items-center gap-1.5" aria-label="Topshiriqlar qatori">
              {Array.from({ length: totalTasksInSkill }, (_, idx) => {
                const taskId =
                  activeSkill === 'algoritmlar'
                    ? SEQUENCE_TASKS[idx].id
                    : activeSkill === 'mantiq'
                    ? LOGIC_TASKS[idx].id
                    : LOOP_BUG_TASKS[idx].id;
                const isDone = skillProgress.completedTaskIds.includes(taskId);
                const isCurr = idx === effectiveTaskIndex;
                return (
                  <button
                    key={taskId}
                    type="button"
                    onClick={() => selectTaskIndex(activeSkill, idx)}
                    aria-label={`${idx + 1}-topshiriq`}
                    className={`w-7 h-7 rounded-lg text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                      isCurr
                        ? 'bg-[#F59E0B] text-[#0E1A2B]'
                        : isDone
                        ? 'bg-[#047857] text-white'
                        : 'bg-[#0E1A2B] text-[#B8C4D6] hover:bg-[#243957]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="text-xs font-semibold text-[#6EE7B7]">
              {dailyItem ? ui.dailyReasons[dailyItem.reason] : ''}
            </span>
          )}
        </div>

        {!isPrerequisiteMet && !dailyMode && (
          <div className="rounded-xl bg-[#17273E] border border-[#F59E0B]/40 px-4 py-3 text-xs sm:text-sm text-[#FDE68A]">
            {ui.prereqHint}
          </div>
        )}

        {/* Active Interactive Game Stage */}
        <motion.div
          key={`${effectiveSkill}-${activeTask.id}-${nudgeKey}`}
          initial={false}
          className={`relative rounded-2xl bg-white text-[#122033] border border-[#D5CEC0] p-6 sm:p-8 shadow-2xl ${
            feedback?.type === 'error' && !progress.preferences.reducedMotion
              ? 'animate-gentle-nudge'
              : ''
          }`}
        >
          <AnimatePresence>
            {floatingXp && (
              <motion.div
                key={floatingXp.id}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: -20, scale: 1.05 }}
                exit={{ opacity: 0, y: -36 }}
                transition={{ duration: 0.7, ease: MOTION_TOKENS.ease.elastic }}
                onAnimationComplete={() => setFloatingXp(null)}
                className="pointer-events-none absolute top-5 right-6 font-display text-lg font-bold text-[#047857] tabular-nums"
              >
                +{floatingXp.amount} XP
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-[#5C6B80]">
                  {pickText(activeNode.gameTitle, script)} ·{' '}
                  {pickText(activeTask.title, script)}
                </p>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#122033]">
                  {pickText(activeTask.prompt, script)}
                </h3>
                <p className="text-xs text-[#5C6B80]">
                  {pickText(activeNode.gameRule, script)}
                </p>
              </div>

              {/* MECHANIC 1: SEQUENCE REORDER */}
              {effectiveSkill === 'algoritmlar' && (
                <div className="space-y-3">
                  {seqIndices.map((origIdx, pos) => {
                    const stepText = pickText(currentSeqTask.correctSteps[origIdx], script);
                    return (
                      <div
                        key={`${currentSeqTask.id}-step-${origIdx}`}
                        className="flex items-center justify-between gap-3 rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 shrink-0 rounded-lg bg-[#0F4C81] text-white text-xs font-bold flex items-center justify-center tabular-nums">
                            {pos + 1}
                          </span>
                          <span className="text-sm sm:text-base font-medium text-[#122033]">
                            {stepText}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={pos === 0 || solvedCurrent}
                            onClick={() => moveStep(pos, -1)}
                            aria-label={`${stepText} yuqoriga`}
                            className="p-2 min-w-[40px] min-h-[40px] rounded-lg bg-white border border-[#D5CEC0] hover:border-[#0F4C81] disabled:opacity-35 cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={pos === seqIndices.length - 1 || solvedCurrent}
                            onClick={() => moveStep(pos, 1)}
                            aria-label={`${stepText} pastga`}
                            className="p-2 min-w-[40px] min-h-[40px] rounded-lg bg-white border border-[#D5CEC0] hover:border-[#0F4C81] disabled:opacity-35 cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MECHANIC 2: LOGIC CODE PREDICTION */}
              {effectiveSkill === 'mantiq' && (
                <div className="space-y-4">
                  <div className={`grid grid-cols-1 ${showRealCode ? 'sm:grid-cols-2' : ''} gap-3`}>
                    <pre className="rounded-xl bg-[#0E1A2B] text-[#F4F6FA] p-4 sm:p-5 text-sm font-code overflow-x-auto leading-relaxed">
                      {showRealCode && (
                        <span className="block text-[11px] font-sans text-[#94A3B8] mb-2">
                          {ui.pseudoTitle}
                        </span>
                      )}
                      <code>{currentLogicTask.code}</code>
                    </pre>
                    {showRealCode && (
                      <pre className="rounded-xl bg-[#17273E] text-[#BAE6FD] p-4 sm:p-5 text-sm font-code overflow-x-auto leading-relaxed">
                        <span className="block text-[11px] font-sans text-[#7DD3FC] mb-2">
                          {ui.pythonTitle}
                        </span>
                        <code>{currentLogicTask.pythonCode}</code>
                      </pre>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentLogicTask.options.map((opt, idx) => {
                      const active = selectedLogicOpt === idx;
                      return (
                        <button
                          key={`${currentLogicTask.id}-opt-${idx}`}
                          type="button"
                          disabled={solvedCurrent}
                          onClick={() => {
                            playGameSound('click', progress.preferences.soundEnabled);
                            setSelectedLogicOpt(idx);
                          }}
                          className={`px-4 py-3.5 min-h-[48px] rounded-xl border text-left sm:text-center font-code text-sm sm:text-base font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'border-[#0F4C81] bg-[#F0F9FF] text-[#075985]'
                              : 'border-[#D5CEC0] bg-[#F6F4EE] hover:border-[#0F4C81] text-[#122033]'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MECHANIC 3: LOOP TRACE & BUG LINE INSPECTOR */}
              {effectiveSkill === 'sikllar' && (
                <div className="space-y-4">
                  <div className={`grid grid-cols-1 ${showRealCode ? 'sm:grid-cols-2' : ''} gap-3`}>
                    <div className="rounded-xl bg-[#0E1A2B] p-4 sm:p-5 space-y-1.5 font-code text-xs sm:text-sm overflow-x-auto">
                      {showRealCode && (
                        <p className="text-[11px] font-sans text-[#94A3B8] mb-2">
                          {ui.pseudoTitle}
                        </p>
                      )}
                      {currentLoopTask.codeLines.map((line, idx) => {
                        const lineNumber = idx + 1;
                        const isBugMode = currentLoopTask.mode === 'bug-line';
                        const isSelected = selectedLoopLine === lineNumber;

                        if (isBugMode) {
                          return (
                            <button
                              key={`${currentLoopTask.id}-line-${lineNumber}`}
                              type="button"
                              disabled={solvedCurrent}
                              onClick={() => {
                                playGameSound('click', progress.preferences.soundEnabled);
                                setSelectedLoopLine(lineNumber);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-lg text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#9A5B00]/40 border border-[#F59E0B] text-white'
                                  : 'text-[#E2E8F0] hover:bg-[#17273E]'
                              }`}
                            >
                              <span className="w-6 text-xs text-[#94A3B8] tabular-nums shrink-0">
                                {lineNumber}
                              </span>
                              <span className="whitespace-pre">{line}</span>
                              {isSelected && (
                                <Bug className="w-4 h-4 text-[#F59E0B] ml-auto shrink-0" aria-hidden="true" />
                              )}
                            </button>
                          );
                        }

                        return (
                          <div
                            key={`${currentLoopTask.id}-line-${lineNumber}`}
                            className="flex items-center gap-3 px-3 py-1.5 text-[#E2E8F0]"
                          >
                            <span className="w-6 text-xs text-[#94A3B8] tabular-nums shrink-0">
                              {lineNumber}
                            </span>
                            <span className="whitespace-pre">{line}</span>
                          </div>
                        );
                      })}
                    </div>

                    {showRealCode && (
                      <div className="rounded-xl bg-[#17273E] p-4 sm:p-5 space-y-1.5 font-code text-xs sm:text-sm overflow-x-auto text-[#BAE6FD]">
                        <p className="text-[11px] font-sans text-[#7DD3FC] mb-2">
                          {ui.pythonTitle}
                        </p>
                        {currentLoopTask.pythonLines.map((line, idx) => (
                          <div
                            key={`${currentLoopTask.id}-py-${idx}`}
                            className="flex items-center gap-3 px-2 py-1.5"
                          >
                            <span className="w-6 text-xs text-[#7DD3FC] tabular-nums shrink-0">
                              {idx + 1}
                            </span>
                            <span className="whitespace-pre">{line}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {currentLoopTask.mode === 'trace-output' && currentLoopTask.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentLoopTask.options.map((opt, idx) => {
                        const active = selectedLoopOpt === idx;
                        return (
                          <button
                            key={`${currentLoopTask.id}-opt-${idx}`}
                            type="button"
                            disabled={solvedCurrent}
                            onClick={() => {
                              playGameSound('click', progress.preferences.soundEnabled);
                              setSelectedLoopOpt(idx);
                            }}
                            className={`px-4 py-3.5 min-h-[48px] rounded-xl border font-code text-sm sm:text-base font-semibold transition-colors cursor-pointer ${
                              active
                                ? 'border-[#0F4C81] bg-[#F0F9FF] text-[#075985]'
                                : 'border-[#D5CEC0] bg-[#F6F4EE] hover:border-[#0F4C81] text-[#122033]'
                            }`}
                          >
                            {pickText(opt, script)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!solvedCurrent ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (effectiveSkill === 'algoritmlar') checkSequence();
                      else if (effectiveSkill === 'mantiq') checkLogic();
                      else checkLoopBug();
                    }}
                    disabled={
                      (effectiveSkill === 'mantiq' && selectedLogicOpt === null) ||
                      (effectiveSkill === 'sikllar' &&
                        currentLoopTask.mode === 'bug-line' &&
                        selectedLoopLine === null) ||
                      (effectiveSkill === 'sikllar' &&
                        currentLoopTask.mode === 'trace-output' &&
                        selectedLoopOpt === null)
                    }
                    className="px-6 py-3 min-h-[48px] rounded-xl bg-[#0F4C81] hover:bg-[#0B3A63] disabled:opacity-45 text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                  >
                    {ui.checkBtn}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNextTask}
                    className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                  >
                    <span>{dailyMode ? ui.nextDailyBtn : ui.nextBtn}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}

                {effectiveSkill === 'algoritmlar' && !solvedCurrent && (
                  <button
                    type="button"
                    onClick={() =>
                      setSeqIndices(
                        getShuffledIndices(
                          currentSeqTask.correctSteps.length,
                          currentSeqTask.id
                        )
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-3 min-h-[48px] rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] hover:border-[#0F4C81] text-sm font-medium text-[#122033] cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>{ui.shuffleBtn}</span>
                  </button>
                )}

                {!dailyMode && (
                  <button
                    type="button"
                    onClick={() =>
                      setVictoryModal({ skillId: effectiveSkill, earnedBadges: [] })
                    }
                    className="ml-auto text-xs sm:text-sm font-semibold text-[#0F4C81] hover:underline py-2 px-2 cursor-pointer"
                  >
                    {ui.summaryBtn}
                  </button>
                )}
              </div>

              {/* Constructive Misconception-Aware Feedback + Mirzo Trace Replay + Twin Question */}
              {feedback && (
                <div className="space-y-4">
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-xl p-4 text-sm flex items-start gap-3 ${
                      feedback.type === 'success'
                        ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                        : 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    <div className="space-y-2 flex-1">
                      <p className="font-bold">
                        {feedback.type === 'success'
                          ? `${ui.successTitle} (+${feedback.xpEarned} XP)`
                          : ui.errorTitle}
                      </p>
                      <p>{feedback.message}</p>

                      {feedback.type === 'error' && (
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowTraceReplay((s) => !s)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-lg bg-white border border-[#0F4C81] text-xs font-bold text-[#0F4C81] hover:bg-[#F0F9FF] cursor-pointer"
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" />
                            <span>
                              {showTraceReplay ? ui.mirzoHideBtn : ui.mirzoShowBtn}
                            </span>
                          </button>

                          {feedback.steppedDown && (
                            <button
                              type="button"
                              onClick={goToAdaptiveEasierTask}
                              className="text-xs font-bold underline cursor-pointer"
                            >
                              {ui.easierBtn}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mirzo Trace Replay */}
                  {feedback.type === 'error' && showTraceReplay && (
                    <div>
                      {activeTraceId && TRACE_PROGRAMS[activeTraceId] ? (
                        <TraceMachine
                          program={TRACE_PROGRAMS[activeTraceId]}
                          script={script}
                          showRealCode={showRealCode}
                          onToggleRealCode={onToggleRealCode}
                          reducedMotion={progress.preferences.reducedMotion}
                          compact
                        />
                      ) : (
                        <div className="rounded-xl bg-[#0E1A2B] text-white p-4 space-y-2 text-xs sm:text-sm">
                          <p className="font-bold text-[#FDE68A]">
                            {ui.mirzoSeqExplainTitle}
                          </p>
                          <ol className="space-y-1 list-decimal list-inside text-[#E2E8F0]">
                            {currentSeqTask.correctSteps.map((stepObj, i) => (
                              <li key={`${currentSeqTask.id}-replay-${i}`}>
                                {pickText(stepObj, script)}
                              </li>
                            ))}
                          </ol>
                          <p className="text-[#6EE7B7] pt-1">
                            {pickText(currentSeqTask.explanation, script)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Twin Repair Question after a miss */}
                  {feedback.type === 'error' && (
                    <div className="rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] p-4 space-y-3">
                      <p className="text-xs sm:text-sm font-bold text-[#0F4C81] flex items-center gap-1.5">
                        <Wrench className="w-4 h-4" aria-hidden="true" />
                        <span>{ui.twinTitle}</span>
                      </p>

                      <p className="text-sm font-semibold text-[#122033]">
                        {pickText(activeTask.twin.prompt, script)}
                      </p>

                      {activeTask.twin.code && (
                        <div className={`grid grid-cols-1 ${showRealCode && activeTask.twin.pythonCode ? 'sm:grid-cols-2' : ''} gap-2`}>
                          <pre className="rounded-lg bg-[#0E1A2B] text-[#F4F6FA] p-3 text-xs font-code overflow-x-auto">
                            <code>{activeTask.twin.code}</code>
                          </pre>
                          {showRealCode && activeTask.twin.pythonCode && (
                            <pre className="rounded-lg bg-[#17273E] text-[#BAE6FD] p-3 text-xs font-code overflow-x-auto">
                              <code>{activeTask.twin.pythonCode}</code>
                            </pre>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {activeTask.twin.options.map((opt, idx) => (
                          <button
                            key={`${activeTask.id}-twin-${idx}`}
                            type="button"
                            disabled={twinStatus === 'correct'}
                            onClick={() => {
                              setTwinChoice(idx);
                              setTwinStatus('idle');
                            }}
                            className={`px-3 py-2.5 min-h-[42px] rounded-xl border text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                              twinChoice === idx
                                ? 'bg-[#0F4C81] border-[#0F4C81] text-white'
                                : 'bg-white border-[#D5CEC0] hover:border-[#0F4C81] text-[#122033]'
                            }`}
                          >
                            {pickText(opt, script)}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {twinStatus !== 'correct' && (
                          <button
                            type="button"
                            disabled={twinChoice === null}
                            onClick={handleCheckTwin}
                            className="px-4 py-2 min-h-[40px] rounded-xl bg-[#0F4C81] disabled:opacity-45 text-white text-xs sm:text-sm font-semibold cursor-pointer"
                          >
                            {ui.twinCheckBtn}
                          </button>
                        )}

                        {twinStatus === 'correct' && (
                          <p className="text-xs sm:text-sm font-semibold text-[#065F46]">
                            {ui.twinSuccessPrefix} (+{twinXpNote} XP){' '}
                            {pickText(activeTask.twin.explanation, script)}
                          </p>
                        )}

                        {twinStatus === 'wrong' && (
                          <p className="text-xs font-semibold text-[#991B1B]">
                            {ui.twinWrong}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: 3-Step Hint Ladder */}
            <aside className="lg:col-span-4 rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] p-5 space-y-4 h-fit">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display text-base font-bold text-[#122033] flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#9A5B00]" aria-hidden="true" />
                  <span>{ui.hintTitle}</span>
                </h4>
                <span className="text-xs text-[#5C6B80] tabular-nums">
                  {hintsOpened} / 3
                </span>
              </div>

              <p className="text-xs text-[#43536B]">{ui.hintSub}</p>

              <div className="space-y-2.5">
                {[0, 1, 2].map((idx) => {
                  const unlocked = idx < hintsOpened;
                  return (
                    <div
                      key={ui.hintLabels[idx]}
                      className="rounded-lg bg-white border border-[#D5CEC0] p-3 text-xs sm:text-sm"
                    >
                      <p className="font-semibold text-[#0F4C81]">
                        {ui.hintLabels[idx]}
                      </p>
                      {unlocked ? (
                        <p className="mt-1 text-[#122033]">
                          {pickText(activeTask.hints[idx], script)}
                        </p>
                      ) : (
                        <p className="mt-1 text-[#5C6B80]">{ui.hintLocked}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {hintsOpened < 3 && !solvedCurrent && (
                <button
                  type="button"
                  onClick={() => setHintsOpened((h) => Math.min(3, h + 1))}
                  className="w-full py-2.5 px-4 min-h-[44px] rounded-xl bg-white border border-[#0F4C81] text-[#0F4C81] hover:bg-[#F0F9FF] text-sm font-semibold transition-colors cursor-pointer"
                >
                  {ui.hintOpenBtn}
                </button>
              )}
            </aside>
          </div>
        </motion.div>
      </div>

      {/* Workshop Finale Modal */}
      <AnimatePresence>
        {victoryModal && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="victory-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1A2B]/80 p-4"
          >
            <motion.div
              initial={
                progress.preferences.reducedMotion ? undefined : { scale: 0.9, y: 16 }
              }
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.38, ease: MOTION_TOKENS.ease.elastic }}
              className="w-full max-w-lg rounded-2xl bg-white text-[#122033] border border-[#D5CEC0] p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FEF3C7] text-[#9A5B00] flex items-center justify-center">
                  <Trophy className="w-7 h-7" aria-hidden="true" />
                </div>
                <p className="text-xs font-semibold text-[#9A5B00]">{ui.victoryTag}</p>
                <h3 id="victory-title" className="font-display text-2xl font-bold">
                  {pickText(activeNode.gameTitle, script)} {ui.victorySuffix}
                </h3>
                <p className="font-display text-3xl font-bold text-[#0F4C81] tabular-nums">
                  {displayedVictoryXp} XP
                </p>
                <p className="text-xs text-[#5C6B80] tabular-nums">
                  {ui.victorySolved} {skillProgress.completedTaskIds.length} / 10 ·{' '}
                  {ui.victoryMastery} {Math.round(skillProgress.mastery * 100)}%
                </p>
              </div>

              <div className="rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] p-4 space-y-2">
                <p className="text-xs font-bold text-[#0F4C81]">{ui.victoryLearned}</p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[#122033]">
                  {activeNode.takeaways.map((fact, idx) => (
                    <li key={`${activeNode.id}-fact-${idx}`} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#9A5B00] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{pickText(fact, script)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {victoryModal.earnedBadges.length > 0 && (
                <div className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-3 text-center text-sm font-semibold text-[#065F46]">
                  {ui.victoryBadge}{' '}
                  {victoryModal.earnedBadges
                    .map((id) => {
                      const b = BADGES.find((item) => item.id === id);
                      return b ? pickText(b.title, script) : id;
                    })
                    .join(', ')}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setVictoryModal(null);
                    selectTaskIndex(effectiveSkill, 0);
                  }}
                  className="px-5 py-3 min-h-[44px] rounded-xl bg-[#F6F4EE] border border-[#D5CEC0] hover:border-[#0F4C81] text-sm font-semibold cursor-pointer"
                >
                  {ui.victoryAgain}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const order: SkillId[] = ['algoritmlar', 'mantiq', 'sikllar'];
                    const next =
                      order[(order.indexOf(effectiveSkill) + 1) % order.length];
                    setVictoryModal(null);
                    selectSkillTab(next);
                  }}
                  className="px-5 py-3 min-h-[44px] rounded-xl bg-[#0F4C81] hover:bg-[#0B3A63] text-white text-sm font-semibold cursor-pointer"
                >
                  {ui.victoryNext}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
