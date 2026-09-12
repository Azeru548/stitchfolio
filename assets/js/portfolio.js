/* Kennedy Chinwo — Cartoon Lab interactions
   Bouncy reveals · parallax orbs · star cursor · wobbly cards · portrait depth */

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
      const open = nav.classList.contains("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      // bouncy pop
      menuBtn.animate(
        [{ transform: "scale(0.92) rotate(-3deg)" }, { transform: "scale(1) rotate(0deg)" }],
        { duration: 320, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
      );
    });
    nav.querySelectorAll(".nav__links a").forEach((a) => {
      a.addEventListener("click", () => nav.classList.remove("is-open"));
    });
  }

  /* ── Step dots ── */
  const sections = document.querySelectorAll("[data-step]");
  const dots = document.querySelectorAll(".step-dots a");
  function updateDots() {
    if (!sections.length || !dots.length) return;
    let active = 0;
    const mid = window.innerHeight * 0.42;
    sections.forEach((sec, i) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= mid) active = i;
    });
    dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
  }

  /* ── Bouncy reveal ── */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            // extra pop for cards
            if (e.target.classList.contains("card")) {
              e.target.animate(
                [
                  { transform: "translateY(18px) scale(0.97) rotate(0.6deg)" },
                  { transform: "translateY(0) scale(1) rotate(0deg)" },
                ],
                { duration: 650, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
              );
            }
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

  /* ── Parallax orbs + any [data-parallax] ── */
  const orbs = document.querySelectorAll(".ambient__orb");
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  let mx = 0, my = 0, tx = 0, ty = 0;
  let scrollY = window.scrollY;
  let scrollT = 0;

  function onPointerMove(e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function tickParallax() {
    if (reduceMotion) return;
    tx += (mx - tx) * 0.07;
    ty += (my - ty) * 0.07;
    scrollT += (scrollY - scrollT) * 0.08;

    orbs.forEach((orb, i) => {
      const speed = parseFloat(orb.dataset.speed) || 0.14 + i * 0.07;
      const depthX = (i + 1) * 18;
      const depthY = (i + 1) * 12;
      const sy = scrollT * speed * 0.45;
      const rx = tx * depthX;
      const ry = ty * depthY * 0.7 - sy;
      const rot = tx * 2.2;
      orb.style.transform = "translate3d(" + rx + "px," + ry + "px,0) rotate(" + rot + "deg)";
    });

    // generic parallax for other stamped elements
    parallaxEls.forEach((el) => {
      if (el.classList.contains("ambient__orb")) return;
      const s = parseFloat(el.dataset.speed) || 0.15;
      el.style.transform = "translate3d(0," + (-scrollT * s * 0.35) + "px,0)";
    });

    // hero subtle tilt based on mouse
    const hero = document.querySelector(".hero__grid");
    if (hero) {
      hero.style.transform = "translate3d(" + tx * 6 + "px," + ty * 4 + "px,0)";
    }

    requestAnimationFrame(tickParallax);
  }

  if (!reduceMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    requestAnimationFrame(tickParallax);
  }

  /* ── Star cursor ── */
  const glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    let gx = -100, gy = -100, cx = -100, cy = -100;
    let raf = null;
    window.addEventListener(
      "pointermove",
      (e) => {
        gx = e.clientX;
        gy = e.clientY;
        glow.classList.add("is-on");
        if (!raf) raf = requestAnimationFrame(loop);
      },
      { passive: true }
    );
    window.addEventListener("pointerleave", () => glow.classList.remove("is-on"));
    // hover enlarge on interactive
    document.querySelectorAll("a, button, .card").forEach((el) => {
      el.addEventListener("pointerenter", () => glow.classList.add("is-hover"));
      el.addEventListener("pointerleave", () => glow.classList.remove("is-hover"));
    });
    function loop() {
      cx += (gx - cx) * 0.18;
      cy += (gy - cy) * 0.18;
      glow.style.left = cx + "px";
      glow.style.top = cy + "px";
      // wobble based on velocity
      const dx = gx - cx;
      const dy = gy - cy;
      const scale = 1 + Math.min(0.22, Math.hypot(dx, dy) * 0.008);
      glow.style.transform = "translate(-50%, -50%) scale(" + scale + ") rotate(" + dx * 0.15 + "deg)";
      if (Math.hypot(gx - cx, gy - cy) > 0.3) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
  }

  /* ── Wobbly cards ── */
  document.querySelectorAll(".card").forEach((card) => {
    let enterRaf = null;
    card.addEventListener(
      "pointermove",
      (e) => {
        if (reduceMotion) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        // subtle 3D wobble + follow
        card.style.transform =
          "translate(" + x * 8 + "px," + y * 8 + "px) rotate(" + x * 2.2 + "deg) rotateX(" + -y * 3 + "deg) translate(-2px,-2px)";
      },
      { passive: true }
    );
    card.addEventListener("pointerenter", () => {
      if (reduceMotion) return;
      card.animate(
        [{ transform: "scale(0.985) rotate(-0.4deg)" }, { transform: "scale(1.015) rotate(0.5deg)" }, { transform: "scale(1) rotate(0deg)" }],
        { duration: 420, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
      );
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
    // click pop
    card.addEventListener("pointerdown", () => {
      card.animate(
        [{ transform: "scale(0.98)" }, { transform: "scale(1)" }],
        { duration: 180, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
      );
    });
  });

  /* ── Magnetic + squish buttons ── */
  document.querySelectorAll(".btn, .nav__cta").forEach((btn) => {
    if (reduceMotion) return;
    btn.addEventListener(
      "pointermove",
      (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + x * 0.16 + "px," + y * 0.2 + "px) rotate(" + x * 0.04 + "deg)";
      },
      { passive: true }
    );
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    btn.addEventListener("pointerdown", () => {
      btn.animate([{ transform: "scale(0.94)" }, { transform: "scale(1)" }], { duration: 220, easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" });
    });
  });

  /* ── Portrait — keep but with cartoon depth + floating stickers ── */
  const portrait = document.querySelector(".portrait-stack");
  if (portrait && !reduceMotion) {
    const frame = portrait.querySelector(".portrait-stack__frame");
    const floats = portrait.querySelectorAll(".portrait-stack__float");
    portrait.addEventListener(
      "pointermove",
      (e) => {
        const r = portrait.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        if (frame) {
          frame.style.transform = "rotateY(" + x * 9 + "deg) rotateX(" + -y * 7 + "deg) rotate(" + x * 1.2 + "deg) scale(1.02)";
        }
        floats.forEach((f, i) => {
          const m = (i + 1) * 10;
          f.style.transform = "translate(" + x * m + "px," + y * m + "px) rotate(" + x * 3 + "deg)";
        });
      },
      { passive: true }
    );
    portrait.addEventListener("pointerleave", () => {
      if (frame) frame.style.transform = "";
      floats.forEach((f) => (f.style.transform = ""));
      // little wiggle on leave
      portrait.animate(
        [{ transform: "rotate(-0.6deg)" }, { transform: "rotate(0.8deg)" }, { transform: "rotate(-0.6deg)" }],
        { duration: 500, easing: "ease-in-out" }
      );
    });
  }

  /* ── Count-up with bouncy easing ── */
  function animateValue(el, target, suffix) {
    const isNum = !isNaN(target);
    if (!isNum) { el.textContent = target + (suffix || ""); return; }
    const end = Number(target);
    const dur = 1300;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      // elastic out-ish
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t) * Math.cos(t * Math.PI * 0.9);
      el.textContent = Math.round(end * eased) + (suffix || "");
      if (t < 1) requestAnimationFrame(step);
      else {
        el.animate([{ transform: "scale(1.08) rotate(-1deg)" }, { transform: "scale(1) rotate(0deg)" }], { duration: 420, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
      }
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll("[data-count]").forEach((el) => {
    const val = el.getAttribute("data-count");
    const suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = val + suffix; return; }
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { animateValue(el, val, suffix); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ── Scroll-driven doodle sway ── */
  let ticking = false;
  function onScroll() {
    scrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        updateRail();
        updateNav();
        updateDots();
        // add slight stagger to cards on scroll for parallax feel
        if (!reduceMotion) {
          document.querySelectorAll(".cap-card, .proj-mini, .proj-feature").forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const dist = (window.innerHeight / 2 - center) * 0.02 * (0.5 + (i % 3) * 0.18);
            el.style.translate = "0 " + dist + "px";
          });
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  updateRail(); updateNav(); updateDots();

  /* ── Haptic + confetti burst on contact click ── */
  document.querySelectorAll(".btn, .card, .nav__cta, .pressable").forEach((el) => {
    el.addEventListener("pointerdown", () => {
      if (navigator.vibrate) navigator.vibrate(10);
    }, { passive: true });
  });

  // playful hero badge wiggle loop
  const badge = document.querySelector(".hero__badge");
  if (badge && !reduceMotion) {
    setInterval(() => {
      badge.animate(
        [{ transform: "rotate(-1.2deg) translateY(0)" }, { transform: "rotate(0.8deg) translateY(-2px)" }, { transform: "rotate(-1.2deg) translateY(0)" }],
        { duration: 900, easing: "ease-in-out" }
      );
    }, 3400);
  }

  // metrics pop stagger on load
  const metrics = document.querySelectorAll(".metrics__item");
  metrics.forEach((m, i) => {
    m.style.animationDelay = i * 0.08 + "s";
  });
})();
