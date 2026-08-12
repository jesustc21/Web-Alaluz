export const LEGAL_VERSION = "2026-08-12";

export const company = {
  name: "BATAR INVESTMENT GROUP, S.L.",
  cif: "B16738643",
  address: "Calle Lictores, 22, esc. 2, 1A, 41018 Sevilla",
  email: "grupobatar@gmail.com",
  registry: "Registro Mercantil de Sevilla: Tomo 7104, Libro 0, Folio 170, Sección 8, Hoja SE-131651, Inscripción 1",
  tourism: "CR/SE/00382",
};

export const legalPages = {
  aviso: {
    title: "Aviso legal",
    sections: [
      ["Titular del sitio", `Este sitio web y el servicio de reserva directa de Casa Rural Alaluz son titularidad de ${company.name}, CIF ${company.cif}, con domicilio en ${company.address}. Contacto: ${company.email}. ${company.registry}. Registro turístico del alojamiento: ${company.tourism}.`],
      ["Objeto", "La web facilita información sobre Casa Rural Alaluz, consulta de disponibilidad, cálculo de precios y, cuando el sistema de pago esté habilitado, contratación directa de estancias."],
      ["Uso de la web", "La persona usuaria se compromete a utilizar la web de forma lícita y a facilitar información veraz durante el proceso de reserva. Los contenidos, fotografías, marcas y elementos gráficos están protegidos por la normativa aplicable y no pueden reutilizarse con fines comerciales sin autorización."],
      ["Responsabilidad", "Se procura mantener actualizados la disponibilidad, tarifas y contenidos. Pueden producirse interrupciones técnicas o errores puntuales. Una reserva solo se considerará confirmada cuando el proceso de contratación indique expresamente su confirmación."],
      ["Legislación", "La relación con las personas usuarias se regirá por la normativa española y europea que resulte aplicable, incluida la normativa de servicios de la sociedad de la información, consumidores y protección de datos."],
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    sections: [
      ["Responsable", `${company.name}, CIF ${company.cif}, ${company.address}. Contacto para privacidad: ${company.email}.`],
      ["Datos tratados", "Podemos tratar datos identificativos y de contacto, datos de la estancia y reserva, número de huéspedes, comunicaciones relacionadas con la reserva, información necesaria para facturación y, cuando corresponda, referencias técnicas del pago. Los datos completos de la tarjeta no son almacenados por Casa Rural Alaluz cuando el pago se procesa mediante un proveedor de pagos externo."],
      ["Finalidades y bases jurídicas", "Tratamos los datos para atender consultas y gestionar la reserva y estancia, ejecutar el contrato de alojamiento, gestionar cobros, cancelaciones y reembolsos, cumplir obligaciones fiscales, contables, de registro de viajeros y demás obligaciones legales, y defender posibles reclamaciones. Cuando una finalidad dependa del consentimiento, podrá retirarse sin afectar a la licitud del tratamiento anterior."],
      ["Destinatarios", "Los datos podrán comunicarse a proveedores necesarios para prestar el servicio, como alojamiento tecnológico, base de datos, automatización y pasarela de pago, bajo las garantías correspondientes; y a administraciones u organismos públicos cuando exista obligación legal, incluido el sistema oficial de registro de viajeros cuando resulte aplicable."],
      ["Conservación", "Los datos se conservarán durante la relación contractual y posteriormente durante los plazos necesarios para atender obligaciones legales y posibles responsabilidades. Los datos basados exclusivamente en consentimiento se conservarán hasta su retirada o hasta que dejen de ser necesarios."],
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
      ["Precio y contratación", "Antes de confirmar se mostrarán las fechas, número de noches, huéspedes y precio total aplicable. La solicitud queda sujeta a disponibilidad. Cuando el pago online esté habilitado, la reserva se considerará confirmada únicamente tras la confirmación del pago y del sistema de reservas."],
      ["Política de cancelación Semiestricta", "Para estancias de menos de 28 noches: (a) reembolso del 100 % si se cancela dentro de las 24 horas siguientes a la confirmación, siempre que falten al menos 7 días para la entrada; (b) reembolso del 100 % si se cancela con 30 días o más de antelación; (c) reembolso del 50 % si se cancela entre 7 y 30 días antes de la entrada; y (d) con menos de 7 días de antelación no se reembolsa el importe correspondiente a la estancia. Si el alojamiento cancela una reserva confirmada, se devolverá el 100 % de lo cobrado."],
      ["Reembolsos", "Cuando proceda un reembolso, se tramitará preferentemente mediante el mismo medio de pago utilizado. Los plazos de abono efectivo pueden depender del proveedor de pagos y de la entidad bancaria del huésped."],
      ["Huéspedes y normas", "La persona que realiza la reserva es responsable de facilitar datos correctos, respetar la capacidad contratada y cumplir las normas del alojamiento. Los huéspedes deberán facilitar la información legalmente exigible para el registro de viajeros."],
      ["Desistimiento", "Los servicios de alojamiento contratados para fechas o periodos específicos están sujetos al régimen legal aplicable a este tipo de servicios. La cancelación de la reserva se regirá por la política específica indicada anteriormente, sin perjuicio de los derechos imperativos que correspondan al consumidor."],
      ["Versión aceptada", `Versión de estas condiciones: ${LEGAL_VERSION}. La versión aplicable será la mostrada y aceptada durante la contratación, que podrá registrarse junto con la reserva.`],
      ["Contacto", `Para consultas, incidencias o cancelaciones puedes contactar en ${company.email}.`],
    ],
  },
};
