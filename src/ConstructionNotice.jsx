import { useState } from "react";

export default function ConstructionNotice() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <>
      <style>{`
        .construction-notice{position:relative;z-index:45;display:flex;align-items:center;justify-content:center;gap:14px;background:#B7882B;color:#2b2107;padding:10px 46px 10px 16px;text-align:center;font:600 13px/1.4 'Hanken Grotesk',system-ui,sans-serif}
        .construction-notice button{position:absolute;right:13px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:#2b2107;font-size:21px;line-height:1;cursor:pointer;padding:5px 8px}
        @media(max-width:560px){.construction-notice{font-size:12px;padding:9px 42px 9px 12px}}
      `}</style>
      <div className="construction-notice" role="status">
        <span>🚧 Web en construcción. Las tarifas todavía son provisionales y estamos realizando pruebas del sistema de reservas y pagos. La web aún no está abierta al público.</span>
        <button type="button" aria-label="Cerrar aviso" onClick={() => setVisible(false)}>×</button>
      </div>
    </>
  );
}
