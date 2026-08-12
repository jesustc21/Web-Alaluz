import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ComplianceShell from "./ComplianceShell.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ComplianceShell />
  </StrictMode>
);
