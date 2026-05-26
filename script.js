// JXM CONSTRUCTION - SHARED SCRIPTS

document.addEventListener('DOMContentLoaded', () => {

  // YEAR
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ACTIVE NAV
  const page = document.body.dataset.page;
  if (page) {
    document.querySelectorAll('.nav-links a[data-nav]').forEach(a => {
      if (a.dataset.nav === page) a.classList.add('is-active');
    });
  }

  // MENU TOGGLE
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // BEFORE / AFTER SLIDER (home page only)
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const after = slider.querySelector('.ba-img-after');
    const handle = slider.querySelector('.ba-handle');
    if (!after || !handle) return;
    let dragging = false;

    const setPos = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const pct = (x / rect.width) * 100;
      handle.style.left = pct + '%';
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    };

    const start = (e) => { dragging = true; e.preventDefault(); };
    const move = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
    };
    const end = () => { dragging = false; };

    slider.addEventListener('mousedown', start);
    slider.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
    slider.addEventListener('click', (e) => setPos(e.clientX));
  });

  // FEATURED CAROUSEL (gallery - center focus with side previews)
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dotsWrap = carousel.parentElement.querySelector('.carousel-dots');
    const prevBtn = carousel.parentElement.querySelector('.carousel-prev');
    const nextBtn = carousel.parentElement.querySelector('.carousel-next');
    let current = 0;
    let autoTimer = null;
    const AUTO_INTERVAL = 2000;

    // Build dots
    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
        dot.dataset.idx = i;
        dot.addEventListener('click', () => {
          goTo(i);
          resetAuto();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function classify(idx, center, total) {
      // Returns is-center, is-left, is-right, is-far-left, is-far-right, is-hidden
      const diff = ((idx - center) % total + total) % total;
      if (diff === 0) return 'is-center';
      if (diff === 1) return 'is-right';
      if (diff === total - 1) return 'is-left';
      if (diff === 2) return 'is-far-right';
      if (diff === total - 2) return 'is-far-left';
      return 'is-hidden';
    }

    function render() {
      slides.forEach((slide, i) => {
        slide.classList.remove('is-center', 'is-left', 'is-right', 'is-far-left', 'is-far-right', 'is-hidden');
        slide.classList.add(classify(i, current, slides.length));
      });
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
          d.classList.toggle('is-active', i === current);
        });
      }
    }

    function goTo(idx) {
      current = ((idx % slides.length) + slides.length) % slides.length;
      render();
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(next, AUTO_INTERVAL);
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }
    function resetAuto() {
      stopAuto();
      startAuto();
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

    // Click slide to jump
    slides.forEach((slide, i) => {
      slide.addEventListener('click', () => {
        if (i !== current) {
          goTo(i);
          resetAuto();
        }
      });
    });

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // Touch swipe
    let touchStartX = 0;
    let touchEndX = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAuto();
    });
    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next(); else prev();
      }
      startAuto();
    });

    render();
    startAuto();
  }

});