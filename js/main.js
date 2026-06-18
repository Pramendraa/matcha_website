/**
 * Matcha Website - Main JavaScript
 * Handles navigation, contact modal, and scroll effects
 */

initPageLoader();

document.addEventListener('DOMContentLoaded', function () {
  initThemeToggle();
  initNavbar();
  initContactModal();
  initHeroPhoneSlideshow();
  initWetaHeroScroll();
  initScrollReveal();
  initFeaturesStrokeParallax();
  initHowItWorksStrokeParallax();
  initVisualIntelligenceScrollReveal();
  initVisualIntelligenceEndReflection();
  initAmbientParallax();
  initFeaturesDotsParallax();
  initScrollNavigation();
  initHeroParticles();
  initPricingCountUp();
  initAnalyticsVideos();
});

/** Animate numeric prices counting up when pricing section enters viewport. */
function initPricingCountUp() {
  var section = document.getElementById('pricing');
  if (!section || !('IntersectionObserver' in window)) return;

  // Match both desktop table cells and mobile card values
  var targets = section.querySelectorAll('.pt-amount, .price-value');
  if (!targets.length) return;

  function animate(el) {
    var raw = (el.textContent || '').trim();
    // Skip non-numeric ("600+", "0", "Custom") and already-animated nodes
    if (el.dataset.counted === '1' || raw === '0' || /[^\d.]/.test(raw)) {
      el.dataset.counted = '1';
      return;
    }
    var target = parseFloat(raw);
    if (!isFinite(target) || target <= 0) { el.dataset.counted = '1'; return; }

    el.dataset.counted = '1';
    var duration = 900;
    var start = performance.now();
    function tick(now) {
      var t = Math.min(1, (now - start) / duration);
      // easeOutQuart
      var eased = 1 - Math.pow(1 - t, 4);
      var current = target * eased;
      el.textContent = target >= 100 ? Math.round(current).toString()
                                     : current.toFixed(target % 1 === 0 ? 0 : 2);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = raw; // restore original formatting
    }
    requestAnimationFrame(tick);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      targets.forEach(animate);
      observer.disconnect();
    });
  }, { threshold: 0.25 });

  observer.observe(section);
}

/** Performance Analytics: autoplay demo videos when section is visible (all phones shown at once). */
function initAnalyticsVideos() {
  var section = document.getElementById('analytics');
  if (!section || !('IntersectionObserver' in window)) return;

  var videos = [].slice.call(section.querySelectorAll('.analytics-phones video'));
  if (!videos.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sync(shouldPlay) {
    videos.forEach(function (video) {
      if (!shouldPlay || reduceMotion) {
        try { video.pause(); } catch (e) {}
        return;
      }
      video.play().catch(function () {});
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      sync(entry.isIntersecting);
    });
  }, { threshold: 0.2 });

  observer.observe(section);
}

/**
 * Reload splash: #111 field, radial glow, three vertical lines (CSS); center ~100×100 WebM.
 * On end: pause near last frame, hold 2s, overlay fade.
 */
