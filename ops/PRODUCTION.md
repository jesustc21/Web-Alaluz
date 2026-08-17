# Casa Rural Alaluz · Producción

Última revisión: 2026-08-17

## Arquitectura

- Web: Vercel, repositorio `jesustc21/Web-Alaluz`.
- Automatización: n8n en `https://automation.casaruralalaluz.com`.
- Base de datos de reservas/bloqueos: Supabase.
- Pagos: Revolut Merchant API (producción) y entorno Sandbox separado.
- Correo transaccional: `reservas@casaruralalaluz.com` por SMTP.
- Calendarios: sincronización Airbnb → Alaluz y feed Alaluz → Airbnb por iCal.

## Endpoints públicos

- Disponibilidad y tarifas: `https://automation.casaruralalaluz.com/webhook/alaluz-public-availability-v1`
- Solicitud de reserva: `https://automation.casaruralalaluz.com/webhook/alaluz-solicitud-v1`
- Estado tras pago: `https://automation.casaruralalaluz.com/webhook/alaluz-estado-reserva-v1`
- Feed iCal hacia Airbnb: `https://automation.casaruralalaluz.com/webhook/alaluz-web-calendar-9x7k3f4c.ics`

## Reglas de negocio relevantes

- La solicitud inicial no cobra ni bloquea fechas.
- Cada solicitud se revisa antes de habilitar el pago.
- Capacidad máxima: 12 adultos y 20 huéspedes en total.
- Ventana de pago tras preaprobación: 24 horas.
- Fianza por defecto: 200 EUR.
- Objetivo de revisión/devolución de fianza: 48 horas tras la salida.
- Versión legal activa: `2026-08-14`.
- En un límite entre temporadas de igual prioridad prevalece la temporada que empieza ese día.

## Flujos n8n de producción

### Web
- `L65Y31UZkj0chC0H` · Airbnb → Alaluz
- `zAs4eCOuShr2I433` · Solicitud de reserva
- `zZg5sjwiGvL0ZGXw` · Disponibilidad y tarifas públicas
- `toZy6oSPzqfRvvYp` · Alaluz → Airbnb iCal

### Pagos
- `YSS8fQUZpZdBklU3` · Preaprobar y crear checkout
- `QUfPrK4aICuwjIac` · Webhook Revolut HMAC v2
- `ywY6sTuxdBPYmcCd` · Fallback pagos producción
- `ob15k5ZqPoS18MFr` · Monitor reembolsos
- `1icKJ5fl2o3wf31Y` · Merchant GET interno

### Administración
- `9skjIS8KGj5nfSLj` · Panel principal
- `Novkppdl5j5Jz04t` · Solicitudes
- `yqWt1eLZmrwSgSev` · API reservas
- `E79zTepAKdUbBpRY` · API calendario
- `KrQj9mfHYoF44RGB` · Tarifas, ajustes y finanzas

### Comunicaciones
- `gI9DLFAkpLCSQkJ4` · Emails de reservas

### Monitorización
- `jiUdQvEZ9eLeTAZ8` · Errores producción

Los flujos Sandbox y Legacy deben permanecer inactivos salvo pruebas o contingencia controlada.

## Monitorización

Los workflows críticos usan el workflow de error `jiUdQvEZ9eLeTAZ8`, que avisa por SMTP ante fallos de producción.

Además existe una comprobación externa periódica de la web y del endpoint público de disponibilidad.

## Estado de la migración

- Los workflows Alaluz del antiguo n8n de Soluciona están desactivados.
- La web apunta directamente a `automation.casaruralalaluz.com`.
- Se eliminó la redirección temporal que sustituía URLs del servidor antiguo en `window.fetch`.
- Revolut producción está autenticado contra el nuevo servidor.
- El webhook HMAC v2 de Revolut está en el nuevo n8n.
- Los datos de las Data Tables se migraron al nuevo n8n.

## Seguridad pendiente

- Sustituir el acceso administrativo heredado que contiene una clave compartida en lógica de workflows por un mecanismo de autenticación sin secreto embebido en código.
- Revisar firewall, SSH y actualizaciones del VPS mediante acceso al sistema operativo.
- Configurar y probar copias de seguridad del volumen/base de datos de n8n antes de retirar definitivamente el servidor antiguo.

## SEO / lanzamiento

La web mantiene temporalmente `noindex, nofollow`. Los metadatos de título, descripción, canonical y Open Graph están preparados. Retirar `noindex, nofollow` únicamente cuando se decida abrir la indexación pública.

## Backup recomendado

Antes de automatizar backups hay que identificar por SSH la instalación real (Docker Compose, volumen persistente y motor de base de datos). No asumir rutas ni nombres de contenedores. La copia debe incluir como mínimo:

1. Base de datos de n8n.
2. Volumen/configuración persistente de n8n.
3. Archivo Compose y variables de entorno, conservados en un almacén cifrado.
4. Prueba periódica de restauración.
5. Retención de varias generaciones fuera del propio VPS.

Nunca guardar claves de Revolut, Supabase, SMTP ni contraseñas administrativas en este repositorio.
