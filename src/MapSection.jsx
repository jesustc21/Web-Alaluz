const MAP_LINK = "https://maps.app.goo.gl/N2jE9BiozKxmfheT9";
const MAP_EMBED = "https://www.google.com/maps?q=Vi%C3%B1a%20Alaluz%2C%20Osuna%2C%20Sevilla&output=embed";

export default function MapSection() {
  return (
    <div className="alaluz-map-card">
      <iframe
        className="alaluz-map-frame"
        src={MAP_EMBED}
        title="Mapa de Viña Alaluz en Google Maps"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="alaluz-map-footer">
        <div>
          <b>Viña Alaluz</b>
          <span>Osuna · Sevilla</span>
        </div>
        <a href={MAP_LINK} target="_blank" rel="noreferrer">Abrir en Google Maps ↗</a>
      </div>
      <style>{`
        .alaluz-map-card{margin-top:28px;border:1px solid #E2DBCB;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 10px 30px rgba(32,38,26,.06)}
        .alaluz-map-frame{display:block;width:100%;height:360px;border:0;background:#F2EEE2}
        .alaluz-map-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 20px;font-family:'Hanken Grotesk',system-ui,sans-serif;color:#37432B}
        .alaluz-map-footer>div{display:grid;gap:2px}.alaluz-map-footer b{font-size:16px}.alaluz-map-footer span{font-size:13px;color:#8f8879}
        .alaluz-map-footer a{background:#37432B!important;color:#FBF9F3!important;padding:11px 17px;border-radius:999px;text-decoration:none!important;font-weight:600;font-size:14px;white-space:nowrap}
        .alaluz-map-footer a:hover{background:#B7882B!important;color:#FBF9F3!important}
        @media(max-width:600px){.alaluz-map-frame{height:300px}.alaluz-map-footer{align-items:stretch;flex-direction:column}.alaluz-map-footer a{text-align:center}}
      `}</style>
    </div>
  );
}
