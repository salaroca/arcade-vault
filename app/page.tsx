const FEATURED_GAMES = [
  {
    id: "caida",
    title: "CAÍDA",
    short: "Encaja las piezas antes de que el techo te aplaste.",
    cat: "PUZZLE",
    cover: "cover-tetro",
    color: "magenta",
    best: 184220,
    plays: "31.8K",
  },
  {
    id: "gloton",
    title: "GLOTÓN",
    short: "Devora puntos y escapa de los fantasmas.",
    cat: "ARCADE",
    cover: "cover-glot",
    color: "yellow",
    best: 96400,
    plays: "27.2K",
  },
  {
    id: "invasores",
    title: "INVASORES",
    short: "Defiende el planeta de filas alienígenas.",
    cat: "SHOOTER",
    cover: "cover-invaders",
    color: "green",
    best: 54190,
    plays: "18.0K",
  },
  {
    id: "rocas",
    title: "ROCAS",
    short: "Pulveriza asteroides en gravedad cero.",
    cat: "SHOOTER",
    cover: "cover-rocas",
    color: "yellow",
    best: 41200,
    plays: "15.6K",
  },
] as const;

const TOP_SCORES = [
  { rank: 1, name: "PX_KAI",    score: 234120 },
  { rank: 2, name: "NEONFOX",   score: 226440 },
  { rank: 3, name: "Z3R0COOL",  score: 218760 },
  { rank: 4, name: "M00NRYU",   score: 211080 },
  { rank: 5, name: "VAULT_07",  score: 203400 },
];

const PODIUM = [
  { rank: 2, name: "PX_KAI",   score: 176540, slot: "silver" as const, date: "14/03/2026" },
  { rank: 1, name: "NEONFOX",  score: 184220, slot: "gold"   as const, date: "09/05/2026", label: "CAMPEÓN" },
  { rank: 3, name: "VAULT_07", score: 168860, slot: "bronze" as const, date: "27/04/2026" },
];

export default function Home() {
  return (
    <>
      <div className="av-bg" aria-hidden="true" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Nav */}
        <nav className="av-nav">
          <div className="logo">
            <div className="logo-mark" />
            <span className="logo-text">ARCADE VAULT</span>
          </div>
          <div className="links">
            <a className="active">JUEGOS</a>
            <a>FAMA</a>
          </div>
          <div className="spacer" />
          <div className="coin-counter">
            <div className="coin" />
            <span>03 MONEDAS</span>
          </div>
          <button className="btn auth-btn">ENTRAR</button>
        </nav>

        <main className="flex-1">
          {/* Hero */}
          <section className="av-hero-layout">
            <div className="av-hero-content">
              <h1 className="flicker">ARCADE<br />VAULT</h1>
              <p className="av-hero-sub">
                INSERTA UNA MONEDA PARA JUGAR <span className="blink">_</span>
              </p>
              <div className="av-hero-actions">
                <button className="btn xl pulse">EXPLORAR JUEGOS</button>
                <button className="btn lg ghost">SALÓN DE LA FAMA</button>
              </div>
            </div>

            <div className="av-hero-scores">
              <div className="leaderboard">
                <h3>CLASIFICACIÓN GLOBAL</h3>
                {TOP_SCORES.map((s, i) => (
                  <div
                    key={s.name}
                    className={`lb-row ${i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : ""}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span className="rk">#{String(s.rank).padStart(2, "0")}</span>
                    <span className="pl">{s.name}</span>
                    <span className="sc">{s.score.toLocaleString("es-ES")}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Games */}
          <section className="av-section">
            <div className="section-header">
              <h2>JUEGOS DESTACADOS</h2>
              <button className="btn ghost">VER TODOS</button>
            </div>
            <div className="av-grid">
              {FEATURED_GAMES.map((game) => (
                <div key={game.id} className="card">
                  <div className="cover">
                    <div className={`cover-bg ${game.cover}`} />
                    <div className="label">{game.cat}</div>
                  </div>
                  <div className="meta">
                    <div className="title">{game.title}</div>
                    <div className="desc">{game.short}</div>
                    <div className="row">
                      <div className="score-badge">
                        <span>MEJOR PUNTUACIÓN</span>
                        <b>{game.best.toLocaleString("es-ES")}</b>
                      </div>
                      <button
                        className={`btn ${
                          game.color === "magenta"
                            ? "magenta"
                            : game.color === "green"
                            ? "green"
                            : ""
                        }`}
                      >
                        JUGAR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Hall of Fame teaser */}
          <section className="av-section">
            <div className="section-header">
              <h2>SALÓN DE LA FAMA</h2>
              <button className="btn ghost">VER TODO</button>
            </div>
            <p className="av-hall-sub">LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA</p>
            <div className="podium">
              {PODIUM.map((p) => (
                <div key={p.name} className={`podium-slot ${p.slot}`}>
                  {p.slot === "gold" && (
                    <div className="pixel" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}>
                      {p.label}
                    </div>
                  )}
                  <div className="rank-num">
                    {String(p.rank).padStart(2, "0")}
                  </div>
                  <div className="name">{p.name}</div>
                  <div className="score">{p.score.toLocaleString("es-ES")}</div>
                  <div className="date">{p.date}</div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="av-footer">
          © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
        </footer>
      </div>
    </>
  );
}
