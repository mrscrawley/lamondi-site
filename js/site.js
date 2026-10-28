/* lamondi — общий скрипт: шапка/подвал, языки, меню, слайдер, анимации */

const T = (de, en) => `<span data-l="de">${de}</span><span data-l="en">${en}</span>`;

// Контакты, часы, Instagram.
const CONFIG = {
  phone: "0921 2305699",
  tel: "+499212305699",
  fax: "0921 2305693",
  street: "Bahnhofstraße 23",
  city: "95444 Bayreuth",
  maps: "https://www.google.com/maps/search/?api=1&query=Lamondi+Bahnhofstra%C3%9Fe+23+95444+Bayreuth",
  email: "",          // TODO: уточнить, есть ли почта. Пока пусто: форма предлагает позвонить
  instagram: "https://www.instagram.com/lamondi_bayreuth/",
  // часы из профиля Google (27.10.2026)
  hours: [
    { de: "mo – sa", en: "mon – sat", t: "09:00 – 14:00" },
    { de: "", en: "", t: "17:00 – 23:00" },
    { de: "sonntag", en: "sunday", t: T("ruhetag", "closed") },
  ],
};

const NAV = [
  { href: "speisekarte.html", de: "speisekarte", en: "menu" },
  { href: "reservierung.html", de: "reservierung", en: "reservations" },
  { href: "index.html#catering", de: "feiern + catering", en: "parties + catering" },
  { href: "ueber-uns.html", de: "über uns", en: "about us" },
];

const page = location.pathname.split("/").pop() || "index.html";

