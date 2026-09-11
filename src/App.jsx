import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CONFIG from "./config";
import { fetchAllSecrets, saveNoAttempt, saveSecret } from "./cloud";
import "./App.css";

const TOTAL = 15;

function shuffled(n) {
  return Array.from({ length: n }, (_, i) => ({
    i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 10 + Math.random() * 10,
    size: 10 + Math.random() * 16,
    opacity: 0.15 + Math.random() * 0.35,
  }));
}

function GoldTitle({ children, className = "" }) {
  return <h1 className={`gold-text ${className}`}>{children}</h1>;
}

function RevealText({ text }) {
  const parts = text.split(/(\s+)/);
  let wordIndex = 0;

  return (
    <p className="reveal">
      {parts.map((part, index) => {
        if (/\s+/.test(part)) return part;

        const delay = 0.12 * wordIndex + 0.2;
        wordIndex += 1;
        return (
          <span key={index} style={{ animationDelay: `${delay}s` }}>
            {part}
          </span>
        );
      })}
    </p>
  );
}

function Background() {
  const hearts = useMemo(() => shuffled(14), []);
  return (
    <div className="bg" aria-hidden="true">
      <div className="glow glow-a" />
      <div className="glow glow-b" />
      <div className="vignette" />
      <div className="grain" />
      {hearts.map((h) => (
        <span
          key={h.i}
          className="float-heart"
          style={{
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            fontSize: `${h.size}px`,
            opacity: h.opacity,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

function Progress({ page }) {
  return (
    <div className="progress">
      {Array.from({ length: TOTAL }, (_, i) => (
        <span key={i} className={i < page ? "dot on" : "dot"} />
      ))}
    </div>
  );
}

function App() {
  const [page, setPage] = useState(1);
  const [song, setSong] = useState(null);
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState(false);
  const [noAttempts, setNoAttempts] = useState(0);
  const [noPos, setNoPos] = useState(null);
  const [thanks, setThanks] = useState(false);
  const [day, setDay] = useState("");
  const [allowAdvance, setAllowAdvance] = useState(false);
  const [advanceAt, setAdvanceAt] = useState(0);
  const [place, setPlace] = useState("");
  const [flower, setFlower] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [adminGate, setAdminGate] = useState(false);
  const [adminOk, setAdminOk] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminRows, setAdminRows] = useState([]);
  const [musicError, setMusicError] = useState("");
  const audioRef = useRef(null);
  const answers = useRef({});

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace("#", "");
      setAdminGate(hash === "admin");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (page < 2 || page > 7) return;
    setReady(false);
    setHint(false);
    const t = setTimeout(() => setReady(true), 5000);
    return () => clearTimeout(t);
  }, [page]);

  useEffect(() => {
    if (page !== 14) return;
    setThanks(false);
    setReady(false);
    setHint(false);
    const deadline = Date.now() + 5 * 1000;
    setAdvanceAt(deadline);
    setAllowAdvance(false);

    const timer = window.setInterval(() => {
      if (Date.now() >= deadline) {
        setAllowAdvance(true);
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [page]);

  const persist = useCallback(async (partial, telegramText) => {
    answers.current = { ...answers.current, ...partial };
    await saveSecret(answers.current, telegramText);
  }, []);

  const go = (n) => {
    setShake(false);
    setPage(n);
  };

  const advanceFromFinale = () => {
    if (!allowAdvance && Date.now() < advanceAt) return;
    setAllowAdvance(true);
    go(15);
  };

  const playSong = async (item) => {
    setSong(item);
    setMusicError("");
    const el = audioRef.current;
    if (!el) return;
    el.src = item.file;
    el.loop = true;
    try {
      await el.play();
      persist({ song: `${item.title} — ${item.artist}` });
    } catch {
      setMusicError(
        "Musiqa fayli topilmadi. public/music/ ichiga mp3 qo‘ying yoki brauzer ruxsatini bering."
      );
    }
  };

  const onHeartTap = () => {
    if (!ready) {
      setHint(true);
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }
    go(page + 1);
  };

  const runAway = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = noAttempts + 1;
    setNoAttempts(next);
    saveNoAttempt(next);
    const pad = 24;
    const w = 96;
    const h = 48;
    setNoPos({
      x: pad + Math.random() * (window.innerWidth - w - pad * 2),
      y: pad + Math.random() * (window.innerHeight - h - pad * 2),
    });
  };

  const sayYes = async () => {
    setThanks(true);
    const savePromise = persist(
      { proposal: "ha", noAttempts },
      `💍 <b>${CONFIG.girlName}</b> javob berdi: <b>HA</b>\n❌ Yo‘q urinishlari: ${noAttempts}\n🎵 ${answers.current.song || "-"}`
    );
    savePromise.catch(() => {});
    setTimeout(() => {
      setThanks(false);
      go(9);
    }, 2600);
  };

  const finishMessage = () => {
    const savePromise = persist(
      {
        phone: phone.trim(),
        message: message.trim(),
        day,
        place,
        flower,
        proposal: "ha",
        noAttempts,
      },
      [
        `💌 <b>Yakuniy javob</b>`,
        `🎵 ${answers.current.song || "-"}`,
        `❌ Yo‘q urinishlari: ${noAttempts}`,
        `💍 Taklif: HA`,
        `📅 Kun: ${day || "-"}`,
        `📍 Joy: ${place || "-"}`,
        `🌹 Gul: ${flower || "-"}`,
        `📱 Tel: ${phone.trim() || "kiritilmadi"}`,
        `📝 Xabar: ${message.trim() || "yo‘q"}`,
      ].join("\n")
    );
    savePromise.catch(() => {});
    go(14);
  };

  const openAdmin = async () => {
    if (adminPass !== CONFIG.adminPassword) {
      setShake(true);
      return;
    }
    setAdminOk(true);
    setAdminRows(await fetchAllSecrets());
  };

  if (adminGate) {
    return (
      <div className="app">
        <Background />
        <main className="sheet admin">
          <GoldTitle>Maxfiy daftar</GoldTitle>
          {!adminOk ? (
            <>
              <p className="muted">Faqat siz ko‘ra olasiz.</p>
              <input
                className="field"
                type="password"
                placeholder="Parol"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
              />
              <button className="btn gold" onClick={openAdmin}>
                Kirish
              </button>
            </>
          ) : (
            <div className="admin-list">
              {adminRows.length === 0 && (
                <p className="muted">Hali javob yo‘q.</p>
              )}
              {adminRows.map((row) => (
                <article key={row.id || "local"} className="admin-card">
                  <p>🎵 {row.song || "-"}</p>
                  <p>❌ Yo‘q urinishlari: {row.noAttempts ?? 0}</p>
                  <p>💍 {row.proposal || "-"}</p>
                  <p>📅 {row.day || "-"}</p>
                  <p>📍 {row.place || "-"}</p>
                  <p>🌹 {row.flower || "-"}</p>
                  <p>📱 {row.phone || "-"}</p>
                  <p>📝 {row.message || "-"}</p>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Background />
      <audio ref={audioRef} preload="auto" playsInline />
      <Progress page={page} />

      <main key={page} className={`sheet ${shake ? "shake" : ""}`}>
        {page === 1 && (
          <section className="stack">
            <p className="eyebrow">Faqat sen uchun</p>
            <GoldTitle>Assalomu alaykum, {CONFIG.girlName}.</GoldTitle>
            <p className="lead">
              Bu sahifada senga aytmoqchi bo'lgan gaplarim bor. <br />
              <b>Faqat sen ko‘rishing uchun.</b> <br />
              <b>Qo'shiqlardan birini tanla va davom et</b>
            </p>
            <div className="list">
              {CONFIG.songs.map((item) => (
                <button
                  key={item.id}
                  className={`song ${song?.id === item.id ? "active" : ""}`}
                  onClick={() => playSong(item)}
                >
                  <span className="song-ic">♪</span>
                  <span>
                    <b>{item.title}</b>
                    <small>{item.artist}</small>
                  </span>
                  {song?.id === item.id && <em>yonyapti</em>}
                </button>
              ))}
            </div>
            {musicError && <p className="warn">{musicError}</p>}
            <button
              className="btn gold"
              disabled={!song}
              onClick={() => song && go(2)}
            >
              Davom etish
            </button>
          </section>
        )}

        {page >= 2 && page <= 7 && (
          <section className="heart-page" onClick={onHeartTap}>
            <p className="eyebrow">QANDAY AYTISHNI BILMAYMAN {page - 1}/6</p>
            <div className="heart-pulse">♥</div>
            <RevealText text={CONFIG.hearts[page - 2]} />
            <div className="timer">
              <i style={{ animationName: "fillBar" }} />
            </div>
            <p className={`hint ${ready ? "show" : ""}`}>
              {ready
                ? "Ekranning istalgan joyiga tegining"
                : hint
                ? "Hozir emas... biroz his qiling"
                : "Biroz jim turing"}
            </p>
          </section>
        )}

        {page === 8 && (
          <section className="stack center proposal">
            {thanks ? (
              <>
                <div className="ring">💍</div>
                <GoldTitle className="big">Tashakkur...</GoldTitle>
                <p className="lead">
                  Bu javobni olishni anchadan buyon kutganman. <br />
                  Kel uchrashib gaplashib olamiz. <br />
                </p>
              </>
            ) : (
              <>
                <div className="ring pulse">♥</div>
                <GoldTitle className="big">
                  Men bilan birga hayot yo'lingni davom ettirishni xohlaysanmi? <br />
                  <small>Men bilan yaxshi-yomon kunimda birga bo'lasanmi?</small>
                </GoldTitle>
                <div className="yes-wrap">
                  <button
                    className="btn gold yes"
                    style={{
                      transform: `scale(${Math.min(1 + noAttempts * 0.08, 2.2)})`,
                    }}
                    onClick={sayYes}
                  >
                    Ha
                  </button>
                </div>
                <button
                  className={`btn ghost no-btn ${noPos ? "escaped" : ""}`}
                  style={
                    noPos
                      ? { left: noPos.x, top: noPos.y }
                      : undefined
                  }
                  onMouseEnter={runAway}
                  onPointerDown={runAway}
                >
                  Yo‘q
                </button>
              </>
            )}
          </section>
        )}

        {page === 9 && (
          <section className="stack">
            <p className="eyebrow">Uchrashuv</p>
            <GoldTitle>Kel kelishib bir kunni belgilab gaplashib olamiz.</GoldTitle>
            <p className="lead">
              <b>O'zing uchun qulay kunni tanla:</b>
            </p>
            <div className="list">
              <input
                className="field"
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn gold"
                  onClick={() => {
                    if (!day) return;
                    persist({ day });
                    go(10);
                  }}
                >
                  Davom etish
                </button>
                <button
                  className="btn ghost"
                  onClick={() => {
                    setDay("");
                    persist({ day: "" });
                    go(10);
                  }}
                >
                  O‘tkazib yuborish
                </button>
              </div>
            </div>
          </section>
        )}

        {page === 10 && (
          <section className="stack">
            <p className="eyebrow">Manzil</p>
            <GoldTitle>Qayerga boramiz?</GoldTitle>
            <div className="list">
              {CONFIG.places.map((item) => (
                <button
                  key={item.id}
                  className="card"
                  onClick={() => {
                    setPlace(item.id);
                    persist({ place: item.title });
                    go(11);
                  }}
                >
                  <span className="emoji">{item.emoji}</span>
                  <b>{item.title}</b>
                  <small>{item.note}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {page === 11 && (
          <section className="stack">
            <p className="eyebrow">Gullar</p>
            <GoldTitle>Qay birini yoqtirasan?</GoldTitle>
            <div className="list">
              {CONFIG.flowers.map((item) => (
                <button
                  key={item.id}
                  className="card"
                  onClick={() => {
                    setFlower(item.title);
                    persist({ flower: item.title });
                    go(12);
                  }}
                >
                  <span className="emoji">{item.emoji}</span>
                  <b>{item.title}</b>
                  <small>{item.note}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {page === 12 && (
          <section className="stack">
            <p className="eyebrow">Aloqa</p>
            <GoldTitle>Telefon raqamingiz</GoldTitle>
            <p className="lead">
              Balki raqamingni bersang suhbatimizni davom ettirishimiz oson bo‘rladi. <br />
            </p>
            <input
              className="field"
              type="tel"
              inputMode="tel"
              placeholder="+998 __ ___ __ __"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              className="btn gold"
              onClick={() => {
                persist({ phone: phone.trim() });
                go(13);
              }}
            >
              Davom etish
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                setPhone("");
                persist({ phone: "" });
                go(13);
              }}
            >
              O‘tkazib yuborish
            </button>
          </section>
        )}

        {page === 13 && (
          <section className="stack">
            <p className="eyebrow">Maktub</p>
            <GoldTitle>Men uchun habaring bo'lsa bu joyga yoz.</GoldTitle>
            <textarea
              className="field area"
              rows={6}
              placeholder="Shu yerga yozing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn gold" onClick={finishMessage}>
              Yuborish
            </button>
          </section>
        )}

        {page === 14 && (
          <section
            className={`finale ${place || "park"}`}
            onClick={advanceFromFinale}
          >
            <div className="burst">
              {Array.from({ length: 18 }, (_, i) => (
                <span key={i} className="petal" style={{ "--i": i }}>
                  {place === "kitob" ? "✧" : place === "restoran" ? "✦" : "♥"}
                </span>
              ))}
            </div>
            <GoldTitle className="big">
              Qayerga borishni istaysan?
            </GoldTitle>
            <p className="lead">
              {place === "restoran" && "Shamlar yonadi. Ikki piyola, bitta sukunat."}
              {place === "kitob" && "Sahifalar ochiladi. Sen esa eng sevimli bobim."}
              {place === "park" && "Shabada, barglar va sen bilan sekin qadamlar."}
              {!place && "Yuraklar osmonga uchmoqda."}
            </p>
            <p className="muted">
              {allowAdvance
                ? "Ekranning istalgan joyiga bosib davom eting."
                : "Tashakkur — iltimos 5 soniya kuting."}
            </p>
          </section>
        )}

        {page === 15 && (
          <section className="stack center">
            <p className="eyebrow">Ko‘rishguncha</p>
            <GoldTitle className="big">
              Ko‘rishguncha, go‘zal qalb.
            </GoldTitle>
            <p className="lead">
              Bu hayrlashuv emas. Bu — bizning hikoyamizning birinchi sahifasi.
            </p>
            {song && (
              <p className="song-final">
                Bizning qo‘shig‘imiz: <b>{song.title}</b>
              </p>
            )}
            <div className="heart-pulse huge">♥</div>
            <p className="muted">
              {CONFIG.boyName} tomonidan, faqat {CONFIG.girlName} uchun.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;