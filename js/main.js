/* =========================================================
   LOVELY LOCS BY YAK — Interactions
   ========================================================= */
(() => {
  "use strict";

  /* ---------- Booking config ---------- */
  const STYLIST_PHONE = "+14632316548";          // Ya Ya — (463) 231-6548
  const PHONE_DISPLAY = "(463) 231-6548";

  const buildMessage = (service = "") =>
    "Hi Ya Ya! I'm interested in booking an appointment with Lovely Locs by YaK!\n\n" +
    "My Name:\n" +
    `Service Interested In:${service ? " " + service : ""}\n` +
    "Preferred Appointment Date:\n" +
    "Preferred Appointment Time:\n" +
    "Additional Details / Styling Inspiration:\n\n" +
    "Please let me know your availability. Thank you!";

  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // iOS expects "sms:NUMBER&body=", Android/macOS accept "sms:NUMBER?&body="
  const smsHref = (service) => `sms:${STYLIST_PHONE}${isIOS ? "&" : "?&"}body=${encodeURIComponent(buildMessage(service))}`;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Service chips + live preview ---------- */
  const chips = $$('.chips input[name="svc"]');
  const preview = $(".js-preview");
  const chosenService = () => (chips.find((c) => c.checked) || {}).value || "";

  const escapeHTML = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function renderPreview() {
    if (!preview) return;
    const svc = chosenService();
    let html = escapeHTML(buildMessage(""));
    html = html.replace("Service Interested In:", `Service Interested In:${svc ? " <b>" + escapeHTML(svc) + "</b>" : ""}`);
    preview.innerHTML = html;
  }

  function refreshSmsLinks() {
    $$("[data-sms]").forEach((a) => {
      const service = a.hasAttribute("data-use-chips") ? chosenService() : a.dataset.service || "";
      a.setAttribute("href", smsHref(service));
    });
  }
  chips.forEach((c) => c.addEventListener("change", () => { renderPreview(); refreshSmsLinks(); }));
  $$(".js-phone-display").forEach((el) => (el.textContent = PHONE_DISPLAY));
  renderPreview();
  refreshSmsLinks();

  /* Desktop helper toast: sms: links may not open on every computer */
  const toast = $(".toast");
  let toastTimer;
  let lastMessage = buildMessage("");
  function showToast(service) {
    lastMessage = buildMessage(service);
    $(".toast__msg", toast).innerHTML = `Opening your messages app… On a computer without texting? Text Ya Ya at <strong>${PHONE_DISPLAY}</strong> — or copy the pre-written message.`;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-shown"), 9000);
  }
  if (toast) {
    $(".toast__x", toast).addEventListener("click", () => toast.classList.remove("is-shown"));
    $(".toast__copy", toast).addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(lastMessage); btn.textContent = "Copied ♡"; }
      catch { btn.textContent = "Copy failed"; }
      setTimeout(() => (btn.textContent = "Copy message"), 2200);
    });
  }
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-sms]");
    if (!a) return;
    if (!isTouchDevice) showToast(a.hasAttribute("data-use-chips") ? chosenService() : a.dataset.service || "");
  });

  /* ---------- Loader / intro ---------- */
  const html = document.documentElement;
  const body = document.body;
  let seen = false;
  try { seen = sessionStorage.getItem("ll-intro") === "1"; sessionStorage.setItem("ll-intro", "1"); } catch {}
  const introDelay = reduceMotion ? 0 : seen ? 250 : 1500;
  const start = performance.now();
  let loaded = false;
  function reveal() {
    if (loaded) return;
    loaded = true;
    const wait = Math.max(0, introDelay - (performance.now() - start));
    setTimeout(() => {
      body.classList.remove("is-loading");
      body.classList.add("is-loaded");
      // remove the curtain entirely once its exit animation has had time to play
      setTimeout(() => { const l = $(".loader"); if (l) l.remove(); }, 1300);
    }, wait);
  }
  if (document.readyState === "complete") reveal();
  else window.addEventListener("load", reveal);
  setTimeout(reveal, 3500); // failsafe for slow networks

  /* ---------- Navigation ---------- */
  const nav = $("[data-nav]");
  const toggle = $(".nav__toggle");
  const menu = $("#menu");
  let lastY = window.scrollY;

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
    if (open) nav.classList.remove("is-hidden");
  }
  toggle.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && body.classList.contains("menu-open")) setMenu(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 900 && body.classList.contains("menu-open")) setMenu(false); });

  // Active link highlighting
  const navLinks = $$("[data-link]");
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.dataset.section;
      navLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.link === id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("[data-section]").forEach((s) => sectionObserver.observe(s));

  /* ---------- Floating mobile CTA ---------- */
  const floatBook = $(".float-book");
  const hero = $(".hero");
  const book = $("#book");
  let heroVisible = true, bookVisible = false;
  const updateFloat = () => floatBook.classList.toggle("is-shown", !heroVisible && !bookVisible);
  new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; updateFloat(); }, { threshold: 0.05 }).observe(hero);
  new IntersectionObserver(([en]) => { bookVisible = en.isIntersecting; updateFloat(); }, { threshold: 0.05 }).observe(book);
  new IntersectionObserver(([en]) => { if (en.isIntersecting) { bookVisible = true; updateFloat(); } }).observe($(".footer"));

  /* ---------- Scroll reveals ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      revealObserver.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
  $$("[data-reveal], .g-item").forEach((el) => revealObserver.observe(el));

  // stagger siblings that reveal together
  $$(".pillars li, .steps li").forEach((el, i) => (el.style.transitionDelay = `${(i % 3) * 0.12}s`));

  /* ---------- Price count-up ---------- */
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      countObserver.unobserve(en.target);
      const el = en.target;
      const target = Number(el.dataset.count);
      if (reduceMotion) { el.textContent = target; return; }
      const dur = 1400, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      el.textContent = "0";
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- Statement: words light up as you scroll ---------- */
  const statement = $("[data-words]");
  let words = [];
  if (statement) {
    const wrapWords = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) wrapWords(child);
      });
    };
    statement.setAttribute("aria-label", statement.textContent.replace(/\s+/g, " ").trim());
    wrapWords(statement);
    words = $$(".w", statement);
    words.forEach((w) => w.setAttribute("aria-hidden", "true"));
    if (reduceMotion) words.forEach((w) => w.classList.add("on"));
  }
  function updateWords() {
    if (!words.length || reduceMotion) return;
    const r = statement.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
    const lit = Math.floor(Math.max(0, Math.min(1, progress)) * words.length * 1.1);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));
  }

  /* ---------- Parallax (uses the `translate` property so CSS transforms stay intact) ---------- */
  const parallaxEls = reduceMotion ? [] : $$("[data-speed]");
  function updateParallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.speed);
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });
  }

  /* ---------- Scroll loop ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 30);
      if (!body.classList.contains("menu-open")) nav.classList.toggle("is-hidden", y > lastY && y > 500);
      lastY = y;
      updateWords();
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Service card tilt (desktop) ---------- */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  }

  /* ---------- Custom cursor ---------- */
  const cursor = $(".cursor");
  if (finePointer && cursor && !reduceMotion) {
    const label = $(".cursor__label", cursor);
    let mx = -100, my = -100, cx = -100, cy = -100;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; cursor.classList.add("is-visible"); }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
    const loop = () => {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("mouseover", (e) => {
      const labelled = e.target.closest("[data-cursor]");
      const hoverable = e.target.closest("a, button, label");
      cursor.classList.toggle("is-active", !!labelled);
      cursor.classList.toggle("is-hover", !labelled && !!hoverable);
      label.textContent = labelled ? labelled.dataset.cursor : "";
    });
  }

  /* ---------- Gallery lightbox ---------- */
  const items = $$(".g-item");
  const lb = $(".lightbox");
  const lbImg = $(".lightbox__img", lb);
  const lbCap = $(".lightbox__cap", lb);
  const lbCount = $(".lightbox__count", lb);
  let current = 0, lastFocus = null;

  function show(i) {
    current = (i + items.length) % items.length;
    const item = items[current];
    const thumb = $("img", item);
    lbImg.classList.remove("is-ready");
    lbImg.alt = thumb.alt;
    lbCap.textContent = item.dataset.caption || "";
    lbCount.textContent = `${String(current + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    const src = item.dataset.full;
    const img = new Image();
    img.onload = () => { lbImg.src = src; requestAnimationFrame(() => lbImg.classList.add("is-ready")); };
    img.src = src;
    // preload neighbour
    const next = items[(current + 1) % items.length];
    if (next) new Image().src = next.dataset.full;
  }
  function openLB(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    body.classList.add("lb-open");
    $(".lightbox__close", lb).focus();
  }
  function closeLB() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    body.classList.remove("lb-open");
    if (lastFocus) lastFocus.focus();
  }
  items.forEach((item, i) => item.addEventListener("click", () => openLB(i)));
  $(".lightbox__close", lb).addEventListener("click", closeLB);
  $(".lightbox__prev", lb).addEventListener("click", () => show(current - 1));
  $(".lightbox__next", lb).addEventListener("click", () => show(current + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lightbox__figure")) closeLB(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowRight") show(current + 1);
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "Tab") { // simple focus trap
      const f = $$("button", lb);
      const idx = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Misc ---------- */
  $$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
