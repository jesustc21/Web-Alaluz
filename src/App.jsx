import { useState, useMemo, useEffect } from "react";

// ---------------------------------------------------------------------------
// Casa rural Alaluz (Osuna) — prototipo de web de reservas directas
// Diseño: campiña de la Sierra Sur — verde olivo + oro de aceite sobre cal.
// Nota: disponibilidad, precio y pago son SIMULADOS en este prototipo.
//   - La disponibilidad real vendrá del iCal de Airbnb vía n8n.
//   - El pago real irá por Stripe o Redsys.
// ---------------------------------------------------------------------------

const PHOTOS = [
  "1bc39096-b2d6-4cca-9e85-afa5dd012444",
  "3c68aea4-d7a3-40f6-a397-d7df4eaad8ad",
  "5cc79761-4695-413d-a47c-6b8709e160e3",
  "7ffd7b96-05fc-4c6d-8e0f-f948478b24ef",
  "aec230ba-b741-4c44-bd55-7d6f94e1e41a",
  "9a69f2f9-1b77-4ec4-a082-784f89d4152e",
].map(
  (id) =>
    `https://a0.muscache.com/im/pictures/miso/Hosting-870948616590893988/original/${id}.jpeg?im_w=1200`
);

const AVAILABILITY_URL = "https://automation.soluciona.es/webhook/alaluz-public-availability-v1";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function datesInRange(start, end) {
  const set = new Set();
  if (!start || !end) return set;
  for (let d = new Date(`${start}T00:00:00`); iso(d) < end; d = addDays(d, 1)) set.add(iso(d));
  return set;
}

function pickRule(date, rules) {
  const candidates = rules.filter((r) => r.activa && date >= r.desde && date <= r.hasta);
  if (!candidates.length) return null;
  const maxPriority = Math.max(...candidates.map((r) => Number(r.prioridad) || 0));
  const top = candidates.filter((r) => (Number(r.prioridad) || 0) === maxPriority);
  return top.length === 1 ? top[0] : null;
}

function priceForDate(date, pricing) {
  const special = pickRule(date, pricing.especiales || []);
  const rule = special || pickRule(date, pricing.tarifas || []);
  if (!rule) return null;
  const dow = new Date(`${date}T00:00:00`).getDay();
  const field = dow === 5 ? "precio_viernes" : dow === 6 ? "precio_sabado" : dow === 0 ? "precio_domingo" : "precio_lun_jue";
  return { price: Number(rule[field]), minNights: Number(rule.min_noches) || 1, name: rule.nombre };
}

