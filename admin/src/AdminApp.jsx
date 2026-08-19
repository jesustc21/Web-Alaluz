import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from './api.js'

const SECTIONS = [
  { id: 'solicitudes', label: 'Solicitudes', icon: '✦' },
  { id: 'reservas', label: 'Reservas', icon: '⌂' },
  { id: 'calendario', label: 'Calendario', icon: '▦' },
  { id: 'tarifas', label: 'Tarifas', icon: '€' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙' },
]

const money = (value) => Number(value || 0).toLocaleString('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

const moneyCent = (value) => money(Number(value || 0) / 100)

function formatDate(value) {
  if (!value) return '—'
  const raw = String(value).slice(0, 10)
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : raw
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return formatDate(value)
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function currentMadridMonth() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date())
  const p = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${p.year}-${p.month}`
}

function monthShift(month, delta) {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, mon - 1 + delta, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthTitle(month) {
  const [year, mon] = month.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, mon - 1, 1)))
}

function isoDay(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isCheckoutAlive(reserva) {
  if (!reserva.checkout_url || reserva.pago_estado !== 'pending') return false
  if (!reserva.pago_expira_en) return true
  return Date.now() < new Date(reserva.pago_expira_en).getTime()
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.length === 9) return `34${digits}`
  return digits
}

function matchingTariff(date, tarifas, excepciones) {
  const rows = [
    ...excepciones.map((item) => ({ ...item, _kind: 'especial' })),
    ...tarifas.map((item) => ({ ...item, _kind: 'temporada' })),
  ].filter((item) => item.activa !== false && item.desde && item.hasta && date >= item.desde && date <= item.hasta)

  if (!rows.length) return { status: 'missing' }
  const maxPriority = Math.max(...rows.map((item) => Number(item.prioridad || 0)))
  const top = rows.filter((item) => Number(item.prioridad || 0) === maxPriority)
  let selected = top[0]

  if (top.length > 1) {
    const startingToday = top.filter((item) => item.desde === date)
    if (startingToday.length === 1) selected = startingToday[0]
    else return { status: 'conflict', rows: top }
  }

  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()
  const field = weekday === 0
    ? 'precio_domingo'
    : weekday === 5
      ? 'precio_viernes'
      : weekday === 6
        ? 'precio_sabado'
        : 'precio_lun_jue'

  return {
    status: 'ok',
    row: selected,
    price: Number(selected[field] || 0),
    kind: selected._kind,
  }
}

function StatusPill({ children, tone = 'neutral' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-mark">✓</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function RequestsView({ rows, onRefresh, onPreapprove, onReject, busy }) {
  const pending = rows.filter((item) => item.estado === 'pendiente_revision')

  return (
    <section>
      <div className="section-head">
        <div>
          <p className="eyebrow">Entrada de reservas</p>
          <h1>Solicitudes</h1>
          <p className="section-copy">Revisa cada grupo antes de generar un checkout real.</p>
        </div>
        <button className="button secondary" onClick={onRefresh} disabled={busy}>Actualizar</button>
      </div>

      <div className="summary-strip">
        <div><strong>{pending.length}</strong><span>Pendientes</span></div>
        <div><strong>{rows.filter((x) => x.estado === 'preaprobada').length}</strong><span>Preaprobadas</span></div>
        <div><strong>{rows.filter((x) => x.estado === 'rechazada').length}</strong><span>Rechazadas</span></div>
      </div>

      {!pending.length ? (
        <EmptyState title="Todo revisado" text="No hay solicitudes pendientes de revisión." />
      ) : (
        <div className="cards-list">
          {pending.map((item) => (
            <article className="request-card" key={item.solicitud_id}>
              <div className="card-topline">
                <div>
                  <span className="card-kicker">{formatDate(item.fecha_entrada)} → {formatDate(item.fecha_salida)}</span>
                  <h2>{item.nombre || 'Huésped'}</h2>
                </div>
                <StatusPill tone="warning">Pendiente</StatusPill>
              </div>

              <div className="metric-grid">
                <div><span>Grupo</span><b>{item.adultos || 0} adultos · {item.menores || 0} menores</b></div>
                <div><span>Total</span><b>{money(item.importe_total)}</b></div>
                <div><span>Alojamiento</span><b>{money(item.importe_estancia)}</b></div>
                <div><span>Fianza</span><b>{money(item.fianza)}</b></div>
              </div>

              <div className="contact-line">
                <a href={`mailto:${item.email}`}>{item.email}</a>
                <span>·</span>
                <a href={`tel:${item.telefono}`}>{item.telefono}</a>
              </div>

              <div className="request-copy">
                {item.motivo_estancia && <p><b>Motivo:</b> {item.motivo_estancia}</p>}
                {item.descripcion_grupo && <p>{item.descripcion_grupo}</p>}
              </div>

              <div className="warning-box compact">
                Preaprobar crea un pago de <b>PRODUCCIÓN</b> y bloquea las fechas durante 24 horas.
              </div>

              <div className="action-row">
                <button className="button primary" disabled={busy} onClick={() => onPreapprove(item)}>
                  Preaprobar y generar pago
                </button>
                <button className="button danger-ghost" disabled={busy} onClick={() => onReject(item)}>
                  Rechazar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function ReservationsView({ rows, onRefresh, onResend, onRefundBond, onCancel, busy }) {
  const [stateFilter, setStateFilter] = useState('activas')
  const [environment, setEnvironment] = useState('produccion')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => rows.filter((item) => {
    if (environment !== 'todos' && item.entorno !== environment) return false
    if (stateFilter === 'activas' && item.estado === 'cancelada') return false
    if (stateFilter !== 'todas' && stateFilter !== 'activas' && item.estado !== stateFilter) return false
    const haystack = `${item.nombre} ${item.email} ${item.telefono} ${item.id}`.toLowerCase()
    return haystack.includes(query.toLowerCase().trim())
  }), [rows, environment, stateFilter, query])

  return (
    <section>
      <div className="section-head">
        <div>
          <p className="eyebrow">Operación</p>
          <h1>Reservas</h1>
          <p className="section-copy">Estado de estancia, pago y fianza en una sola vista.</p>
        </div>
        <button className="button secondary" onClick={onRefresh} disabled={busy}>Actualizar</button>
      </div>

      <div className="filters-card">
        <input className="input search" placeholder="Buscar huésped, email, teléfono…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="activas">Activas</option>
          <option value="confirmada">Confirmadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="cancelada">Canceladas</option>
          <option value="todas">Todas</option>
        </select>
        <select className="input" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
          <option value="produccion">Producción</option>
          <option value="sandbox">Sandbox</option>
          <option value="todos">Todos los entornos</option>
        </select>
      </div>

      <p className="results-count">{visible.length} reservas</p>

      {!visible.length ? (
        <EmptyState title="Sin resultados" text="No hay reservas que coincidan con estos filtros." />
      ) : (
        <div className="cards-list">
          {visible.map((item) => {
            const whatsapp = normalizePhone(item.telefono)
            const checkoutAlive = isCheckoutAlive(item)
            const canRefundBond = Boolean(item.fianza_disponible && Number(item.fianza_pendiente) > 0)
            const isPaid = item.pago_estado === 'completed'
            return (
              <article className="reservation-card" key={item.id}>
                <div className="card-topline">
                  <div>
                    <span className="card-kicker">{formatDate(item.fecha_entrada)} → {formatDate(item.fecha_salida)}</span>
                    <h2>{item.nombre || 'Huésped'}</h2>
                  </div>
                  <div className="pill-stack">
                    <StatusPill tone={item.estado === 'confirmada' ? 'success' : item.estado === 'cancelada' ? 'danger' : 'warning'}>{item.estado}</StatusPill>
                    {item.entorno === 'sandbox' && <StatusPill>Sandbox</StatusPill>}
                  </div>
                </div>

                <div className="metric-grid reservation-metrics">
                  <div><span>Huéspedes</span><b>{item.huespedes || '—'}</b></div>
                  <div><span>Alojamiento</span><b>{money(item.importe)}</b></div>
                  <div><span>Pago</span><b>{item.pago_estado || '—'}</b></div>
                  <div><span>Total cobrado</span><b>{item.importe_total == null ? '—' : money(item.importe_total)}</b></div>
                </div>

                <div className="contact-line wrap">
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                  <span>·</span>
                  <a href={`tel:${item.telefono}`}>{item.telefono}</a>
                  {whatsapp && <><span>·</span><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a></>}
                </div>

                {item.fianza != null && (
                  <div className="bond-box">
                    <div><span>Fianza</span><b>{money(item.fianza)}</b></div>
                    <div><span>Devuelta</span><b>{money(item.fianza_reembolso)}</b></div>
                    <div><span>Pendiente</span><b>{money(item.fianza_pendiente)}</b></div>
                    <div><span>Estado</span><b>{item.fianza_estado || '—'}</b></div>
                  </div>
                )}

                {item.solicitud_id && <p className="reference">Solicitud: {item.solicitud_id}</p>}

                <div className="action-row">
                  {checkoutAlive && <a className="button primary" href={item.checkout_url} target="_blank" rel="noreferrer">Abrir pago</a>}
                  {checkoutAlive && <button className="button secondary" disabled={busy} onClick={() => onResend(item)}>Reenviar pago</button>}
                  {canRefundBond && <button className="button secondary" disabled={busy} onClick={() => onRefundBond(item)}>Devolver fianza</button>}
                  {isPaid && item.estado !== 'cancelada' && <button className="button danger-ghost" disabled={busy} onClick={() => onCancel(item, 'huesped')}>Cancelar huésped</button>}
                  {isPaid && item.estado !== 'cancelada' && <button className="button danger-ghost" disabled={busy} onClick={() => onCancel(item, 'anfitrion')}>Cancelar anfitrión</button>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function CalendarView({ month, setMonth, calendar, tarifas, excepciones, onLoad, busy }) {
  useEffect(() => { onLoad(month) }, [month, onLoad])

  const [year, mon] = month.split('-').map(Number)
  const days = new Date(Date.UTC(year, mon, 0)).getUTCDate()
  const firstDay = new Date(Date.UTC(year, mon - 1, 1)).getUTCDay()
  const mondayOffset = (firstDay + 6) % 7
  const cells = Array.from({ length: mondayOffset }, () => null)
    .concat(Array.from({ length: days }, (_, index) => index + 1))

  function dayEvents(day) {
    const date = isoDay(year, mon, day)
    const bookings = (calendar?.reservas || []).filter((item) => date >= String(item.fecha_entrada).slice(0, 10) && date < String(item.fecha_salida).slice(0, 10))
    const blocks = (calendar?.bloqueos || []).filter((item) => date >= String(item.fecha_entrada).slice(0, 10) && date < String(item.fecha_salida).slice(0, 10))
    return { bookings, blocks, tariff: matchingTariff(date, tarifas, excepciones) }
  }

  return (
    <section>
      <div className="section-head calendar-heading">
        <div>
          <p className="eyebrow">Ocupación y precio</p>
          <h1>Calendario</h1>
          <p className="section-copy">Airbnb, reservas directas y tarifa aplicable por noche.</p>
        </div>
        <div className="month-controls">
          <button className="icon-button" onClick={() => setMonth(monthShift(month, -1))}>‹</button>
          <strong>{monthTitle(month)}</strong>
          <button className="icon-button" onClick={() => setMonth(monthShift(month, 1))}>›</button>
        </div>
      </div>

      <div className="calendar-legend">
        <span><i className="legend-dot direct" /> Reserva web</span>
        <span><i className="legend-dot airbnb" /> Airbnb</span>
        <span><i className="legend-dot tariff" /> Tarifa</span>
      </div>

      <div className={`calendar ${busy ? 'is-loading' : ''}`}>
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((label) => <div className="weekday" key={label}>{label}</div>)}
        {cells.map((day, index) => {
          if (!day) return <div className="calendar-day outside" key={`empty-${index}`} />
          const { bookings, blocks, tariff } = dayEvents(day)
          return (
            <div className={`calendar-day ${bookings.length || blocks.length ? 'occupied' : ''}`} key={day}>
              <div className="calendar-day-head">
                <b>{day}</b>
                {tariff.status === 'ok' && <span className="day-price">{money(tariff.price).replace(',00', '')}</span>}
                {tariff.status === 'missing' && <span className="day-warning" title="Sin tarifa">!</span>}
                {tariff.status === 'conflict' && <span className="day-warning conflict" title="Conflicto de tarifa">!!</span>}
              </div>
              <div className="day-events">
                {blocks.map((item) => <span className="day-event airbnb" key={`b-${item.id}`}>Airbnb</span>)}
                {bookings.map((item) => <span className={`day-event direct ${item.estado}`} key={`r-${item.id}`}>{item.estado === 'confirmada' ? 'Web' : 'Pend.'}</span>)}
                {tariff.status === 'ok' && <span className="tariff-name">{tariff.row.nombre}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TariffModal({ initial, isException, onClose, onSave, busy }) {
  const legacyMismatch = Boolean(initial && (
    Number(initial.precio_domingo) !== Number(initial.precio_lun_jue)
    || Number(initial.precio_sabado) !== Number(initial.precio_viernes)
  ))
  const [form, setForm] = useState({
    id: initial?.id || '',
    nombre: initial?.nombre || '',
    desde: initial?.desde || '',
    hasta: initial?.hasta || '',
    sunThu: initial?.precio_lun_jue ?? '',
    friSat: initial?.precio_viernes ?? '',
    min_noches: initial?.min_noches || 1,
    prioridad: initial?.prioridad ?? (isException ? 10 : 0),
    activa: initial?.activa !== false,
    nota: initial?.nota || '',
  })
  const [unify, setUnify] = useState(!legacyMismatch)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  function submit(event) {
    event.preventDefault()
    if (legacyMismatch && !unify) return
    onSave({
      id: form.id,
      nombre: form.nombre.trim(),
      desde: form.desde,
      hasta: form.hasta,
      precio_lun_jue: Number(form.sunThu),
      precio_domingo: Number(form.sunThu),
      precio_viernes: Number(form.friSat),
      precio_sabado: Number(form.friSat),
      min_noches: Number(form.min_noches),
      prioridad: Number(form.prioridad),
      activa: Boolean(form.activa),
      nota: form.nota.trim(),
    }, isException)
  }

  return (
    <Modal title={`${initial ? 'Editar' : 'Nueva'} ${isException ? 'fecha especial' : 'temporada'}`} onClose={onClose}>
      <form className="form-grid" onSubmit={submit}>
        {legacyMismatch && (
          <div className="warning-box form-span">
            Esta tarifa antigua tenía precios diferentes entre domingo/lunes-jueves o viernes/sábado. Al guardar se unificará al nuevo modelo.
            <label className="check-line"><input type="checkbox" checked={unify} onChange={(e) => setUnify(e.target.checked)} /> Confirmo que quiero unificar estos precios.</label>
          </div>
        )}
        <label className="form-span">Nombre<input className="input" required value={form.nombre} onChange={(e) => update('nombre', e.target.value)} /></label>
        <label>Desde<input className="input" type="date" required value={form.desde} onChange={(e) => update('desde', e.target.value)} /></label>
        <label>Hasta<input className="input" type="date" required value={form.hasta} onChange={(e) => update('hasta', e.target.value)} /></label>
        <label>Domingo–jueves (€)<input className="input" type="number" min="0.01" step="0.01" required value={form.sunThu} onChange={(e) => update('sunThu', e.target.value)} /></label>
        <label>Viernes–sábado (€)<input className="input" type="number" min="0.01" step="0.01" required value={form.friSat} onChange={(e) => update('friSat', e.target.value)} /></label>
        <label>Mínimo noches<input className="input" type="number" min="1" step="1" required value={form.min_noches} onChange={(e) => update('min_noches', e.target.value)} /></label>
        <label>Prioridad<input className="input" type="number" step="1" required value={form.prioridad} onChange={(e) => update('prioridad', e.target.value)} /></label>
        <label className="form-span">Nota<input className="input" value={form.nota} onChange={(e) => update('nota', e.target.value)} /></label>
        <label className="check-line form-span"><input type="checkbox" checked={form.activa} onChange={(e) => update('activa', e.target.checked)} /> Tarifa activa</label>
        <div className="modal-actions form-span">
          <button type="button" className="button secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="button primary" disabled={busy || (legacyMismatch && !unify)}>Guardar</button>
        </div>
      </form>
    </Modal>
  )
}

function TariffsView({ tarifas, excepciones, onNew, onEdit, onDelete, busy }) {
  const renderList = (rows, isException) => (
    <div className="tariff-list">
      {rows.length === 0 ? <p className="muted">Todavía no hay registros.</p> : rows.map((item) => {
        const legacyMismatch = Number(item.precio_domingo) !== Number(item.precio_lun_jue)
          || Number(item.precio_sabado) !== Number(item.precio_viernes)
        return (
          <article className="tariff-card" key={item.id}>
            <div className="tariff-main">
              <div className="card-topline compact-line">
                <div><h3>{item.nombre}</h3><span className="muted">{formatDate(item.desde)} → {formatDate(item.hasta)}</span></div>
                <StatusPill tone={item.activa === false ? 'neutral' : 'success'}>{item.activa === false ? 'Inactiva' : 'Activa'}</StatusPill>
              </div>
              <div className="tariff-prices">
                <div><span>Dom–Jue</span><b>{money(item.precio_lun_jue)}</b></div>
                <div><span>Vie–Sáb</span><b>{money(item.precio_viernes)}</b></div>
                <div><span>Mínimo</span><b>{item.min_noches || 1} noches</b></div>
                <div><span>Prioridad</span><b>{item.prioridad || 0}</b></div>
              </div>
              {legacyMismatch && <p className="legacy-note">⚠ Registro heredado con precios diarios distintos. Se unificará al editar.</p>}
              {item.nota && <p className="muted">{item.nota}</p>}
            </div>
            <div className="tariff-actions">
              <button className="button secondary small" disabled={busy} onClick={() => onEdit(item, isException)}>Editar</button>
              <button className="button danger-ghost small" disabled={busy} onClick={() => onDelete(item, isException)}>Eliminar</button>
            </div>
          </article>
        )
      })}
    </div>
  )

  return (
    <section>
      <div className="section-head">
        <div>
          <p className="eyebrow">Motor de precios</p>
          <h1>Tarifas</h1>
          <p className="section-copy">Modelo simplificado: domingo–jueves y viernes–sábado.</p>
        </div>
      </div>

      <div className="subsection-head"><div><h2>Temporadas</h2><p>Tarifa base para rangos de fechas.</p></div><button className="button primary" onClick={() => onNew(false)}>Nueva temporada</button></div>
      {renderList(tarifas, false)}

      <div className="subsection-head second"><div><h2>Fechas especiales</h2><p>Overrides con prioridad superior para puentes, festivos o eventos.</p></div><button className="button secondary" onClick={() => onNew(true)}>Nueva fecha especial</button></div>
      {renderList(excepciones, true)}
    </section>
  )
}

function SettingsView({ ajustes, onSave, busy }) {
  const fianzaRow = ajustes.find((item) => item.clave === 'fianza_importe')
  const horasRow = ajustes.find((item) => item.clave === 'fianza_devolucion_horas')
  const [fianza, setFianza] = useState(fianzaRow?.valor_numero ?? 200)
  const [horas, setHoras] = useState(horasRow?.valor_numero ?? 48)

  useEffect(() => {
    setFianza(fianzaRow?.valor_numero ?? 200)
    setHoras(horasRow?.valor_numero ?? 48)
  }, [fianzaRow?.valor_numero, horasRow?.valor_numero])

  return (
    <section>
      <div className="section-head">
        <div>
          <p className="eyebrow">Configuración de negocio</p>
          <h1>Ajustes</h1>
          <p className="section-copy">Valores usados por nuevas solicitudes y por la operativa de fianza.</p>
        </div>
      </div>

      <form className="settings-card" onSubmit={(event) => {
        event.preventDefault()
        onSave({ fianza_importe: Number(fianza), fianza_devolucion_horas: Number(horas) })
      }}>
        <label>Fianza por defecto (€)<input className="input" type="number" min="0" step="1" value={fianza} onChange={(e) => setFianza(e.target.value)} /></label>
        <label>Objetivo revisión/devolución (horas)<input className="input" type="number" min="0" step="1" value={horas} onChange={(e) => setHoras(e.target.value)} /></label>
        <div className="info-box">Estos cambios afectan a solicitudes nuevas. Las reservas existentes conservan los valores con los que fueron creadas.</div>
        <button className="button primary" disabled={busy}>Guardar ajustes</button>
      </form>
    </section>
  )
}

export default function AdminApp() {
  const [section, setSection] = useState('solicitudes')
  const [solicitudes, setSolicitudes] = useState([])
  const [reservas, setReservas] = useState([])
  const [config, setConfig] = useState({ tarifas: [], excepciones: [], ajustes: [] })
  const [calendar, setCalendar] = useState({ reservas: [], bloqueos: [] })
  const [month, setMonth] = useState(currentMadridMonth())
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [paymentLink, setPaymentLink] = useState('')
  const [tariffModal, setTariffModal] = useState(null)

  const pendingCount = solicitudes.filter((item) => item.estado === 'pendiente_revision').length

  const handleError = useCallback((err) => {
    setError(err?.message || 'Se ha producido un error')
  }, [])

  const loadCore = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [requestsData, reservationsData, configData] = await Promise.all([
        api.listarSolicitudes(),
        api.listarReservas(),
        api.configuracion(),
      ])
      setSolicitudes(requestsData.solicitudes || [])
      setReservas(reservationsData.reservas || [])
      setConfig({
        tarifas: configData.tarifas || [],
        excepciones: configData.excepciones || [],
        ajustes: configData.ajustes || [],
      })
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [handleError])

  useEffect(() => { loadCore() }, [loadCore])

  const refreshRequests = useCallback(async () => {
    setBusy(true)
    try {
      const data = await api.listarSolicitudes()
      setSolicitudes(data.solicitudes || [])
    } catch (err) { handleError(err) } finally { setBusy(false) }
  }, [handleError])

  const refreshReservations = useCallback(async () => {
    setBusy(true)
    try {
      const data = await api.listarReservas()
      setReservas(data.reservas || [])
    } catch (err) { handleError(err) } finally { setBusy(false) }
  }, [handleError])

  const refreshConfig = useCallback(async () => {
    const data = await api.configuracion()
    setConfig({ tarifas: data.tarifas || [], excepciones: data.excepciones || [], ajustes: data.ajustes || [] })
  }, [])

  const loadCalendar = useCallback(async (targetMonth) => {
    setBusy(true)
    try {
      const data = await api.calendario(targetMonth)
      setCalendar({ reservas: data.reservas || [], bloqueos: data.bloqueos || [] })
    } catch (err) { handleError(err) } finally { setBusy(false) }
  }, [handleError])

  async function runAction(work, successMessage) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await work()
      if (successMessage) setNotice(successMessage)
      return result
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function preapprove(item) {
    if (!window.confirm('Vas a generar un enlace de pago REAL y bloquear las fechas durante 24 h. ¿Continuar?')) return
    const text = window.prompt('Escribe exactamente GENERAR PAGO')
    if (text !== 'GENERAR PAGO') {
      if (text !== null) setError('Confirmación no válida. No se ha generado ningún pago.')
      return
    }
    const result = await runAction(() => api.preaprobarSolicitud(item.solicitud_id), 'Solicitud preaprobada y enlace enviado por email.')
    if (result?.checkout_url) setPaymentLink(result.checkout_url)
    if (result) await Promise.all([refreshRequests(), refreshReservations()])
  }

  async function reject(item) {
    const tipo = window.prompt('Categoría interna del rechazo', 'otro')
    if (tipo === null) return
    const explanation = window.prompt('Explicación que recibirá el huésped (mínimo 10 caracteres):')
    if (!explanation || explanation.trim().length < 10) {
      setError('La explicación del rechazo debe tener al menos 10 caracteres.')
      return
    }
    if (!window.confirm(`¿Confirmar el rechazo de la solicitud de ${item.nombre}?`)) return
    const result = await runAction(
      () => api.rechazarSolicitud(item.solicitud_id, tipo.trim() || 'otro', explanation.trim()),
      'Solicitud rechazada.',
    )
    if (result) await refreshRequests()
  }

  async function resendPayment(item) {
    if (!window.confirm(`¿Reenviar a ${item.email} el enlace de pago existente?`)) return
    const result = await runAction(() => api.reenviarPago(item.id), 'Enlace de pago reenviado por email.')
    if (result) await refreshReservations()
  }

  async function refundBond(item) {
    const max = Number(item.fianza_pendiente || 0)
    const entered = window.prompt(`Importe de fianza a devolver. Máximo ${money(max)}:`, String(max))
    if (entered === null) return
    const amount = Number(String(entered).replace(',', '.'))
    if (!Number.isFinite(amount) || amount <= 0 || amount > max) {
      setError('Importe de fianza no válido.')
      return
    }
    if (!window.confirm(`ATENCIÓN: se solicitará una devolución REAL de ${money(amount)} a Revolut. ¿Continuar?`)) return
    const text = window.prompt('Escribe exactamente DEVOLVER FIANZA')
    if (text !== 'DEVOLVER FIANZA') {
      if (text !== null) setError('Confirmación no válida. No se ha enviado ninguna devolución.')
      return
    }
    const result = await runAction(
      () => api.devolverFianza(item.id, Math.round(amount * 100)),
      'Devolución enviada a Revolut. El monitor conciliará su estado final.',
    )
    if (result) await refreshReservations()
  }

  async function cancelReservation(item, type) {
    const preview = await runAction(() => api.previewCancelacion(item.id, type))
    if (!preview) return
    const p = preview.preview || {}
    const policy = p.politica || {}
    const summary = [
      `Cancelación: ${type === 'anfitrion' ? 'por anfitrión' : 'por huésped'}`,
      `Días hasta entrada: ${policy.dias_hasta_entrada ?? '—'}`,
      `Reembolso alojamiento: ${moneyCent(p.alojamiento_centimos)}`,
      `Reembolso fianza: ${moneyCent(p.fianza_centimos)}`,
      `TOTAL: ${moneyCent(p.total_centimos)}`,
    ].join('\n')
    if (!window.confirm(`${summary}\n\n¿Continuar con esta cancelación?`)) return
    if (!window.confirm('ATENCIÓN: esta operación puede mover dinero REAL en Revolut y cancelar la reserva. ¿Confirmas?')) return
    const text = window.prompt('Escribe exactamente CANCELAR Y REEMBOLSAR')
    if (text !== 'CANCELAR Y REEMBOLSAR') {
      if (text !== null) setError('Confirmación no válida. La reserva no se ha cancelado.')
      return
    }
    const reason = window.prompt('Motivo interno (opcional):', type === 'anfitrion' ? 'Cancelación por anfitrión' : 'Cancelación por huésped') || ''
    const result = await runAction(
      () => api.cancelarYReembolsar(item.id, type, reason.trim()),
      'Cancelación procesada. Si existe reembolso, su estado final será conciliado por el monitor.',
    )
    if (result) await Promise.all([refreshReservations(), refreshRequests()])
  }

  async function saveTariff(data, isException) {
    const result = await runAction(() => api.guardarTarifa(data, isException), 'Tarifa guardada.')
    if (result) {
      setTariffModal(null)
      try { await refreshConfig() } catch (err) { handleError(err) }
    }
  }

  async function deleteTariff(item, isException) {
    if (!window.confirm(`¿Eliminar “${item.nombre}”?`)) return
    const result = await runAction(() => api.eliminarTarifa(item.id, isException), 'Tarifa eliminada.')
    if (result) {
      try { await refreshConfig() } catch (err) { handleError(err) }
    }
  }

  async function saveSettings(data) {
    const result = await runAction(() => api.guardarAjustes(data), 'Ajustes guardados.')
    if (result) {
      try { await refreshConfig() } catch (err) { handleError(err) }
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div><strong>Alaluz</strong><span>Administración</span></div>
        </div>
        <nav className="side-nav">
          {SECTIONS.map((item) => (
            <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
              {item.id === 'solicitudes' && pendingCount > 0 && <b className="nav-badge">{pendingCount}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className="status-dot" /> Producción
        </div>
      </aside>

      <main className="main-area">
        <header className="mobile-head">
          <div className="brand compact"><div className="brand-mark">A</div><div><strong>Alaluz</strong><span>Admin</span></div></div>
          <span className="prod-label"><i className="status-dot" /> PROD</span>
        </header>

        <div className="content">
          {loading && <div className="loading-card"><div className="spinner" /><p>Cargando Alaluz…</p></div>}
          {!loading && error && <div className="alert error"><b>Error</b><span>{error}</span><button onClick={() => setError('')}>×</button></div>}
          {!loading && notice && <div className="alert success"><b>Correcto</b><span>{notice}</span><button onClick={() => setNotice('')}>×</button></div>}

          {!loading && section === 'solicitudes' && <RequestsView rows={solicitudes} onRefresh={refreshRequests} onPreapprove={preapprove} onReject={reject} busy={busy} />}
          {!loading && section === 'reservas' && <ReservationsView rows={reservas} onRefresh={refreshReservations} onResend={resendPayment} onRefundBond={refundBond} onCancel={cancelReservation} busy={busy} />}
          {!loading && section === 'calendario' && <CalendarView month={month} setMonth={setMonth} calendar={calendar} tarifas={config.tarifas} excepciones={config.excepciones} onLoad={loadCalendar} busy={busy} />}
          {!loading && section === 'tarifas' && <TariffsView tarifas={config.tarifas} excepciones={config.excepciones} onNew={(isException) => setTariffModal({ initial: null, isException })} onEdit={(initial, isException) => setTariffModal({ initial, isException })} onDelete={deleteTariff} busy={busy} />}
          {!loading && section === 'ajustes' && <SettingsView ajustes={config.ajustes} onSave={saveSettings} busy={busy} />}
        </div>
      </main>

      <nav className="bottom-nav">
        {SECTIONS.map((item) => (
          <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}>
            <span>{item.icon}</span><small>{item.label}</small>
            {item.id === 'solicitudes' && pendingCount > 0 && <b className="nav-badge">{pendingCount}</b>}
          </button>
        ))}
      </nav>

      {busy && <div className="busy-bar" />}

      {paymentLink && (
        <Modal title="Preaprobada correctamente" onClose={() => setPaymentLink('')}>
          <p>El checkout real se ha generado y también se ha enviado al huésped por email.</p>
          <div className="modal-actions">
            <button className="button secondary" onClick={async () => {
              try { await navigator.clipboard.writeText(paymentLink); setNotice('Enlace copiado.') } catch { window.prompt('Copia el enlace:', paymentLink) }
            }}>Copiar enlace</button>
            <a className="button primary" href={paymentLink} target="_blank" rel="noreferrer">Abrir pago real</a>
          </div>
        </Modal>
      )}

      {tariffModal && (
        <TariffModal initial={tariffModal.initial} isException={tariffModal.isException} onClose={() => setTariffModal(null)} onSave={saveTariff} busy={busy} />
      )}
    </div>
  )
}
