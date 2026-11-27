'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Toast } from '@/components/ui/Toast';
import {
  decodeShortCode,
  encodeShortCode,
  exportBackupJson,
  importBackupJson,
} from '@/lib/storage/backup';
import {
  loadProgressV2,
  requestPersistentStorage,
  saveProgressV2,
} from '@/lib/storage/idb';

export function BackupPanel() {
  const [shortCode, setShortCode] = useState('');
  const [importInput, setImportInput] = useState('');
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    tone: 'success' | 'danger' | 'info';
  } | null>(null);

  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.storage &&
      typeof navigator.storage.persisted === 'function'
    ) {
      void navigator.storage
        .persisted()
        .then(setPersisted)
        .catch(() => setPersisted(false));
    }
  }, []);

  const handleGenerateCode = async () => {
    const progress = await loadProgressV2();
    const code = encodeShortCode(progress);
    setShortCode(code);
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code).catch(() => {});
    }
    setStatusMsg({
      text: 'Qisqa nusxa kodi tayyorlandi (xavfsiz joyga saqlab qoʻy).',
      tone: 'success',
    });
  };

  const handleDownloadJson = async () => {
    const progress = await loadProgressV2();
    const json = exportBackupJson(progress);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oyna-va-organ-nusxa.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ text: 'JSON nusxa fayli yuklab olindi.', tone: 'success' });
  };

  const handleApplyCode = async () => {
    try {
      const next = decodeShortCode(importInput, Date.now());
      await saveProgressV2(next);
      setImportInput('');
      setStatusMsg({
        text: `Natija tiklandi! (${next.xp} XP, ${Object.keys(next.levels).length} ta daraja)`,
        tone: 'success',
      });
    } catch (err) {
      setStatusMsg({
        text: err instanceof Error ? err.message : 'Kod notoʻgʻri.',
        tone: 'danger',
      });
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const next = importBackupJson(text, Date.now());
      await saveProgressV2(next);
      setStatusMsg({
        text: `Fayldan tiklandi! (${next.xp} XP)`,
        tone: 'success',
      });
    } catch {
      setStatusMsg({ text: 'Nusxa fayli oʻqilmadi.', tone: 'danger' });
    }
  };

  const handlePersist = async () => {
    const res = await requestPersistentStorage();
    setPersisted(res.persisted);
    setStatusMsg({
      text: res.persisted
        ? 'Brauzer doimiy saqlashga ruxsat berdi.'
        : 'Brauzer avtomatik saqlashni cheklashi mumkin — vaqti-vaqti bilan nusxa yuklab ol.',
      tone: res.persisted ? 'success' : 'info',
    });
  };

  return (
    <Panel variant="elevated" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
            Natijani saqlash va koʻchirish (Oflayn nusxa)
          </h2>
          <p className="mt-1 text-[14.5px] text-[var(--on-surface-muted)]">
            {persisted === false
              ? 'Ayrim brauzerlar (masalan Safari) uzoq kirmasang maʼlumotni tozalashi mumkin. Nusxani saqlab qoʻy.'
              : 'Barcha yutuqlar faqat qurilmangdagi IndexedDB xotirasida saqlanadi.'}
          </p>
        </div>
        <Button variant="secondary" onClick={handlePersist}>
          {persisted ? 'Doimiy xotira yoqilgan' : 'Xotirani himoyalash'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={handleDownloadJson}>
          Nusxa faylini yuklab olish (.json)
        </Button>
        <Button variant="secondary" onClick={handleGenerateCode}>
          Qisqa nusxa kodini olish
        </Button>
        <label className="ws-key-btn ws-key-btn--secondary min-h-[48px] cursor-pointer px-4">
          <span>Fayldan tiklash</span>
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleFileImport}
            className="sr-only"
          />
        </label>
      </div>

      {shortCode ? (
        <div className="rounded-[12px] border border-[var(--line-strong)] bg-[var(--surface-inset)] p-3">
          <p className="text-[13px] font-bold text-[var(--on-surface-muted)]">
            Nusxa kodingiz (boshqa qurilmaga koʻchiring):
          </p>
          <code className="mt-1 block break-all font-[family-name:var(--font-mono)] text-[13px] text-[var(--on-surface)]">
            {shortCode}
          </code>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="backup-code-input">
          Nusxa kodini kiriting
        </label>
        <input
          id="backup-code-input"
          type="text"
          value={importInput}
          onChange={(e) => setImportInput(e.target.value)}
          placeholder="OYNA2.... nusxa kodini shu yerga qoʻying"
          className="min-h-[48px] flex-1 rounded-[12px] border-2 border-[var(--line-strong)] bg-[var(--surface)] px-3.5 text-[15px] text-[var(--on-surface)]"
        />
        <Button
          variant="primary"
          onClick={handleApplyCode}
          disabled={!importInput.trim()}
        >
          Kodni qoʻllash
        </Button>
      </div>

      {statusMsg ? (
        <Toast
          tone={statusMsg.tone}
          message={statusMsg.text}
          onDismiss={() => setStatusMsg(null)}
        />
      ) : null}
    </Panel>
  );
}
