'use client';

import React, { useEffect, useState } from 'react';
import { lt, pickText, UI_STRINGS } from '@/lib/engine/i18n';
import {
  applyDiagnosticResult,
  createInitialProgress,
  getLevelFromXp,
  loadProgressFromStorage,
  recordLessonProgress,
  recordMisconception,
  recordTaskAttempt,
  recordTwinRepair,
  resetProgressStorage,
  saveProgressToStorage,
  type ProgressState,
  type UserPreferences,
} from '@/lib/engine/mastery';
import {
  createMascotSnapshot,
  dispatchMascotCue,
  settleMascotStep,
  type MascotFsmSnapshot,
} from '@/lib/engine/mascot-fsm';
import type { SkillId } from '@/lib/data/curriculum';
import type { LessonId } from '@/lib/data/lessons';
import { QUALITY_PRESETS } from '@/lib/motion/tokens';
import { PreloaderIntro } from '@/components/PreloaderIntro';
import { CustomCursor } from '@/components/CustomCursor';
import { TopNav } from '@/components/TopNav';
import { HeroSection } from '@/components/HeroSection';
import { LessonsSection } from '@/components/LessonsSection';
import { JourneyMapSection } from '@/components/JourneyMapSection';
import { MiniGamesSection } from '@/components/MiniGamesSection';
import { PrinciplesSection } from '@/components/PrinciplesSection';
import { RewardsSettingsSection } from '@/components/RewardsSettingsSection';
import { DiagnosticModal } from '@/components/DiagnosticModal';
import { CheatSheetModal } from '@/components/CheatSheetModal';

const MIRZO_TIPS = [
  lt(
    'Maslahat: katta masalani 3 ta kichik qadamga boʻlsang, yechim oʻzi koʻrinadi!',
    'Маслаҳат: катта масалани 3 та кичик қадамга бўлсанг, ечим ўзи кўринади!'
  ),
  lt(
    'Kodda xato chiqsa xafa boʻlma — Mirzo mashinasi qayerda toʻxtaganini koʻrsatadi.',
    'Кодда хато чиқса хафа бўлма — Мирзо машинаси қаерда тўхтаганини кўрсатади.'
  ),
  lt(
    'Oʻzgaruvchi bu nomli quti: yangi qiymat kirganda eski qiymat chiqib ketadi.',
    'Ўзгарувчи бу номли қути: янги қиймат кирганда эски қиймат чиқиб кетади.'
  ),
  lt(
    'Sikl yozishdan oldin uning qachon toʻxtashini albatta tekshir!',
    'Цикл ёзишдан олдин унинг қачон тўхташини албатта текшир!'
  ),
];

