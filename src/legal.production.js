import { company as baseCompany, legalPages as basePages } from "./legal.js";

export const LEGAL_VERSION = "2026-08-14";
export const company = { ...baseCompany, email: "reservas@casaruralalaluz.com" };

const condicionesExtra = [
  ["Solicitud previa y revisión", "El envío de una solicitud no genera cobro, no confirma la reserva y no bloquea por sí solo las fechas. El alojamiento revisa cada solicitud antes de autorizar el pago."],
  ["Preaprobación y pago", "Si la solicitud es preaprobada se vuelve a comprobar la disponibilidad y se facilita un enlace de pago, normalmente válido durante 24 horas. La reserva solo queda confirmada cuando el pago ha sido verificado por el sistema."],
  ["Capacidad y distribución de plazas", "Las solicitudes se limitan a un máximo de 12 adultos y a la capacidad máxima legalmente aplicable a la casa rural. Parte de las plazas se encuentran en literas compactas especialmente adecuadas para menores."],
  ["Fianza reembolsable", "La fianza se muestra separada del alojamiento y queda fijada al generar el pago. Puede revisarse desde el día de salida. Si no existen incidencias se tramita su devolución íntegra al mismo medio de pago; si existen daños acreditados puede retenerse total o parcialmente dejando constancia del motivo."],
  ["Cancelación y fianza", "La fianza no forma parte de la penalización por cancelación y se devuelve al 100 %. Los reembolsos se tramitan preferentemente al mismo medio de pago utilizado."],
  ["Rechazo de solicitudes", "Una solicitud puede no ser preaprobada por disponibilidad, capacidad, distribución de plazas o incompatibilidad con las normas de uso y convivencia. El alojamiento comunicará una explicación al solicitante. Al no existir todavía pago, no hay reembolso que tramitar."],
];

export const legalPages = {
  ...basePages,
  aviso: { ...basePages.aviso, sections: basePages.aviso.sections.map(([t, x]) => t === "Objeto" ? [t, "La web permite consultar disponibilidad y precios, enviar solicitudes de estancia y, tras preaprobación, formalizar y pagar la reserva."] : [t, x]) },
  privacidad: { ...basePages.privacidad, sections: [...basePages.privacidad.sections, ["Datos de la solicitud", "Para revisar una solicitud podemos tratar número de adultos y menores, motivo declarado de la estancia y una descripción del grupo, además de los datos de contacto y fechas."], ["Revisión humana", "La aceptación o rechazo de solicitudes corresponde a las personas responsables del alojamiento y no se delega en una decisión automatizada mediante inteligencia artificial."]] },
  condiciones: { ...basePages.condiciones, sections: [basePages.condiciones.sections[0], ...condicionesExtra, ...basePages.condiciones.sections.slice(2).filter(([t]) => !["Huéspedes y normas", "Versión aceptada", "Contacto"].includes(t)), ["Normas de uso y convivencia", "La persona solicitante debe facilitar datos correctos, respetar la capacidad contratada y cumplir las normas del alojamiento. No se admiten fiestas, eventos ni usos incompatibles con una estancia tranquila."], ["Versión aceptada", `Versión de estas condiciones: ${LEGAL_VERSION}.`], ["Contacto", `Para consultas, incidencias o cancelaciones puedes contactar en ${company.email}.`]] },
};
