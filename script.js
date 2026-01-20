/* =========================================================
   TRICKS ZONE — script.js
   - Preloader
   - Navbar blur on scroll
   - Smooth scroll + close mobile menu
   - Reveal on scroll
   - Counters (once)
   - Gallery fullscreen modal (ESC + click outside)
   - Back-to-top
   - Button ripple
   - Contact form validation + success message
   - Footer year
========================================================= */

(() => {
  "use strict";

  /* -----------------------------
     Helpers
  ------------------------------ */
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  /* -----------------------------
     Elements
  ------------------------------ */
  const preloader = $("#preloader");
  const navbar = $("#tzNavbar");
  const topBtn = $("#tzTop");

  const modal = $("#tzModal");
  const modalImg = $("#tzModalImg");
  const modalClose = $("#tzModalClose");

  const contactForm = $("#tzContactForm");
  const formMsg = $("#tzFormMsg");

  /* -----------------------------
     1) Preloader
  ------------------------------ */
  window.addEventListener("load", () => {
    if (!preloader) return;
    // Small delay for smoothness
    setTimeout(() => {
      preloader.classList.add("hide");
    }, 350);
  });

  /* -----------------------------
     2) Navbar blur on scroll
     3) Back to top visibility
  ------------------------------ */
  const onScrollUI = () => {
    const y = window.scrollY || 0;

    if (navbar) {
      if (y > 30) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    }

    if (topBtn) {
      if (y > 450) topBtn.classList.add("show");
      else topBtn.classList.remove("show");
    }
  };

  window.addEventListener("scroll", onScrollUI, { passive: true });
  onScrollUI();

  /* -----------------------------
     4) Smooth scroll for anchor links
        + close mobile menu after click
  ------------------------------ */
  const navCollapse = $("#tzNav");
  const bsCollapse =
    navCollapse && window.bootstrap
      ? new bootstrap.Collapse(navCollapse, { toggle: false })
      : null;

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      // Close mobile nav if open
      if (navCollapse && navCollapse.classList.contains("show") && bsCollapse) {
        bsCollapse.hide();
      }

      // Smooth scroll with navbar offset
      const navH = navbar ? navbar.getBoundingClientRect().height : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - (navH - 2);

      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* -----------------------------
     5) Reveal on scroll (IntersectionObserver)
  ------------------------------ */
  const revealEls = $$(".reveal");
  if (revealEls.length) {
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (ent.isIntersecting) {
            ent.target.classList.add("show");
            revealIO.unobserve(ent.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealEls.forEach((el) => revealIO.observe(el));
  }

  /* -----------------------------
     6) Counters animation (once)
     Targets: .counter and .metric-num
  ------------------------------ */
  const counterEls = [...$$(".counter"), ...$$(".metric-num")];
  const animateCount = (el, to) => {
    const duration = 900; // ms
    const start = performance.now();
    const from = 0;

    const step = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (counterEls.length) {
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (!ent.isIntersecting) return;
          const el = ent.target;
          const to = parseInt(el.getAttribute("data-counter") || "0", 10);
          if (!Number.isFinite(to)) return;
          animateCount(el, to);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.55 }
    );

    counterEls.forEach((el) => {
      // Start from 0
      el.textContent = "0";
      counterIO.observe(el);
    });
  }

  /* -----------------------------
     7) Gallery fullscreen modal
  ------------------------------ */
  const galleryButtons = $$(".tz-gallery-item");

  const openModal = (src) => {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modal || !modalImg) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modalImg.src = "";
    document.body.style.overflow = "";
  };

  galleryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const full = btn.getAttribute("data-full");
      if (full) openModal(full);
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);

  // Click outside image closes
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("show")) {
      closeModal();
    }
  });

  /* -----------------------------
     8) Back to top action
  ------------------------------ */
  if (topBtn) {
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -----------------------------
     9) Ripple effect on buttons
     Apply to elements with .tz-ripple class
  ------------------------------ */
  $$(".tz-ripple").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;

      // Remove older ripple if present
      const old = this.querySelector(".ripple");
      if (old) old.remove();

      this.appendChild(span);

      span.addEventListener("animationend", () => span.remove());
    });
  });

  /* -----------------------------
     10) Contact form validation + fake submit
  ------------------------------ */
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = contactForm.elements["name"]?.value.trim();
      const email = contactForm.elements["email"]?.value.trim();
      const message = contactForm.elements["message"]?.value.trim();

      // Basic validation
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || name.length < 2) {
        formMsg.textContent = "Please enter your name (at least 2 characters).";
        formMsg.style.color = "rgba(255,79,216,.9)";
        return;
      }
      if (!emailOk) {
        formMsg.textContent = "Please enter a valid email address.";
        formMsg.style.color = "rgba(255,79,216,.9)";
        return;
      }
      if (!message || message.length < 10) {
        formMsg.textContent = "Please write a message (at least 10 characters).";
        formMsg.style.color = "rgba(255,79,216,.9)";
        return;
      }

      // Simulate successful submit
      formMsg.textContent = "✅ Message sent! I’ll reply within 24 hours.";
      formMsg.style.color = "rgba(38,247,255,.9)";
      contactForm.reset();

      // Optional: clear msg after a while
      setTimeout(() => {
        formMsg.textContent = "";
      }, 4500);
    });
  }

  /* -----------------------------
     11) Footer year
  ------------------------------ */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
