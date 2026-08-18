import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AlaluzReservas from "./App.jsx";
import DepositPricingBridge from "./DepositPricingBridge.jsx";
import RequestFlowBridge from "./RequestFlowBridge.jsx";
import PaymentReturnNotice from "./PaymentReturnNotice.jsx";
import MapSection from "./MapSection.jsx";
import ConstructionNotice from "./ConstructionNotice.jsx";
import { CookieConsent, LegalFooter, LegalModal, LEGAL_CSS } from "./LegalCompliance.jsx";
import { LEGAL_VERSION } from "./legal.js";

function MapPortal() {
  const [target, setTarget] = useState(null);
  useEffect(() => {
    const section = document.querySelector("#ubicacion");
    setTarget(section || null);
  }, []);
  return target ? createPortal(<MapSection />, target) : null;
}

export default function ComplianceShell() {
  const [legalPage, setLegalPage] = useState(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pendingButton, setPendingButton] = useState(null);

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#condiciones-reserva") setLegalPage("condiciones");
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  useEffect(() => {
    const intercept = (event) => {
      const button = event.target.closest?.("button.btn-solid.full");
      if (!button || button.disabled || accepted || document.documentElement.dataset.alaluzLegalAccepted === "1") return;
      const text = (button.textContent || "").trim();
      if (!["Reservar", "Solicitar reserva"].includes(text)) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingButton(button);
      setConsentOpen(true);
    };
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [accepted]);

  const confirmBooking = () => {
    document.documentElement.dataset.alaluzLegalAccepted = "1";
    setAccepted(true);
    setConsentOpen(false);
    const button = pendingButton;
    setPendingButton(null);
    setTimeout(() => button?.click(), 0);
  };

  const closeLegal = () => {
    setLegalPage(null);
    if (window.location.hash === "#condiciones-reserva") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <>
      <style>{LEGAL_CSS}</style>
      <ConstructionNotice />
      <AlaluzReservas />
      <DepositPricingBridge />
      <RequestFlowBridge />
      <PaymentReturnNotice />
      <MapPortal />
      <LegalFooter onOpenLegal={setLegalPage} />
      <CookieConsent onOpenLegal={setLegalPage} />
      <LegalModal page={legalPage} onClose={closeLegal} />
      {consentOpen && (
        <div className="legal-overlay" role="dialog" aria-modal="true" aria-label="Aceptación de condiciones">
          <div className="legal-modal" style={{ maxWidth: 560 }}>
            <div className="legal-head">
              <div><span className="eyebrow">Antes de continuar</span><h2>Condiciones de la solicitud</h2></div>
              <button className="legal-close" onClick={() => setConsentOpen(false)} aria-label="Cerrar">×</button>
            </div>
            <p style={{ lineHeight: 1.65 }}>Para enviar la solicitud debes aceptar las Condiciones de reserva y confirmar que has leído la Política de privacidad. Enviar la solicitud no supone todavía ningún cobro ni confirma la reserva.</p>
            <div className="booking-consent">
              <input id="legal-accept" type="checkbox" />
              <label htmlFor="legal-accept">He leído y acepto las <button type="button" onClick={() => setLegalPage("condiciones")}>Condiciones de reserva</button> y he leído la <button type="button" onClick={() => setLegalPage("privacidad")}>Política de privacidad</button>. Versión {LEGAL_VERSION}.</label>
            </div>
            <button className="btn-solid full" onClick={(e) => {
              const box = e.currentTarget.parentElement.querySelector("#legal-accept");
              if (!box?.checked) { box?.focus(); return; }
              confirmBooking();
            }}>Aceptar y continuar</button>
            <button className="cookie-btn secondary" style={{ width: "100%", marginTop: 9 }} onClick={() => setConsentOpen(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
}
