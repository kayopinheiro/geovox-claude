document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     NAVBAR — transparent → solid on scroll
     ============================================================ */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ============================================================
     LANGUAGE SELECTOR — PT / EN toggle
     ============================================================ */
  const langBtn   = document.getElementById('lang-btn');
  const langLabel = document.getElementById('lang-label');
  const langs     = ['PT', 'EN'];
  let langIdx     = 0;

  langBtn.addEventListener('click', () => {
    langIdx = (langIdx + 1) % langs.length;
    langLabel.textContent = langs[langIdx];
    langBtn.setAttribute('aria-label', `Idioma selecionado: ${langs[langIdx]}`);
  });

  /* ============================================================
     SERVICE TABS
     ============================================================ */
  const tabs   = document.querySelectorAll('.service-tab');
  const panels = document.querySelectorAll('.service-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(p => {
        if (p.id === `panel-${target}`) {
          p.classList.add('active');
          p.removeAttribute('hidden');
        } else {
          p.classList.remove('active');
          p.setAttribute('hidden', '');
        }
      });
    });
  });

  /* ============================================================
     CAROUSEL
     ============================================================ */
  const track   = document.getElementById('carousel-track');
  const dots    = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const carouselRegion = document.querySelector('.carousel');

  const TOTAL_SLIDES = track ? track.children.length : 0;
  const VISIBLE      = 2;           // slides visible at once
  const MAX_INDEX    = TOTAL_SLIDES - VISIBLE; // 0..2 for 4 slides
  const AUTO_DELAY   = 5000;        // 5 s — enough time to read a card

  let current   = 0;
  let autoTimer = null;
  let paused    = false;

  function getSlideStep() {
    const slide = track.querySelector('.carousel-slide');
    if (!slide) return 0;
    return slide.offsetWidth + 20; // slide width + gap
  }

  function goTo(index) {
    current = ((index % (MAX_INDEX + 1)) + (MAX_INDEX + 1)) % (MAX_INDEX + 1); // wrap around
    const offset = current * getSlideStep();
    track.style.transform = `translateX(-${offset}px)`;

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });

    // Arrows disabled only at hard boundaries (optional — keep for a11y)
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      if (!paused) goTo(current + 1);
    }, AUTO_DELAY);
  }

  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  // Pause on hover / resume on leave
  if (carouselRegion) {
    carouselRegion.addEventListener('mouseenter', () => { paused = true; });
    carouselRegion.addEventListener('mouseleave', () => { paused = false; });
    // Also pause on focus inside (keyboard users)
    carouselRegion.addEventListener('focusin',  () => { paused = true; });
    carouselRegion.addEventListener('focusout', () => { paused = false; });
  }

  // Manual navigation resets the timer so the user gets a full interval
  function manualGoTo(index) {
    goTo(index);
    startAuto(); // restart the countdown
  }

  prevBtn && prevBtn.addEventListener('click', () => manualGoTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => manualGoTo(current + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => manualGoTo(parseInt(dot.dataset.index, 10)));
  });

  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Recalculate on resize
  window.addEventListener('resize', () => goTo(current), { passive: true });

  // Initialize
  goTo(0);
  if (!prefersReduced) startAuto();

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  const backBtn = document.getElementById('back-to-top');
  backBtn && backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============================================================
     VIDEO MODAL
     ============================================================ */
  const playBtn       = document.querySelector('.play-btn');
  const videoSection  = document.getElementById('video');
  const videoModal    = document.getElementById('video-modal');
  const videoIframe   = document.getElementById('video-iframe');
  const modalClose    = document.getElementById('video-modal-close');
  const modalBackdrop = document.getElementById('video-modal-backdrop');

  function openVideoModal() {
    const src = videoSection?.dataset.videoSrc || '';
    videoIframe.src = src;
    videoModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeVideoModal() {
    videoIframe.src = '';
    videoModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    playBtn && playBtn.focus();
  }

  playBtn       && playBtn.addEventListener('click', openVideoModal);
  modalClose    && modalClose.addEventListener('click', closeVideoModal);
  modalBackdrop && modalBackdrop.addEventListener('click', closeVideoModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && videoModal && !videoModal.hasAttribute('hidden')) {
      closeVideoModal();
    }
  });

  /* ============================================================
     FUNDADORAS — avatar deco slide-in on scroll
     ============================================================ */
  const avatarStacks = document.querySelectorAll('.founder-avatar-stack');
  if (avatarStacks.length && 'IntersectionObserver' in window) {
    const avatarObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger: Patricia first, Melissa 150ms later
          const delay = entry.target.dataset.avatarDelay || 0;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          avatarObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    avatarStacks.forEach(stack => avatarObserver.observe(stack));
  }

  /* ============================================================
     SCROLL REVEAL — Intersection Observer
     ============================================================ */
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    function addReveal(el, delay = 0) {
      if (el.closest('#hero, #navbar')) return; // skip above-fold
      el.classList.add('reveal');
      if (delay > 0) el.style.setProperty('--reveal-delay', `${delay}s`);
      revealObs.observe(el);
    }

    // [selector, stagger-between-siblings in seconds]
    const revealGroups = [
      ['.tagline',             0   ],
      ['.sobre-grid > *',      0.1 ],
      ['.sobre-image',         0   ],
      ['.servicos-heading',    0   ],
      ['.servicos-grid',       0   ],
      ['.projetos-header',     0   ],
      ['.carousel',            0   ],
      ['.espec-header',        0   ],
      ['.espec-card',          0.1 ],
      ['.fund-header',         0   ],
      ['.founder-entry',       0.18],
      ['.wsm-content',         0   ],
      ['.footer-top',          0   ],
      ['.footer-contact-item', 0.1 ],
      ['.footer-bottom',       0   ],
    ];

    if (!prefersReduced) {
      revealGroups.forEach(([sel, stagger]) => {
        document.querySelectorAll(sel).forEach((el, i) => {
          addReveal(el, i * stagger);
        });
      });
    }
  }

  /* ============================================================
     SMOOTH SCROLL for nav links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 8;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
