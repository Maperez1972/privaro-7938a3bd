import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { initAnalytics } from "./lib/analytics";
import "./index.css";

initAnalytics();

const root = document.getElementById("root")!;
createRoot(root).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
