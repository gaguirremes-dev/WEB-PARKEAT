/* ============================================================
   PARKEAT — main.js
   ============================================================ */

'use strict';

/* ── Navbar scroll ──────────────────────────────────────────── */
(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile menu ────────────────────────────────────────────── */
(function () {
  const btn  = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', open);
    btn.classList.toggle('open', !open);
    btn.setAttribute('aria-expanded', String(!open));
    document.body.style.overflow = open ? '' : 'hidden';
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.add('hidden');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

/* ── How It Works tabs ──────────────────────────────────────── */
(function () {
  const tabs   = document.querySelectorAll('.hiw-tab');
  const panels = { owners: document.getElementById('hiw-owners'), drivers: document.getElementById('hiw-drivers') };
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.hiw;
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      Object.values(panels).forEach(p => p?.classList.add('hidden'));
      panels[target]?.classList.remove('hidden');

      // Animate incoming panel steps if GSAP is ready
      if (typeof gsap !== 'undefined') {
        const steps = document.querySelectorAll(`#hiw-${target} .hiw-step`);
        if (steps.length) {
          gsap.fromTo(steps,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.1, overwrite: true }
          );
        }
      }
    });
  });
})();

/* ── Smooth scroll ──────────────────────────────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const offset = document.getElementById('navbar')?.offsetHeight || 80;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    });
  });
})();

/* ── Hero stats counters (IntersectionObserver) ─────────────── */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      const target   = parseInt(e.target.dataset.count, 10);
      const duration = 1600;
      const start    = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
        e.target.textContent = target >= 1000 ? `+${v.toLocaleString('es-PE')}` : `+${v}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ── Contact form ───────────────────────────────────────────── */
(function () {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const spinner = document.getElementById('submit-spinner');
  const btnText = document.getElementById('submit-text');
  const btn     = document.getElementById('submit-btn');
  if (!form) return;

  const rules = {
    name:    { req: true, msg: 'Por favor ingresa tu nombre.' },
    email:   { req: true, msg: 'Ingresa un correo válido.', email: true },
    type:    { req: true, msg: 'Selecciona una opción.' },
    message: { req: true, msg: 'Escribe un mensaje.' },
  };

  const showErr  = (f, m) => { document.getElementById(f)?.classList.add('error'); const el = document.getElementById(`${f}-error`); if (el) el.textContent = m; };
  const clearErr = (f)    => { document.getElementById(f)?.classList.remove('error'); const el = document.getElementById(`${f}-error`); if (el) el.textContent = ''; };

  Object.keys(rules).forEach(f => document.getElementById(f)?.addEventListener('input', () => clearErr(f)));

  const validate = () => {
    let ok = true;
    Object.entries(rules).forEach(([f, r]) => {
      const v = document.getElementById(f)?.value?.trim() || '';
      if (r.req && !v)   { showErr(f, r.msg); ok = false; return; }
      if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { showErr(f, r.msg); ok = false; }
    });
    return ok;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Object.keys(rules).forEach(clearErr);
    if (!validate()) return;

    btn.disabled = true;
    if (btnText) btnText.textContent = 'Enviando...';
    spinner?.classList.remove('hidden');

    await new Promise(r => setTimeout(r, 1600));

    btn.disabled = false;
    if (btnText) btnText.textContent = 'Enviar Mensaje';
    spinner?.classList.add('hidden');
    form.reset();
    success?.classList.remove('hidden');
    setTimeout(() => success?.classList.add('hidden'), 6000);
  });
})();

/* ── GSAP + ScrollTrigger ────────────────────────────────────── */
/* defer guarantees GSAP scripts load before main.js executes    */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* ·· 1. Hero stagger ·· */
  const heroOrder = [
    '[data-hero="badge"]',
    '[data-hero="eyebrow"]',
    '[data-hero="line1"]',
    '[data-hero="line2"]',
    '[data-hero="line3"]',
    '[data-hero="sub"]',
    '[data-hero="ctas"]',
    '[data-hero="stats"]',
    '[data-hero="phone"]',
  ];
  const heroEls = heroOrder.map(s => document.querySelector(s)).filter(Boolean);
  if (heroEls.length) {
    gsap.set(heroEls, { opacity: 0, y: 24 });
    gsap.to(heroEls, {
      opacity: 1,
      y: 0,
      duration: 0.72,
      ease: 'power3.out',
      stagger: 0.09,
      delay: 0.15,
    });
  }

  /* ·· 2. Universal reveal batch — ONE batch, zero conflicts ·· */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (revealEls.length) {
    // Set initial hidden state per element, once, based on direction
    revealEls.forEach(el => {
      const dir = el.dataset.reveal;
      if (dir === 'left')        gsap.set(el, { opacity: 0, x: -48, y: 0 });
      else if (dir === 'right')  gsap.set(el, { opacity: 0, x:  48, y: 0 });
      else                       gsap.set(el, { opacity: 0, x:   0, y: 36 });
    });

    // Single batch — no overlap, no dual-trigger issues
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (elements) => {
        elements.forEach((el, i) => {
          const dir = el.dataset.reveal;
          const isDirectional = dir === 'left' || dir === 'right';
          gsap.to(el, {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.65,
            ease: 'power3.out',
            delay: i * 0.06,
            overwrite: 'auto',
          });
        });
      },
    });
  }

  /* ·· 3. Parallax on owners image ·· */
  const parallaxImg = document.querySelector('.owners-parallax-img');
  if (parallaxImg) {
    gsap.to(parallaxImg, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: parallaxImg.closest('.owners-img-wrap') || parallaxImg,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  }

  /* ·· 4. Stats counters ·· */
  const statCells = document.querySelectorAll('[data-stat]');
  if (statCells.length) {
    ScrollTrigger.create({
      trigger: '.stats-section',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        statCells.forEach(el => {
          const target = parseInt(el.dataset.stat, 10);
          const suffix = el.dataset.suffix || '';
          const dur    = 1800;
          const t0     = performance.now();
          const tick   = (now) => {
            const p = Math.min((now - t0) / dur, 1);
            const v = Math.round((1 - Math.pow(1 - p, 3)) * target);
            el.textContent = (target >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
    });
  }

  ScrollTrigger.refresh();
})();
