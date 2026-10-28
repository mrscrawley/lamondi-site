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
  // на главной логотип в шапке появляется, когда в неё «приедет» большое слово (initLogoDock) — прячем сразу, без мелькания
  if (document.querySelector(".hero .hero__word .lm") && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.documentElement.classList.add("dock");
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
    v ? window.lenis?.stop() : window.lenis?.start();
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

/* ---------- главная: большое «lamondi» при скролле уменьшается и уезжает в логотип шапки ----------
   Копия вордмарка (fixed, над шапкой) двигается только transform; оригинал держит место в вёрстке. */
let dockOff = null;
function initLogoDock() {
  dockOff?.();
  const hero = document.querySelector(".hero .hero__word .lm"), head = document.querySelector(".site-header .logo-word .lm");
  const root = document.documentElement;
  if (!hero || !head || matchMedia("(prefers-reduced-motion: reduce)").matches) { root.classList.remove("dock"); return; }
  root.classList.add("dock"); root.classList.remove("dock-in");
  hero.style.visibility = "";
  const cs = getComputedStyle(hero);
  const ghost = document.createElement("div");
  ghost.className = "logo-ghost"; ghost.setAttribute("aria-hidden", "true");
  ghost.style.cssText = `font-size:${cs.fontSize};letter-spacing:${cs.letterSpacing};font-weight:${cs.fontWeight};line-height:${cs.lineHeight}`;
  ghost.append(hero.cloneNode(true));
  document.body.append(ghost);
  const g0 = ghost.getBoundingClientRect(), i0 = ghost.firstChild.getBoundingClientRect();
  const ox = i0.left - g0.left, oy = i0.top - g0.top;   // слово внутри копии смещено от её угла — учитываем
  const gw = i0.width;                                  // ширина копии в масштабе 1
  const sub = document.querySelector(".hero .hero__sub"), bar = document.querySelector(".site-header");
  hero.style.visibility = "hidden";
  let queued = false, docked = null;
  const tick = () => {
    queued = false;
    // геометрию берём каждый кадр с настоящего (скрытого) слова — копия всегда стоит точно на его месте,
    // даже если шрифт догрузился или ширина окна поменялась
    const sY = scrollY, r = hero.getBoundingClientRect(), d = head.getBoundingClientRect();
    const top0 = r.top + sY, B0 = (sub ? sub.getBoundingClientRect().top : r.bottom) + sY;
    const dist = Math.max(160, B0 - bar.getBoundingClientRect().bottom);
    const p = Math.min(1, Math.max(0, sY / dist));
    const shrink = 1 - Math.pow(1 - p, 2);             // уменьшается сразу
    const rise = p * p * p;                             // в полосу шапки заходит только в конце, уже маленьким
    const x = r.left + (d.left - r.left) * shrink, y = top0 + (d.top - top0) * rise;
    // не наезжать на «bayreuth», который уезжает вверх: доля свободного места от того, что было в покое
    const room = ((B0 - sY) - y) / (B0 - top0);
    const w = p >= 1 ? d.width : Math.max(d.width, Math.min(r.width + (d.width - r.width) * shrink, r.width * room));
    const sc = w / gw;
    ghost.style.transform = `translate3d(${(x - ox * sc).toFixed(1)}px,${(y - oy * sc).toFixed(1)}px,0) scale(${sc.toFixed(4)})`;
    const inHead = p >= 1;
    if (inHead !== docked) { docked = inHead; root.classList.toggle("dock-in", inHead); ghost.style.opacity = inHead ? 0 : 1; }
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(tick); } };
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); tick();
  dockOff = () => { removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); ghost.remove(); hero.style.visibility = ""; };
}