function initPageLoader() {
  var loader = document.getElementById('page-loader');
  if (!loader) return;

  var video = document.getElementById('page-loader-video');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var splashDone = false;
  var safetyTimer = null;
  var holdStarted = false;
  var holdMs = 2000;

  function hideDom() {
    if (video) {
      try {
        video.pause();
      } catch (e) {}
    }
    loader.setAttribute('aria-hidden', 'true');
    loader.style.display = 'none';
  }

  function runExit() {
    if (splashDone) return;
    splashDone = true;
    if (safetyTimer) {
      window.clearTimeout(safetyTimer);
      safetyTimer = null;
    }
    loader.classList.add('page-loader--exiting');
    document.body.classList.remove('page-loading');

    if (reduceMotion) {
      window.setTimeout(hideDom, 80);
      return;
    }

    loader.addEventListener('transitionend', function onTe(e) {
      if (e.propertyName !== 'opacity') return;
      loader.removeEventListener('transitionend', onTe);
      hideDom();
    });
    window.setTimeout(hideDom, 1100);
  }

  function startHoldAfterVideo() {
    if (holdStarted || splashDone) return;
    holdStarted = true;
    window.setTimeout(runExit, holdMs);
  }

  function freezeLastFrame() {
    if (!video) return;
    try {
      if (video.duration && !isNaN(video.duration)) {
        video.currentTime = Math.max(0, video.duration - 0.04);
      }
      video.pause();
    } catch (e3) {}
  }

  safetyTimer = window.setTimeout(function () {
    if (!splashDone) runExit();
  }, 120000);

  loader.classList.add('page-loader--show-grid');

  if (reduceMotion) {
    if (video) {
      try {
        video.pause();
        video.style.display = 'none';
      } catch (e4) {}
    }
    window.setTimeout(runExit, holdMs);
    return;
  }

  if (!video) {
    window.setTimeout(runExit, holdMs);
    return;
  }

  video.loop = false;

  video.addEventListener(
    'ended',
    function () {
      freezeLastFrame();
      startHoldAfterVideo();
    },
    { once: true }
  );

  video.addEventListener(
    'error',
    function () {
      try {
        video.style.display = 'none';
      } catch (e5) {}
      startHoldAfterVideo();
    },
    { once: true }
  );

  var p = video.play();
  if (p && typeof p.catch === 'function') {
    p.catch(function () {
      try {
        video.style.display = 'none';
      } catch (e6) {}
      startHoldAfterVideo();
    });
  }
}

/** Dark-mode ambient blobs: subtle vertical drift vs scroll (UE-style depth) */
function initAmbientParallax() {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function apply() {
    if (reduceMotion.matches) {
      root.style.setProperty('--ambient-scroll-y-1', '0px');
      root.style.setProperty('--ambient-scroll-y-2', '0px');
      return;
    }
    var y = window.scrollY || window.pageYOffset;
    root.style.setProperty('--ambient-scroll-y-1', y * 0.036 + 'px');
    root.style.setProperty('--ambient-scroll-y-2', -y * 0.024 + 'px');
  }

  window.addEventListener('scroll', apply, { passive: true });
  reduceMotion.addEventListener('change', apply);
  apply();
}

/** Theme toggle: dark/light mode with localStorage + system preference */
function initThemeToggle() {
  var toggle = document.getElementById('theme-toggle');
  var stored = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Apply saved theme or follow system preference
  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (!toggle) return;

  toggle.addEventListener('click', function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}

/** Navbar: scroll shadow, mobile toggle, smooth close on link click */
function initNavbar() {
  var navbar = document.getElementById('navbar');
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-menu');

  if (!navbar || !toggle || !menu) return;

  // Add shadow on scroll
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Mobile hamburger toggle
  toggle.addEventListener('click', function () {
    menu.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  // Close menu when a nav link is clicked
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('open');
      toggle.classList.remove('active');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target) && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.classList.remove('active');
    }
  });

  // Close menu on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.classList.remove('active');
    }
  });

  initNavScrollSpy(menu);
}

