'use client';

import React, { useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  Panel,
  ProgressRing,
  SpeechBubble,
  Stars,
  TermChip,
  Toast,
  Toggle,
} from '@/components/ui';
import type { SurfaceMode } from '@/lib/engine/store';

export function DesignGalleryClient() {
  const [surface, setSurface] = useState<SurfaceMode>('paper');
  const [dyslexia, setDyslexia] = useState(false);
  const [selectedChip, setSelectedChip] = useState<'all' | 'algo' | 'logic'>('algo');
  const [toggleOn, setToggleOn] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(true);

  const toggleDyslexia = (next: boolean) => {
    setDyslexia(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-dyslexia', next ? 'true' : 'false');
    }
  };

  return (
    <div
      data-surface={surface}
      className="ws-surface min-h-screen px-4 py-8 sm:px-8"
    >
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[var(--line)] pb-5">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold sm:text-3xl">
              Oʻyna va oʻrgan — Dizayn tizimi galereyasi
            </h1>
            <p className="mt-1 text-[15px] text-[var(--on-surface-muted)]">
              Barcha UI komponentlar va holatlar: Qogʻoz (Tushunish) va Chizma (Oʻyin) yuzalarida.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Chip
              label="Tushunish varagʻi"
              selected={surface === 'paper'}
              onClick={() => setSurface('paper')}
            />
            <Chip
              label="Oʻyin chizmasi"
              selected={surface === 'blueprint'}
              onClick={() => setSurface('blueprint')}
            />
          </div>
        </header>

        <main className="space-y-8">
          <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Tugmalar (Button) — 48px+ tegish maydoni
          </h2>
          <Panel variant="elevated" className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Bosib koʻr</Button>
            <Button variant="primary" size="lg">
              Boshlash (Katta)
            </Button>
            <Button variant="secondary">Tekshir</Button>
            <Button variant="ghost">Orqaga qaytar</Button>
            <Button variant="danger">Nolga tushirish</Button>
            <Button variant="primary" loading>
              Yuklanmoqda
            </Button>
            <Button variant="secondary" disabled>
              Qulflangan
            </Button>
          </Panel>
        </section>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Panellar (Panel) — Kesilgan burchak va holatlar
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Panel variant="chamfered" state="default">
              <h3 className="font-bold">Kesilgan panel (Chamfer)</h3>
              <p className="mt-1 text-[14.5px] text-[var(--on-surface-muted)]">
                Ustaxona chizmalarining asosiy shakli.
              </p>
            </Panel>
            <Panel variant="elevated" state="active">
              <h3 className="font-bold">Faol holat</h3>
              <p className="mt-1 text-[14.5px] text-[var(--on-surface-muted)]">
                Tanlangan buyruq yoki blok.
              </p>
            </Panel>
            <Panel variant="elevated" state="success">
              <h3 className="font-bold">Muvaffaqiyat</h3>
              <p className="mt-1 text-[14.5px] text-[var(--on-surface-muted)]">
                Barcha sinovlar oʻtdi.
              </p>
            </Panel>
            <Panel variant="elevated" state="warning">
              <h3 className="font-bold">Ogohlantirish</h3>
              <p className="mt-1 text-[14.5px] text-[var(--on-surface-muted)]">
                Chegarani tekshirib koʻr.
              </p>
            </Panel>
            <Panel variant="elevated" state="danger">
              <h3 className="font-bold">Xato holati</h3>
              <p className="mt-1 text-[14.5px] text-[var(--on-surface-muted)]">
                Bu qadam natijani oʻzgartirdi.
              </p>
            </Panel>
            <Panel variant="inset" state="disabled">
              <h3 className="font-bold">Qulflangan (Inset)</h3>
              <p className="mt-1 text-[14.5px] text-[var(--on-surface-muted)]">
                Keyingi koʻnikmada ochiladi.
              </p>
            </Panel>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Filtr chiplari, Atama izohi (TermChip) va Oʻzgartirgich (Toggle)
          </h2>
          <Panel className="space-y-5">
            <div className="flex flex-wrap gap-2.5">
              <Chip
                label="Barchasi"
                count={8}
                selected={selectedChip === 'all'}
                onClick={() => setSelectedChip('all')}
              />
              <Chip
                label="Algoritm"
                count={4}
                selected={selectedChip === 'algo'}
                onClick={() => setSelectedChip('algo')}
              />
              <Chip
                label="Mantiq"
                count={3}
                selected={selectedChip === 'logic'}
                onClick={() => setSelectedChip('logic')}
              />
              <Chip label="Qulflangan" disabled />
            </div>

            <div className="text-[16px] leading-relaxed">
              Dasturdagi{' '}
              <TermChip
                term="Oʻzgaruvchi"
                definition="Qiymati dastur davomida oʻzgarishi mumkin boʻlgan nomlangan xotira qutisi."
                example="Masalan: ball = 5 yozuvi qutiga 5 sonini soladi."
              />{' '}
              har bir{' '}
              <TermChip
                term="Takt"
                definition="Mashina soatining bitta zarbi. Har bir taktda bitta qadam bajariladi."
              />{' '}
              ichida yangilanishi mumkin.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                label="Ustaxona ovozlari"
                description="Har bir takt va yutuqda yumshoq ovoz"
                checked={toggleOn}
                onChange={setToggleOn}
              />
              <Toggle
                label="Oʻqishni yengillashtirish"
                description="Harflar orasini kengaytirish rejimi"
                checked={dyslexia}
                onChange={toggleDyslexia}
              />
            </div>
          </Panel>
        </section>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Mirzo gapi (SpeechBubble), Yulduzlar (Stars) va Mahorat halqalari (ProgressRing)
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <SpeechBubble text="Qutidagi ball qiymati 5 edi. Endi 3 qoʻshsak nima boʻladi?" />
              <SpeechBubble
                tone="hint"
                text="Avval ball qutisini ochib koʻr, keyin natijani chop et."
              />
              <SpeechBubble
                tone="success"
                text="Ajoyib! Mashina barcha 3 ta sinovdan oʻtdi."
              />
              <SpeechBubble
                tone="danger"
                text="ball oʻzgardi, lekin chopEt buyrugʻiga yetib bormadi."
              />
            </div>

            <Panel className="space-y-5">
              <div className="flex flex-wrap items-center gap-4">
                <Stars earned={0} showNumeric />
                <Stars earned={2} showNumeric />
                <Stars earned={3} showNumeric />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <ProgressRing value={0} state="new" label="Yangi" />
                <ProgressRing value={30} state="introduced" label="Tanishildi" />
                <ProgressRing value={65} state="practicing" label="Mashqda" />
                <ProgressRing value={90} state="mastered" label="Oʻzlashtirildi" />
                <ProgressRing value={100} state="retained" label="Mustahkamlandi" />
              </div>
            </Panel>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Xabar (Toast) va Oyna (Dialog)
          </h2>
          <div className="space-y-3">
            {toastVisible ? (
              <Toast
                tone="info"
                message="Yangi versiya tayyor — yangilab olamizmi?"
                actionLabel="Yangilash"
                onAction={() => setToastVisible(false)}
                onDismiss={() => setToastVisible(false)}
              />
            ) : (
              <Button variant="secondary" onClick={() => setToastVisible(true)}>
                Xabarni qayta koʻrsatish
              </Button>
            )}

            <Toast
              tone="success"
              message="Natija nusxasi qurilmangga saqlandi."
            />

            <div>
              <Button variant="primary" onClick={() => setDialogOpen(true)}>
                Dialogni ochish
              </Button>
            </div>
          </div>
        </section>
        </main>
      </div>

      <Dialog
        open={dialogOpen}
        surface={surface}
        title="Natijani saqlash"
        description="Nusxa kodini xavfsiz joyga koʻchirib qoʻyishing mumkin."
        onClose={() => setDialogOpen(false)}
      >
        <p className="text-[15px] text-[var(--on-surface)]">
          Bu oyna klaviaturada Escape tugmasi bilan ham yopiladi.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDialogOpen(false)}>
            Yopish
          </Button>
          <Button variant="primary" onClick={() => setDialogOpen(false)}>
            Tayyor
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
