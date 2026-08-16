import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ComplianceShell from "./ComplianceShell.jsx";
import "./cta-fix.css";

const LEGACY_AUTOMATION_ORIGIN = "https://automation.soluciona.es";
const ALALUZ_AUTOMATION_ORIGIN = "https://automation.casaruralalaluz.com";
const nativeFetch = window.fetch.bind(window);

window.fetch = (input, init) => {
  if (typeof input === "string" && input.startsWith(LEGACY_AUTOMATION_ORIGIN)) {
    return nativeFetch(input.replace(LEGACY_AUTOMATION_ORIGIN, ALALUZ_AUTOMATION_ORIGIN), init);
  }
  if (input instanceof Request && input.url.startsWith(LEGACY_AUTOMATION_ORIGIN)) {
    const rewritten = input.url.replace(LEGACY_AUTOMATION_ORIGIN, ALALUZ_AUTOMATION_ORIGIN);
    return nativeFetch(new Request(rewritten, input), init);
  }
  return nativeFetch(input, init);
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ComplianceShell />
  </StrictMode>
);
