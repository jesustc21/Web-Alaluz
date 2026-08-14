export const LEGAL_VERSION = "2026-08-14";

export const company = {
  name: "BATAR INVESTMENT GROUP, S.L.",
  cif: "B16738643",
  address: "Calle Lictores, 22, esc. 2, 1A, 41018 Sevilla",
  email: "reservas@casaruralalaluz.com",
  registry: "Registro Mercantil de Sevilla: Tomo 7104, Libro 0, Folio 170, Sección 8, Hoja SE-131651, Inscripción 1",
  tourism: "CR/SE/00382",
};

export const legalPages = {
  aviso: {
    title: "Aviso legal",
    sections: [
      ["Titular del sitio", `Este sitio web y el servicio de solicitud y reserva directa de Casa Rural Alaluz son titularidad de ${company.name}, CIF ${company.cif}, con domicilio en ${company.address}. Contacto: ${company.email}. ${company.registry}. Registro turístico del alojamiento: ${company.tourism}.`],
      ["Objeto", "La web facilita información sobre Casa Rural Alaluz, consulta de disponibilidad, cálculo orientativo y final de precios, envío de solicitudes de estancia y, cuando una solicitud sea preaprobada, contratación y pago de la reserva."],
      ["Uso de la web", "La persona usuaria se compromete a utilizar la web de forma lícita y a facilitar información veraz durante el proceso de solicitud y reserva. Los contenidos, fotografías, marcas y elementos gráficos están protegidos por la normativa aplicable y no pueden reutilizarse con fines comerciales sin autorización."],
      ["Responsabilidad", "Se procura mantener actualizados la disponibilidad, tarifas y contenidos. Pueden producirse interrupciones técnicas o errores puntuales. El envío de una solicitud no equivale a una reserva confirmada. La reserva solo se considerará confirmada cuando el pago haya sido verificado y el sistema de reservas lo indique expresamente."],
      ["Legislación", "La relación con las personas usuarias se regirá por la normativa española y europea que resulte aplicable, incluida la normativa de servicios de la sociedad de la información, consumidores, turismo y protección de datos."],
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    sections: [
      ["Responsable", `${company.name}, CIF ${company.cif}, ${company.address}. Contacto para privacidad: ${company.email}.`],
      ["Datos tratados", "Podemos tratar datos identificativos y de contacto, fechas de estancia, número de adultos y menores, composición y motivo declarado del grupo, comunicaciones relacionadas con la solicitud o reserva, información necesaria para facturación y, cuando corresponda, referencias técnicas del pago. Los datos completos de la tarjeta no son almacenados por Casa Rural Alaluz cuando el pago se procesa mediante un proveedor de pagos externo."],
      ["Finalidades y bases jurídicas", "Tratamos los datos para valorar y responder solicitudes de estancia, gestionar preaprobaciones y reservas, ejecutar el contrato de alojamiento, gestionar cobros, cancelaciones, reembolsos y fianzas, cumplir obligaciones fiscales, contables, de registro de viajeros y demás obligaciones legales, y defender posibles reclamaciones. Cuando una finalidad dependa del consentimiento, podrá retirarse sin afectar a la licitud del tratamiento anterior."],
      ["Decisión sobre solicitudes", "Las solicitudes son revisadas por personas responsables del alojamiento. La información facilitada sobre la composición del grupo y el motivo de la estancia se utiliza para comprobar capacidad, adecuación a las características y normas de la vivienda y disponibilidad. No se realiza una aceptación o rechazo automatizado mediante inteligencia artificial."],
      ["Destinatarios", "Los datos podrán comunicarse a proveedores necesarios para prestar el servicio, como alojamiento tecnológico, base de datos, automatización, correo transaccional y pasarela de pago, bajo las garantías correspondientes; y a administraciones u organismos públicos cuando exista obligación legal, incluido el sistema oficial de registro de viajeros cuando resulte aplicable."],
      ["Conservación", "Los datos se conservarán durante la tramitación de la solicitud y, si existe reserva, durante la relación contractual y posteriormente durante los plazos necesarios para atender obligaciones legales y posibles responsabilidades. Los datos basados exclusivamente en consentimiento se conservarán hasta su retirada o hasta que dejen de ser necesarios."],
      ["Derechos", `Puedes solicitar acceso, rectificación, supresión, oposición, limitación o portabilidad, cuando proceda, escribiendo a ${company.email} e identificando tu solicitud. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos.`],
      ["Seguridad", "Aplicamos medidas técnicas y organizativas razonables para proteger la información. Ningún sistema conectado a Internet puede garantizar seguridad absoluta."],
    ],
  },
  cookies: {
    title: "Política de cookies",
    sections: [
      ["Qué son las cookies", "Las cookies y tecnologías similares permiten almacenar o recuperar información en el dispositivo durante la navegación."],
      ["Cookies necesarias", "La web puede utilizar almacenamiento estrictamente necesario para recordar decisiones esenciales, como tus preferencias de cookies o el funcionamiento de la sesión. Estas tecnologías no requieren consentimiento cuando son imprescindibles para prestar el servicio solicitado."],
      ["Cookies opcionales", "Si en el futuro incorporamos analítica, publicidad u otras tecnologías no necesarias, permanecerán desactivadas hasta que las aceptes. Podrás rechazarlas con la misma facilidad que aceptarlas y modificar tu elección posteriormente."],
      ["Configuración actual", "En esta versión no se pretende instalar cookies opcionales de analítica o publicidad antes de obtener consentimiento. El panel de preferencias permite aceptar o rechazar la categoría opcional."],
      ["Cambiar preferencias", "Puedes volver a abrir la configuración de cookies desde el enlace disponible en el pie de página y cambiar tu decisión en cualquier momento."],
    ],
  },
  condiciones: {
    title: "Condiciones de reserva",
    sections: [
      ["Prestador y alojamiento", `${company.name} gestiona la contratación directa de Casa Rural Alaluz, alojamiento con registro turístico ${company.tourism}, situado en Osuna (Sevilla).`],
      ["Solicitud previa y revisión", "La web funciona mediante solicitud previa. El envío de una solicitud no genera un cobro, no confirma la reserva y, por sí solo, no bloquea las fechas. La solicitud es revisada por el alojamiento atendiendo a la disponibilidad, capacidad, características de la vivienda y cumplimiento previsto de sus normas de uso y convivencia."],
      ["Preaprobación y pago", "Si la solicitud es preaprobada, se volverá a comprobar la disponibilidad y se facilitará un enlace de pago. Desde la preaprobación las fechas podrán mantenerse bloqueadas temporalmente durante el plazo indicado, normalmente 24 horas. Si el pago no se completa dentro del plazo, la preaprobación podrá caducar y las fechas volverán a quedar disponibles. La reserva se considerará confirmada únicamente cuando el pago haya sido verificado y el sistema de reservas la marque como confirmada."],
      ["Capacidad y distribución de plazas", "Casa Rural Alaluz limita las solicitudes a un máximo de 12 adultos y, en todo caso, a la capacidad máxima de alojamiento aplicable a la casa rural. La limitación de adultos responde a la distribución y dimensiones de las camas: parte de las plazas se encuentran en literas compactas especialmente adecuadas para menores. La composición del grupo debe declararse de forma veraz en la solicitud."],
      ["Precio y fianza", "Antes de enviar la solicitud se mostrará el importe correspondiente al alojamiento y la fianza reembolsable de forma separada, junto con el total. El importe de la fianza aplicable queda fijado al generar el pago tras la preaprobación. La fianza forma parte del cobro total, pero no del precio de la estancia."],
      ["Revisión y devolución de fianza", "La fianza puede revisarse desde el propio día de salida. Si no existen incidencias, se tramitará su devolución íntegra al mismo medio de pago utilizado, con un objetivo habitual de tramitación dentro de las 48 horas siguientes a la salida. Si existen daños o incumplimientos acreditados, podrá retenerse total o parcialmente la fianza en la cuantía razonablemente correspondiente, dejando constancia del motivo. El tiempo efectivo hasta que el abono sea visible puede depender del proveedor de pagos y de la entidad bancaria del huésped."],
      ["Política de cancelación Semiestricta", "Para estancias de menos de 28 noches: (a) reembolso del 100 % del alojamiento si se cancela dentro de las 24 horas siguientes a la confirmación, siempre que falten al menos 7 días para la entrada; (b) reembolso del 100 % del alojamiento si se cancela con 30 días o más de antelación; (c) reembolso del 50 % del alojamiento si se cancela entre 7 y 30 días antes de la entrada; y (d) con menos de 7 días de antelación no se reembolsa el importe correspondiente a la estancia. La fianza reembolsable no forma parte de la penalización por cancelación y se devolverá al 100 %. Si el alojamiento cancela una reserva confirmada, se devolverá el 100 % de lo cobrado."],
      ["Reembolsos", "Cuando proceda un reembolso total o parcial, se tramitará preferentemente mediante el mismo medio de pago utilizado. Los plazos de abono efectivo pueden depender del proveedor de pagos y de la entidad bancaria del huésped."],
      ["Normas de uso y convivencia", "La persona solicitante y posteriormente titular de la reserva es responsable de facilitar datos correctos, respetar la capacidad contratada y cumplir las normas del alojamiento. No se admiten fiestas, eventos ni actividades incompatibles con el uso tranquilo del alojamiento o que puedan causar molestias, riesgos o daños. Los huéspedes deberán facilitar la información legalmente exigible para el registro de viajeros."],
      ["Rechazo de solicitudes", "El alojamiento puede no preaprobar una solicitud cuando no resulte compatible con la disponibilidad, la capacidad, la distribución de plazas o las normas de uso y convivencia. Cuando se rechace una solicitud se comunicará al solicitante una explicación. Al no existir todavía pago, el rechazo de la solicitud no requiere ningún reembolso."],
      ["Desistimiento", "Los servicios de alojamiento contratados para fechas o periodos específicos están sujetos al régimen legal aplicable a este tipo de servicios. La cancelación de la reserva se regirá por la política específica indicada anteriormente, sin perjuicio de los derechos imperativos que correspondan al consumidor."],
      ["Versión aceptada", `Versión de estas condiciones: ${LEGAL_VERSION}. La versión aplicable será la mostrada y aceptada durante la solicitud y, cuando corresponda, registrada junto con la reserva.`],
      ["Contacto", `Para consultas, incidencias o cancelaciones puedes contactar en ${company.email}.`],
    ],
  },
};
