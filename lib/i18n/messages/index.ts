import { DEFAULT_LOCALE, type Locale } from '../types';
import { EN_MESSAGES } from './en';
import { RU_MESSAGES } from './ru';
import { UZ_MESSAGES, type LocaleDictionary } from './uz';

export const DICTIONARIES: Record<Locale, LocaleDictionary> = {
  uz: UZ_MESSAGES,
  ru: RU_MESSAGES,
  en: EN_MESSAGES,
};

export function getDictionary(locale: Locale = DEFAULT_LOCALE): LocaleDictionary {
  return DICTIONARIES[locale] ?? UZ_MESSAGES;
}

export type { LocaleDictionary };