/** Highlight nav links for the section currently in view (homepage scroll spy). */
function initNavScrollSpy(menu) {
  var links = Array.prototype.slice.call(menu.querySelectorAll('a[href*="#"]'));
  if (!links.length) return;

  var pairs = [];
  links.forEach(function (link) {
    var hash = (link.getAttribute('href') || '').split('#')[1];
    if (!hash) return;
    var section = document.getElementById(hash);
    if (section) pairs.push({ link: link, section: section, id: hash });
  });

  if (!pairs.length) return;

  pairs.sort(function (a, b) {
    return a.section.offsetTop - b.section.offsetTop;
  });

  var ticking = false;

  function getNavOffset() {
    var navH = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
    return (parseFloat(navH) || 72) + 32;
  }

  function updateActiveSection() {
    ticking = false;
    var scrollY = window.scrollY || window.pageYOffset;
    var offset = getNavOffset();
    var activeId = '';

    for (var i = 0; i < pairs.length; i++) {
      if (scrollY + offset >= pairs[i].section.offsetTop) {
        activeId = pairs[i].id;
      }
    }

    pairs.forEach(function (pair) {
      pair.link.classList.toggle('active', pair.id === activeId);
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateActiveSection);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();
}

/** Hero phone: push left; four clips; loop snaps instantly 4→1 (no duplicate slide — avoids second speed meter flash) */
function initHeroPhoneSlideshow() {
  var root = document.querySelector('[data-hero-slideshow]');
  if (!root) return;

  var track = root.querySelector('[data-hero-track]');
  if (!track) return;

  var INTERVAL_MS = 4000;
  var index = 0;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STEP_PCT = 25;

  var slides = track.querySelectorAll('video.phone-mockup-slide');

  function syncVideos() {
    if (!slides.length) return;
    slides.forEach(function (v, i) {
      if (i === index) {
        v.play().catch(function () {});
      } else {
        v.pause();
      }
    });
  }

  function setTransform() {
    track.style.transform = 'translateX(-' + index * STEP_PCT + '%)';
    syncVideos();
  }

  function snapToLoopStart() {
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    index = 0;
    void track.offsetWidth;
    track.style.transition = '';
    if (slides[0]) slides[0].currentTime = 0;
    syncVideos();
  }

  function advance() {
    if (reduceMotion) {
      index = (index + 1) % 4;
      setTransform();
      return;
    }
    if (index === 3) {
      snapToLoopStart();
      return;
    }
    index += 1;
    setTransform();
  }

  setTransform();
  window.setInterval(advance, INTERVAL_MS);
}

/**
 * Wētā FX–style hero (wetafx.co.nz): layered scroll motion — phone scrubs up from below with
 * subtle 3D tilt + scale; text and glow move at different rates (depth). Reveal progress
 * locks forward so the phone does not drop back when scrolling up.
 */
function initWetaHeroScroll() {
  var phone = document.querySelector('[data-hero-phone-reveal]');
  var hero = document.querySelector('.hero');
  var content = document.querySelector('.hero-content');
  var glow = document.querySelector('.hero-glow');
  if (!phone || !hero) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    phone.style.removeProperty('transform');
    if (content) content.style.removeProperty('transform');
    if (glow) glow.style.removeProperty('transform');
    return;
  }

  function supportsScrollDrivenHero() {
    if (typeof CSS === 'undefined' || !CSS.supports) return false;
    try {
      return (
        CSS.supports('animation-timeline', 'scroll()') ||
        CSS.supports('animation-timeline', 'scroll(root)') ||
        CSS.supports('animation-timeline', 'scroll(root block)')
      );
    } catch (e) {
      return false;
    }
  }

  var useScrollTimeline = supportsScrollDrivenHero();
  if (useScrollTimeline) {
    document.body.setAttribute('data-hero-scroll-driven', '');
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  function travelPx(vh) {
    /* Keep reveal inside hero; avoid pushing mockup past section edge */
    return Math.min(200, Math.max(100, Math.round(vh * 0.16)));
  }

  var maxReveal = 0;
  var rafScheduled = false;

  function tick() {
    var vh = window.innerHeight || 1;
    var scrollY = window.scrollY || window.pageYOffset || 0;

    // Stronger motion per pixel scroll (easier to see than ~0.72vh range)
    var range = Math.max(vh * 0.42, 220);
    var raw = scrollY / range;
    var progress = easeOutQuint(clamp(raw, 0, 1));
    if (progress > maxReveal) maxReveal = progress;

    var narrow = window.innerWidth < 768;
    if (!useScrollTimeline) {
      var p = maxReveal;
      var rotMax = narrow ? 4 : 6;
      var ty = (1 - p) * travelPx(vh);
      var rotX = (1 - p) * rotMax;
      var sc = 0.93 + p * 0.07;

      phone.style.transform =
        'translate3d(0, ' +
        ty.toFixed(2) +
        'px, 0) rotateX(' +
        rotX.toFixed(2) +
        'deg) scale3d(' +
        sc.toFixed(4) +
        ', ' +
        sc.toFixed(4) +
        ', 1)';
    }

    var parallaxMul = narrow ? 0.4 : 1;

    // Copy moves slightly against scroll (depth vs phone — Wētā-style layer separation)
    if (content) {
      var contentShift = -clamp(scrollY * 0.055 * parallaxMul, 0, 52);
      content.style.transform = 'translate3d(0, ' + contentShift.toFixed(2) + 'px, 0)';
    }

    // Background glow drifts slower than copy (extra depth)
    if (glow) {
      var gy = -clamp(scrollY * 0.028 * parallaxMul, 0, 32);
      glow.style.transform = 'translate3d(-50%, calc(-50% + ' + gy.toFixed(2) + 'px), 0)';
    }
  }

  function onScrollOrResize() {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(function () {
      rafScheduled = false;
      tick();
    });
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  requestAnimationFrame(function () {
    requestAnimationFrame(tick);
  });
}

/**
 * Wētā-style section reveals (wetafx.co.nz): blocks ease up + fade in as they enter the viewport;
 * grids stagger children for a layered “popup” feel.
 */
function initScrollReveal() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markVisible(el) {
    if (el.hasAttribute('data-scroll-reveal-group')) {
      el.classList.add('scroll-reveal-group--visible');
    } else if (el.classList.contains('scroll-reveal-steps')) {
      el.classList.add('scroll-reveal-steps--visible');
    } else if (el.classList.contains('scroll-reveal')) {
      el.classList.add('scroll-reveal--visible');
    }
  }

  function revealEverything() {
    document.querySelectorAll('.scroll-reveal, [data-scroll-reveal-group], .scroll-reveal-steps').forEach(markVisible);
  }

  if (reduce) {
    revealEverything();
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        markVisible(entry.target);
        io.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: '0px 0px -4% 0px', threshold: 0.16 }
  );

  document.querySelectorAll('.scroll-reveal, [data-scroll-reveal-group], .scroll-reveal-steps').forEach(function (el) {
    io.observe(el);
  });
}

/** Decorative stroke in features section: vertical parallax on scroll */
function initFeaturesStrokeParallax() {
  var stroke = document.querySelector('[data-features-stroke]');
  if (!stroke) return;

  var section = stroke.closest('.features-section');
  if (!section) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stroke.style.transform = 'translate3d(0, -50%, 0)';
    return;
  }

  var currentShift = 0;
  var targetShift = 0;
  var ticking = false;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function measureTarget() {
    var vh = window.innerHeight || 1;
    var rect = section.getBoundingClientRect();
    var sectionCenter = rect.top + rect.height * 0.5;
    var viewportCenter = vh * 0.5;
    var norm = (sectionCenter - viewportCenter) / (vh * 0.85);
    targetShift = clamp(-norm * 30, -30, 30);
  }

  function animate() {
    currentShift += (targetShift - currentShift) * 0.065;
    stroke.style.transform =
      'translate3d(0, calc(-50% + ' + currentShift.toFixed(2) + 'px), 0)';

    if (Math.abs(targetShift - currentShift) > 0.05) {
      requestAnimationFrame(animate);
    } else {
      ticking = false;
    }
  }

  function onScrollOrResize() {
    measureTarget();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      animate();
    });
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  measureTarget();
  requestAnimationFrame(animate);
}

