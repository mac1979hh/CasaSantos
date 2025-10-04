// Header Blur bei Scroll
const header = document.querySelector('.site-header');
const onScroll = () => {
  if (window.scrollY > 10) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal-Animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Jahr im Footer
document.getElementById('y').textContent = new Date().getFullYear();

// Hamburger-Menü (mobil)
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.getElementById('primary-menu');

  if (!toggle || !menu) return;

  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    document.body.style.overflow = 'hidden'; // optional: Scroll sperren, solange offen
  };

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  });

  // Schließen bei Klick auf Link
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) close();
  });

  // ESC schließt
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Beim Resize auf Desktop schließen
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) close();
  });
})();

// ===== Hero Slideshow =====
(() => {
  const hero = document.querySelector('.hero');
  const slides = hero?.querySelectorAll('.hero-slide');
  if (!hero || !slides || !slides.length) return;
  const dotsWrap = hero.querySelector('.hero-dots');

  let i = 0;
  const DURATION = 6000; // 6s pro Slide
  let timer = null;

  const setActive = (next) => {
    slides[i].classList.remove('is-active');
    i = (next + slides.length) % slides.length;
    slides[i].classList.add('is-active');
    // Dots aktualisieren
    if (dots.length) {
      dots.forEach((d, idx) => d.setAttribute('aria-current', String(idx === i)));
    }
  };

  console.log('Wechsel auf Slide', i);

  const play = () => { stop(); timer = setInterval(() => setActive(i + 1), DURATION); };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

  // Dots automatisch erzeugen
  let dots = [];
  if (dotsWrap) {
    dots = Array.from({ length: slides.length }, (_, idx) => {
      const b = document.createElement('button');
      b.className = 'hero-dot';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Slide ${idx + 1}`);
      b.setAttribute('aria-current', String(idx === 0));
      b.addEventListener('click', () => { stop(); setActive(idx); play(); });
      dotsWrap.appendChild(b);
      return b;
    });
  }

  // Autoplay starten
  play();

  // Pause bei Hover (Desktop)
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', play);

  // Pause bei Tab-Wechsel
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : play();
  });

  // Wischen (Touch)
  let startX = null, startY = null;
  const onTouchStart = (e) => {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    stop();
  };
  const onTouchEnd = (e) => {
    if (startX === null || startY === null) return play();
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    // nur horizontale Wischer beachten
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setActive(i + (dx < 0 ? 1 : -1));
    }
    startX = startY = null;
    play();
  };
  hero.addEventListener('touchstart', onTouchStart, { passive: true });
  hero.addEventListener('touchend', onTouchEnd);

  // Pfeile (manuelle Navigation)
  const prevBtn = hero.querySelector('.hero-prev');
  const nextBtn = hero.querySelector('.hero-next');

  const goPrev = () => { stop(); setActive(i - 1); play(); };
  const goNext = () => { stop(); setActive(i + 1); play(); };

  prevBtn?.addEventListener('click', goPrev);
  nextBtn?.addEventListener('click', goNext);

  // Tastatur-Support (links/rechts), solange Fokus irgendwo im Hero ist
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { goPrev(); }
    if (e.key === 'ArrowRight') { goNext(); }
  });

  // Damit Arrow-Keys ankommen (Hero fokussierbar machen)
  hero.setAttribute('tabindex','-1');
})();