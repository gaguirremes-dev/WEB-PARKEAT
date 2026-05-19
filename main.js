/* ============================================================
   PARKEAT — main.js
   ============================================================ */

'use strict';

/* ── Navbar scroll ──────────────────────────────────────────── */
(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
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
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.add('hidden');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ── City grid spots ────────────────────────────────────────── */
(function () {
  const container = document.getElementById('spots');
  if (!container) return;

  const W = window.innerWidth, H = window.innerHeight;
  const cols = Math.ceil(W / 48) + 1;
  const rows = Math.ceil(H / 48) + 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.92) {
        const dot = document.createElement('div');
        const colors = ['rgba(96,165,250,0.7)', 'rgba(220,38,38,0.7)', 'rgba(74,222,128,0.7)'];
        const color  = colors[Math.floor(Math.random() * colors.length)];
        Object.assign(dot.style, {
          position: 'absolute',
          left: `${c * 48 + 24}px`,
          top:  `${r * 48 + 24}px`,
          width: '4px', height: '4px',
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 6px ${color}`,
          animation: `spotBlink ${2 + Math.random() * 3}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`,
        });
        container.appendChild(dot);
      }
    }
  }

  // Inject keyframes once
  if (!document.getElementById('spot-kf')) {
    const s = document.createElement('style');
    s.id = 'spot-kf';
    s.textContent = `
      @keyframes spotBlink {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.4); }
      }
    `;
    document.head.appendChild(s);
  }
})();

/* ── Parking spaces visual ──────────────────────────────────── */
(function () {
  const rows = [
    { id: 'park-row-1', count: 8 },
    { id: 'park-row-2', count: 8 },
    { id: 'park-row-3', count: 8 },
    { id: 'park-row-4', count: 8 },
    { id: 'park-row-5', count: 8 },
  ];

  const states = ['occ', 'occ', 'occ', 'free', 'occ', 'res', 'occ', 'occ', 'free', 'occ'];

  rows.forEach(({ id, count }) => {
    const el = document.getElementById(id);
    if (!el) return;
    for (let i = 0; i < count; i++) {
      const sp = document.createElement('div');
      sp.className = `parking-space ${states[Math.floor(Math.random() * states.length)]}`;
      el.appendChild(sp);
    }
  });

  // Occasionally flip a space state
  function randomFlip() {
    const allSpaces = document.querySelectorAll('.parking-space');
    if (!allSpaces.length) return;
    const sp = allSpaces[Math.floor(Math.random() * allSpaces.length)];
    const next = ['occ', 'free', 'res'][Math.floor(Math.random() * 3)];
    sp.className = `parking-space ${next}`;
    setTimeout(randomFlip, 1200 + Math.random() * 2000);
  }
  setTimeout(randomFlip, 2000);
})();

/* ── Intersection Observer — reveal ────────────────────────── */
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ── Animated counters ──────────────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const format = (n) => {
    if (n >= 10000) return `+${(n / 1000).toFixed(0)}k`;
    if (n >= 1000)  return `+${n.toLocaleString('es-PE')}`;
    return `+${n}`;
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      const target = parseInt(e.target.dataset.count, 10);
      const duration = 1800;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        e.target.textContent = format(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ── B2C Tabs ───────────────────────────────────────────────── */
(function () {
  const tabs   = document.querySelectorAll('.feat-tab');
  const panels = document.querySelectorAll('.tab-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.add('hidden'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(`tab-${target}`);
      if (panel) panel.classList.remove('hidden');
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
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
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
    name:    { req: true,  msg: 'Por favor ingresa tu nombre.' },
    email:   { req: true,  msg: 'Ingresa un correo válido.',    email: true },
    type:    { req: true,  msg: 'Selecciona una opción.' },
    message: { req: true,  msg: 'Escribe un mensaje.' },
  };

  const showError = (field, msg) => {
    const input = document.getElementById(field);
    const error = document.getElementById(`${field}-error`);
    if (input) input.classList.add('error');
    if (error) error.textContent = msg;
  };
  const clearError = (field) => {
    const input = document.getElementById(field);
    const error = document.getElementById(`${field}-error`);
    if (input) input.classList.remove('error');
    if (error) error.textContent = '';
  };

  Object.keys(rules).forEach(field => {
    const input = document.getElementById(field);
    if (input) input.addEventListener('input', () => clearError(field));
  });

  const validate = () => {
    let valid = true;
    Object.entries(rules).forEach(([field, rule]) => {
      const val = document.getElementById(field)?.value?.trim() || '';
      if (rule.req && !val) { showError(field, rule.msg); valid = false; return; }
      if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        showError(field, rule.msg); valid = false;
      }
    });
    return valid;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Object.keys(rules).forEach(clearError);
    if (!validate()) return;

    btn.disabled = true;
    btnText.textContent = 'Enviando...';
    spinner?.classList.remove('hidden');

    // Simulate async submit
    await new Promise(r => setTimeout(r, 1600));

    btn.disabled = false;
    btnText.textContent = 'Enviar Mensaje';
    spinner?.classList.add('hidden');
    form.reset();
    success?.classList.remove('hidden');

    setTimeout(() => success?.classList.add('hidden'), 6000);
  });
})();
