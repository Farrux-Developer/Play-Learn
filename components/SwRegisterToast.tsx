'use client';

import React, { useEffect, useState } from 'react';
import { Toast } from '@/components/ui/Toast';

export function SwRegisterToast({
  updateMessage = 'Yangi versiya tayyor — yangilab olamizmi?',
  updateLabel = 'Yangilash',
}: {
  updateMessage?: string;
  updateLabel?: string;
}) {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    let cancelled = false;
    const onMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_UPDATE_READY') {
        void navigator.serviceWorker.getRegistration().then((reg) => {
          if (!cancelled && reg?.waiting) setWaitingWorker(reg.waiting);
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (cancelled) return;
        if (reg.waiting) setWaitingWorker(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (
              installing.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(installing);
            }
          });
        });
      })
      .catch(() => {
        // Offline registration optional
      });

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, []);

  if (!waitingWorker) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-sm">
      <Toast
        tone="info"
        message={updateMessage}
        actionLabel={updateLabel}
        onAction={() => {
          waitingWorker.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }}
        onDismiss={() => setWaitingWorker(null)}
      />
    </div>
  );
}