export default function HomePage() {
  const [progress, setProgress] = useState<ProgressState>(() =>
    createInitialProgress()
  );
  const [hydrated, setHydrated] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<LessonId>('L1');
  const [activeSkill, setActiveSkill] = useState<SkillId>('algoritmlar');
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [tipCursor, setTipCursor] = useState(0);
  const [mascot, setMascot] = useState<MascotFsmSnapshot>(() =>
    createMascotSnapshot()
  );

  // Hydrate saved progress, OS reduced-motion preference, and ?autostart=1
  useEffect(() => {
    const loaded = loadProgressFromStorage();
    const osReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const params = new URLSearchParams(window.location.search);
    const autostart = params.get('autostart') === '1';

    if (osReduced && !loaded.preferences.reducedMotion) {
      loaded.preferences.reducedMotion = true;
    }

    queueMicrotask(() => {
      setProgress(loaded);
      if (autostart) {
        setShowPreloader(false);
      }
      setHydrated(true);
    });
  }, []);

  // Persist progress & sync accessibility classes on <html>
  useEffect(() => {
    if (!hydrated) return;
    saveProgressToStorage(progress);

    const root = document.documentElement;
    root.classList.toggle('reduced-motion', progress.preferences.reducedMotion);
    root.classList.toggle('dyslexia-mode', progress.preferences.dyslexiaMode);
    root.lang = progress.preferences.script === 'uz-Cyrl' ? 'uz-Cyrl' : 'uz';
  }, [progress, hydrated]);

  // Auto-settle mascot state after temporary reactions
  useEffect(() => {
    if (mascot.currentState === 'idle') return;
    const timer = window.setTimeout(() => {
      setMascot((prev) => settleMascotStep(prev));
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [mascot]);

  const script = progress.preferences.script;
  const t = UI_STRINGS[script];
  const levelInfo = getLevelFromXp(progress.xp);
  const hasProgress = progress.xp > 0 || progress.seenLessons.length > 0;
  const preset = QUALITY_PRESETS[progress.preferences.qualityTier];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: progress.preferences.reducedMotion ? 'auto' : 'smooth',
      });
    }
  };

  const scrollToGames = (skill?: SkillId) => {
    if (skill) setActiveSkill(skill);
    scrollToSection('oyinlar');
  };

  const scrollToLessons = (lessonId?: LessonId) => {
    if (lessonId) setActiveLessonId(lessonId);
    scrollToSection('darslar');
  };

  const handleTapMascot = () => {
    const tip = pickText(MIRZO_TIPS[tipCursor % MIRZO_TIPS.length], script);
    setTipCursor((c) => c + 1);
    setMascot((prev) =>
      dispatchMascotCue(prev, {
        state: 'speaking',
        subtitle: tip,
        durationMs: 2200,
      })
    );
  };

  const handleTaskResult = (params: {
    skillId: SkillId;
    taskId: string;
    isCorrect: boolean;
    hintsUsed: number;
    misconceptionId?: string;
    explanation: string;
  }) => {
    const outcome = recordTaskAttempt(progress, params);
    setProgress(outcome.nextState);

    setMascot((prev) =>
      dispatchMascotCue(prev, {
        state: params.isCorrect
          ? outcome.nextState.streak >= 3
            ? 'streak'
            : 'happy'
          : 'encouraging',
        subtitle: params.isCorrect
          ? script === 'uz-Cyrl'
            ? `Ажойиб! +${outcome.xpEarned} XP қўшилди!`
            : `Ajoyib! +${outcome.xpEarned} XP qoʻshildi!`
          : script === 'uz-Cyrl'
          ? 'Ҳечқиси йўқ! "Мирзо кўрсатади" тугмасини босиб кузат.'
          : 'Hechqisi yoʻq! "Mirzo koʻrsatadi" tugmasini bosib kuzat.',
        durationMs: 2200,
      })
    );

    return {
      xpEarned: outcome.xpEarned,
      newlyUnlockedBadges: outcome.newlyUnlockedBadges,
      steppedDown: outcome.steppedDown,
    };
  };

  const handleTwinRepair = (params: { taskId: string; isCorrect: boolean }) => {
    const outcome = recordTwinRepair(progress, params);
    setProgress(outcome.nextState);
    if (params.isCorrect) {
      setMascot((prev) =>
        dispatchMascotCue(prev, {
          state: 'celebrating',
          subtitle:
            script === 'uz-Cyrl'
              ? `Хатони тузатдинг! +${outcome.xpEarned} XP бонус.`
              : `Xatoni tuzatding! +${outcome.xpEarned} XP bonus.`,
          durationMs: 2400,
        })
      );
    }
    return outcome;
  };

  const handleLessonSeen = (lessonId: LessonId) => {
    setProgress((prev) =>
      recordLessonProgress(prev, { lessonId, seen: true }).nextState
    );
  };

  const handleLessonExplained = (lessonId: LessonId) => {
    const res = recordLessonProgress(progress, {
      lessonId,
      explained: true,
      xpBonus: 25,
    });
    setProgress(res.nextState);
    if (res.xpEarned > 0) {
      setMascot((prev) =>
        dispatchMascotCue(prev, {
          state: 'celebrating',
          subtitle:
            script === 'uz-Cyrl'
              ? `Зўр тушунтирдинг! +${res.xpEarned} XP қўшилди.`
              : `Zoʻr tushuntirding! +${res.xpEarned} XP qoʻshildi.`,
          durationMs: 2400,
        })
      );
    }
  };

  const handleRecordMisconception = (misconceptionId: string) => {
    setProgress((prev) => recordMisconception(prev, misconceptionId));
  };

  const handleUpdatePrefs = (patch: Partial<UserPreferences>) => {
    setProgress((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...patch,
      },
    }));
  };

  const handleToggleRealCode = () => {
    handleUpdatePrefs({ showRealCode: !progress.preferences.showRealCode });
  };

  const handleResetProgress = () => {
    const fresh = resetProgressStorage();
    setProgress(fresh);
    setActiveLessonId('L1');
    setActiveSkill('algoritmlar');
    setMascot(
      createMascotSnapshot(
        script === 'uz-Cyrl'
          ? 'Ҳаммаси янгидан бошланди! Қани, 1-дарсга кирамиз!'
          : 'Hammasi yangidan boshlandi! Qani, 1-darsga kiramiz!'
      )
    );
  };

  const handleDiagnosticComplete = (results: Record<SkillId, boolean>) => {
    setDiagnosticOpen(false);
    setProgress((prev) => applyDiagnosticResult(prev, results));
    const score = Object.values(results).filter(Boolean).length;
    const recommended: SkillId =
      score >= 3 ? 'sikllar' : score === 2 ? 'mantiq' : 'algoritmlar';
    setActiveSkill(recommended);
    setMascot((prev) =>
      dispatchMascotCue(prev, {
        state: 'celebrating',
        subtitle:
          script === 'uz-Cyrl'
            ? `Қисқа синов тугади (${score}/3)! Сен учун энг қулай устахона очилди.`
            : `Qisqa sinov tugadi (${score}/3)! Sen uchun eng qulay ustaxona ochildi.`,
        durationMs: 2800,
      })
    );
    scrollToGames(recommended);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F6F4EE] text-[#122033]"
      data-state={showPreloader ? 'preloader' : 'ready'}
    >
      <PreloaderIntro
        visible={showPreloader}
        title={t.preloaderTitle}
        subtitle={t.preloaderSubtitle}
        skipLabel={t.preloaderSkip}
        onSkip={() => setShowPreloader(false)}
        reducedMotion={progress.preferences.reducedMotion}
      />

      <CustomCursor
        enabled={preset.enableCustomCursor && !progress.preferences.reducedMotion}
      />

      <TopNav t={t} onStartPrimary={() => scrollToLessons()} />

      <main className="flex-1">
        <HeroSection
          t={t}
          script={script}
          xp={progress.xp}
          levelInfo={levelInfo}
          streak={progress.streak}
          hasProgress={hasProgress}
          mascot={mascot}
          soundEnabled={progress.preferences.soundEnabled}
          subtitlesEnabled={progress.preferences.subtitlesEnabled}
          reducedMotion={progress.preferences.reducedMotion}
          qualityTier={progress.preferences.qualityTier}
          onTapMascot={handleTapMascot}
          onStartLesson={() => scrollToLessons()}
          onOpenDiagnostic={() => setDiagnosticOpen(true)}
          onToggleSound={() =>
            handleUpdatePrefs({
              soundEnabled: !progress.preferences.soundEnabled,
            })
          }
          onToggleSubtitles={() =>
            handleUpdatePrefs({
              subtitlesEnabled: !progress.preferences.subtitlesEnabled,
            })
          }
        />

        <LessonsSection
          t={t}
          progress={progress}
          activeLessonId={activeLessonId}
          onChangeLesson={setActiveLessonId}
          onLessonSeen={handleLessonSeen}
          onLessonExplained={handleLessonExplained}
          onRecordMisconception={handleRecordMisconception}
          onToggleRealCode={handleToggleRealCode}
          onOpenCheatSheet={() => setCheatSheetOpen(true)}
          onGoToWorkshop={(skillId) => scrollToGames(skillId)}
        />

        <JourneyMapSection
          t={t}
          progress={progress}
          activeSkill={activeSkill}
          enable3DTilt={preset.enable3DTilt}
          reducedMotion={progress.preferences.reducedMotion}
          onSelectSkill={(skillId) => scrollToGames(skillId)}
        />

        <MiniGamesSection
          t={t}
          progress={progress}
          activeSkill={activeSkill}
          onChangeSkill={setActiveSkill}
          onToggleRealCode={handleToggleRealCode}
          onOpenCheatSheet={() => setCheatSheetOpen(true)}
          onTaskResult={handleTaskResult}
          onTwinRepair={handleTwinRepair}
        />

        <PrinciplesSection
          t={t}
          script={script}
          progress={progress}
          onToggleRealCode={handleToggleRealCode}
        />

        <RewardsSettingsSection
          t={t}
          progress={progress}
          onUpdatePrefs={handleUpdatePrefs}
          onResetProgress={handleResetProgress}
        />
      </main>

      <footer className="bg-[#0E1A2B] text-[#B8C4D6] py-8 px-4 sm:px-6 text-center text-xs sm:text-sm border-t border-[#243957]">
        <p className="max-w-4xl mx-auto">{t.footerNote}</p>
      </footer>

      <DiagnosticModal
        open={diagnosticOpen}
        script={script}
        showRealCode={progress.preferences.showRealCode}
        onClose={() => setDiagnosticOpen(false)}
        onRecordMisconception={handleRecordMisconception}
        onComplete={handleDiagnosticComplete}
      />

      <CheatSheetModal
        open={cheatSheetOpen}
        script={script}
        onClose={() => setCheatSheetOpen(false)}
      />
    </div>
  );
}
