/* Kennedy Chinwo — calm interactions.
   Nav state, the mobile menu, and live previews that stay unloaded until the
   visitor asks for one. Everything else on the page is static, so there is no
   scroll handler competing with scrolling and no per-pointer work. */

(function () {
  "use strict";

  var nav = document.querySelector(".nav");

  function updateNav() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true });

  var menuBtn = document.querySelector(".nav__menu-btn");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
})();

/* Live previews: a stage carries data-src and loads nothing until clicked.
   The iframe renders at a desktop width and is scaled to the card, so the
   real site appears as it looks rather than as a squeezed mobile layout. */
(function () {
  "use strict";

  var VW = 1280;
  var VH = 800;
  var stages = document.querySelectorAll(".live-preview__stage[data-src]");
  if (!stages.length) return;

  function fit(stage) {
    var scaler = stage.querySelector(".live-preview__scaler");
    if (!scaler || !stage.clientWidth) return;
    var scale = stage.clientWidth / VW;
    scaler.style.transform = "scale(" + scale + ")";
    stage.style.height = Math.round(VH * scale) + "px";
    stage.style.aspectRatio = "auto";
  }

  Array.prototype.forEach.call(stages, function (stage) {
    var src = stage.getAttribute("data-src");
    var btn = stage.querySelector(".live-preview__engage");
    var scaler = stage.querySelector(".live-preview__scaler");
    var frame = null;
    var loaded = false;

    function label(text) {
      if (btn) btn.textContent = text;
    }

    function load() {
      frame = document.createElement("iframe");
      frame.src = src;
      frame.title = stage.getAttribute("data-title") || "Live site preview";
      frame.loading = "lazy";
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
      frame.setAttribute("referrerpolicy", "no-referrer");
      frame.addEventListener("load", function () {
        fit(stage);
      });
      scaler.appendChild(frame);
      loaded = true;
      stage.classList.add("is-loaded");
      fit(stage);
    }

    if (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!loaded) {
          load();
          label("Click the page to scroll it");
          return;
        }
        var live = !stage.classList.contains("is-live");
        stage.classList.toggle("is-live", live);
        label(live ? "Release preview" : "Click the page to scroll it");
      });
    }

    stage.addEventListener("mouseleave", function () {
      stage.classList.remove("is-live");
      if (loaded) label("Click the page to scroll it");
    });

    var resizeTimer = null;
    window.addEventListener(
      "resize",
      function () {
        if (!loaded) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          fit(stage);
        }, 150);
      },
      { passive: true }
    );

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (loaded) fit(stage);
      });
    }
  });
})();
