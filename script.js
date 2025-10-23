const body = document.body;

const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

// Mobile navigation
const navToggle = select('.nav__toggle');
const navList = select('.nav__list');
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.classList.toggle('open', isOpen);
  });

  selectAll('.nav__link', navList).forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('open');
    });
  });
}

// Sticky header shadow
const header = select('.header');
const toggleHeaderShadow = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', toggleHeaderShadow);
toggleHeaderShadow();

// Smooth scroll for internal links
const internalLinks = selectAll('a[href^="#"]:not([href="#"])');
internalLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = select(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Intersection Observer for reveals
const revealElements = selectAll('.reveal');
if (revealElements.length) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

// Hero parallax
const hero = select('.hero');
const parallaxItems = selectAll('[data-depth]', hero);
if (hero && parallaxItems.length) {
  let bounds = hero.getBoundingClientRect();
  let mouseX = bounds.width / 2;
  let mouseY = bounds.height / 2;
  let rafId = null;

  const updateParallax = () => {
    parallaxItems.forEach((item) => {
      const depth = parseFloat(item.dataset.depth || '0');
      const moveX = ((mouseX - bounds.width / 2) / bounds.width) * depth * -40;
      const moveY = ((mouseY - bounds.height / 2) / bounds.height) * depth * -30;
      item.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
    rafId = null;
  };

  hero.addEventListener('mousemove', (event) => {
    const rect = hero.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    if (!rafId) {
      rafId = requestAnimationFrame(updateParallax);
    }
  });

  hero.addEventListener('mouseleave', () => {
    mouseX = bounds.width / 2;
    mouseY = bounds.height / 2;
    if (!rafId) {
      rafId = requestAnimationFrame(updateParallax);
    }
  });

  window.addEventListener('resize', () => {
    bounds = hero.getBoundingClientRect();
    mouseX = bounds.width / 2;
    mouseY = bounds.height / 2;
    if (!rafId) {
      rafId = requestAnimationFrame(updateParallax);
    }
  });
}

// Hover tilt effect
const tiltElements = selectAll('[data-tilt]');
if (tiltElements.length) {
  const maxTilt = 8;

  tiltElements.forEach((el) => {
    const handleMove = (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      el.classList.add('hovered');
    };

    const resetTilt = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      el.classList.remove('hovered');
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', resetTilt);
    el.addEventListener('touchstart', () => el.classList.add('hovered'));
    el.addEventListener('touchend', resetTilt);
  });
}

// Back to top button
const backToTop = select('.back-to-top');
const toggleBackToTop = () => {
  if (!backToTop) return;
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
};
window.addEventListener('scroll', toggleBackToTop);
toggleBackToTop();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Newsletter form success simulation
const newsletterForm = select('.newsletter-form');
const newsletterSuccess = select('.newsletter-success');
if (newsletterForm && newsletterSuccess) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    newsletterSuccess.classList.add('visible');
    setTimeout(() => {
      newsletterSuccess.classList.remove('visible');
    }, 4000);
  });
}

// Contact form success toast
const contactForm = select('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.textContent = 'Message received! I will reach out shortly.';
    body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 4200);
  });
}

// WhatsApp FAB focus ripple (optional animation trigger)
const whatsappFab = select('.whatsapp-fab');
if (whatsappFab) {
  whatsappFab.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      whatsappFab.click();
    }
  });
}

// Lightbox for certifications
const lightbox = select('.lightbox');
const lightboxContent = select('.lightbox__content');
const lightboxClose = select('.lightbox__close');
if (lightbox && lightboxContent && lightboxClose) {
  const openLightbox = (img) => {
    const clone = img.cloneNode(true);
    lightboxContent.innerHTML = '';
    lightboxContent.appendChild(clone);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxClose.focus({ preventScroll: true });
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  selectAll('.cert-card').forEach((card) => {
    card.addEventListener('click', () => {
      const img = select('img', card);
      if (img) {
        openLightbox(img);
      }
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const img = select('img', card);
        if (img) {
          openLightbox(img);
        }
      }
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${card.querySelector('h3').textContent} certificate preview`);
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });
}

// Backdrop toast styling injection
const toastStyle = document.createElement('style');
toastStyle.innerHTML = `
.toast-success {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translate3d(-50%, 120%, 0);
  padding: 1rem 1.6rem;
  border-radius: 18px;
  background: linear-gradient(120deg, rgba(0, 35, 102, 0.92), rgba(0, 35, 102, 0.65));
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.03em;
  box-shadow: 0 26px 60px rgba(0, 35, 102, 0.3);
  z-index: 999;
  transition: transform 320ms cubic-bezier(0.23, 1, 0.32, 1), opacity 320ms cubic-bezier(0.23, 1, 0.32, 1);
  opacity: 0;
}
.toast-success.visible {
  transform: translate3d(-50%, 0, 0);
  opacity: 1;
}
`;
document.head.appendChild(toastStyle);

// FAQ subtle hover tilt removal for keyboard focus
selectAll('.faq details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (detail.open) {
      detail.classList.add('open');
    } else {
      detail.classList.remove('open');
    }
  });
});
