/* ==========================================================================
   Outlier Works Limited — main.js
   Core site behavior: header/footer injection, navigation, theme toggle,
   scroll effects, back-to-top, newsletter, reveal-on-scroll.
   Class names follow the BEM convention used in style.css.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  injectPartials();
  initHeroTyping();
  initTestimonialCarousel();
});

/**
 * Fetches the shared header and footer partials and injects them into the
 * page, then wires up all behavior that depends on that markup existing.
 */
function injectPartials() {
  const headerSlot = document.getElementById('header');
  const footerSlot = document.getElementById('footer');

  const headerLoad = headerSlot
    ? fetch('partials/header.html').then((res) => res.text()).then((html) => {
        headerSlot.innerHTML = html;
      })
    : Promise.resolve();

  const footerLoad = footerSlot
    ? fetch('partials/footer.html').then((res) => res.text()).then((html) => {
        footerSlot.innerHTML = html;
      })
    : Promise.resolve();

  Promise.all([headerLoad, footerLoad]).then(() => {
    initHeaderScroll();
    initMobileMenu();
    initThemeToggle();
    initActiveNav();
    initNewsletterForm();
    setCurrentYear();
    initBackToTop();
    initRevealOnScroll();
    initCounters();
  });
}

/* -------------------------------------------------------------------------
   Header: glass effect once the page is scrolled
   ------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('site-header--scrolled', window.scrollY > 24);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* -------------------------------------------------------------------------
   Mobile hamburger menu
   ------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-menu-close');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');
  if (!toggleBtn || !menu || !overlay) return;

  const openMenu = () => {
    menu.classList.add('mobile-menu--open');
    overlay.classList.add('mobile-overlay--open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('mobile-menu--open');
    overlay.classList.remove('mobile-overlay--open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('mobile-menu--open')) closeMenu();
  });
}

/* -------------------------------------------------------------------------
   Dark / light mode toggle, persisted in localStorage
   ------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const root = document.documentElement;

  const applyTheme = (theme) => {
    if (theme === 'light') {
      root.classList.add('light-mode');
      icon?.classList.remove('fa-moon');
      icon?.classList.add('fa-sun');
    } else {
      root.classList.remove('light-mode');
      icon?.classList.remove('fa-sun');
      icon?.classList.add('fa-moon');
    }
  };

  const saved = localStorage.getItem('owl-theme') || 'dark';
  applyTheme(saved);

  toggleBtn?.addEventListener('click', () => {
    const isLight = root.classList.contains('light-mode');
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('owl-theme', next);
  });
}

/* -------------------------------------------------------------------------
   Highlight the current page in the nav
   ------------------------------------------------------------------------- */
function initActiveNav() {
  const current = (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  document.querySelectorAll('.nav-link').forEach((link) => {
    if (link.dataset.page === current) {
      link.classList.add('nav-link--active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* -------------------------------------------------------------------------
   Newsletter signup (front-end only for now — wired to a backend in a
   later milestone alongside the contact form)
   ------------------------------------------------------------------------- */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  const message = document.getElementById('newsletter-message');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email');
    if (!email.value || !email.validity.valid) {
      message.textContent = 'Please enter a valid email address.';
      message.style.color = 'var(--color-danger)';
      return;
    }
    message.textContent = 'Thanks for subscribing!';
    message.style.color = 'var(--color-secondary)';
    form.reset();
  });
}

/* -------------------------------------------------------------------------
   Footer copyright year
   ------------------------------------------------------------------------- */
function setCurrentYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* -------------------------------------------------------------------------
   Back-to-top button
   ------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle('back-to-top--visible', window.scrollY > 300);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -------------------------------------------------------------------------
   Reveal-on-scroll for elements marked with the .reveal class
   ------------------------------------------------------------------------- */
function initRevealOnScroll() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
}

/* -------------------------------------------------------------------------
   Animated counters (count up when scrolled into view)
   Usage: <span class="counter" data-target="500">0</span>
   ------------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString();
      }
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* -------------------------------------------------------------------------
   Hero typing effect — cycles through construction specialties.
   Only runs if #hero-typed exists on the page (i.e. the homepage).
   ------------------------------------------------------------------------- */
function initHeroTyping() {
  const el = document.getElementById('hero-typed');
  if (!el) return;

  const phrases = [
    'Residential Construction',
    'Commercial Buildings',
    'Industrial Projects',
    'Renovations & Remodels',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const current = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 35 : 75);
  };

  tick();
}

/* -------------------------------------------------------------------------
   Testimonial carousel — builds dots dynamically, supports arrows,
   autoplay, and pauses autoplay on hover.
   Only runs if a .testimonial-carousel exists on the page.
   ------------------------------------------------------------------------- */
function initTestimonialCarousel() {
  const carousel = document.querySelector('.testimonial-carousel');
  const track = document.querySelector('.testimonial-carousel__track');
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsWrap = document.querySelector('.testimonial-carousel__dots');
  const prevBtn = document.querySelector('.testimonial-carousel__arrow--prev');
  const nextBtn = document.querySelector('.testimonial-carousel__arrow--next');
  if (!carousel || !track || !slides.length) return;

  let index = 0;
  const dots = [];

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'testimonial-carousel__dot' + (i === 0 ? ' testimonial-carousel__dot--active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap?.appendChild(dot);
    dots.push(dot);
  });

  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('testimonial-carousel__dot--active', i === index));
  };

  const goTo = (i) => {
    index = (i + slides.length) % slides.length;
    update();
  };

  prevBtn?.addEventListener('click', () => goTo(index - 1));
  nextBtn?.addEventListener('click', () => goTo(index + 1));

  let autoplay = setInterval(() => goTo(index + 1), 6000);
  carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
  carousel.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(index + 1), 6000);
  });
}