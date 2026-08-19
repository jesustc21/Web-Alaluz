const API_BASE = (import.meta.env.VITE_API_BASE || '/api/webhook').replace(/\/$/, '')

const paths = {
  solicitudes: 'alaluz-admin-solicitudes-v1',
  preaprobar: 'alaluz-admin-solicitudes-preaprobar-v1',
  rechazar: 'alaluz-admin-solicitudes-rechazar-v1',
  reservas: 'alaluz-admin-reservas-v1',
  reenviarPago: 'alaluz-admin-reservas-reenviar-pago-v1',
  calendario: 'alaluz-admin-calendar-v1',
  admin: 'alaluz-admin-api-v1',
  finanzas: 'alaluz-admin-finance-v1',
}

function describeError(data, status) {
  const raw = data?.error ?? data?.message
  if (typeof raw === 'string' && raw.trim()) return raw
  if (raw && typeof raw === 'object') {
    if (typeof raw.message === 'string' && raw.message.trim()) return raw.message
    if (typeof raw.code === 'string' && raw.code.trim()) return `${raw.code} (HTTP ${status})`
  }
  return `Backend no disponible (HTTP ${status})`
}

async function request(path, body = {}) {
  const response = await fetch(`${API_BASE}/${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Backend no disponible (HTTP ${response.status})`)
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    const error = new Error(describeError(data, response.status))
    error.status = response.status
    error.data = data
    throw error
  }
  return data
}

export const api = {
  listarSolicitudes: () => request(paths.solicitudes),
  preaprobarSolicitud: (solicitudId) => request(paths.preaprobar, {
    solicitud_id: solicitudId,
    confirm: true,
    confirm_text: 'GENERAR PAGO',
  }),
  rechazarSolicitud: (solicitudId, tipo, explicacion) => request(paths.rechazar, {
    solicitud_id: solicitudId,
    rechazo_tipo: tipo,
    rechazo_explicacion: explicacion,
    confirm: true,
  }),
  listarReservas: () => request(paths.reservas),
  reenviarPago: (id) => request(paths.reenviarPago, { id }),
  calendario: (month) => request(paths.calendario, { month }),
  configuracion: () => request(paths.admin, { action: 'list' }),
  guardarTarifa: (data, excepcion = false) => request(paths.admin, {
    action: excepcion ? 'saveExcepcion' : 'saveTarifa',
    data,
  }),
  eliminarTarifa: (id, excepcion = false) => request(paths.admin, {
    action: excepcion ? 'deleteExcepcion' : 'deleteTarifa',
    data: { id },
  }),
  guardarAjustes: (data) => request(paths.admin, { action: 'saveAjustes', data }),
  previewCancelacion: (reservaId, tipo) => request(paths.finanzas, {
    action: 'previewCancel',
    reserva_id: reservaId,
    cancelacion_tipo: tipo,
  }),
  cancelarYReembolsar: (reservaId, tipo, motivo = '') => request(paths.finanzas, {
    action: 'cancelRefund',
    reserva_id: reservaId,
    cancelacion_tipo: tipo,
    confirm_text: 'CANCELAR Y REEMBOLSAR',
    motivo,
  }),
  devolverFianza: (reservaId, importeCentimos) => request(paths.finanzas, {
    action: 'refundFianza',
    reserva_id: reservaId,
    importe_fianza_centimos: importeCentimos,
    confirm_text: 'DEVOLVER FIANZA',
  }),
}

export { API_BASE }
