import { createRoot } from "react-dom/client";
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

const root = document.getElementById("root")!;
createRoot(root).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
