import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const REQUEST_URL = "https://automation.soluciona.es/webhook/alaluz-solicitud-v1";
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function selectedDate(className) {
  const cell = document.querySelector(`.calendar .cell.${className}`);
  const month = cell?.closest(".month");
  const label = month?.querySelector(".month-name")?.textContent?.trim().toLowerCase() || "";
  const match = label.match(/^([^\s]+)\s+(\d{4})$/);
  const day = Number(cell?.textContent || 0);
  if (!match || !day) return "";
  const monthIndex = MONTHS.indexOf(match[1]);
  if (monthIndex < 0) return "";
  return `${match[2]}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function displayedTotal() {
  const node = document.querySelector(".summary .deposit-total span:last-child") || document.querySelector(".summary .total span:last-child");
  return node?.textContent?.trim() || "";
}

export default function RequestFlowBridge() {
  const [guestTarget, setGuestTarget] = useState(null);
  const [adults, setAdults] = useState(2);
  const [minors, setMinors] = useState(0);
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState({ entrada: "", salida: "" });
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", motivo: "", grupo: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const totalGuests = adults + minors;

  useEffect(() => {
    const guests = document.querySelector(".summary .guests");
    if (guests) setGuestTarget(guests);
  }, []);

  useEffect(() => {
    const intercept = (event) => {
      const button = event.target.closest?.(".summary button.btn-solid.full");
      if (!button || button.disabled) return;
      if (!["Reservar", "Solicitar reserva"].includes((button.textContent || "").trim())) return;
      if (document.documentElement.dataset.alaluzLegalAccepted !== "1") return;
      event.preventDefault();
      event.stopPropagation();
      const entrada = selectedDate("start");
      const salida = selectedDate("end");
      if (!entrada || !salida) return;
      setDates({ entrada, salida });
      setError("");
      setResult(null);
      setOpen(true);
    };
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, []);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (adults < 1 || adults > 12) return setError("La vivienda admite un máximo de 12 adultos.");
    if (totalGuests > 20) return setError("La casa rural admite un máximo de 20 huéspedes en total.");
    if (!form.nombre.trim() || !form.email.trim() || !form.telefono.trim()) return setError("Completa nombre, email y teléfono.");
    if (form.motivo.trim().length < 3 || form.grupo.trim().length < 10) return setError("Indica el motivo y cuéntanos brevemente quiénes vais a venir.");
    setSending(true);
    try {
      const response = await fetch(REQUEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha_entrada: dates.entrada,
          fecha_salida: dates.salida,
          adultos,
          menores: minors,
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
          motivo_estancia: form.motivo.trim(),
          descripcion_grupo: form.grupo.trim(),
          acepta_normas: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "No hemos podido registrar la solicitud.");
      setResult(data);
    } catch (err) {
      setError(err.message || "No hemos podido registrar la solicitud.");
    } finally {
      setSending(false);
    }
  };

  const guestControls = guestTarget ? createPortal(
    <div className="request-guests">
      <div className="request-guest-field">
        <label>Adultos</label>
        <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="request-guest-field">
        <label>Menores</label>
        <select value={minors} onChange={(e) => setMinors(Number(e.target.value))}>
          {Array.from({ length: Math.max(0, 20 - adults) + 1 }, (_, i) => i).map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <p>{totalGuests} huéspedes en total · máximo 12 adultos y 20 huéspedes.</p>
      <p>Por la distribución y dimensiones de las camas, limitamos la ocupación a 12 adultos. Parte de las plazas restantes se encuentran en literas compactas, especialmente adecuadas para menores.</p>
    </div>,
    guestTarget
  ) : null;

  return (
    <>
      <style>{`
        .summary .guests>label,.summary .guests>select{display:none!important}
        .summary>button.btn-solid.full:not(:disabled){font-size:0}
        .summary>button.btn-solid.full:not(:disabled)::after{content:"Solicitar reserva";font-size:15px}
        .request-guests{margin-top:0;display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .request-guest-field{border:1px solid var(--linea);border-radius:11px;padding:10px 12px}
        .request-guest-field label{display:block!important;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--piedra)}
        .request-guest-field select{display:block!important;width:100%;border:none;background:transparent;font:inherit;color:var(--olivo);outline:none}
        .request-guests p{grid-column:1/-1;margin:0;font-size:11px;line-height:1.4;color:var(--piedra)}
        .request-overlay{position:fixed;inset:0;background:rgba(20,24,17,.55);z-index:80;display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}
        .request-modal{background:#fff;border-radius:18px;width:min(640px,100%);padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.25)}
        .request-modal h2{font-family:var(--display);font-weight:400;color:var(--olivo);margin:0 0 8px}.request-modal .lead{color:#5d6054;margin:0 0 18px}
        .request-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.request-grid .wide{grid-column:1/-1}
        .request-modal label{display:block;font-size:12px;font-weight:600;color:var(--olivo);margin-bottom:5px}.request-modal input,.request-modal textarea,.request-modal select{width:100%;box-sizing:border-box;border:1px solid var(--linea);border-radius:10px;padding:11px 12px;font:inherit;background:#fff}.request-modal textarea{min-height:92px;resize:vertical}
        .request-summary{background:#f7f3e9;border-radius:12px;padding:12px;margin:14px 0;font-size:14px}.request-error{background:#f9e9e5;color:#8b3b32;padding:10px;border-radius:9px;margin:12px 0}.request-success{background:#edf3e8;padding:18px;border-radius:12px;line-height:1.55}.request-actions{display:flex;gap:9px;margin-top:16px}.request-actions button{flex:1}.request-secondary{border:1px solid var(--linea);background:#fff;border-radius:999px;padding:12px;cursor:pointer}
        @media(max-width:600px){.request-grid{grid-template-columns:1fr}.request-grid .wide{grid-column:auto}}
      `}</style>
      {guestControls}
      {open && (
        <div className="request-overlay" role="dialog" aria-modal="true" aria-label="Solicitud de reserva" onMouseDown={(e) => { if (e.target === e.currentTarget && !sending) setOpen(false); }}>
          <div className="request-modal">
            {result ? (
              <div className="request-success">
                <h2>Solicitud recibida</h2>
                <p><b>Referencia:</b> {result.solicitud_id}</p>
                <p>Revisaremos los datos antes de aceptar la reserva. <b>No se ha realizado ningún cargo.</b></p>
                <p>Si la preaprobamos, recibirás un enlace para completar el pago dentro del plazo indicado.</p>
                <button className="btn-solid full" onClick={() => setOpen(false)}>Cerrar</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2>Solicitar reserva</h2>
                <p className="lead">Primero revisamos cada solicitud. Solo se habilitará el pago si la preaprobamos.</p>
                <div className="request-summary"><b>{dates.entrada} → {dates.salida}</b> · {adults} adultos · {minors} menores{displayedTotal() ? ` · ${displayedTotal()}` : ""}</div>
                <div className="request-grid">
                  <div><label>Nombre y apellidos</label><input value={form.nombre} onChange={update("nombre")} autoComplete="name" required /></div>
                  <div><label>Email</label><input type="email" value={form.email} onChange={update("email")} autoComplete="email" required /></div>
                  <div className="wide"><label>Teléfono</label><input value={form.telefono} onChange={update("telefono")} autoComplete="tel" required /></div>
                  <div className="wide"><label>Motivo de la estancia</label><input value={form.motivo} onChange={update("motivo")} placeholder="Vacaciones familiares, reunión familiar…" required /></div>
                  <div className="wide"><label>Cuéntanos brevemente quiénes vais a venir</label><textarea value={form.grupo} onChange={update("grupo")} placeholder="Por ejemplo: tres familias con sus hijos…" required /></div>
                </div>
                <p style={{ fontSize: 12, color: "#6d6d63" }}>Al enviar confirmas los datos del grupo y las condiciones que acabas de aceptar. La solicitud no bloquea fechas ni genera ningún cobro hasta que sea preaprobada.</p>
                {error && <div className="request-error">{error}</div>}
                <div className="request-actions">
                  <button type="button" className="request-secondary" disabled={sending} onClick={() => setOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn-solid full" disabled={sending}>{sending ? "Enviando…" : "Enviar solicitud"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
