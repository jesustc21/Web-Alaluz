import { useEffect, useState } from "react";
import AlaluzReservas from "./App.jsx";
import MapSection from "./MapSection.jsx";
import { CookieConsent, LegalFooter, LegalModal, LEGAL_CSS } from "./LegalCompliance.jsx";
import { LEGAL_VERSION } from "./legal.js";

export default function ComplianceShell() {
  const [legalPage, setLegalPage] = useState(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pendingButton, setPendingButton] = useState(null);

  useEffect(() => {
    const intercept = (event) => {
      const button = event.target.closest?.("button.btn-solid.full");
      if (!button || button.disabled || accepted) return;
      if ((button.textContent || "").trim() !== "Reservar") return;
      event.preventDefault(); event.stopPropagation(); setPendingButton(button); setConsentOpen(true);
    };
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [accepted]);

  const confirmBooking = () => {
    setAccepted(true); setConsentOpen(false); const button = pendingButton; setPendingButton(null); setTimeout(() => button?.click(), 0);
  };

  return (
    <>
      <style>{LEGAL_CSS}</style>
      <AlaluzReservas />
      <div className="alaluz-map-slot"><MapSection /></div>
      <style>{`.alaluz-map-slot{max-width:1140px;margin:-58px auto 70px;padding:0 28px}@media(max-width:560px){.alaluz-map-slot{margin:-34px auto 50px;padding:0 20px}}`}</style>
      <LegalFooter onOpenLegal={setLegalPage} />
      <CookieConsent onOpenLegal={setLegalPage} />
      <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />
      {consentOpen && (
        <div className="legal-overlay" role="dialog" aria-modal="true" aria-label="Aceptación de condiciones">
          <div className="legal-modal" style={{ maxWidth: 560 }}>
            <div className="legal-head"><div><span className="eyebrow">Antes de continuar</span><h2>Condiciones de la reserva</h2></div><button className="legal-close" onClick={() => setConsentOpen(false)} aria-label="Cerrar">×</button></div>
            <p style={{ lineHeight: 1.65 }}>Para continuar con la reserva debes aceptar las Condiciones de reserva y confirmar que has leído la Política de privacidad. La política de cancelación aplicable es la Semiestricta indicada en las condiciones.</p>
            <div className="booking-consent"><input id="legal-accept" type="checkbox" /><label htmlFor="legal-accept">He leído y acepto las <button type="button" onClick={() => setLegalPage("condiciones")}>Condiciones de reserva</button> y he leído la <button type="button" onClick={() => setLegalPage("privacidad")}>Política de privacidad</button>. Versión {LEGAL_VERSION}.</label></div>
            <button className="btn-solid full" onClick={(e) => { const box=e.currentTarget.parentElement.querySelector("#legal-accept"); if(!box?.checked){box?.focus();return;} confirmBooking(); }}>Aceptar y continuar</button>
            <button className="cookie-btn secondary" style={{ width: "100%", marginTop: 9 }} onClick={() => setConsentOpen(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
}
