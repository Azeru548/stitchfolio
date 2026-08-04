/* Kennedy Chinwo — portfolio interactions
   Parallax · reveals · reactive cards · scroll rail */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Scroll progress rail ── */
  const rail = document.querySelector(".scroll-rail__fill");
  function updateRail() {
    if (!rail) return;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    rail.style.width = p + "%";
  }

  /* ── Nav scroll state ── */
  const nav = document.querySelector(".nav");
  function updateNav() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  /* ── Mobile menu ── */
  const menuBtn = document.querySelector(".nav__menu-btn");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", nav.classList.contains("is-open"));
    });
    nav.querySelectorAll(".nav__links a").forEach((a) => {
      a.addEventListener("click", () => nav.classList.remove("is-open"));
    });
  }

  /* ── Section step dots ── */
  const sections = document.querySelectorAll("[data-step]");
  const dots = document.querySelectorAll(".step-dots a");
  function updateDots() {
    if (!sections.length || !dots.length) return;
    let active = 0;
    const mid = window.innerHeight * 0.4;
    sections.forEach((sec, i) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= mid) active = i;
    });
    dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
  }

  /* ── Reveal on scroll ── */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ── Ambient orb parallax ── */
  const orbs = document.querySelectorAll(".ambient__orb");
  let mx = 0, my = 0, tx = 0, ty = 0;
  let scrollY = 0;

  function onPointerMove(e) {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    mx = x;
    my = y;
  }

  function tickParallax() {
    if (reduceMotion) return;
    tx += (mx - tx) * 0.06;
    ty += (my - ty) * 0.06;
    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 12;
      const sy = scrollY * (0.02 + i * 0.015);
      orb.style.transform =
        "translate3d(" + tx * depth + "px," + (ty * depth * 0.6 - sy) + "px,0)";
    });
    requestAnimationFrame(tickParallax);
  }

  if (orbs.length && !reduceMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    requestAnimationFrame(tickParallax);
  }

  /* ── Cursor glow ── */
  const glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    let gx = 0, gy = 0, cx = 0, cy = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        gx = e.clientX;
        gy = e.clientY;
        glow.classList.add("is-on");
      },
      { passive: true }
    );
    window.addEventListener("pointerleave", () => glow.classList.remove("is-on"));
    (function loop() {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.left = cx + "px";
      glow.style.top = cy + "px";
      requestAnimationFrame(loop);
    })();
  }

  /* ── Card spotlight + tilt ── */
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener(
      "pointermove",
      (e) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty("--mx", x + "%");
        card.style.setProperty("--my", y + "%");

        if (card.classList.contains("card--tilt") && !reduceMotion) {
          /* hard offset, not soft 3D bubble */
          card.style.transform = "translate(-3px, -3px)";
        }
      },
      { passive: true }
    );
    card.addEventListener("pointerleave", () => {
      if (card.classList.contains("card--tilt")) {
        card.style.transform = "";
      }
    });
  });

  /* ── Magnetic buttons ── */
  document.querySelectorAll(".btn--primary, .nav__cta").forEach((btn) => {
    if (reduceMotion) return;
    btn.addEventListener(
      "pointermove",
      (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform =
          "translate(" + x * 0.18 + "px," + y * 0.22 + "px)";
      },
      { passive: true }
    );
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });

  /* ── Portrait parallax depth ── */
  const portrait = document.querySelector(".portrait-stack");
  if (portrait && !reduceMotion) {
    portrait.addEventListener(
      "pointermove",
      (e) => {
        const r = portrait.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const frame = portrait.querySelector(".portrait-stack__frame");
        const floats = portrait.querySelectorAll(".portrait-stack__float");
        if (frame) {
          frame.style.transform =
            "rotateY(" + x * 6 + "deg) rotateX(" + -y * 5 + "deg)";
        }
        floats.forEach((f, i) => {
          const m = (i + 1) * 8;
          f.style.transform =
            "translate(" + x * m + "px," + y * m + "px)";
        });
      },
      { passive: true }
    );
    portrait.addEventListener("pointerleave", () => {
      const frame = portrait.querySelector(".portrait-stack__frame");
      const floats = portrait.querySelectorAll(".portrait-stack__float");
      if (frame) frame.style.transform = "";
      floats.forEach((f) => (f.style.transform = ""));
    });
  }

  /* ── Count-up metrics ── */
  function animateValue(el, target, suffix) {
    const isNum = !isNaN(target);
    if (!isNum) {
      el.textContent = target + (suffix || "");
      return;
    }
    const end = Number(target);
    const dur = 1200;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(end * eased) + (suffix || "");
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll("[data-count]").forEach((el) => {
    const val = el.getAttribute("data-count");
    const suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = val + suffix;
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateValue(el, val, suffix);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
  });

  /* ── Scroll loop ── */
  let ticking = false;
  function onScroll() {
    scrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        updateRail();
        updateNav();
        updateDots();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  updateRail();
  updateNav();
  updateDots();

  /* ── Soft press haptic via Vibration API (mobile) ── */
  document.querySelectorAll(".btn, .card a, .nav__cta, .pressable").forEach((el) => {
    el.addEventListener(
      "pointerdown",
      () => {
        if (navigator.vibrate) navigator.vibrate(8);
      },
      { passive: true }
    );
  });
})();
