"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, type Locale } from "./translations";

// Use a flexible type so both EN and ID translations are assignable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTranslation = any;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: AnyTranslation;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: translations.en,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("laby-locale") as Locale | null;
    if (saved === "en" || saved === "id") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("laby-locale", l);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
