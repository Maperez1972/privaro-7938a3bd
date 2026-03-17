

## Plan: Auto-detect language based on user's browser locale

### What changes

**Single file: `src/context/LanguageContext.tsx`**

Replace the hardcoded `useState<Language>("en")` initializer with a function that:

1. Uses `navigator.language` (e.g. `"es-MX"`, `"es"`, `"en-US"`) to detect the browser's locale.
2. If the language code starts with `"es"`, default to `"es"`. Otherwise, default to `"en"`.
3. Allow manual override via `setLang` (which also persists to `localStorage`).
4. On subsequent visits, check `localStorage` first — if the user manually switched, respect that choice.

### Detection logic

```typescript
function detectInitialLang(): Language {
  const saved = localStorage.getItem("privaro-lang");
  if (saved === "es" || saved === "en") return saved;
  const browserLang = navigator.language || "";
  return browserLang.startsWith("es") ? "es" : "en";
}
```

The `setLang` wrapper will also persist to `localStorage` so manual toggles stick across sessions.

### Why `navigator.language` is sufficient

The browser locale reflects the user's OS/browser language setting, which correlates strongly with their country. All Spanish-speaking countries will typically have `es-*` locales. No external geolocation API needed — this is instant, free, and privacy-friendly.