/* ---------- язык ---------- */
function getLang() {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "de" || q === "en") return q;
  try { const s = localStorage.getItem("lamondi-lang"); if (s) return s; } catch (e) {}
  return "de"; // немецкий по умолчанию, EN — переключателем
}
function setLang(l) {
  document.documentElement.lang = l;
  try { localStorage.setItem("lamondi-lang", l); } catch (e) {}
  document.querySelectorAll(".lang-switch button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
  // атрибуты: data-ph-de / data-ph-en (placeholder), data-title-de / -en
  document.querySelectorAll("[data-ph-de]").forEach(el => el.placeholder = el.dataset["ph" + (l === "de" ? "De" : "En")]);
  document.querySelectorAll("option[data-de]").forEach(o => o.textContent = o.dataset[l]);
  const t = document.querySelector("meta[name='title-" + l + "']");
  if (t) document.title = t.content;
  document.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  requestAnimationFrame(fitWords);
}
document.documentElement.lang = getLang();

const langSwitch = () => `<div class="lang-switch" role="group" aria-label="Sprache / Language">
  <button type="button" data-lang="de" aria-pressed="false">DE</button><button type="button" data-lang="en" aria-pressed="false">EN</button></div>`;

/* ---------- шапка / подвал ---------- */
function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;
  const links = NAV.map(n => {
    const cur = n.href === page ? ' aria-current="page"' : "";
    return `<li><a href="${n.href}"${cur}>${T(n.de, n.en)}</a></li>`;
  }).join("");
  el.className = "site-header";
  el.innerHTML = `<div class="container header-in">
      <a class="logo-word" href="index.html" aria-label="lamondi — Startseite"><span class="lm" aria-label="lamondi">lamond<span class="idot">ı</span></span></a>
      <nav class="nav-main" aria-label="Hauptnavigation"><ul>${links}</ul></nav>
      <div class="header-right">
        ${langSwitch()}
        <a class="header-res link" href="reservierung.html">${T("reservieren", "reserve")}</a>
        <button class="burger" type="button" aria-label="Menü öffnen" aria-controls="side-nav" aria-expanded="false"><span></span></button>
      </div>
    </div>`;

  const side = document.createElement("div");
  side.className = "side-nav"; side.id = "side-nav";
  side.innerHTML = `<div class="side-nav__scrim" data-close></div>
    <aside class="side-nav__panel" aria-label="Menü">
      <div class="side-nav__top"><a class="logo-word" href="index.html"><span class="lm" aria-label="lamondi">lamond<span class="idot">ı</span></span></a>
        <button class="side-nav__close" type="button" aria-label="Schließen" data-close>×</button></div>
      <ul>${NAV.map(n => `<li><a href="${n.href}">${T(n.de, n.en)}</a></li>`).join("")}</ul>
      <div class="side-nav__foot">
        ${langSwitch()}
        <p>${CONFIG.street}<br>${CONFIG.city}<br><a href="tel:${CONFIG.tel}">${CONFIG.phone}</a></p>
      </div>
    </aside>`;
  document.body.appendChild(side);

  const burger = el.querySelector(".burger");
  const open = v => {
    side.classList.toggle("is-open", v);
    burger.setAttribute("aria-expanded", String(v));
    document.documentElement.style.overflow = v ? "hidden" : "";
  };
  burger.addEventListener("click", () => open(true));
  side.addEventListener("click", e => { if (e.target.closest("[data-close]") || e.target.closest("a")) open(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") open(false); });

  const onScroll = () => el.classList.toggle("is-scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
}

function hoursHTML() {
  return `<div class="hours">${CONFIG.hours.map(h => `<span>${T(h.de, h.en)}</span><span>${h.t}</span>`).join("")}</div>`;
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.className = "site-footer";
  const insta = CONFIG.instagram ? `<li><a href="${CONFIG.instagram}" target="_blank" rel="noopener">instagram</a></li>` : "";
  el.innerHTML = `<div class="container">
    <div class="footer-box">
      <div class="footer-logo"><a href="index.html"><span class="word"><span class="lm" aria-label="lamondi">lamond<span class="idot">ı</span></span></span><small>bayreuth</small></a></div>
      <div class="footer-cols">
        <div><h4>${T("adresse", "address")}</h4>
          <p>${CONFIG.street}<br>${CONFIG.city}<br><a href="${CONFIG.maps}" target="_blank" rel="noopener">${T("route planen", "get directions")}</a></p></div>
        <div><h4>${T("öffnungszeiten", "opening hours")}</h4>${hoursHTML()}</div>
        <div><h4>${T("kontakt", "contact")}</h4>
          <ul><li><a href="tel:${CONFIG.tel}">${CONFIG.phone}</a></li>
          ${CONFIG.email ? `<li><a href="mailto:${CONFIG.email}">${CONFIG.email}</a></li>` : ""}
          ${insta}</ul></div>
        <div><h4>${T("entdecken", "explore")}</h4>
          <ul>${NAV.map(n => `<li><a href="${n.href}">${T(n.de, n.en)}</a></li>`).join("")}</ul></div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} lamondi · ${T("familienrestaurant seit 2000", "family restaurant since 2000")}</span>
      <span><a href="impressum.html">impressum</a> · <a href="datenschutz.html">${T("datenschutz", "privacy")}</a></span>
      <span class="credit">designed by <a href="https://nolvi-studio.com/" target="_blank" rel="noopener">nolvi studio</a></span>
    </div>
  </div>`;
}

/* ---------- огромный вордмарк во всю ширину ---------- */
function fitWords() {
  document.querySelectorAll("[data-fit]").forEach(w => {
    const box = w.parentElement.clientWidth;
    w.style.fontSize = "100px";
    w.style.display = "inline-block";
    const k = box / w.getBoundingClientRect().width;
    w.style.display = "";
    w.style.fontSize = Math.floor(100 * k * (parseFloat(w.dataset.fit) || 1)) + "px";
  });
}

/* точка над i: квадрат шириной ровно с палочку ı, точно над ней, по высоте — там же,
   где родная точка «i» шрифта (ищем её по пикселям). Всё в em — не зависит от размера. */
function placeDots() {
  const FS = 400, cv = document.createElement("canvas"), ctx = cv.getContext("2d", { willReadFrequently: true });
  cv.width = FS; cv.height = FS * 1.4;
  document.querySelectorAll(".idot").forEach(el => {
    const cs = getComputedStyle(el);
    ctx.font = `${cs.fontWeight} ${FS}px ${cs.fontFamily}`;
    const m = ctx.measureText("ı");
    const left = -m.actualBoundingBoxLeft, w = m.actualBoundingBoxRight - left;
    const base = m.fontBoundingBoxAscent;            // базовая линия от верха content-area
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillText("i", 50, base);
    const x = Math.round(50 + left + w / 2), px = ctx.getImageData(x, 0, 1, cv.height).data;
    let top = -1, bottom = -1;                        // первая сплошная полоса сверху — точка
    for (let y = 0; y < cv.height; y++) {
      const ink = px[y * 4 + 3] > 128;
      if (ink && top < 0) top = y;
      if (!ink && top >= 0) { bottom = y; break; }
    }
    const dotH = bottom - top, cy = top + dotH / 2;   // центр родной точки
    el.style.setProperty("--dl", (left / FS).toFixed(4) + "em");
    el.style.setProperty("--dw", (w / FS).toFixed(4) + "em");
    el.style.setProperty("--dt", ((cy - w / 2) / FS).toFixed(4) + "em");
  });
}

/* ---------- появление, параллакс полосы ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("is-in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  // соседние блоки в одной строке появляются с небольшим сдвигом
  els.forEach(e => {
    const sib = [...e.parentElement.children].filter(c => c.classList.contains("reveal"));
    if (sib.length > 1) e.style.setProperty("--rd", sib.indexOf(e) * 0.12 + "s");
    io.observe(e);
  });
}
/* ---------- стена с нишами: белая стена, ниши в шахматном порядке, в нишах статуэтки ---------- */
// ниши со статуэтками — студийные кадры по фото стены, одинаковое кадрирование (_gen/niche_crop.py)
const NICHES = ["buddha", "vase", "bowl", "hand", "abstract", "urn", "candle", "figure"];
const CORAL = ["buddha", "hand", "bowl", "vase", "abstract", "urn"];   // есть коралловые версии: coral-<имя>
const niche = (name, coral) => `<img src="assets/img/niches/${coral ? "coral-" : ""}${name}.webp" alt="" loading="lazy" decoding="async">`;

function wallHTML(rows, cols, interactive, seed = 0) {
  let h = "", k = seed, kc = seed, lastCoral = "";
  const used = {};                                   // "r,c" → фигура, чтобы одинаковые не стояли рядом
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    // в колоночном порядке для полосы, в строчном для стены — порядок задаёт grid-auto-flow
    const rr = interactive ? Math.floor((c * rows + r) / cols) : r;
    const cc = interactive ? (c * rows + r) % cols : c;
    if ((rr + cc) % 2) { h += '<div class="wall__cell"></div>'; continue; }
    const coral = (cc + rr * 6) % 9 < 2; // ~каждая четвёртая ниша — коралловая; по координатам, чтобы вразброс и в стене, и в обоих рядах полосы
    // соседи в радиусе двух клеток (по диагонали, через одну в ряду и в столбце) — фигура должна отличаться
    const near = new Set();
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) if (dr || dc) near.add(used[(rr + dr) + "," + (cc + dc)]);
    if (coral) near.add(lastCoral);                  // и две коралловые подряд — с разными фигурами
    const pool = coral ? CORAL : NICHES;
    const start = coral ? kc++ : k * 3;              // коралловые идут своим кругом — Будда, рука, чаша, ваза…
    let name = pool[start % pool.length];
    for (let i = 0; i < pool.length; i++) { const cand = pool[(start + i) % pool.length]; if (!near.has(cand)) { name = cand; break; } }
    used[rr + "," + cc] = name; if (coral) lastCoral = name;
    const tag = interactive ? 'button type="button" aria-label="Nische"' : "span";
    h += `<div class="wall__cell"><${tag} class="niche">${niche(name, coral)}</${tag.split(" ")[0]}></div>`;
    k++;
  }
  return h;
}

function initLightWall() {
  const bands = document.querySelectorAll(".pattern-band");
  bands.forEach(b => {
    const cols = Math.ceil((b.clientWidth + 400) / 64);
    b.innerHTML = `<div class="wall">${wallHTML(2, cols, false)}</div>`;
  });
  document.querySelectorAll("[data-lightwall]").forEach(g => {
    g.classList.add("wall");
    g.innerHTML = wallHTML(5, 6, true, 2);
    g.addEventListener("click", e => e.target.closest(".niche")?.classList.toggle("off"));
  });
  if (!bands.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // двигаем только полосы в кадре, сразу transform у слоя (без пересчёта стилей), не чаще кадра
  const walls = new Map([...bands].map(b => [b, b.firstElementChild]));
  const seen = new Set();
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
  bands.forEach(b => io.observe(b));
  let queued = false;
  const tick = () => {
    queued = false;
    seen.forEach(b => { walls.get(b).style.transform = `translate3d(${(b.getBoundingClientRect().top * 0.2 - 60).toFixed(1)}px,0,0)`; });
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(tick); } }, { passive: true });
  bands.forEach(b => { seen.add(b); }); tick();
}

/* ---------- слайдер любимых блюд ---------- */
function initSlider() {
  document.querySelectorAll("[data-slider]").forEach(root => {
    const track = root.querySelector(".fav__track");
    const slides = [...track.children];
    const out = document.querySelectorAll("[data-slider-count]");
    let i = 0;
    const go = n => {
      i = (n + slides.length) % slides.length;
      track.style.transform = `translateX(${-100 * i}%)`;
      slides.forEach((s, k) => { s.classList.toggle("is-active", k === i); s.setAttribute("aria-hidden", String(k !== i)); });
      out.forEach(o => o.innerHTML = `${i + 1} ${T("von", "of")} ${slides.length}`);
    };
    document.querySelectorAll("[data-prev]").forEach(b => b.addEventListener("click", () => go(i - 1)));
    document.querySelectorAll("[data-next]").forEach(b => b.addEventListener("click", () => go(i + 1)));
    let x0 = null;
    root.addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
    root.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    go(0);
  });
}

/* ---------- «перейти к» ---------- */
function initJump() {
  const dd = document.querySelector("[data-jump]");
  if (!dd) return;
  const btn = dd.querySelector(".jump__btn"), list = dd.querySelector(".jump__list");
  const open = v => { list.hidden = !v; btn.setAttribute("aria-expanded", String(v)); };
  btn.addEventListener("click", () => {
    open(list.hidden);
    if (!list.hidden) list.querySelector("a").focus({ preventScroll: true });
  });
  list.addEventListener("click", e => { if (e.target.closest("a")) open(false); });
  document.addEventListener("click", e => { if (!dd.contains(e.target)) open(false); });
  dd.addEventListener("keydown", e => {
    const links = [...list.querySelectorAll("a")], i = links.indexOf(document.activeElement);
    if (e.key === "Escape") { open(false); btn.focus(); }
    if (e.key === "ArrowDown" && !list.hidden) { e.preventDefault(); links[(i + 1) % links.length].focus(); }
    if (e.key === "ArrowUp" && !list.hidden) { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
  });
}

/* ---------- формы ---------- */
function initForms() {
  const rf = document.querySelector("[data-reservation]");
  if (rf) {
    const d = rf.querySelector("[name=date]");
    if (d) d.min = new Date().toISOString().slice(0, 10);
    rf.addEventListener("submit", e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(rf));
      const msg = rf.querySelector(".form-msg");
      const body = `Reservierungsanfrage\n\nDatum: ${f.date}\nUhrzeit: ${f.time}\nPersonen: ${f.guests}\nName: ${f.name}\nTelefon: ${f.phone}\nE-Mail: ${f.email || "-"}\n\n${f.note || ""}`;
      if (CONFIG.email) {
        location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Reservierung " + f.date + " " + f.time)}&body=${encodeURIComponent(body)}`;
        msg.className = "form-msg ok";
        msg.innerHTML = T("Ihr E-Mail-Programm öffnet sich — bitte senden Sie die Anfrage ab.", "Your e-mail app is opening — please send the request.");
      } else {
        msg.className = "form-msg ok";
        msg.innerHTML = T(`Online-Reservierung folgt in Kürze. Bitte rufen Sie uns an: <a href="tel:${CONFIG.tel}">${CONFIG.phone}</a>`,
                          `Online booking is coming soon. Please call us: <a href="tel:${CONFIG.tel}">${CONFIG.phone}</a>`);
      }
    });
  }
}

/* ---------- подстановка контактов в разметку ---------- */
function fillConfig() {
  document.querySelectorAll("[data-hours]").forEach(e => e.innerHTML = hoursHTML());
  document.querySelectorAll("[data-phone]").forEach(e => { e.href = "tel:" + CONFIG.tel; e.textContent = CONFIG.phone; });
  document.querySelectorAll("[data-maps]").forEach(e => e.href = CONFIG.maps);
}

/* ---------- видео вместо фото, если положить assets/video.mp4 ---------- */
function initVideo() {
  const v = document.querySelector("video[data-optional]");
  if (!v) return;
  v.addEventListener("error", () => v.remove(), true);
  v.querySelector("source")?.addEventListener("error", () => v.remove());
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  fillConfig();
  document.addEventListener("click", e => {
    const b = e.target.closest(".lang-switch button");
    if (b) setLang(b.dataset.lang);
  });
  setLang(document.documentElement.lang);
  initReveal();
  initLightWall();
  initSlider();
  initJump();
  initForms();
  initVideo();
  document.fonts?.ready.then(() => { fitWords(); placeDots(); });
  addEventListener("resize", fitWords);
});
