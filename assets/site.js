/* ===== Tire Special & Auto Repair — shared static site behavior ===== */
(function () {
  var PHONE = '+18134433869';
  var PHONE_DISP = '(813) 443-3869';

  var PATHS = {
    phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>'
  };
  function ic(name, size, sw) {
    size = size || 18; sw = sw || 2;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;display:block;">' + PATHS[name] + '</svg>';
  }

  var SUN = '<span class="ts-sun"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg></span>';
  var MOON = '<span class="ts-moon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path></svg></span>';

  var NAV = [
    { label: 'Home', href: 'index.html', key: 'home' },
    { label: 'Tires', href: 'tires.html', key: 'tires' },
    { label: 'Services', href: 'services.html', key: 'services' },
    { label: 'Promotions', href: 'promotions.html', key: 'promos' },
    { label: 'Book', href: 'book.html', key: 'book' },
    { label: 'Contact', href: 'contact.html', key: 'contact' }
  ];

  function buildHeader(active) {
    var desk = NAV.map(function (l) {
      return '<a class="nav-link' + (l.key === active ? ' active' : '') + '" href="' + l.href + '">' + l.label + '</a>';
    }).join('');
    var mob = NAV.map(function (l) {
      return '<a class="mnav-link' + (l.key === active ? ' active' : '') + '" href="' + l.href + '">' + l.label + '</a>';
    }).join('');
    return '' +
    '<header id="tsh">' +
      '<div class="topbar"><div class="topbar-inner">' +
        '<span class="topbar-addr"><span class="diamond">◆</span> 105 US-301, STE#103 · Tampa, FL 33619</span>' +
        '<div style="display:flex;align-items:center;gap:20px;">' +
          '<span class="topbar-hours"><span class="diamond">◆</span> MON–FRI 8–6 · SAT 8–5</span>' +
          '<a href="tel:' + PHONE + '">' + ic('phone', 15) + ' ' + PHONE_DISP + '</a>' +
        '</div>' +
      '</div></div>' +
      '<div class="mainbar"><div class="mainbar-inner">' +
        '<a class="logo" href="index.html" aria-label="Tire Special & Auto Repair — home">' +
          '<img class="ts-logo-light" src="assets/logo-light.png" alt="Tire Special & Auto Repair">' +
          '<img class="ts-logo-dark" src="assets/logo-dark.png" alt="Tire Special & Auto Repair">' +
        '</a>' +
        '<nav class="desk-nav">' + desk + '</nav>' +
        '<div class="head-actions">' +
          '<button class="theme-toggle" id="tsThemeToggle" aria-label="Toggle light or dark mode" title="Toggle theme">' + SUN + MOON + '</button>' +
          '<a class="call-btn" href="tel:' + PHONE + '">' + ic('phone', 18) + ' <span class="call-full">Call Now</span></a>' +
          '<button class="burger" id="tsBurger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-menu" id="tsMobileMenu" hidden><div class="inner">' + mob + '</div></div>' +
      '</div>' +
    '</header>';
  }

  function buildFooter() {
    var explore = NAV.slice(0, 5).map(function (l) {
      var label = l.key === 'services' ? 'Auto Services' : (l.key === 'book' ? 'Book Appointment' : l.label);
      return '<a class="foot-link" href="' + l.href + '">' + label + '</a>';
    }).join('');
    return '' +
    '<footer id="tsf">' +
      '<div class="fgrid">' +
        '<div>' +
          '<a href="index.html" style="display:inline-block;background:#fff;border-radius:10px;padding:8px 14px;line-height:0;margin-bottom:18px;"><img src="assets/logo-light.png" alt="Tire Special & Auto Repair" style="height:52px;width:auto;display:block;"></a>' +
          '<p style="color:#9a9aa1;font-size:15px;line-height:1.65;max-width:320px;margin:0;">Tampa\'s trusted full-service tire &amp; auto repair shop. New &amp; used tires, brakes, oil changes, alignments, A/C and more — all under one roof.</p>' +
          '<div style="display:flex;gap:10px;margin-top:20px;">' +
            '<a class="soc" href="https://www.facebook.com/TireSpecialAutoRepair" aria-label="Facebook">f</a>' +
            '<a class="soc" href="https://www.yelp.com/biz/tire-special-and-auto-repair-tampa-2" aria-label="Yelp">Y</a>' +
            '<a class="soc" href="https://g.co/kgs/cJTYi28" aria-label="Google">G</a>' +
          '</div>' +
        '</div>' +
        '<div><h4>Explore</h4><div style="display:flex;flex-direction:column;gap:11px;font-size:15px;">' + explore + '</div></div>' +
        '<div><h4>Hours</h4><div style="display:flex;flex-direction:column;gap:11px;font-size:15px;color:#d4d4d8;">' +
          '<div style="display:flex;justify-content:space-between;gap:12px;"><span>Mon–Fri</span><span style="color:#9a9aa1;">8:00–6:00</span></div>' +
          '<div style="display:flex;justify-content:space-between;gap:12px;"><span>Saturday</span><span style="color:#9a9aa1;">8:00–5:00</span></div>' +
          '<div style="display:flex;justify-content:space-between;gap:12px;"><span>Sunday</span><span style="color:#9a9aa1;">Closed</span></div>' +
        '</div></div>' +
        '<div><h4>Get In Touch</h4><div style="display:flex;flex-direction:column;gap:13px;font-size:15px;">' +
          '<a class="foot-link" href="tel:' + PHONE + '" style="color:#fff;font-weight:700;font-size:20px;font-family:\'Barlow Condensed\',sans-serif;display:inline-flex;align-items:center;gap:8px;">' + ic('phone', 18) + ' ' + PHONE_DISP + '</a>' +
          '<a class="foot-link" href="mailto:tirespecialfl@gmail.com">tirespecialfl@gmail.com</a>' +
          '<span style="color:#9a9aa1;line-height:1.5;">105 US-301, STE#103<br>Tampa, FL 33619</span>' +
        '</div></div>' +
      '</div>' +
      '<div class="foot-bottom"><div class="foot-bottom-inner">' +
        '<span>© 2026 Tire Special &amp; Auto Repair · Tampa, FL. All rights reserved.</span>' +
        '<a class="foot-link" href="privacy.html">Privacy Policy</a>' +
      '</div></div>' +
    '</footer>';
  }

  function mountChrome() {
    var active = document.body.getAttribute('data-page') || '';
    var h = document.getElementById('site-header');
    if (h) h.innerHTML = buildHeader(active);
    var f = document.getElementById('site-footer');
    if (f) f.innerHTML = buildFooter();

    var toggle = document.getElementById('tsThemeToggle');
    if (toggle) toggle.addEventListener('click', function () { if (window.tsToggleTheme) window.tsToggleTheme(); });

    var burger = document.getElementById('tsBurger');
    var menu = document.getElementById('tsMobileMenu');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.hasAttribute('hidden');
        if (open) { menu.removeAttribute('hidden'); burger.setAttribute('aria-expanded', 'true'); }
        else { menu.setAttribute('hidden', ''); burger.setAttribute('aria-expanded', 'false'); }
      });
    }
  }

  /* ---- Tire size finder ---- */
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function wireFinder() {
    var box = document.querySelector('[data-finder]');
    if (!box) return;
    var w = box.querySelector('[data-finder-width]');
    var r = box.querySelector('[data-finder-ratio]');
    var d = box.querySelector('[data-finder-diameter]');
    var btn = box.querySelector('[data-finder-cta]');
    if (!w || !r || !d || !btn) return;
    var empty = btn.getAttribute('data-cta-empty') || 'Get Price';
    var suffix = btn.getAttribute('data-cta-suffix') || '';
    var icon = btn.getAttribute('data-cta-icon') === 'phone' ? ic('phone', 17) + ' ' : '';
    var isSearching = false;

    function clean(v) { return (v || '').replace(/[^0-9]/g, ''); }
    function dims() { return { width: clean(w.value), ratio: clean(r.value), diameter: clean(d.value) }; }
    function isComplete(v) { return Boolean(v.width && v.ratio && v.diameter); }

    function update() {
      if (isSearching) return;
      var v = dims();
      if (isComplete(v)) {
        btn.innerHTML = icon + v.width + '/' + v.ratio + 'R' + v.diameter + suffix;
      } else {
        btn.innerHTML = icon + empty;
      }
    }
    [w, r, d].forEach(function (s) { s.addEventListener('change', update); s.addEventListener('input', update); });
    update();

    /* Results panel — created at runtime, hidden until a search runs so the
       page markup/layout is unchanged until the user actually searches. */
    var results = document.createElement('div');
    results.setAttribute('data-finder-results', '');
    results.hidden = true;
    results.style.cssText = 'max-width:1280px;margin:18px auto 0;padding:0 24px;';
    box.insertAdjacentElement('afterend', results);

    function renderMessage(text) {
      results.hidden = false;
      results.innerHTML = '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px 22px;color:var(--muted);font-family:\'Barlow\',sans-serif;font-size:15px;">' + escapeHtml(text) + '</div>';
    }

    function renderResults(items) {
      results.hidden = false;
      if (!items || !items.length) {
        renderMessage("No tires found for that size. Call us and we'll check availability.");
        return;
      }
      var rows = items.map(function (item) {
        var tags = [];
        if (item.partCode) tags.push('<span>Part# ' + escapeHtml(item.partCode) + '</span>');
        if (item.speedIndex) tags.push('<span>Speed ' + escapeHtml(item.speedIndex) + '</span>');
        if (item.availability) tags.push('<span>Avail ' + escapeHtml(item.availability) + '</span>');
        return '<div style="display:flex;flex-wrap:wrap;gap:6px 18px;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);">' +
          '<div style="font-family:\'Barlow\',sans-serif;font-size:15px;color:var(--text);font-weight:600;">' + escapeHtml(item.description) + '</div>' +
          '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--muted);font-family:\'Barlow Condensed\',sans-serif;letter-spacing:.03em;text-transform:uppercase;">' + tags.join('') + '</div>' +
        '</div>';
      }).join('');
      results.innerHTML = '<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;">' + rows + '</div>';
    }

    function setLoading(loading) {
      isSearching = loading;
      if (loading) {
        btn.setAttribute('aria-disabled', 'true');
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.65';
        btn.innerHTML = 'Searching…';
      } else {
        btn.removeAttribute('aria-disabled');
        btn.style.pointerEvents = '';
        btn.style.opacity = '';
        update();
      }
    }

    btn.addEventListener('click', function (e) {
      if (isSearching) { e.preventDefault(); return; }
      var v = dims();
      if (!isComplete(v)) return; // incomplete size: fall through to the tel: link
      e.preventDefault();
      if (!window.tsApi || typeof window.tsApi.searchTires !== 'function') {
        renderMessage('Search is unavailable right now. Please call us.');
        return;
      }
      setLoading(true);
      renderMessage('Searching…');
      window.tsApi.searchTires(v)
        .then(function (data) { renderResults(data && data.results); })
        .catch(function () { renderMessage('We could not complete your search. Please try again or call us.'); })
        .then(function () { setLoading(false); });
    });
  }

  /* ---- Booking form ---- */
  function wireBooking() {
    var form = document.getElementById('bookForm');
    if (!form) return;
    var success = document.getElementById('bookSuccess');
    var errBox = document.getElementById('bookError');
    var nameEl = form.querySelector('[name="name"]');
    var phoneEl = form.querySelector('[name="phone"]');
    var serviceEl = form.querySelector('[name="service"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!nameEl.value.trim() || !phoneEl.value.trim()) {
        if (errBox) errBox.hidden = false;
        return;
      }
      if (errBox) errBox.hidden = true;
      var first = nameEl.value.trim().split(' ')[0] || 'there';
      var svc = (serviceEl.value || '').toLowerCase();
      var nameOut = document.getElementById('bookNameOut');
      var svcOut = document.getElementById('bookServiceOut');
      if (nameOut) nameOut.textContent = first;
      if (svcOut) svcOut.textContent = svc;
      form.hidden = true;
      if (success) success.hidden = false;
    });

    var reset = document.getElementById('bookReset');
    if (reset) reset.addEventListener('click', function () {
      form.reset();
      if (success) success.hidden = true;
      form.hidden = false;
    });
  }

  /* ---- GSAP entrance + scroll reveal ---- */
  function wireAnim() {
    var g = window.gsap, ST = window.ScrollTrigger, tries = 0;
    (function ready() {
      if (!g) { g = window.gsap; }
      if (!ST) { ST = window.ScrollTrigger; }
      if (!g || !ST) { if (tries++ < 60) { setTimeout(ready, 50); } return; }
      g.registerPlugin(ST);
      var root = document.querySelector('[data-page-root]');
      if (!root) return;
      var mm = g.matchMedia();
      mm.add({ motion: '(prefers-reduced-motion: no-preference)' }, function (ctx) {
        if (!ctx.conditions.motion) return;
        var q = g.utils.selector(root);
        var hero = q('[data-hero]');
        var tl = g.timeline({ defaults: { ease: 'power3.out' } });
        if (hero.length) {
          tl.from(hero, { autoAlpha: 0, y: 28, duration: .75, stagger: .1, delay: .12 });
          var heroBtns = q('[data-hero-cta] a');
          if (heroBtns.length) {
            tl.from(heroBtns, { scale: .9, autoAlpha: 0, duration: .5, stagger: .08, ease: 'back.out(1.7)', clearProps: 'scale' }, '-=.4');
          }
        }
        var sections = g.utils.toArray(root.querySelectorAll('section')).slice(1);
        g.set(sections, { autoAlpha: 0, y: 44 });
        ST.batch(sections, {
          start: 'top 86%',
          onEnter: function (b) { g.to(b, { autoAlpha: 1, y: 0, duration: .75, ease: 'power3.out', stagger: .12, overwrite: true }); }
        });
        requestAnimationFrame(function () { ST.refresh(); });
      });
    })();
  }

  function init() {
    mountChrome();
    wireFinder();
    wireBooking();
    wireAnim();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
