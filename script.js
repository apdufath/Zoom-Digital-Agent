/* ============================================================
   Zoom Digital Agency — interactions
   Nav toggle, smooth scroll, scroll-reveal, testimonial slider,
   back-to-top, active-section highlighting, contact form.
   ============================================================ */

(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const hamburger = document.getElementById("menu-toggle");
  const mobilePanel = document.getElementById("mobile-menu");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  const backToTop = document.getElementById("back-to-top");
  const sections = document.querySelectorAll("main section[id]");

  /* ---------- Lucide icons ---------- */
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  /* ---------- Navbar background on scroll ---------- */
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 480);
    }
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ---------- Mobile menu ---------- */
  function setMenuOpen(open) {
    if (!hamburger || !mobilePanel) return;
    hamburger.classList.toggle("is-open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobilePanel.classList.toggle("is-open", open);
    document.body.classList.toggle("overflow-hidden", open);
  }

  if (hamburger && mobilePanel) {
    hamburger.addEventListener("click", function () {
      setMenuOpen(!mobilePanel.classList.contains("is-open"));
    });
  }

  /* ---------- Smooth scroll (offset handled by CSS scroll-padding) ---------- */
  function scrollToHash(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      setMenuOpen(false);
      scrollToHash(hash);
      if (history.pushState) {
        history.pushState(null, "", hash);
      }
    });
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuOpen(false);
    });
  });

  /* ---------- Active nav link from scroll position ---------- */
  function highlightNav() {
    const fromTop = window.scrollY + 120;
    let currentId = "home";

    sections.forEach(function (section) {
      if (section.offsetTop <= fromTop) {
        currentId = section.id;
      }
    });

    // Subsections sit under About and should keep that nav item active
    if (currentId === "ceo" || currentId === "team" || currentId === "vision") {
      currentId = "about";
    }

    document.querySelectorAll(".nav-link").forEach(function (link) {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", href === "#" + currentId);
    });
  }

  window.addEventListener("scroll", highlightNav, { passive: true });
  highlightNav();

  /* ---------- Scroll-reveal (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Testimonial slider ---------- */
  const slider = document.getElementById("testimonial-slider");
  if (slider) {
    const track = slider.querySelector(".slider-track");
    const slides = slider.querySelectorAll(".slider-slide");
    const prevBtn = slider.querySelector("[data-slider-prev]");
    const nextBtn = slider.querySelector("[data-slider-next]");
    const dotsWrap = slider.querySelector("[data-slider-dots]");
    let index = 0;
    let timer = null;
    const total = slides.length;

    function goTo(i) {
      index = (i + total) % total;
      if (track) {
        track.style.transform = "translateX(-" + index * 100 + "%)";
      }
      if (dotsWrap) {
        dotsWrap.querySelectorAll(".slider-dot").forEach(function (dot, n) {
          dot.classList.toggle("is-active", n === index);
          dot.setAttribute("aria-selected", n === index ? "true" : "false");
        });
      }
    }

    function startAuto() {
      stopAuto();
      timer = setInterval(function () {
        goTo(index + 1);
      }, 6500);
    }

    function stopAuto() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (dotsWrap) {
      slides.forEach(function (_slide, n) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "slider-dot" + (n === 0 ? " is-active" : "");
        btn.setAttribute("aria-label", "Go to testimonial " + (n + 1));
        btn.setAttribute("aria-selected", n === 0 ? "true" : "false");
        btn.addEventListener("click", function () {
          goTo(n);
          startAuto();
        });
        dotsWrap.appendChild(btn);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(index - 1);
        startAuto();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(index + 1);
        startAuto();
      });
    }

    slider.addEventListener("mouseenter", stopAuto);
    slider.addEventListener("mouseleave", startAuto);
    slider.addEventListener("focusin", stopAuto);
    slider.addEventListener("focusout", startAuto);

    // Touch swipe
    let touchStartX = 0;
    slider.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAuto();
      },
      { passive: true }
    );
    slider.addEventListener(
      "touchend",
      function (e) {
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(dx) > 40) {
          goTo(dx < 0 ? index + 1 : index - 1);
        }
        startAuto();
      },
      { passive: true }
    );

    goTo(0);
    startAuto();
  }

  /* ---------- Back to top ---------- */
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Contact form (front-end only) ---------- */
  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = form.querySelector("#name");
      const email = form.querySelector("#email");
      const message = form.querySelector("#message");

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        if (formStatus) {
          formStatus.textContent = "Please fill in all fields.";
          formStatus.className = "mt-4 text-sm text-red-600";
        }
        return;
      }

      form.reset();
      if (formStatus) {
        formStatus.textContent =
          "Thank you. Your message has been noted. This demo form does not send email yet — please use info@zoomhd.com.";
        formStatus.className = "mt-4 text-sm text-emerald-700";
      }
    });
  }

  /* ---------- Current year in footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