function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function AlaluzReservas() {
  const today = useMemo(() => stripTime(new Date()), []);
  const [availability, setAvailability] = useState({ blocked: new Set(), tarifas: [], especiales: [], loaded: false, error: "" });
  useEffect(() => {
    let alive = true;
    fetch(AVAILABILITY_URL)
      .then((r) => { if (!r.ok) throw new Error("No se pudo consultar la disponibilidad"); return r.json(); })
      .then((data) => {
        if (!alive) return;
        const blocked = new Set();
        (data.bloqueos || []).forEach((r) => datesInRange(r.fecha_entrada, r.fecha_salida).forEach((d) => blocked.add(d)));
        setAvailability({ blocked, tarifas: data.tarifas || [], especiales: data.especiales || [], loaded: true, error: "" });
      })
      .catch(() => alive && setAvailability((a) => ({ ...a, loaded: true, error: "No hemos podido actualizar la disponibilidad. Inténtalo de nuevo en unos minutos." })));
    return () => { alive = false; };
  }, []);
  const blocked = availability.blocked;
  const [offset, setOffset] = useState(0); // meses desde el actual
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(8);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const monthsShown = [base, new Date(base.getFullYear(), base.getMonth() + 1, 1)];

  const rangeHasBlocked = (a, b) => {
    for (let d = new Date(a); d < b; d = addDays(d, 1))
      if (blocked.has(iso(d))) return true;
    return false;
  };

  const onPick = (day) => {
    setNotice("");
    if (!day) return;
    const d = stripTime(day);
    if (d < today || blocked.has(iso(d))) return;
    // primer clic, o empezar una selección nueva
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(d);
      setCheckOut(null);
      return;
    }
    // clic igual o anterior a la entrada → mover la entrada
    if (d <= checkIn) {
      setCheckIn(d);
      return;
    }
    // único bloqueo duro: no cruzar un día ocupado
    if (rangeHasBlocked(checkIn, d)) {
      setNotice("Esas fechas incluyen días no disponibles. Prueba otro rango.");
      return;
    }
    // fijar la salida siempre que el rango sea válido; el precio y la estancia
    // mínima se comprueban aparte y solo condicionan el botón "Reservar"
    setCheckOut(d);
  };

  const nights = checkIn && checkOut ? Math.round((checkOut - checkIn) / 86400000) : 0;
  const nightlyBreakdown = useMemo(() => {
    if (!checkIn || !checkOut) return [];
    const rows = [];
    for (let d = new Date(checkIn); d < checkOut; d = addDays(d, 1)) {
      const rule = priceForDate(iso(d), availability);
      if (rule) rows.push({ date: iso(d), ...rule });
    }
    return rows;
  }, [checkIn, checkOut, availability.tarifas, availability.especiales]);
  const subtotal = nightlyBreakdown.reduce((sum, x) => sum + x.price, 0);
  const priceComplete = nights > 0 && nightlyBreakdown.length === nights;
  const total = priceComplete ? subtotal : 0;
  const minNightsRequired = nightlyBreakdown.length
    ? Math.max(1, ...nightlyBreakdown.map((r) => r.minNights))
    : 1;
  const meetsMin = nights >= minNightsRequired;
  const canBook = Boolean(checkIn && checkOut && priceComplete && meetsMin);
  const fromPrice = useMemo(() => {
    const rule = priceForDate(iso(today), availability);
    return rule?.price || null;
  }, [availability.tarifas, availability.especiales, today]);

  const fmtDate = (d) =>
    d ? `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}` : "—";
  const eur = (n) => n.toLocaleString("es-ES") + " €";

  const dayState = (day) => {
    if (!day) return "empty";
    const d = stripTime(day);
    if (d < today) return "past";
    if (blocked.has(iso(d))) return "blocked";
    if (checkIn && d.getTime() === checkIn.getTime()) return "start";
    if (checkOut && d.getTime() === checkOut.getTime()) return "end";
    if (checkIn && checkOut && d > checkIn && d < checkOut) return "inrange";
    return "open";
  };

  return (
    <div className="alaluz">
      <style>{CSS}</style>

      {showBanner && (
        <div className="build-banner">
          <span>
            🚧 Esta web está en construcción. Precios, disponibilidad y pagos
            son de prueba — todavía no aceptamos reservas reales.
          </span>
          <button
            className="build-banner-close"
            onClick={() => setShowBanner(false)}
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      )}

      <header className="nav">
        <div className="brand">
          <span className="mark">Alaluz</span>
          <span className="brand-sub">Casa rural · Osuna</span>
        </div>
        <nav className="links">
          <a href="#casa">La casa</a>
          <a href="#galeria">Galería</a>
          <a href="#ubicacion">Dónde estamos</a>
          <a className="btn-ghost" href="#reservar">Reservar</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-img" style={{ backgroundImage: grad(0) }}>
          <img src={PHOTOS[0]} alt="Casa rural Alaluz" onError={hideImg} />
          <div className="scrim" />
        </div>
        <div className="hero-copy">
          <span className="eyebrow">Osuna · Sierra Sur de Sevilla</span>
          <h1>
            Una casa entera<br />para los tuyos,<br />
            <em>en pleno campo</em>
          </h1>
          <p className="lede">
            Siete dormitorios, piscina y campiña alrededor. Reserva directa,
            sin intermediarios ni comisiones.
          </p>
          <div className="facts">
            <Fact n="16+" l="viajeros" />
            <Fact n="7" l="dormitorios" />
            <Fact n="18" l="camas" />
            <Fact n="7,5" l="baños" />
            <Fact n="4,9★" l="41 reseñas" />
          </div>
          <a className="btn-solid" href="#reservar">Ver disponibilidad</a>
        </div>
      </section>

      {/* RESERVAR */}
      <section id="reservar" className="book">
        <div className="section-head">
          <span className="num">Reserva</span>
          <h2>Elige tus fechas</h2>
          <p className="muted">
            Disponibilidad sincronizada con Airbnb y precios calculados según las tarifas activas.
          </p>
        </div>

        <div className="book-grid">
          <div className="calendar">
            <div className="cal-nav">
              <button
                className="chev"
                onClick={() => setOffset((o) => Math.max(0, o - 1))}
                disabled={offset === 0}
                aria-label="Mes anterior"
              >
                ‹
              </button>
              <button
                className="chev"
                onClick={() => setOffset((o) => o + 1)}
                aria-label="Mes siguiente"
              >
                ›
              </button>
            </div>
            <div className="months">
              {monthsShown.map((m, mi) => (
                <div className="month" key={mi}>
                  <div className="month-name">
                    {MESES[m.getMonth()]} {m.getFullYear()}
                  </div>
                  <div className="dow">
                    {DIAS.map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="grid">
                    {monthMatrix(m.getFullYear(), m.getMonth()).map((week, wi) =>
                      week.map((day, di) => {
                        const st = dayState(day);
                        return (
                          <button
                            key={`${wi}-${di}`}
                            className={`cell ${st}`}
                            onClick={() => onPick(day)}
                            disabled={
                              st === "empty" || st === "past" || st === "blocked"
                            }
                          >
                            {day ? day.getDate() : ""}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!availability.loaded && <div className="notice">Actualizando disponibilidad…</div>}
            {availability.error && <div className="notice">{availability.error}</div>}
            <div className="legend">
              <span><i className="lg open" /> Libre</span>
              <span><i className="lg blocked" /> Ocupado (Airbnb)</span>
              <span><i className="lg sel" /> Tu estancia</span>
            </div>
          </div>

          <aside className="summary">
            <div className="price-row">
              <span className="price">{fromPrice ? `Desde ${eur(fromPrice)}` : "Consulta fechas"}</span>
              <span className="per">/ noche</span>
            </div>
            <div className="dates">
              <div className="date-box">
                <label>Entrada</label>
                <b>{fmtDate(checkIn)}</b>
              </div>
              <div className="date-box">
                <label>Salida</label>
                <b>{fmtDate(checkOut)}</b>
              </div>
            </div>
            <div className="guests">
              <label>Viajeros</label>
              <select value={guests} onChange={(e) => setGuests(+e.target.value)}>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "viajero" : "viajeros"}
                  </option>
                ))}
              </select>
            </div>

            {notice && <div className="notice">{notice}</div>}
            {checkIn && checkOut && !meetsMin && (
              <div className="notice">Estancia mínima de {minNightsRequired} noches para estas fechas.</div>
            )}
            {checkIn && checkOut && meetsMin && !priceComplete && (
              <div className="notice">Aún no hay tarifa publicada para todas las noches. Escríbenos y te confirmamos el precio.</div>
            )}

            {nights > 0 && priceComplete && (
              <div className="breakdown">
                <div>
                  <span>{nights} noches · tarifa según fecha</span>
                  <span>{eur(subtotal)}</span>
                </div>
                <div className="total">
                  <span>Total</span>
                  <span>{eur(total)}</span>
                </div>
              </div>
            )}

            <button
              className="btn-solid full"
              disabled={!canBook}
              onClick={() => setModal(true)}
            >
              {canBook
                ? "Reservar"
                : checkIn && checkOut
                ? "Consulta estas fechas"
                : "Selecciona tus fechas"}
            </button>
            <p className="reassure">Reserva directa. Sin comisiones de plataforma.</p>
          </aside>
        </div>
      </section>

      {/* LA CASA */}
      <section id="casa" className="casa">
        <div className="section-head">
          <span className="num">La casa</span>
          <h2>Cortijo para reunir a todos</h2>
        </div>
        <div className="casa-grid">
          <p className="casa-text">
            En Alaluz se respira tranquilidad. Una casa rural con encanto,
            rodeada de campiña, con salón con chimenea, comedor y cocina
            totalmente equipada. Fuera, piscina privada y barbacoa, y senderos
            para explorar el paraje. Ideal para familias grandes y celebraciones.
          </p>
          <ul className="amen">
            {[
              "Piscina privada",
              "Barbacoa",
              "Chimenea",
              "Cocina equipada",
              "Wifi",
              "Aparcamiento gratis",
              "Zona de trabajo",
              "7 baños en suite",
            ].map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* GALERÍA */}
      <section id="galeria" className="galeria">
        <div className="section-head">
          <span className="num">Galería</span>
          <h2>Un vistazo</h2>
        </div>
        <div className="gal-grid">
          {PHOTOS.map((src, i) => (
            <figure
              key={i}
              className={`gal-item g${i}`}
              style={{ backgroundImage: grad(i) }}
            >
              <img src={src} alt={`Alaluz ${i + 1}`} onError={hideImg} />
            </figure>
          ))}
        </div>
      </section>

      {/* RESEÑAS */}
      <section className="resenas">
        <div className="section-head">
          <span className="num">Reseñas</span>
          <h2>4,9 sobre 5 · 41 evaluaciones</h2>
        </div>
        <div className="res-grid">
          {[
            ["Limpieza", 4.8],
            ["Veracidad", 4.8],
            ["Llegada", 4.9],
            ["Comunicación", 5.0],
            ["Ubicación", 4.9],
            ["Calidad", 4.8],
          ].map(([k, v]) => (
            <div className="res-row" key={k}>
              <span className="res-k">{k}</span>
              <span className="res-bar">
                <i style={{ width: `${(v / 5) * 100}%` }} />
              </span>
              <span className="res-v">{v.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <div className="chips">
          {["Piscina", "Hospitalidad", "Familia", "Vistas", "Ubicación", "Limpieza"].map(
            (c) => (
              <span className="chip" key={c}>{c}</span>
            )
          )}
        </div>
      </section>

      {/* UBICACIÓN */}
      <section id="ubicacion" className="ubi">
        <div className="section-head">
          <span className="num">Dónde estamos</span>
          <h2>Osuna, Sierra Sur de Sevilla</h2>
        </div>
        <p className="ubi-text">
          En plena campiña sevillana, a un paso del casco histórico de Osuna y
          bien conectada con Sevilla, Málaga y Granada. Un entorno tranquilo,
          entre olivares, ideal para desconectar.
        </p>
      </section>

      <footer className="foot">
        <div className="foot-col">
          <span className="mark">Alaluz</span>
          <p>Casa rural · Osuna, Andalucía</p>
        </div>
        <div className="foot-col small">
          <p>Registro turístico de Andalucía: <b>CR/SE/00382</b></p>
          <p>Disponibilidad sincronizada con Airbnb.</p>
          <p className="proto">Disponibilidad y precios reales · pago todavía en pruebas</p>
        </div>
      </footer>

      {modal && (
        <div className="overlay" onClick={() => setModal(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Resumen de tu reserva</h3>
            <div className="dlg-rows">
              <div><span>Fechas</span><b>{fmtDate(checkIn)} → {fmtDate(checkOut)}</b></div>
              <div><span>Noches</span><b>{nights}</b></div>
              <div><span>Viajeros</span><b>{guests}</b></div>
              <div className="dlg-total"><span>Total</span><b>{eur(total)}</b></div>
            </div>
            <p className="dlg-note">
              El siguiente paso del proyecto es conectar aquí el pago seguro y, tras confirmarlo,
              registrar la reserva y bloquear automáticamente estas fechas también en Airbnb.
            </p>
            <button className="btn-solid full" onClick={() => setModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ n, l }) {
  return (
    <div className="fact">
      <b>{n}</b>
      <span>{l}</span>
    </div>
  );
}

function grad(i) {
  const gs = [
    "linear-gradient(135deg,#55643F,#37432B)",
    "linear-gradient(135deg,#8C9A6E,#55643F)",
    "linear-gradient(135deg,#C0912F,#8a6a2a)",
    "linear-gradient(135deg,#37432B,#20261A)",
    "linear-gradient(135deg,#a9b389,#55643F)",
    "linear-gradient(135deg,#55643F,#8C9A6E)",
  ];
  return gs[i % gs.length];
}
function hideImg(e) {
  e.currentTarget.style.opacity = "0";
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

.alaluz{
  --cal:#FBF9F3; --cal2:#F2EEE2; --olivo:#37432B; --olivo2:#55643F;
  --sage:#8C9A6E; --oro:#B7882B; --oro-soft:#E8D9B0; --tinta:#20261A;
  --piedra:#8f8879; --linea:#E2DBCB;
  --display:'Fraunces',Georgia,serif; --body:'Hanken Grotesk',system-ui,sans-serif;
  font-family:var(--body); color:var(--tinta); background:var(--cal);
  line-height:1.55; -webkit-font-smoothing:antialiased;
}
.alaluz *{box-sizing:border-box;}
.alaluz h1,.alaluz h2,.alaluz h3{font-family:var(--display);font-weight:400;letter-spacing:-.01em;margin:0;}
.alaluz a{color:inherit;text-decoration:none;}
.alaluz section{padding:76px 28px;max-width:1140px;margin:0 auto;}

/* BUILD BANNER */
.build-banner{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:center;
  gap:14px;background:var(--oro);color:#2b2107;padding:10px 44px 10px 16px;text-align:center;
  font-size:13px;font-weight:600;line-height:1.4;}
.build-banner-close{position:absolute;right:14px;top:50%;transform:translateY(-50%);
  background:none;border:none;color:#2b2107;font-size:20px;line-height:1;cursor:pointer;
  padding:4px 8px;}
.build-banner-close:hover{opacity:.7;}
@media(max-width:560px){
  .build-banner{font-size:12px;padding:9px 40px 9px 12px;}
}

/* NAV */
.nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;
  padding:16px 28px;background:rgba(251,249,243,.86);backdrop-filter:blur(10px);
  border-bottom:1px solid var(--linea);}
.brand{display:flex;flex-direction:column;line-height:1;}
.mark{font-family:var(--display);font-size:24px;color:var(--olivo);}
.brand-sub{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--piedra);margin-top:3px;}
.links{display:flex;align-items:center;gap:26px;font-size:14px;}
.links a{color:var(--olivo);}
.links a:hover{color:var(--oro);}
.btn-ghost{border:1px solid var(--olivo);padding:8px 16px;border-radius:999px;}
.btn-ghost:hover{background:var(--olivo);color:var(--cal)!important;}

/* HERO */
.hero{display:grid;grid-template-columns:1.05fr .95fr;gap:0;max-width:none!important;
  padding:0!important;min-height:82vh;align-items:stretch;}
.hero-img{position:relative;overflow:hidden;background-size:cover;background-position:center;}
.hero-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .4s;}
.scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(32,38,26,.10),transparent 40%);}
.hero-copy{display:flex;flex-direction:column;justify-content:center;padding:64px 7vw 64px 5vw;background:var(--cal);}
.eyebrow{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--oro);font-weight:600;}
.hero-copy h1{font-size:clamp(38px,5.4vw,68px);line-height:1.02;margin:20px 0 0;color:var(--olivo);}
.hero-copy h1 em{font-style:italic;color:var(--oro);}
.lede{font-size:18px;color:#4a4c40;max-width:30ch;margin:22px 0 30px;}
.facts{display:flex;flex-wrap:wrap;gap:26px 34px;margin-bottom:34px;}
.fact{display:flex;flex-direction:column;}
.fact b{font-family:var(--display);font-size:26px;color:var(--olivo);line-height:1;}
.fact span{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--piedra);margin-top:5px;}
.btn-solid{align-self:flex-start;background:var(--olivo);color:var(--cal);border:none;cursor:pointer;
  padding:15px 30px;border-radius:999px;font-family:var(--body);font-size:15px;font-weight:600;
  letter-spacing:.02em;transition:background .2s,transform .1s;}
.btn-solid:hover:not(:disabled){background:var(--oro);}
.btn-solid:active{transform:translateY(1px);}
.btn-solid:disabled{background:var(--linea);color:var(--piedra);cursor:not-allowed;}

/* SECTION HEAD */
.section-head{margin-bottom:34px;}
.num{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--oro);font-weight:600;}
.section-head h2{font-size:clamp(28px,3.6vw,42px);color:var(--olivo);margin-top:10px;}
.muted{color:var(--piedra);font-size:14px;margin-top:8px;}

/* BOOK */
.book{border-top:1px solid var(--linea);}
.book-grid{display:grid;grid-template-columns:1fr 340px;gap:40px;align-items:start;}
.calendar{background:#fff;border:1px solid var(--linea);border-radius:18px;padding:22px 22px 18px;position:relative;}
.cal-nav{position:absolute;top:22px;right:22px;display:flex;gap:8px;}
.chev{width:34px;height:34px;border-radius:50%;border:1px solid var(--linea);background:#fff;
  cursor:pointer;font-size:18px;color:var(--olivo);line-height:1;}
.chev:hover:not(:disabled){border-color:var(--olivo);}
.chev:disabled{opacity:.35;cursor:not-allowed;}
.months{display:flex;gap:34px;}
.month{flex:1;min-width:0;}
.month-name{font-family:var(--display);font-size:18px;color:var(--olivo);margin-bottom:14px;
  text-transform:capitalize;}
.dow{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:6px;}
.dow span{text-align:center;font-size:11px;color:var(--piedra);font-weight:600;}
.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.cell{aspect-ratio:1;border:none;background:transparent;border-radius:9px;cursor:pointer;
  font-family:var(--body);font-size:13.5px;color:var(--tinta);transition:background .12s;}
.cell.empty{visibility:hidden;}
.cell.open:hover{background:var(--oro-soft);}
.cell.past{color:var(--linea);cursor:default;}
.cell.blocked{color:#c9c2b2;text-decoration:line-through;cursor:not-allowed;}
.cell.inrange{background:var(--oro-soft);border-radius:0;}
.cell.start,.cell.end{background:var(--olivo);color:var(--cal);font-weight:600;}
.cell.start{border-radius:9px 0 0 9px;}
.cell.end{border-radius:0 9px 9px 0;}
.legend{display:flex;gap:20px;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid var(--linea);
  font-size:12px;color:var(--piedra);}
.legend span{display:flex;align-items:center;gap:7px;}
.lg{width:13px;height:13px;border-radius:4px;display:inline-block;}
.lg.open{background:#fff;border:1px solid var(--linea);}
.lg.blocked{background:repeating-linear-gradient(45deg,#ece4d5,#ece4d5 3px,#fff 3px,#fff 6px);}
.lg.sel{background:var(--olivo);}

/* SUMMARY */
.summary{background:#fff;border:1px solid var(--linea);border-radius:18px;padding:24px;
  position:sticky;top:92px;}
.price-row{display:flex;align-items:baseline;gap:6px;}
.price{font-family:var(--display);font-size:30px;color:var(--olivo);}
.per{color:var(--piedra);font-size:14px;}
.dates{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px;}
.date-box{border:1px solid var(--linea);border-radius:11px;padding:10px 12px;}
.date-box label{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--piedra);}
.date-box b{font-size:15px;color:var(--olivo);}
.guests{margin-top:10px;border:1px solid var(--linea);border-radius:11px;padding:10px 12px;}
.guests label{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--piedra);}
.guests select{width:100%;border:none;background:transparent;font-family:var(--body);font-size:15px;
  color:var(--olivo);outline:none;padding-top:2px;}
.notice{margin-top:14px;background:#f6ede2;border:1px solid var(--oro-soft);color:#8a6a2a;
  padding:10px 12px;border-radius:10px;font-size:13px;}
.breakdown{margin-top:18px;font-size:14px;}
.breakdown>div{display:flex;justify-content:space-between;padding:7px 0;color:#54564a;}
.breakdown .total{border-top:1px solid var(--linea);margin-top:6px;padding-top:12px;
  font-family:var(--display);font-size:18px;color:var(--olivo);}
.full{width:100%;margin-top:18px;text-align:center;}
.reassure{text-align:center;font-size:12px;color:var(--piedra);margin:12px 0 0;}

/* CASA */
.casa{border-top:1px solid var(--linea);}
.casa-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:48px;align-items:start;}
.casa-text{font-size:18px;color:#4a4c40;}
.amen{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px 20px;}
.amen li{position:relative;padding-left:20px;font-size:15px;}
.amen li:before{content:"";position:absolute;left:0;top:8px;width:8px;height:8px;border-radius:50%;
  background:var(--oro);}

/* GALERIA */
.galeria{border-top:1px solid var(--linea);}
.gal-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:180px;gap:12px;}
.gal-item{position:relative;overflow:hidden;border-radius:14px;background-size:cover;background-position:center;}
.gal-item img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s,opacity .4s;}
.gal-item:hover img{transform:scale(1.05);}
.g0{grid-column:span 2;grid-row:span 2;}
.g3{grid-column:span 2;}

/* RESENAS */
.resenas{border-top:1px solid var(--linea);}
.res-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 48px;}
.res-row{display:grid;grid-template-columns:120px 1fr 34px;align-items:center;gap:14px;}
.res-k{font-size:14px;color:#54564a;}
.res-bar{height:5px;background:var(--linea);border-radius:999px;overflow:hidden;}
.res-bar i{display:block;height:100%;background:var(--oro);}
.res-v{font-family:var(--display);font-size:15px;color:var(--olivo);text-align:right;}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:32px;}
.chip{border:1px solid var(--linea);border-radius:999px;padding:8px 16px;font-size:13px;color:var(--olivo);}

/* UBI */
.ubi{border-top:1px solid var(--linea);}
.ubi-text{font-size:18px;color:#4a4c40;max-width:60ch;}

/* FOOT */
.foot{border-top:1px solid var(--linea);background:var(--olivo);color:var(--cal);
  display:flex;justify-content:space-between;flex-wrap:wrap;gap:24px;padding:44px 28px;}
.foot .mark{color:var(--cal);}
.foot-col p{margin:6px 0 0;font-size:14px;color:#d9dccb;}
.foot-col.small{text-align:right;}
.foot-col.small b{color:var(--oro-soft);}
.proto{font-style:italic;opacity:.7;}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(32,38,26,.5);display:flex;align-items:center;
  justify-content:center;padding:20px;z-index:50;}
.dialog{background:var(--cal);border-radius:18px;padding:30px;max-width:400px;width:100%;}
.dialog h3{font-size:24px;color:var(--olivo);margin-bottom:18px;}
.dlg-rows>div{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--linea);font-size:15px;}
.dlg-rows>div span{color:var(--piedra);}
.dlg-rows>div b{color:var(--olivo);}
.dlg-total{border-bottom:none!important;font-family:var(--display);font-size:18px;padding-top:14px!important;}
.dlg-note{font-size:13px;color:#54564a;margin:18px 0 4px;background:#f6ede2;padding:12px;border-radius:10px;}

@media(max-width:900px){
  .hero{grid-template-columns:1fr;min-height:auto;}
  .hero-img{height:52vh;}
  .book-grid{grid-template-columns:1fr;}
  .summary{position:static;}
  .month:nth-child(2){display:none;}
  .casa-grid{grid-template-columns:1fr;gap:26px;}
  .res-grid{grid-template-columns:1fr;}
  .gal-grid{grid-template-columns:repeat(2,1fr);}
  .g0{grid-column:span 2;grid-row:span 1;}
}
@media(max-width:560px){
  .links a:not(.btn-ghost){display:none;}
  .alaluz section{padding:52px 20px;}
  .facts{gap:18px 24px;}
}
@media(prefers-reduced-motion:reduce){
  .alaluz *{transition:none!important;}
}
`;