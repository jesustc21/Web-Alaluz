import { useEffect, useState } from "react";

const STATUS_URL = "https://automation.soluciona.es/webhook/alaluz-estado-reserva-v1";
const TERMINAL_ERROR = new Set(["cancelada", "expirada", "rechazada"]);

export default function PaymentReturnNotice() {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("pago") !== "ok") return undefined;

    const solicitud = url.searchParams.get("solicitud") || "";
    const reserva = url.searchParams.get("reserva") || "";
    if (!solicitud || !reserva) return undefined;

    setNotice({ type: "pending", text: "Has vuelto de la pasarela de pago. Estamos verificando el pago con Revolut…" });

    url.searchParams.delete("pago");
    url.searchParams.delete("solicitud");
    url.searchParams.delete("reserva");
    const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);

    let stopped = false;
    let timer = null;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const endpoint = `${STATUS_URL}?solicitud=${encodeURIComponent(solicitud)}&reserva=${encodeURIComponent(reserva)}`;
        const response = await fetch(endpoint, { headers: { Accept: "application/json" }, cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (stopped) return;

        if (response.ok && data.ok) {
          const estado = String(data.estado || "").toLowerCase();
          if (estado === "confirmada") {
            setNotice({ type: "success", text: "Pago verificado. Tu reserva está confirmada. Te hemos enviado un email con los datos de la estancia." });
            return;
          }
          if (TERMINAL_ERROR.has(estado)) {
            setNotice({ type: "error", text: "La reserva no ha podido quedar confirmada. Revisa el email asociado a la solicitud o contacta con Casa Rural Alaluz." });
            return;
          }
        }
      } catch {
        // La confirmación también llega por email; seguimos intentando durante unos segundos.
      }

      if (attempts < 12) {
        timer = window.setTimeout(poll, 2500);
      } else if (!stopped) {
        setNotice({ type: "pending", text: "El pago está pendiente de verificación. Puede tardar unos minutos; recibirás un email en cuanto la reserva quede confirmada." });
      }
    };

    poll();
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!notice) return null;

  return (
    <>
      <style>{`
        .payment-return-notice{position:fixed;right:18px;bottom:18px;z-index:120;width:min(520px,calc(100vw - 36px));box-sizing:border-box;border-radius:16px;padding:15px 48px 15px 16px;box-shadow:0 16px 50px rgba(20,24,17,.24);font:500 14px/1.45 'Hanken Grotesk',system-ui,sans-serif;border:1px solid #d9d7cd;background:#fff;color:#2d3228}
        .payment-return-notice.pending{border-color:#e5d5a7;background:#fffaf0}
        .payment-return-notice.success{border-color:#c8d8bd;background:#f2f8ee}
        .payment-return-notice.error{border-color:#e4c1bb;background:#fff4f1}
        .payment-return-notice b{display:block;margin-bottom:3px;color:#37432b}
        .payment-return-close{position:absolute;right:10px;top:9px;border:0;background:transparent;font-size:22px;line-height:1;color:#687062;cursor:pointer;padding:5px 8px}
        @media(max-width:560px){.payment-return-notice{right:12px;bottom:12px;width:calc(100vw - 24px)}}
      `}</style>
      <div className={`payment-return-notice ${notice.type}`} role="status" aria-live="polite">
        <b>{notice.type === "success" ? "Reserva confirmada" : notice.type === "error" ? "Estado de la reserva" : "Verificando pago"}</b>
        {notice.text}
        <button className="payment-return-close" type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)}>×</button>
      </div>
    </>
  );
}