/* ---------- инерционная прокрутка страницы (как на «Родос»): только мышь/тачпад, на телефоне — родная ---------- */
function initSmooth() {
  if (!window.Lenis || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(pointer: fine)").matches) return;
  const lenis = window.lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
// Safari/Firefox не знают speculationrules — подгружаем страницу при наведении/касании обычным prefetch
function initPrefetch() {
  if (HTMLScriptElement.supports?.("speculationrules")) return;
  const done = new Set();
  const pre = e => {
    const a = e.target.closest?.("a[href]");
    if (!a || a.origin !== location.origin || !/\.html/.test(a.pathname) || samePage(a) || done.has(a.pathname)) return;
    done.add(a.pathname);
    const l = document.createElement("link"); l.rel = "prefetch"; l.href = a.href.split("#")[0]; document.head.append(l);
  };
  document.addEventListener("pointerover", pre, { passive: true });
  document.addEventListener("touchstart", pre, { passive: true });
}
// якоря (#anfahrt, #catering …) — плавно и с поправкой на шапку; на телефоне — родной плавной прокруткой
function initAnchors() {
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || !samePage(a)) return;
    const t = anchorTarget(a.hash);
    if (!t) return;
    e.preventDefault();
    if (window.lenis) window.lenis.scrollTo(t, { offset: -headerH(), duration: 1.2 });
    else scrollTo({ top: t.getBoundingClientRect().top + scrollY - headerH(), behavior: "smooth" });
    history.replaceState(null, "", a.hash);
  });
}
// куда на самом деле прокручивать по якорю: у секции можно указать data-scroll-to — например,
// для #catering не заголовок, а сам блок с текстом и фото, ровно под шапкой
const headerH = () => document.querySelector(".site-header")?.offsetHeight || 0;
const anchorTarget = hash => {
  const sec = hash.length > 1 && document.querySelector(hash);
  if (!sec) return null;
  return (sec.dataset.scrollTo && sec.querySelector(sec.dataset.scrollTo)) || sec;
};
const samePage = a => a.origin === location.origin && a.pathname.replace(/index\.html$/, "") === location.pathname.replace(/index\.html$/, "");
// пришли по ссылке с другой страницы (index.html#catering) — встать так же, как при клике
function landOnHash() {
  const t = location.hash && anchorTarget(location.hash);
  if (!t) return;
  const y = t.getBoundingClientRect().top + scrollY - headerH();
  window.lenis ? window.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
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
  // обычная горизонтальная прокрутка (трекпад, палец, полоса) + стрелки и счётчик
  document.querySelectorAll("[data-slider]").forEach(root => {
    const track = root.querySelector(".fav__track");
    const slides = [...track.children], n = slides.length;
    const out = document.querySelectorAll("[data-slider-count]");
    const idx = () => Math.round(track.scrollLeft / track.clientWidth);
    const prev = document.querySelectorAll("[data-prev]"), next = document.querySelectorAll("[data-next]");
    const show = () => {
      const i = Math.min(n - 1, Math.max(0, idx()));
      slides.forEach((sl, k) => sl.setAttribute("aria-hidden", String(k !== i)));
      out.forEach(o => o.innerHTML = `${i + 1} ${T("von", "of")} ${n}`);
      prev.forEach(b => b.disabled = i === 0); next.forEach(b => b.disabled = i === n - 1);   // на краях стрелка гаснет
    };
    const go = i => track.scrollTo({ left: Math.min(n - 1, Math.max(0, i)) * track.clientWidth });
    // горизонтальный жест трекпада — ленте (родная прокрутка), а не плавному скроллу страницы
    track.addEventListener("wheel", e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation(); }, { passive: true });
    prev.forEach(b => b.addEventListener("click", () => go(idx() - 1)));
    next.forEach(b => b.addEventListener("click", () => go(idx() + 1)));
    let raf; track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(show); }, { passive: true });
    show();
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
  initSmooth();
  initAnchors();
  initPrefetch();
  initSlider();
  initForms();
  initVideo();
  document.fonts?.ready.then(() => { fitWords(); placeDots(); initLogoDock(); landOnHash(); });
  let rz; addEventListener("resize", () => { fitWords(); clearTimeout(rz); rz = setTimeout(initLogoDock, 150); });
});
