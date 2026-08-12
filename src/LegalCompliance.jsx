import { useEffect, useState } from "react";
import { company, legalPages } from "./legal";

const STORAGE_KEY = "alaluz_cookie_preferences_v1";

export function LegalModal({ page, onClose }) {
  if (!page) return null;
  const data = legalPages[page];
  if (!data) return null;
  return (
    <div className="legal-overlay" role="dialog" aria-modal="true" aria-label={data.title} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <article className="legal-modal">
        <div className="legal-head"><div><span className="eyebrow">Casa Rural Alaluz</span><h2>{data.title}</h2></div><button className="legal-close" onClick={onClose} aria-label="Cerrar">×</button></div>
        {data.sections.map(([title, text]) => <section className="legal-section" key={title}><h3>{title}</h3><p>{text}</p></section>)}
        <button className="btn-solid legal-done" onClick={onClose}>Cerrar</button>
      </article>
    </div>
  );
}

export function CookieConsent({ onOpenLegal }) {
  const [prefs, setPrefs] = useState(null);
  const [settings, setSettings] = useState(false);
  const [optional, setOptional] = useState(false);
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved) { setPrefs(saved); setOptional(Boolean(saved.optional)); } } catch {}
  }, []);
  const save = (value) => { const next = { necessary: true, optional: value, savedAt: new Date().toISOString() }; localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setPrefs(next); setOptional(value); setSettings(false); };
  useEffect(() => { window.openAlaluzCookies = () => setSettings(true); return () => { delete window.openAlaluzCookies; }; }, []);
  if (prefs && !settings) return null;
  return (
    <div className="cookie-box" role="dialog" aria-label="Preferencias de cookies">
      <div className="cookie-copy"><b>Tu privacidad</b><p>Usamos almacenamiento necesario para que la web funcione. Las cookies opcionales permanecen desactivadas salvo que las aceptes. <button className="text-link" onClick={() => onOpenLegal("cookies")}>Política de cookies</button></p></div>
      {settings && <label className="cookie-toggle"><span><b>Opcionales</b><small>Analítica u otras funciones no esenciales, si se incorporan.</small></span><input type="checkbox" checked={optional} onChange={(e) => setOptional(e.target.checked)} /></label>}
      <div className="cookie-actions">
        <button className="cookie-btn secondary" onClick={() => save(false)}>Rechazar</button>
        {!settings && <button className="cookie-btn secondary" onClick={() => setSettings(true)}>Configurar</button>}
        {settings ? <button className="cookie-btn primary" onClick={() => save(optional)}>Guardar preferencias</button> : <button className="cookie-btn primary" onClick={() => save(true)}>Aceptar</button>}
      </div>
    </div>
  );
}

export function LegalFooter({ onOpenLegal }) {
  return (
    <footer className="legal-footer">
      <div><b>Casa Rural Alaluz</b><span>Registro turístico {company.tourism}</span></div>
      <div className="legal-links">
        <button onClick={() => onOpenLegal("aviso")}>Aviso legal</button>
        <button onClick={() => onOpenLegal("privacidad")}>Privacidad</button>
        <button onClick={() => onOpenLegal("cookies")}>Cookies</button>
        <button onClick={() => onOpenLegal("condiciones")}>Condiciones de reserva</button>
        <button onClick={() => window.openAlaluzCookies?.()}>Configurar cookies</button>
      </div>
      <small>{company.name} · CIF {company.cif} · {company.address} · {company.email}</small>
    </footer>
  );
}

export const LEGAL_CSS = `
.legal-footer{background:#172019;color:#f6f1e5;padding:38px clamp(20px,5vw,72px);display:grid;gap:18px}.legal-footer>div:first-child{display:flex;gap:12px;align-items:baseline;flex-wrap:wrap}.legal-footer span,.legal-footer small{color:#c8c9bd}.legal-links{display:flex;gap:8px 18px;flex-wrap:wrap}.legal-links button,.text-link{border:0;background:none;padding:0;color:inherit;text-decoration:underline;cursor:pointer;font:inherit}.legal-overlay{position:fixed;z-index:10020;inset:0;background:#111b;display:flex;align-items:center;justify-content:center;padding:20px}.legal-modal{background:#fffdf8;color:#222;max-width:780px;width:100%;max-height:88vh;overflow:auto;border-radius:18px;padding:clamp(22px,4vw,42px);box-shadow:0 24px 80px #0005}.legal-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:1px solid #ddd5c5;padding-bottom:18px;margin-bottom:20px}.legal-head h2{margin:5px 0 0;font-size:clamp(28px,4vw,42px)}.legal-close{border:0;background:#eee8dc;width:42px;height:42px;border-radius:50%;font-size:26px;cursor:pointer}.legal-section{margin:22px 0}.legal-section h3{margin:0 0 8px;font-size:18px}.legal-section p{margin:0;line-height:1.7;color:#4c4b45}.legal-done{margin-top:12px}.cookie-box{position:fixed;z-index:10010;left:18px;right:18px;bottom:18px;margin:auto;max-width:850px;background:#fffdf8;border:1px solid #d9d2c4;border-radius:16px;box-shadow:0 16px 60px #0004;padding:20px;color:#25251f}.cookie-copy p{margin:7px 0 0;line-height:1.5;color:#55534b}.cookie-actions{display:flex;justify-content:flex-end;gap:9px;flex-wrap:wrap;margin-top:16px}.cookie-btn{padding:11px 16px;border-radius:9px;font-weight:700;cursor:pointer}.cookie-btn.secondary{background:#fff;border:1px solid #354333;color:#263426}.cookie-btn.primary{background:#263426;border:1px solid #263426;color:#fff}.cookie-toggle{margin-top:16px;padding:14px;background:#f2eee5;border-radius:10px;display:flex;justify-content:space-between;gap:18px;align-items:center}.cookie-toggle span{display:grid;gap:3px}.cookie-toggle small{color:#666}.cookie-toggle input{width:22px;height:22px}.booking-consent{display:flex;gap:10px;align-items:flex-start;margin:14px 0;font-size:13px;line-height:1.45;color:#555}.booking-consent input{margin-top:3px;flex:0 0 auto}.booking-consent button{border:0;background:none;padding:0;color:#344c35;text-decoration:underline;cursor:pointer;font:inherit}@media(max-width:600px){.cookie-box{left:10px;right:10px;bottom:10px}.cookie-actions{display:grid;grid-template-columns:1fr 1fr}.cookie-btn.primary{grid-column:1/-1}.legal-footer{padding:30px 20px}.legal-links{display:grid;gap:12px}}
`;
