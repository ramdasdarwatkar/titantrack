import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Root from "./Root";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

/**
 * HEIGHT STRATEGY
 *
 * We capture the height ONCE on load and on orientation change only.
 * We intentionally do NOT listen to visualViewport resize, because that
 * fires when the software keyboard opens — causing the layout to squish.
 * The keyboard should float over the content, not compress it.
 */
function setAppHeight() {
  // Use innerHeight (not visualViewport) so keyboard open doesn't affect it
  const height = window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

// Set once on load
setAppHeight();

// Only re-set on orientation change (landscape ↔ portrait)
window.addEventListener("orientationchange", () => {
  // Small delay to let the browser finish rotating before measuring
  setTimeout(setAppHeight, 100);
});

createRoot(rootElement).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
