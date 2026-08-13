import { useEffect } from "react";

const RESERVATION_URL = "https://automation.soluciona.es/webhook/alaluz/reserva";
const MONTHS = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

function selectedDate(className) {
  const cell = document.querySelector(`.calendar .cell.${className}`);
  if (!cell) return "";
  const month = cell.closest(".month");
  const title = month?.querySelector(".month-name")?.textContent?.trim().toLowerCase() || "";
  const match = title.match(/^([a-záéíóúñ]+)\s+(\d{4})$/i);
  const monthNumber = match ? MONTHS[match[1]] : null;
  const day = Number(cell.textContent?.trim());
  if (!match || !monthNumber || !day) return "";
  return `${match[2]}-${String(monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function field(label, id, type, autocomplete) {
  const wrap = document.createElement("label");
  wrap.className = "booking-customer-field";
  const text = document.createElement("span");
  text.textContent = label;
  const input = document.createElement("input");
  input.id = id;
  input.type = type;
  input.autocomplete = autocomplete;
  input.required = true;
  wrap.append(text, input);
  return wrap;
}

export default function BookingCheckoutBridge() {
  useEffect(() => {
    const decorate = () => {
      const dialog = document.querySelector(".dialog");
      if (!dialog || dialog.dataset.checkoutBridge === "1") return;
      const action = Array.from(dialog.querySelectorAll("button.btn-solid.full"))
        .find((button) => (button.textContent || "").trim() === "Entendido");
      if (!action) return;
      dialog.dataset.checkoutBridge = "1";

      const box = document.createElement("div");
      box.className = "booking-customer-box";
      const title = document.createElement("h4");
      title.textContent = "Datos del titular de la reserva";
      const grid = document.createElement("div");
      grid.className = "booking-customer-grid";
      grid.append(
        field("Nombre y apellidos", "booking-name", "text", "name"),
        field("Email", "booking-email", "email", "email"),
        field("Teléfono", "booking-phone", "tel", "tel")
      );
      const note = document.createElement("p");
      note.className = "booking-customer-note";
      note.textContent = "Usaremos estos datos para gestionar la reserva y sus comunicaciones. El cobro sigue en entorno de pruebas Sandbox.";
      const status = document.createElement("div");
      status.className = "booking-checkout-status";
      box.append(title, grid, note, status);
      action.before(box);
      action.textContent = "Continuar al pago seguro · Sandbox";

      action.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (action.disabled) return;

        const nombre = dialog.querySelector("#booking-name")?.value?.trim() || "";
        const email = dialog.querySelector("#booking-email")?.value?.trim() || "";
        const telefono = dialog.querySelector("#booking-phone")?.value?.trim() || "";
        const fecha_entrada = selectedDate("start");
        const fecha_salida = selectedDate("end");
        const huespedes = Number(document.querySelector(".summary .guests select")?.value || 0);

        status.textContent = "";
        if (!nombre || !/^\S+@\S+\.\S+$/.test(email) || !telefono) {
          status.textContent = "Completa nombre, email y teléfono antes de continuar.";
          return;
        }
        if (!fecha_entrada || !fecha_salida || !Number.isInteger(huespedes) || huespedes < 1) {
          status.textContent = "No hemos podido leer correctamente las fechas o los viajeros. Vuelve a seleccionar la estancia.";
          return;
        }

        action.disabled = true;
        action.textContent = "Preparando pago…";
        try {
          const response = await fetch(RESERVATION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fecha_entrada, fecha_salida, huespedes, nombre, email, telefono }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.ok === false || !data.checkout_url) {
            throw new Error(data.error || "No se ha podido preparar el pago");
          }
          window.location.assign(data.checkout_url);
        } catch (error) {
          status.textContent = error?.message || "No se ha podido preparar el pago.";
          action.disabled = false;
          action.textContent = "Continuar al pago seguro · Sandbox";
        }
      }, true);
    };

    decorate();
    const observer = new MutationObserver(decorate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <style>{`
      .booking-customer-box{margin:18px 0 2px;padding-top:16px;border-top:1px solid var(--linea)}
      .booking-customer-box h4{margin:0 0 12px;font-family:var(--display);font-size:18px;color:var(--olivo)}
      .booking-customer-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .booking-customer-field:first-child{grid-column:1/-1}
      .booking-customer-field span{display:block;font-size:11px;font-weight:600;color:var(--piedra);margin-bottom:4px}
      .booking-customer-field input{width:100%;box-sizing:border-box;border:1px solid var(--linea);border-radius:10px;padding:10px 11px;background:#fff;color:var(--tinta);font:inherit}
      .booking-customer-note{font-size:11px;line-height:1.45;color:var(--piedra);margin:10px 0 0}
      .booking-checkout-status{font-size:12px;line-height:1.4;color:#9a3b2f;margin-top:8px;min-height:1em}
      @media(max-width:560px){.booking-customer-grid{grid-template-columns:1fr}.booking-customer-field:first-child{grid-column:auto}}
    `}</style>
  );
}
