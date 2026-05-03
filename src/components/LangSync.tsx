import { useEffect, useRef, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/context/LanguageContext";

/** Syncs the user's preferred_lang from DB into the LanguageContext on login */
const LangSync = () => {
  const { profile } = useAuth();
  // Use try/catch in case of HMR-induced stale context module
  let setLang: ((l: Language) => void) | null = null;
  try {
    setLang = useLanguage().setLang;
  } catch {
    setLang = null;
  }
  const synced = useRef(false);

  useEffect(() => {
    if (!setLang) return;
    if (profile?.preferred_lang && !synced.current) {
      const dbLang = profile.preferred_lang;
      if (dbLang === "en" || dbLang === "es") {
        setLang(dbLang as Language);
        synced.current = true;
      }
    }
    if (!profile) {
      synced.current = false;
    }
  }, [profile, setLang]);

  return null;
};

export default LangSync;
