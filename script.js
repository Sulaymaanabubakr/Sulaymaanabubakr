// main.js

// Mobile nav toggle + outside click close
document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  function openMenu() {
    siteNav.classList.add("open");
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    siteNav.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  navToggle.addEventListener("click", (e) => {
    e.stopPropagation(); // don’t trigger the outside click
    siteNav.classList.contains("open") ? closeMenu() : openMenu();
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (
      siteNav.classList.contains("open") && 
      !siteNav.contains(e.target) && 
      !navToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Optional: close when pressing ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && siteNav.classList.contains("open")) {
      closeMenu();
    }
  });
});

// Sticky header shadow on scroll
const header = document.querySelector('.site-header');
const onScroll = () => {
  if (window.scrollY > 8) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
document.addEventListener('scroll', onScroll);
onScroll();

// Smooth scroll for in-page anchors
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id.length > 1){
      const target = document.querySelector(id);
      if (target){
        e.preventDefault();
        target.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    }
  });
});

// Intersection Observer for reveal animations (including hero image)
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Dynamic year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Optional: add a small load effect to the hero image for polish
const heroImg = document.querySelector('.hero-photo img');
if (heroImg && heroImg.complete) {
  heroImg.classList.add('loaded');
} else if (heroImg) {
  heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
}

// Floating back-to-top visibility + behavior
const backToTop = document.getElementById('backToTop');

function toggleBackToTop(){
  if(!backToTop) return;
  window.scrollY > 400
    ? backToTop.classList.remove('fab-hidden')
    : backToTop.classList.add('fab-hidden');
}
toggleBackToTop();
window.addEventListener('scroll', toggleBackToTop);

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== Portfolio filters (projects.html) ===== */
(function(){
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  const pills = document.querySelectorAll('.portfolio-filters .pill');
  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');

      const f = p.getAttribute('data-filter');
      const cards = grid.querySelectorAll('.project-card');
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (f === 'all' || f === cat) {
          card.style.display = '';
          card.classList.add('reveal'); // nudge animation if you use reveal
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletterForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const endpoint = form.dataset.endpoint;      // from data-endpoint
    const formData = new FormData(form);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        // show your message, not Formspree’s page
        const msg = document.getElementById("newsletterMessage");
        if (msg) msg.style.display = "block";
        form.reset();

        // redirect after 2.5s
        setTimeout(() => {
          window.location.href = "/";            // or your domain root
        }, 2500);
      } else {
        let text = "Something went wrong. Please try again.";
        try {
          const data = await res.json();
          if (data?.errors?.length) text = data.errors.map(e => e.message).join(" ");
        } catch {}
        alert("❌ " + text);
      }
    } catch (err) {
      alert("⚠️ Network error. Please check your connection.");
    }
  });
});

/* ===== Portfolio filters (projects.html) ===== */
(function(){
  const grid = document.getElementById('portfolioGrid');
  if(!grid) return;

  const pills = document.querySelectorAll('.portfolio-filters .pill');
  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');

      const cat = p.getAttribute('data-filter');
      const cards = grid.querySelectorAll('.project-card');
      cards.forEach(card => {
        const c = card.getAttribute('data-category');
        card.style.display = (cat === 'All' || c === cat) ? '' : 'none';
      });
    });
  });
})();

// Simple FAQ toggle
document.querySelectorAll('.faq-q').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const item = btn.closest('.faq');
    const open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});