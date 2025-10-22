(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const body = document.body;
  const header = $('.site-header');
  const nav = $('.site-nav');
  const navToggle = $('.nav-toggle');
  const navOverlay = $('.nav-overlay');

  /* ====== Navigation ====== */
  const closeMenu = () => {
    nav?.classList.remove('open');
    body.classList.remove('menu-open');
    navOverlay?.classList.remove('visible');
    navToggle?.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    nav?.classList.add('open');
    body.classList.add('menu-open');
    navOverlay?.classList.add('visible');
    navToggle?.setAttribute('aria-expanded', 'true');
  };

  navToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    nav?.classList.contains('open') ? closeMenu() : openMenu();
  });

  navOverlay?.addEventListener('click', closeMenu);

  document.addEventListener('click', (event) => {
    if (!nav?.classList.contains('open')) return;
    if (!nav.contains(event.target) && !navToggle.contains(event.target)) {
      closeMenu();
    }
  });

  $$('.site-nav a').forEach((link) =>
    link.addEventListener('click', () => {
      if (nav?.classList.contains('open')) closeMenu();
    })
  );

  const setActiveNavLink = () => {
    const sections = $$('main section[id]');
    const scrollPos = window.scrollY + header.offsetHeight + 60;
    sections.forEach((section) => {
      const link = $(`.site-nav a[href="#${section.id}"]`);
      if (!link) return;
      const { top, height } = section.getBoundingClientRect();
      const sectionTop = window.scrollY + top;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + height) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  window.addEventListener('scroll', () => {
    if (window.scrollY > 8) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');
    setActiveNavLink();
  });
  setActiveNavLink();

  /* ====== Smooth scroll for anchor links ====== */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetID = anchor.getAttribute('href');
      if (!targetID || targetID === '#') return;
      const target = document.querySelector(targetID);
      if (!target) return;
      event.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 4;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });

  /* ====== Hero parallax ====== */
  const hero = $('.section-hero');
  const heroElements = $$('[data-3d]', hero);
  hero?.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    heroElements.forEach((el, index) => {
      const depth = (index + 1) * 10;
      el.style.transform = `translate3d(${relX * depth}px, ${relY * depth}px, ${depth * 2}px)`;
    });
  });

  hero?.addEventListener('pointerleave', () => {
    heroElements.forEach((el) => {
      el.style.transform = 'translate3d(0,0,0)';
    });
  });

  /* ====== Intersection reveal ====== */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ====== Vanilla Tilt ====== */
  if (window.VanillaTilt) {
    VanillaTilt.init($$('.tilt'), {
      max: 10,
      speed: 400,
      glare: true,
      'max-glare': 0.25,
      perspective: 1200,
      gyroscope: true,
    });
  }

  /* ====== GSAP hero entrance ====== */
  if (window.gsap) {
    gsap.from('.hero-copy .display-line', {
      yPercent: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out',
    });
    gsap.from('.hero-copy .subtitle, .hero-copy .bio, .hero-actions', {
      y: 30,
      opacity: 0,
      duration: 0.9,
      delay: 0.4,
      ease: 'power2.out',
      stagger: 0.1,
    });
    gsap.from('.hero-portrait', {
      y: 50,
      opacity: 0,
      duration: 1.1,
      delay: 0.5,
      ease: 'power3.out',
    });
  }

  /* ====== Projects filter ====== */
  const filterButtons = $$('.project-filters .pill');
  const projectGrid = $('#projectGrid');
  let activeFilter = 'all';
  if (filterButtons.length && projectGrid && window.gsap?.Flip) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter || 'all';
        if (filter === activeFilter) return;
        activeFilter = filter;
        filterButtons.forEach((item) => item.classList.remove('active'));
        btn.classList.add('active');

        const state = Flip.getState($$('.project-card', projectGrid));

        $$('.project-card', projectGrid).forEach((card) => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.dataset.hidden = match ? 'false' : 'true';
          card.style.display = match ? '' : 'none';
        });

        Flip.from(state, {
          absolute: true,
          duration: 0.6,
          ease: 'power2.inOut',
          stagger: 0.05,
        });
      });
    });
  }

  /* ====== Courses buttons ====== */
  $$('.course-card button[data-link]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const href = btn.dataset.link;
      if (href) window.location.href = href;
    });
  });

  /* ====== Accordion ====== */
  $$('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const open = item.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(open));
    });
  });

  /* ====== Certificates lightbox ====== */
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxClose = $('.lightbox-close');
  const openLightbox = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  $$('.cert-card').forEach((card) => {
    card.addEventListener('click', () => {
      const img = $('img', card);
      if (!img) return;
      openLightbox(img.src, img.alt);
    });
    card.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const img = $('img', card);
        if (!img) return;
        openLightbox(img.src, img.alt);
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('open')) {
      closeLightbox();
    }
  });

  /* ====== Back to top ====== */
  const backToTop = $('#backToTop');
  const toggleBackToTop = () => {
    if (!backToTop) return;
    if (window.scrollY > 500) backToTop.classList.add('fab-visible');
    else backToTop.classList.remove('fab-visible');
  };
  window.addEventListener('scroll', toggleBackToTop);
  toggleBackToTop();

  backToTop?.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ====== Newsletter ====== */
  const newsletterForm = $('#newsletterForm');
  if (newsletterForm) {
    const message = $('#newsletterMessage');
    newsletterForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const endpoint = newsletterForm.dataset.endpoint;
      const formData = new FormData(newsletterForm);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          message.style.display = 'block';
          newsletterForm.reset();
        } else {
          const data = await response.json().catch(() => null);
          const errMsg = data?.errors?.map((err) => err.message).join(' ') || 'Please try again.';
          alert(errMsg);
        }
      } catch (error) {
        console.error(error);
        alert('Network error – please try again later.');
      }
    });
  }

  /* ====== Contact form (Netlify) ====== */
  const contactForm = $('.contact-form');
  if (contactForm) {
    const successMessage = $('.form-success', contactForm);
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const encoded = new URLSearchParams(formData).toString();
      try {
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encoded,
        });
        contactForm.reset();
        successMessage.style.display = 'block';
        setTimeout(() => (successMessage.style.display = 'none'), 5000);
      } catch (error) {
        alert('Something went wrong. Please email hello@sulaymaanabubakr.name.ng');
      }
    });
  }

  /* ====== Footer year ====== */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