/** How-It-Works decorative batter stroke: slower independent vertical lag */
function initHowItWorksStrokeParallax() {
  var stroke = document.querySelector('[data-hiw-stroke]');
  if (!stroke) return;

  var section = stroke.closest('.how-it-works');
  if (!section) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stroke.style.transform = 'translate3d(0, -50%, 0)';
    return;
  }

  var currentShift = 0;
  var targetShift = 0;
  var ticking = false;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function measureTarget() {
    var vh = window.innerHeight || 1;
    var rect = section.getBoundingClientRect();
    var sectionCenter = rect.top + rect.height * 0.5;
    var viewportCenter = vh * 0.5;
    var norm = (sectionCenter - viewportCenter) / (vh * 0.9);
    targetShift = clamp(-norm * 22, -22, 22);
  }

  function animate() {
    currentShift += (targetShift - currentShift) * 0.05;
    stroke.style.transform =
      'translate3d(0, calc(-50% + ' + currentShift.toFixed(2) + 'px), 0)';

    if (Math.abs(targetShift - currentShift) > 0.04) {
      requestAnimationFrame(animate);
    } else {
      ticking = false;
    }
  }

  function onScrollOrResize() {
    measureTarget();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(animate);
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  measureTarget();
  requestAnimationFrame(animate);
}

/**
 * Smooth delayed scroll response (UE-style feel): sections follow scroll with
 * tiny inertia. Uses CSS translate so existing transform animations stay intact.
 */
