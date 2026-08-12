import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AlaluzReservas from "./App.jsx";
import { ComplianceLayer } from "./ComplianceLayer.jsx";
import "./cta-fix.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AlaluzReservas />
    <ComplianceLayer />
  </StrictMode>
);
