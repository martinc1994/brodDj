/* ============================================
   BROD — DJ & Producer
   JavaScript — Animations, Interactions & i18n
   ============================================ */

// ============ TRANSLATIONS ============
const translations = {
  en: {
    // Navigation
    'nav.about': 'About',
    'nav.music': 'Music',
    'nav.gallery': 'Gallery',
    'nav.press': 'Press',
    'nav.connect': 'Connect',

    // Hero
    'hero.tagline': 'DJ & Producer · Groovy Techno · Argentina',
    'hero.listen': 'Listen Now',
    'hero.contact': 'Get in Touch',
    'hero.scroll': 'Scroll',

    // About
    'about.label': 'About BROD',
    'about.title': 'The Sound<br>Behind the Name',
    'about.bio1': 'BROD (Rodrigo Brizuela) is a DJ and producer based in Tucumán, Argentina, focused on a <strong>dark, hypnotic and rhythmic sound</strong>, where groove is the main axis of every set and production.',
    'about.bio2': 'His proposal combines the raw strength of techno with influences from <strong>techhouse, breakbeat and hardgroove</strong>, creating an intense physical and emotional experience on the dancefloor.',
    'about.statSets': 'Live Sets',
    'about.statFollowers': 'Followers',

    // Music
    'music.label': 'Discography & Sets',
    'music.title': 'Live Sets &<br>Productions',
    'music.subtitle': 'Dark, driving groovy techno sessions recorded live. Raw grooves, tension and power from start to finish.',
    'music.spotify': 'Listen on Spotify',

    // Gallery
    'gallery.label': 'Gallery',
    'gallery.title': 'Behind the<br>Decks',
    'gallery.liveSession': 'Live Session',
    'gallery.inTheMix': 'In The Mix',
    'gallery.portrait': 'Official Portrait',

    // Press
    'press.label': 'Media & Press',
    'press.title': 'In The Media',
    'press.cardTitle': 'Reales En Tu Espacio — Season 2026',
    'press.cardDesc': 'Guest DJ on "Reales en tu Espacio", a cultural broadcast and electronic music scene program.',

    // Connect
    'connect.label': 'Bookings & Socials',
    'connect.title': 'Find BROD<br>Everywhere',
    'connect.subtitle': 'Follow on social media, contact for event bookings, or listen to exclusive sets.',

    // Footer
    'footer.text': '© 2026 BROD (Rodrigo Brizuela). All rights reserved. DJ & Producer · Tucumán, Argentina',
  },

  es: {
    // Navegación
    'nav.about': 'Sobre mí',
    'nav.music': 'Música',
    'nav.gallery': 'Galería',
    'nav.press': 'Prensa',
    'nav.connect': 'Contacto',

    // Hero
    'hero.tagline': 'DJ & Productor · Groovy Techno · Argentina',
    'hero.listen': 'Escuchar Sets',
    'hero.contact': 'Contactar',
    'hero.scroll': 'Deslizar',

    // About
    'about.label': 'Sobre BROD',
    'about.title': 'El Sonido<br>Detrás del Nombre',
    'about.bio1': 'BROD (Rodrigo Brizuela) es un DJ y productor de Tucumán, Argentina, enfocado en un <strong>sonido oscuro, hipnótico y rítmico</strong>, donde el groove es el eje principal de cada set y producción.',
    'about.bio2': 'Su propuesta combina la fuerza pura del techno con influencias del <strong>techhouse, breakbeat y hardgroove</strong>, buscando generar una experiencia física y emocional en la pista de baile.',
    'about.statSets': 'Sets en Vivo',
    'about.statFollowers': 'Seguidores',

    // Música
    'music.label': 'Sets & Discografía',
    'music.title': 'Sets en Vivo &<br>Producciones',
    'music.subtitle': 'Sesiones de groovy techno y techno oscuro grabadas en vivo. Grooves crudos, tensión y potencia de principio a fin.',
    'music.spotify': 'Escuchar en Spotify',

    // Galería
    'gallery.label': 'Galería',
    'gallery.title': 'Detrás de<br>las Bandejas',
    'gallery.liveSession': 'Sesión en Vivo',
    'gallery.inTheMix': 'En la Mezcla',
    'gallery.portrait': 'Retrato Oficial',

    // Prensa
    'press.label': 'Medios y Prensa',
    'press.title': 'En los Medios',
    'press.cardTitle': 'Reales En Tu Espacio — Temporada 2026',
    'press.cardDesc': 'DJ Invitado en "Reales en tu Espacio", programa de difusión cultural y escena electrónica.',

    // Contacto
    'connect.label': 'Bookings & Redes',
    'connect.title': 'Encontrá a BROD<br>en Todas Partes',
    'connect.subtitle': 'Seguí en redes sociales, contrataciones para eventos o simplemente escuchá sus sets.',

    // Footer
    'footer.text': '© 2026 BROD (Rodrigo Brizuela). Todos los derechos reservados. DJ & Productor · Tucumán, Argentina',
  }
};

// ============ i18n ENGINE ============
let currentLang = localStorage.getItem('brod-lang') || 'en';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('brod-lang', lang);
  document.documentElement.lang = lang;

  // Update all data-i18n elements (textContent)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Update all data-i18n-html elements (innerHTML — for <br>, <strong>, etc.)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Update active state on buttons
  document.querySelectorAll('.lang-switch__btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // Update footer year dynamically
  const footerText = document.querySelector('[data-i18n="footer.text"]');
  if (footerText) {
    const year = new Date().getFullYear();
    footerText.textContent = footerText.textContent.replace('2026', year);
  }
}


document.addEventListener('DOMContentLoaded', () => {

  // ============ INIT LANGUAGE ============
  setLanguage(currentLang);

  // Language switch buttons
  document.querySelectorAll('.lang-switch__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  // ============ NAVBAR SCROLL EFFECT ============
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  const handleNavScroll = () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ============ MOBILE MENU TOGGLE ============
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ============ SCROLL REVEAL (Intersection Observer) ============
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============ SMOOTH SCROLL FOR NAV LINKS ============
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============ HERO PARTICLE CANVAS ============
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    const resizeCanvas = () => {
      const hero = canvas.parentElement;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
        this.fadeSpeed = Math.random() * 0.005 + 0.001;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity += this.fadeDirection * this.fadeSpeed;

        if (this.opacity <= 0.05 || this.opacity >= 0.5) {
          this.fadeDirection *= -1;
        }

        // Wrap around
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    const initParticles = () => {
      const count = Math.min(Math.floor(canvas.width * canvas.height / 12000), 80);
      particles = Array.from({ length: count }, () => new Particle());
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animateParticles);
    };

    resizeCanvas();
    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    // Pause animation when hero is not visible for performance
    const heroObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!animationId) animateParticles();
      } else {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }, { threshold: 0 });

    heroObserver.observe(canvas.parentElement);
  }

  // ============ ACTIVE NAV LINK ON SCROLL ============
  const sections = document.querySelectorAll('.section, .hero');
  const navLinksAll = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksAll.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${id}`) {
            link.style.color = 'var(--accent)';
          }
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(section => sectionObserver.observe(section));

  // ============ PARALLAX EFFECT ON HERO IMAGE ============
  const heroBg = document.querySelector('.hero__bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.25}px) scale(1.05)`;
      }
    }, { passive: true });
  }

  // ============ CURSOR GLOW ON HERO (DESKTOP ONLY) ============
  const hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(min-width: 768px)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--mouse-x', `${x}%`);
      hero.style.setProperty('--mouse-y', `${y}%`);
    });
  }

});