function initScrollLag() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = [].slice.call(
    document.querySelectorAll(
      '.scroll-reveal:not(.hero-content), [data-scroll-reveal-group], .scroll-reveal-steps'
    )
  );
  if (!targets.length) return;

  if (reduce) {
    targets.forEach(function (el) {
      el.style.translate = '0 0';
    });
    return;
  }

  var items = targets.map(function (el) {
    var isGroup = el.hasAttribute('data-scroll-reveal-group');
    return {
      el: el,
      current: 0,
      target: 0,
      amp: isGroup ? 16 : 12,
      ease: isGroup ? 0.11 : 0.09,
    };
  });

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function tick() {
    var vh = window.innerHeight || 1;
    var half = vh * 0.5;

    items.forEach(function (it) {
      var rect = it.el.getBoundingClientRect();
      var center = rect.top + rect.height * 0.5;
      var norm = (center - half) / half;
      it.target = clamp(-norm * it.amp, -it.amp, it.amp);
      it.current += (it.target - it.current) * it.ease;
      it.el.style.translate = '0 ' + it.current.toFixed(2) + 'px';
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


/** Contact modal: open via .contact-trigger, close via button/overlay/Escape */
function initContactModal() {
  var modal = document.getElementById('contact-modal');
  var closeBtn = document.getElementById('modal-close');
  var triggers = document.querySelectorAll('.contact-trigger');
  var form = document.getElementById('contact-form');

  if (!modal) return;

  function openModal(e) {
    if (e) e.preventDefault();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (form) form.reset();
  }

  triggers.forEach(function (el) {
    el.addEventListener('click', openModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var content = modal.querySelector('.modal-content');
      if (content) {
        content.innerHTML =
          '<div style="text-align:center;padding:60px 40px;">' +
          '<i class="fas fa-check-circle" style="font-size:60px;color:#02b272;margin-bottom:20px;"></i>' +
          '<h2 style="color:#02b272;margin-bottom:15px;font-family:Montserrat,sans-serif;">Thank You!</h2>' +
          '<p style="color:#666;font-size:16px;margin-bottom:10px;">Your message has been sent.</p>' +
          '<p style="color:#999;font-size:14px;">We\'ll get back to you soon!</p>' +
          '<button onclick="location.reload()" style="margin-top:25px;padding:12px 30px;background:#02b272;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-family:Montserrat,sans-serif;">Close</button>' +
          '</div>';
      }
    });
  }
}

/**
 * Visual Intelligence: staggered slide when the section is meaningfully in view.
 * (Loose "any pixel" checks used to fire on load so the animation finished before scroll.)
 */
function initVisualIntelligenceScrollReveal() {
  var grid = document.querySelector('.visual-intelligence-grid');
  if (!grid) return;

  var items = [].slice.call(grid.querySelectorAll('.visual-intelligence-item'));
  if (!items.length) return;

  var triggered = false;
  var STAGGER_MS = 320;

  function revealAllInstant() {
    items.forEach(function (el) {
      el.classList.add('visual-intelligence-item--in-view');
    });
  }

  function runStaggeredReveal() {
    if (triggered) return;
    triggered = true;

    items.forEach(function (el, i) {
      window.setTimeout(function () {
        el.classList.add('visual-intelligence-item--in-view');
      }, i * STAGGER_MS);
    });
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealAllInstant();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (triggered) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          runStaggeredReveal();
          observer.disconnect();
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -12% 0px',
      threshold: [0.25, 0.4, 0.55, 0.7],
    }
  );

  observer.observe(grid);
}

/** Visual Intelligence: soft reflection sweep when a video ends */
function initVisualIntelligenceEndReflection() {
  var section = document.querySelector('.visual-intelligence-breakout');
  if (!section) return;

  var videos = [].slice.call(section.querySelectorAll('.visual-intelligence-item video'));
  if (!videos.length) return;

  videos.forEach(function (video) {
    video.addEventListener('ended', function () {
      section.classList.remove('visual-intelligence-breakout--reflect');
      // Restart animation reliably by forcing reflow
      void section.offsetWidth;
      section.classList.add('visual-intelligence-breakout--reflect');
    });
  });

  section.addEventListener('animationend', function (e) {
    if (e.animationName === 'vi-section-reflect') {
      section.classList.remove('visual-intelligence-breakout--reflect');
    }
  });
}

/**
 * Decorative dots background in features section: smooth depth parallax.
 * Eases translate3d Y based on the section's position relative to viewport center.
 * Skipped under prefers-reduced-motion.
 */
function initFeaturesDotsParallax() {
  var dots = document.querySelector('[data-features-dots]');
  if (!dots) return;

  var section = dots.closest('.features-section');
  if (!section) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dots.style.transform = 'translate3d(0, 0, 0)';
    return;
  }

  var currentShift = 0;
  var targetShift = 0;
  var ticking = false;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function measureTarget() {
    var vh = window.innerHeight || 1;
    var rect = section.getBoundingClientRect();
    var sectionCenter = rect.top + rect.height * 0.5;
    var viewportCenter = vh * 0.5;
    var norm = (sectionCenter - viewportCenter) / (vh * 0.85);
    targetShift = clamp(-norm * 140, -140, 140);
  }

  function animate() {
    currentShift += (targetShift - currentShift) * 0.05;
    dots.style.transform = 'translate3d(0, ' + currentShift.toFixed(2) + 'px, 0)';

    if (Math.abs(targetShift - currentShift) > 0.04) {
      requestAnimationFrame(animate);
    } else {
      ticking = false;
    }
  }

  function onScrollOrResize() {
    measureTarget();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(animate);
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  measureTarget();
  requestAnimationFrame(animate);
}

/**
 * Scroll navigation controller.
 * Wires #go-top-btn and #go-down-btn; toggles .scroll-button-active based on scrollY.
 */
function initScrollNavigation() {
  var btnTop = document.getElementById('go-top-btn');
  var btnDown = document.getElementById('go-down-btn');
  if (!btnTop || !btnDown) return;

  btnTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnDown.addEventListener('click', function () {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  });

  function updateScrollButtons() {
    var scrollY = window.scrollY;

    if (scrollY > 150) {
      btnTop.classList.add('scroll-button-active');
    } else {
      btnTop.classList.remove('scroll-button-active');
    }

    if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 100) {
      btnDown.classList.remove('scroll-button-active');
    } else {
      btnDown.classList.add('scroll-button-active');
    }
  }

  window.addEventListener('scroll', updateScrollButtons, { passive: true });
  updateScrollButtons();
}

/**
 * Neural-network particle system for hero background.
 * Renders connected particles on <canvas id="hero-particles">.
 * Adaptive count: 30 mobile / 60 desktop. Linked particles within 130px.
 */
function initHeroParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const options = {
    particleColor: 'rgba(28, 174, 129, 0.6)',
    particleAmount: window.innerWidth < 768 ? 30 : 60,
    defaultSpeed: 0.3,
    variantSpeed: 0.4,
    defaultRadius: 1.5,
    variantRadius: 1.5,
    linkRadius: 130
  };

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.speed = options.defaultSpeed + Math.random() * options.variantSpeed;
      this.directionAngle = Math.floor(Math.random() * 360);
      this.color = options.particleColor;
      this.radius = options.defaultRadius + Math.random() * options.variantRadius;
      this.vector = {
        x: Math.cos(this.directionAngle) * this.speed,
        y: Math.sin(this.directionAngle) * this.speed
      };
    }
    update() {
      this.border();
      this.x += this.vector.x;
      this.y += this.vector.y;
    }
    border() {
      if (this.x >= width || this.x <= 0) this.vector.x *= -1;
      if (this.y >= height || this.y <= 0) this.vector.y *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function setup() {
    resize();
    particles = [];
    for (let i = 0; i < options.particleAmount; i++) {
      particles.push(new Particle());
    }
    window.addEventListener('resize', resize);
    requestAnimationFrame(loop);
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    for (let i = 0; i < particles.length; i++) {
      linkParticles(particles[i], particles);
    }
    requestAnimationFrame(loop);
  }

  function linkParticles(particle, arr) {
    for (let i = 0; i < arr.length; i++) {
      let dx = particle.x - arr[i].x;
      let dy = particle.y - arr[i].y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < options.linkRadius) {
        let opacity = 1 - (dist / options.linkRadius);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(28, 174, 129, ${opacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(arr[i].x, arr[i].y);
        ctx.stroke();
      }
    }
  }

  setup();
}
