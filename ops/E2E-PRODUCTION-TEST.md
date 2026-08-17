# Prueba E2E real de producción — Casa Rural Alaluz

Estado: pendiente de ejecución con tarjeta real.

## Objetivo

Validar de extremo a extremo la cadena ya migrada al nuevo VPS/n8n:

web pública → solicitud → revisión humana → preaprobación → creación de checkout Revolut PROD → pago real → webhook HMAC → conciliación → confirmación → emails → calendario interno → iCal Alaluz→Airbnb → cancelación/reembolso de prueba y conciliación del reembolso.

## Principios de seguridad

- La web permanece con aviso visible de construcción y `noindex, nofollow` durante las pruebas.
- No introducir claves, tarjetas ni secretos en logs, GitHub o ChatGPT.
- El pago lo completa manualmente el titular de la tarjeta en la página alojada por Revolut.
- No repetir un cargo si el estado remoto queda incierto: consultar/conciliar primero.
- Usar un importe real mínimo y claramente identificable. Propuesta para la prueba: 2 EUR totales (1 EUR estancia + 1 EUR fianza), solo después de preparar una configuración temporal y reversible.
- Registrar el identificador de solicitud, reserva y orden, pero nunca datos de tarjeta.
- Restaurar tarifas/fianza de producción inmediatamente después de generar el checkout de prueba.
- No eliminar evidencias hasta validar la conciliación y el reembolso.

## Preflight

1. Confirmar que `automation.casaruralalaluz.com` es el origen de todos los endpoints web.
2. Confirmar que Soluciona permanece inactivo para Alaluz.
3. Confirmar webhook Revolut PROD activo y apuntando al nuevo dominio.
4. Confirmar credenciales Supabase, SMTP y Revolut PROD mediante operaciones de lectura/no monetarias.
5. Confirmar que el monitor central de errores está activo y probado.
6. Confirmar disponibilidad pública, feed iCal y panel admin.
7. Comprobar que no existen ejecuciones fallidas recientes que puedan contaminar la prueba.
8. Elegir fechas libres que no interfieran con huéspedes reales.
9. Preparar una tarifa/fianza temporal de prueba de importe mínimo y anotar exactamente los valores originales para restaurarlos.

## Ejecución

1. Abrir la web publicada como un huésped normal.
2. Seleccionar las fechas de prueba.
3. Aceptar condiciones legales versión vigente.
4. Enviar una solicitud con datos de prueba claramente identificados.
5. Verificar que la solicitud aparece en el panel y que llega el email de recepción.
6. Preaprobar desde el panel.
7. Verificar que se crea una única reserva pendiente y una única orden Revolut PROD.
8. Restaurar inmediatamente cualquier tarifa/fianza temporal usada para el test.
9. Abrir el checkout recibido por email.
10. El titular realiza manualmente el pago real.
11. No realizar un segundo intento aunque la página tarde: esperar webhook/fallback y consultar el estado remoto.

## Criterios de aceptación tras el pago

- La orden remota está pagada/completada por el importe exacto y en EUR.
- Solo existe un pago local asociado a la reserva.
- La reserva pasa a confirmada una sola vez.
- La solicitud queda vinculada a la reserva/orden correctas.
- El webhook HMAC se procesa sin error.
- El fallback no duplica ninguna transición ni operación.
- El email de confirmación se envía una sola vez.
- El retorno desde Revolut muestra/termina mostrando reserva confirmada.
- La disponibilidad pública bloquea las fechas.
- El feed iCal contiene exactamente un VEVENT para la reserva web.
- El panel administrativo refleja correctamente pago, estancia y fianza.
- No aparecen ejecuciones fallidas críticas ni alertas inesperadas.

## Prueba de cancelación/reembolso

Solo después de validar el pago:

1. Previsualizar desde el flujo financiero el importe reembolsable.
2. Confirmar que la política seleccionada corresponde al caso de prueba.
3. Ejecutar una única cancelación/reembolso controlado.
4. Verificar la creación de un solo intento/intención de reembolso.
5. Esperar la respuesta de Revolut y/o monitor de reembolsos; no reintentar a ciegas.
6. Confirmar que el importe reembolsado coincide exactamente con el esperado.
7. Confirmar que reserva/solicitud quedan canceladas y las fechas vuelven a estar disponibles.
8. Confirmar que Airbnb/iCal deja de bloquear la reserva web cancelada.
9. Verificar el email de cancelación/reembolso aplicable.

## Cierre

- Guardar IDs técnicos de la prueba en el registro operativo, sin secretos ni datos de tarjeta.
- Confirmar ausencia de duplicados en pagos y reembolsos.
- Confirmar tarifas y fianza restauradas a sus valores previos.
- Confirmar que la web sigue en modo construcción/noindex hasta aprobación final.
- Solo después de una prueba E2E satisfactoria se podrá plantear retirar el aviso, publicar tarifas definitivas y permitir indexación.
