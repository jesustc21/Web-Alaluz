import { useEffect, useState } from "react";

const AVAILABILITY_URL = "https://automation.casaruralalaluz.com/webhook/alaluz-public-availability-v1";

function parseEuro(value) {
  const cleaned = String(value || "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function formatEuro(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DepositPricingBridge() {
  const [deposit, setDeposit] = useState({ amount: 200, hours: 48 });

  useEffect(() => {
    let alive = true;
    fetch(AVAILABILITY_URL)
      .then((response) => {
        if (!response.ok) throw new Error("No se pudieron leer los ajustes");
        return response.json();
      })
      .then((data) => {
        if (!alive) return;
        const amount = Number(data?.ajustes?.fianza_importe);
        const hours = Number(data?.ajustes?.fianza_devolucion_horas);
        setDeposit({
          amount: Number.isFinite(amount) ? amount : 200,
          hours: Number.isFinite(hours) ? hours : 48,
        });
      })
      .catch(() => {
        if (alive) setDeposit({ amount: 200, hours: 48 });
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const makeRow = (label, value, className = "") => {
      const row = document.createElement("div");
      if (className) row.className = className;
      const left = document.createElement("span");
      const right = document.createElement("span");
      left.textContent = label;
      right.textContent = value;
      row.append(left, right);
      return row;
    };

    const makeDialogRow = (label, value, className = "") => {
      const row = document.createElement("div");
      if (className) row.className = className;
      const left = document.createElement("span");
      const right = document.createElement("b");
      left.textContent = label;
      right.textContent = value;
      row.append(left, right);
      return row;
    };

    const decorateSummary = () => {
      document.querySelectorAll(".summary .breakdown").forEach((box) => {
        const rentalRow = Array.from(box.children).find(
          (element) => !element.classList.contains("total") && !element.classList.contains("deposit-price-bridge")
        );
        const rental = parseEuro(rentalRow?.querySelector("span:last-child")?.textContent);
        if (!rental) return;

        const oldTotal = box.querySelector(":scope > .total");
        if (oldTotal && oldTotal.style.display !== "none") oldTotal.style.display = "none";

        let bridge = box.querySelector(":scope > .deposit-price-bridge");
        if (!bridge) {
          bridge = document.createElement("div");
          bridge.className = "deposit-price-bridge";
          box.appendChild(bridge);
        }

        const signature = `${rental}|${deposit.amount}|${deposit.hours}`;
        if (bridge.dataset.signature === signature) return;
        bridge.dataset.signature = signature;
        bridge.replaceChildren();

        bridge.appendChild(makeRow("Fianza reembolsable", formatEuro(deposit.amount)));
        const note = document.createElement("p");
        note.className = "deposit-note";
        note.textContent = `Se devuelve tras revisar la casa, normalmente en unas ${deposit.hours} h desde la salida.`;
        bridge.appendChild(note);
        bridge.appendChild(makeRow("Total a pagar", formatEuro(rental + deposit.amount), "total deposit-total"));
      });
    };

    const decorateDialog = () => {
      document.querySelectorAll(".dialog .dlg-rows").forEach((box) => {
        const oldTotal = box.querySelector(":scope > .dlg-total:not(.deposit-total-modal)");
        if (!oldTotal) return;
        const rental = parseEuro(oldTotal.querySelector("b")?.textContent);
        if (!rental) return;
        if (oldTotal.style.display !== "none") oldTotal.style.display = "none";

        let bridge = box.querySelector(":scope > .deposit-dialog-bridge");
        if (!bridge) {
          bridge = document.createElement("div");
          bridge.className = "deposit-dialog-bridge";
          box.appendChild(bridge);
        }

        const signature = `${rental}|${deposit.amount}|${deposit.hours}`;
        if (bridge.dataset.signature === signature) return;
        bridge.dataset.signature = signature;
        bridge.replaceChildren();

        bridge.appendChild(makeDialogRow("Alojamiento", formatEuro(rental)));
        bridge.appendChild(makeDialogRow("Fianza reembolsable", formatEuro(deposit.amount)));
        bridge.appendChild(makeDialogRow("Total a pagar", formatEuro(rental + deposit.amount), "dlg-total deposit-total-modal"));
        const note = document.createElement("p");
        note.className = "deposit-modal-note";
        note.textContent = `La fianza se devuelve tras la revisión de la vivienda, normalmente en unas ${deposit.hours} h desde la salida.`;
        bridge.appendChild(note);
      });
    };

    const decorate = () => {
      decorateSummary();
      decorateDialog();
    };

    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        decorate();
      });
    });

    decorate();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [deposit.amount, deposit.hours]);

  return (
    <style>{`
      .deposit-price-bridge{display:block!important;padding:0!important;color:inherit!important}
      .deposit-price-bridge>div{display:flex;justify-content:space-between;padding:7px 0;color:#54564a}
      .deposit-price-bridge .deposit-note{font-size:11px;line-height:1.4;color:var(--piedra);margin:0 0 7px;padding:0}
      .deposit-price-bridge .deposit-total{border-top:1px solid var(--linea);margin-top:6px;padding-top:12px;font-family:var(--display);font-size:18px;color:var(--olivo)}
      .deposit-dialog-bridge{display:block!important;padding:0!important;border:0!important}
      .deposit-dialog-bridge>div{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--linea);font-size:15px}
      .deposit-dialog-bridge>div span{color:var(--piedra)}
      .deposit-dialog-bridge>div b{color:var(--olivo)}
      .deposit-dialog-bridge .deposit-total-modal{border-bottom:none!important;font-family:var(--display);font-size:18px;padding-top:14px!important}
      .deposit-modal-note{font-size:12px;line-height:1.45;color:#54564a;margin:8px 0 0;padding:9px 10px;background:#f6ede2;border-radius:9px}
    `}</style>
  );
}
