# Alaluz Admin PWA

Frontend privado de administración de Casa Rural Alaluz.

## Objetivo

Separar la interfaz administrativa del HTML generado dentro de n8n sin modificar la lógica de negocio existente. Los workflows n8n continúan siendo el backend y la fuente de verdad para solicitudes, reservas, calendario, tarifas, ajustes y operaciones financieras.

## Desarrollo

```bash
cd admin
npm install
npm run dev
```

Por defecto el frontend llama a `/api/webhook/*`. En desarrollo puede definirse `VITE_API_BASE`, pero nunca debe contener credenciales ni secretos.

## Despliegue previsto

Crear un proyecto Vercel independiente con:

- Repositorio: `jesustc21/Web-Alaluz`
- Rama inicial de pruebas: `feat/alaluz-admin-pwa`
- Root Directory: `admin`
- Framework: Vite
- Dominio final: `admin.casaruralalaluz.com`

El dominio final debe quedar delante de Vercel mediante el proxy de Alaluz, protegido por Basic Auth de Caddy. El mismo origen debe resolver las llamadas `/api/*` hacia n8n para no exponer credenciales en JavaScript ni depender de CORS.

Esquema conceptual de Caddy (sin rutas internas ni secretos):

```caddyfile
admin.casaruralalaluz.com {
    # Reutilizar la autenticación administrativa existente.
    basic_auth {
        <USUARIO> <HASH_CADDY>
    }

    handle_path /api/* {
        # Enviar al backend n8n preservando la ruta /webhook/...
        reverse_proxy <BACKEND_N8N>
    }

    handle {
        reverse_proxy <VERCEL_ADMIN_HOST>
    }
}
```

La configuración real debe adaptarse al upstream interno existente. No guardar usuario, hash, tokens, claves de Revolut, Supabase ni credenciales n8n en este repositorio.

## Endpoints usados

Todos se consumen bajo `/api/webhook/` y corresponden a los workflows actuales:

- `alaluz-admin-solicitudes-v1`
- `alaluz-admin-solicitudes-preaprobar-v1`
- `alaluz-admin-solicitudes-rechazar-v1`
- `alaluz-admin-reservas-v1`
- `alaluz-admin-reservas-reenviar-pago-v1`
- `alaluz-admin-calendar-v1`
- `alaluz-admin-api-v1`
- `alaluz-admin-finance-v1`

## Seguridad financiera

El frontend conserva las confirmaciones explícitas que exige el backend:

- Preaprobación: `GENERAR PAGO`
- Devolución de fianza: `DEVOLVER FIANZA`
- Cancelación financiera: `CANCELAR Y REEMBOLSAR`

Estas frases no son secretos; son barreras operativas. Las validaciones, locks, idempotencia, comprobación de importes y verificación contra Revolut siguen ejecutándose exclusivamente en n8n.

## PWA

Incluye manifest, iconos y service worker. El service worker no intercepta ni cachea `/api/*`; los datos administrativos y financieros siempre se solicitan al backend en tiempo real.

Las notificaciones push se incorporarán en una fase posterior. WhatsApp queda expresamente fuera del alcance de esta fase.
