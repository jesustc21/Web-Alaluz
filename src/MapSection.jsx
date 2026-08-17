import { useState } from "react";

const MAP_LINK = "https://maps.app.goo.gl/L1uE78gTwJPfJJ8h6?g_st=ic";
const MAP_EMBED = "https://www.google.com/maps?q=37.1746194,-5.0939618&output=embed";

export default function MapSection() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <div className="alaluz-map-card">
      {mapLoaded ? (
        <iframe
          className="alaluz-map-frame"
          src={MAP_EMBED}
          title="Mapa de Casa Rural Alaluz en Google Maps"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="alaluz-map-placeholder">
          <div>
            <b>Casa Rural Alaluz · Osuna</b>
            <p>El mapa de Google se carga solo cuando lo solicitas.</p>
            <button type="button" onClick={() => setMapLoaded(true)}>Cargar mapa de Google</button>
          </div>
        </div>
      )}
      <div className="alaluz-map-footer">
        <div>
          <b>Casa Rural Alaluz</b>
          <span>Osuna · Sevilla</span>
        </div>
        <a href={MAP_LINK} target="_blank" rel="noreferrer">Abrir en Google Maps ↗</a>
      </div>
      <style>{`
        .alaluz-map-card{margin-top:28px;border:1px solid #E2DBCB;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 10px 30px rgba(32,38,26,.06)}
        .alaluz-map-frame{display:block;width:100%;height:360px;border:0;background:#F2EEE2}
        .alaluz-map-placeholder{display:flex;min-height:360px;align-items:center;justify-content:center;text-align:center;padding:32px;background:linear-gradient(135deg,#F2EEE2,#FBF9F3);font-family:'Hanken Grotesk',system-ui,sans-serif;color:#37432B}
        .alaluz-map-placeholder b{font-family:Georgia,serif;font-size:22px}.alaluz-map-placeholder p{margin:8px 0 18px;color:#6f6a5f;font-size:14px}.alaluz-map-placeholder button{border:0;border-radius:999px;padding:12px 18px;background:#37432B;color:#FBF9F3;font:600 14px 'Hanken Grotesk',system-ui,sans-serif;cursor:pointer}.alaluz-map-placeholder button:hover{background:#B7882B}
        .alaluz-map-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 20px;font-family:'Hanken Grotesk',system-ui,sans-serif;color:#37432B}
        .alaluz-map-footer>div{display:grid;gap:2px}.alaluz-map-footer b{font-size:16px}.alaluz-map-footer span{font-size:13px;color:#8f8879}
        .alaluz-map-footer a{background:#37432B!important;color:#FBF9F3!important;padding:11px 17px;border-radius:999px;text-decoration:none!important;font-weight:600;font-size:14px;white-space:nowrap}
        .alaluz-map-footer a:hover{background:#B7882B!important;color:#FBF9F3!important}
        @media(max-width:600px){.alaluz-map-frame,.alaluz-map-placeholder{height:300px;min-height:300px}.alaluz-map-footer{align-items:stretch;flex-direction:column}.alaluz-map-footer a{text-align:center}}
      `}</style>
    </div>
  );
}
