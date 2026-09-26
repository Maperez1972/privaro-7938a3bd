import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Recuperación automática ante chunks obsoletos tras un nuevo despliegue
const RELOAD_FLAG = "privaro:chunk-reloaded";
const isStaleChunkError = (message?: string) =>
  !!message &&
  (/Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message));

const handleStaleChunk = (message?: string) => {
  if (!isStaleChunkError(message)) return;
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, "1");
  window.location.reload();
};

window.addEventListener("error", (e) => handleStaleChunk(e.message));
window.addEventListener("unhandledrejection", (e) =>
  handleStaleChunk(typeof e.reason === "string" ? e.reason : e.reason?.message)
);
window.addEventListener("load", () => sessionStorage.removeItem(RELOAD_FLAG));

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Public pages ship with a prerendered React tree. Hydrate it in place so the
// early H1 is not discarded and painted a second time when the bundle loads.
if (root.dataset.prerendered === "true" && root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
