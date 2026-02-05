import en from "./en.json";
import it from "./it.json";

type Locale = "en" | "it";
type TranslationValue = string | TranslationMap;
interface TranslationMap {
  [key: string]: TranslationValue;
}

const translations: Record<Locale, TranslationMap> = {
  en: en as TranslationMap,
  it: it as TranslationMap,
};
let currentLocale: Locale = "en";

export function setLocale(locale: Locale) {
  if (translations[locale]) currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string): string {
  const keys = key.split(".");
  let value: TranslationValue = translations[currentLocale];

  for (const k of keys) {
    if (typeof value === "object" && value !== null && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}
