import { notFound } from 'next/navigation';
import React from 'react';
import { SwRegisterToast } from '@/components/SwRegisterToast';
import { getDictionary } from '@/lib/i18n/messages';
import { isSupportedLocale } from '@/lib/i18n/types';
import { buildOrganizationAndSiteJsonLd } from '@/lib/seo/jsonld';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }
  const dict = getDictionary(locale);
  const orgJsonLd = buildOrganizationAndSiteJsonLd(locale);

  return (
    <div lang={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {children}
      <SwRegisterToast
        updateMessage={dict.ui.swUpdateReady}
        updateLabel={dict.actions.updateNow}
      />
    </div>
  );
}
