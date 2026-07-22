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
          '<button class="theme-toggle" id="tsThemeToggle" data-theme-toggle aria-label="Toggle light or dark mode" title="Toggle theme">' + SUN + MOON + '</button>' +
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

    // Full-screen details overlay lives at body level so it escapes the finder's flow.
    var detailsEl = document.createElement('div');
    detailsEl.className = 'ts-details';
    detailsEl.hidden = true;
    document.body.appendChild(detailsEl);

    var QTY_OPTIONS = [
      { key: 'qty1', label: '1 Tire' },
      { key: 'qty2', label: '2 Tires' },
      { key: 'qty3Plus', label: '3+ Tires' }
    ];
    var QTY_COUNT = { qty1: 1, qty2: 2, qty3Plus: null };
    var SORT_OPTIONS = [
      { key: 'recommended', label: 'Recommended' },
      { key: 'price-asc', label: 'Price: Low to High' },
      { key: 'price-desc', label: 'Price: High to Low' },
      { key: 'name-asc', label: 'Name: A to Z' }
    ];

    // Optional spec fields — rendered only when the API actually provides them,
    // so missing specs are hidden gracefully and no data is invented.
    var SPEC_FIELDS = [
      { key: 'brand', label: 'Brand' },
      { key: 'mileageWarranty', label: 'Mileage Warranty' },
      { key: 'utqg', label: 'UTQG' },
      { key: 'speedIndex', label: 'Speed Rating' },
      { key: 'loadIndex', label: 'Load Index' },
      { key: 'origin', label: 'Country of Origin' },
      { key: 'dot', label: 'DOT / Mfg Date' },
      { key: 'partCode', label: 'Part #' }
    ];

    // ---- View state (all derived from the single fetched result set) ----
    var selectedQty = 'qty1';
    var lastSize = '';
    var rawItems = null;       // exactly what the API returned
    var viewItems = [];        // filtered + sorted for display
    var sortKey = 'recommended';
    var filters = { availability: {}, speedIndex: {}, priceMax: null };
    var filtersOpen = false;

    var SVG = {
      close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      filter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>',
      empty: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M8 11h6"/></svg>',
      alert: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>'
    };

    function formatPrice(n) { return '$' + Number(n).toFixed(2); }
    // Some fields (availability, speedIndex, partCode, description) come back flat on
    // the result item; the rest (brand, mileageWarranty, utqg, loadIndex, origin, dot)
    // are nested under item.specifications — check both so nothing that the API
    // actually returned gets dropped.
    function specValue(item, key) {
      var v = item[key];
      if (v === undefined || v === null) {
        v = item.specifications ? item.specifications[key] : undefined;
      }
      if (v === undefined || v === null) return '';
      return String(v).trim();
    }
    function unitPrice(item) {
      return item.retailPrice && typeof item.retailPrice[selectedQty] === 'number'
        ? item.retailPrice[selectedQty] : null;
    }
    function distinct(field) {
      var seen = {}, out = [];
      (rawItems || []).forEach(function (it) {
        var v = specValue(it, field);
        if (v && !seen[v]) { seen[v] = 1; out.push(v); }
      });
      return out;
    }
    function priceBounds() {
      var vals = (rawItems || []).map(unitPrice).filter(function (v) { return typeof v === 'number'; });
      if (!vals.length) return null;
      return { min: Math.floor(Math.min.apply(null, vals)), max: Math.ceil(Math.max.apply(null, vals)) };
    }

    // ---- State panels (styled, no invented data) ----
    function renderState(kind, title, text, showCall) {
      rawItems = null;
      results.hidden = false;
      var icon = kind === 'error' ? SVG.alert : SVG.empty;
      results.innerHTML =
        '<div class="ts-state">' +
          '<div class="ts-state-ico ts-state-' + kind + '">' + icon + '</div>' +
          '<div class="ts-state-title">' + escapeHtml(title) + '</div>' +
          '<div class="ts-state-text">' + escapeHtml(text) + '</div>' +
          (showCall ? '<a class="ts-cta ts-state-cta" href="tel:+18134433869">' + ic('phone', 17) + ' Call (813) 443-3869</a>' : '') +
        '</div>';
    }
    function renderMessage(text) { renderState('empty', 'Heads up', text, true); }

    function renderSkeleton() {
      rawItems = null;
      results.hidden = false;
      var cards = '';
      for (var i = 0; i < 6; i++) {
        cards += '<div class="ts-sk-card">' +
          '<div class="ts-sk-line" style="width:62%"></div>' +
          '<div class="ts-sk-line" style="width:34%"></div>' +
          '<div class="ts-sk-line" style="width:80%;margin-top:14px"></div>' +
          '<div class="ts-sk-line" style="width:50%"></div>' +
          '<div class="ts-sk-price"></div>' +
          '<div class="ts-sk-btn"></div>' +
        '</div>';
      }
      results.innerHTML =
        '<div class="ts-sk-head"></div>' +
        '<div class="ts-res-grid">' + cards + '</div>';
    }

    function renderCard(item, idx) {
      var brand = specValue(item, 'brand');
      var name = escapeHtml(item.description || 'Tire');
      var sizeChip = lastSize ? '<span class="ts-size-chip">' + escapeHtml(lastSize) + '</span>' : '';
      var brandLine = brand ? '<div class="ts-card-brand">' + escapeHtml(brand) + '</div>' : '';
      var avail = specValue(item, 'availability');
      var badge = avail ? '<span class="ts-badge"><span class="ts-badge-dot"></span>' + escapeHtml(avail) + '</span>' : '';

      var specs = SPEC_FIELDS.filter(function (f) {
        return f.key !== 'brand' && specValue(item, f.key);
      }).slice(0, 4).map(function (f) {
        return '<div class="ts-spec"><dt>' + escapeHtml(f.label) + '</dt><dd>' + escapeHtml(specValue(item, f.key)) + '</dd></div>';
      }).join('');
      var specBlock = specs ? '<dl class="ts-specs">' + specs + '</dl>' : '';

      var unit = unitPrice(item), priceBlock;
      if (unit != null) {
        var n = QTY_COUNT[selectedQty];
        var sub = n ? 'Est. ' + formatPrice(unit * n) + ' for ' + n + (n === 1 ? ' tire' : ' tires') : 'Price shown per tire';
        priceBlock =
          '<div class="ts-price-line"><span class="ts-price">' + escapeHtml(formatPrice(unit)) + '</span><span class="ts-price-unit">/ tire</span></div>' +
          '<div class="ts-price-sub">' + escapeHtml(sub) + '</div>';
      } else {
        priceBlock = '<div class="ts-price-call">Call for price</div>';
      }

      return '<div class="ts-card">' +
        '<div class="ts-card-top"><div class="ts-card-heads">' + brandLine +
          '<h3 class="ts-card-name">' + name + '</h3></div>' + sizeChip + '</div>' +
        badge + specBlock +
        '<div class="ts-price-wrap">' + priceBlock +
          '<div class="ts-card-actions">' +
            '<button type="button" class="ts-btn-ghost" data-view-idx="' + idx + '">View Details</button>' +
            '<a class="ts-cta" href="tel:+18134433869">' + ic('phone', 17) + ' Call to Order</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    // ---- Filters + sort applied to the fetched set (never a new request) ----
    function computeView() {
      var items = (rawItems || []).slice();
      var af = Object.keys(filters.availability), sf = Object.keys(filters.speedIndex);
      items = items.filter(function (it) {
        if (af.length && !filters.availability[specValue(it, 'availability')]) return false;
        if (sf.length && !filters.speedIndex[specValue(it, 'speedIndex')]) return false;
        if (filters.priceMax != null) {
          var p = unitPrice(it);
          if (p != null && p > filters.priceMax) return false; // unknown price is never filtered out
        }
        return true;
      });
      if (sortKey === 'price-asc' || sortKey === 'price-desc') {
        items.sort(function (a, b) {
          var pa = unitPrice(a), pb = unitPrice(b);
          if (pa == null && pb == null) return 0;
          if (pa == null) return 1; if (pb == null) return -1;
          return sortKey === 'price-asc' ? pa - pb : pb - pa;
        });
      } else if (sortKey === 'name-asc') {
        items.sort(function (a, b) { return String(a.description || '').localeCompare(String(b.description || '')); });
      }
      return items;
    }

    function renderSidebar() {
      var groups = '';
      var avails = distinct('availability');
      var speeds = distinct('speedIndex');
      var pb = priceBounds();

      if (avails.length) {
        groups += '<div class="ts-fgroup"><div class="ts-fgroup-t">Availability</div>' +
          avails.map(function (v) {
            var on = !!filters.availability[v];
            return '<label class="ts-check"><input type="checkbox" data-f="availability" value="' + escapeHtml(v) + '"' + (on ? ' checked' : '') + '><span>' + escapeHtml(v) + '</span></label>';
          }).join('') + '</div>';
      }
      if (speeds.length) {
        groups += '<div class="ts-fgroup"><div class="ts-fgroup-t">Speed Rating</div>' +
          speeds.map(function (v) {
            var on = !!filters.speedIndex[v];
            return '<label class="ts-check"><input type="checkbox" data-f="speedIndex" value="' + escapeHtml(v) + '"' + (on ? ' checked' : '') + '><span>' + escapeHtml(v) + '</span></label>';
          }).join('') + '</div>';
      }
      if (pb && pb.max > pb.min) {
        var cur = filters.priceMax != null ? filters.priceMax : pb.max;
        groups += '<div class="ts-fgroup"><div class="ts-fgroup-t">Max Price / Tire</div>' +
          '<input type="range" class="ts-range" data-price-range min="' + pb.min + '" max="' + pb.max + '" step="1" value="' + cur + '">' +
          '<div class="ts-range-val">Up to <strong>' + formatPrice(cur) + '</strong></div></div>';
      }
      if (!groups) groups = '<div class="ts-fgroup-empty">No filters available for these results.</div>';

      return '<aside class="ts-sidebar' + (filtersOpen ? ' is-open' : '') + '" aria-label="Filters">' +
        '<div class="ts-sidebar-head"><span>Filters</span>' +
          '<button type="button" class="ts-clear" data-clear-filters>Clear all</button></div>' +
        groups +
      '</aside>';
    }

    function renderWorkspace() {
      viewItems = computeView();
      var total = (rawItems || []).length;
      var head = '<div class="ts-res-head">' +
        '<h2 class="ts-res-title">' + total + (total === 1 ? ' Match' : ' Matches') +
          (lastSize ? ' for ' + escapeHtml(lastSize) : '') + '</h2>' +
        '<span class="ts-res-sub">Live retail pricing · installation available in-store</span>' +
      '</div>';

      var qtyBar = '<div class="ts-qtybar" role="group" aria-label="Quantity">' +
        QTY_OPTIONS.map(function (opt) {
          var active = opt.key === selectedQty;
          return '<button type="button" class="ts-qtybtn" data-qty-option="' + opt.key + '" aria-pressed="' + (active ? 'true' : 'false') + '">' + opt.label + '</button>';
        }).join('') + '</div>';

      var sortSel = '<div class="ts-sort"><label class="ts-sort-l" for="tsSort">Sort</label>' +
        '<select id="tsSort" class="ts-sort-sel">' +
          SORT_OPTIONS.map(function (o) {
            return '<option value="' + o.key + '"' + (o.key === sortKey ? ' selected' : '') + '>' + escapeHtml(o.label) + '</option>';
          }).join('') +
        '</select></div>';

      var toolbar = '<div class="ts-toolbar">' +
        '<button type="button" class="ts-filter-toggle" data-filter-toggle>' + SVG.filter + ' Filters</button>' +
        qtyBar + sortSel +
        '<span class="ts-showing">Showing ' + viewItems.length + ' of ' + total + '</span>' +
      '</div>';

      var grid = viewItems.length
        ? '<div class="ts-res-grid">' + viewItems.map(renderCard).join('') + '</div>'
        : '<div class="ts-state ts-state-inline"><div class="ts-state-ico ts-state-empty">' + SVG.empty + '</div>' +
          '<div class="ts-state-title">No matches for these filters</div>' +
          '<div class="ts-state-text">Try clearing a filter to see more tires.</div>' +
          '<button type="button" class="ts-btn-ghost" data-clear-filters>Clear filters</button></div>';

      results.innerHTML = head + toolbar +
        '<div class="ts-workspace">' + renderSidebar() + '<div class="ts-grid-wrap">' + grid + '</div></div>';

      wireWorkspace();
    }

    function wireWorkspace() {
      Array.prototype.forEach.call(results.querySelectorAll('[data-qty-option]'), function (b) {
        b.addEventListener('click', function () {
          selectedQty = b.getAttribute('data-qty-option');
          filters.priceMax = null; // price scale depends on qty — reset so nothing is silently hidden
          renderWorkspace(); // re-render from already-fetched data — no new API request
        });
      });
      var sortSel = results.querySelector('.ts-sort-sel');
      if (sortSel) sortSel.addEventListener('change', function () { sortKey = sortSel.value; renderWorkspace(); });

      Array.prototype.forEach.call(results.querySelectorAll('input[data-f]'), function (cb) {
        cb.addEventListener('change', function () {
          var group = cb.getAttribute('data-f'), val = cb.value;
          if (cb.checked) filters[group][val] = 1; else delete filters[group][val];
          renderWorkspace();
        });
      });
      var range = results.querySelector('[data-price-range]');
      if (range) range.addEventListener('input', function () {
        filters.priceMax = Number(range.value);
        var lbl = results.querySelector('.ts-range-val strong');
        if (lbl) lbl.textContent = formatPrice(filters.priceMax);
        // debounce grid re-render to keep the slider smooth
        clearTimeout(range._t);
        range._t = setTimeout(renderWorkspace, 120);
      });
      Array.prototype.forEach.call(results.querySelectorAll('[data-clear-filters]'), function (b) {
        b.addEventListener('click', function () {
          filters = { availability: {}, speedIndex: {}, priceMax: null };
          renderWorkspace();
        });
      });
      var toggle = results.querySelector('[data-filter-toggle]');
      if (toggle) toggle.addEventListener('click', function () {
        filtersOpen = !filtersOpen;
        var sb = results.querySelector('.ts-sidebar');
        if (sb) sb.classList.toggle('is-open', filtersOpen);
      });
      Array.prototype.forEach.call(results.querySelectorAll('[data-view-idx]'), function (b) {
        b.addEventListener('click', function () { openDetails(viewItems[Number(b.getAttribute('data-view-idx'))]); });
      });
    }

    // ---- Tire details view (overlay populated from the already-fetched item) ----
    function openDetails(item) {
      if (!item) return;
      var brand = specValue(item, 'brand');
      var avail = specValue(item, 'availability');
      var badge = avail ? '<span class="ts-badge"><span class="ts-badge-dot"></span>' + escapeHtml(avail) + '</span>' : '';

      var tierRows = QTY_OPTIONS.map(function (opt) {
        var p = item.retailPrice && typeof item.retailPrice[opt.key] === 'number' ? item.retailPrice[opt.key] : null;
        var n = QTY_COUNT[opt.key];
        var tot = (p != null && n) ? formatPrice(p * n) : '—';
        return '<tr' + (opt.key === selectedQty ? ' class="is-sel"' : '') + '><th scope="row">' + escapeHtml(opt.label) + '</th>' +
          '<td>' + (p != null ? formatPrice(p) + ' / tire' : 'Call for price') + '</td>' +
          '<td>' + tot + '</td></tr>';
      }).join('');

      var specs = SPEC_FIELDS.filter(function (f) {
        return f.key !== 'brand' && specValue(item, f.key);
      }).map(function (f) {
        return '<div class="ts-spec"><dt>' + escapeHtml(f.label) + '</dt><dd>' + escapeHtml(specValue(item, f.key)) + '</dd></div>';
      }).join('');
      var specBlock = specs
        ? '<dl class="ts-specs ts-specs-lg">' + specs + '</dl>'
        : '<p class="ts-dt-note">Full specifications are confirmed by phone for this tire.</p>';

      detailsEl.innerHTML =
        '<div class="ts-dt-backdrop" data-dt-close></div>' +
        '<div class="ts-dt-panel" role="dialog" aria-modal="true" aria-label="Tire details">' +
          '<button type="button" class="ts-dt-x" data-dt-close aria-label="Close">' + SVG.close + '</button>' +
          '<div class="ts-dt-hero">' +
            (brand ? '<div class="ts-card-brand">' + escapeHtml(brand) + '</div>' : '') +
            '<h2 class="ts-dt-name">' + escapeHtml(item.description || 'Tire') + '</h2>' +
            '<div class="ts-dt-meta">' + (lastSize ? '<span class="ts-size-chip">' + escapeHtml(lastSize) + '</span>' : '') + badge + '</div>' +
          '</div>' +
          '<div class="ts-dt-body">' +
            '<div class="ts-dt-pricing"><h3 class="ts-dt-h">Pricing</h3>' +
              '<table class="ts-tiers"><thead><tr><th>Quantity</th><th>Per Tire</th><th>Total</th></tr></thead><tbody>' + tierRows + '</tbody></table>' +
              '<p class="ts-dt-note">Prices are live retail. Mount &amp; balance available in-store.</p>' +
            '</div>' +
            '<div class="ts-dt-specs"><h3 class="ts-dt-h">Specifications</h3>' + specBlock + '</div>' +
          '</div>' +
          '<div class="ts-dt-actions">' +
            '<a class="ts-cta" href="tel:+18134433869">' + ic('phone', 17) + ' Call to Order</a>' +
            '<a class="ts-btn-ghost ts-btn-ghost-lg" href="book.html">Book Installation</a>' +
          '</div>' +
        '</div>';
      detailsEl.hidden = false;
      document.body.style.overflow = 'hidden';
      var x = detailsEl.querySelector('.ts-dt-x'); if (x) x.focus();
      Array.prototype.forEach.call(detailsEl.querySelectorAll('[data-dt-close]'), function (c) {
        c.addEventListener('click', closeDetails);
      });
    }
    function closeDetails() {
      detailsEl.hidden = true;
      detailsEl.innerHTML = '';
      document.body.style.overflow = '';
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && detailsEl && !detailsEl.hidden) closeDetails();
    });

    function renderResults(items) {
      results.hidden = false;
      if (!items || !items.length) {
        renderState('empty', 'No tires found', "We couldn't find that size in stock right now — call us and we'll source it for you.", true);
        return;
      }
      rawItems = items;
      sortKey = 'recommended';
      filters = { availability: {}, speedIndex: {}, priceMax: null };
      filtersOpen = false;
      renderWorkspace();
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
      selectedQty = 'qty1';
      lastSize = v.width + '/' + v.ratio + 'R' + v.diameter;
      setLoading(true);
      renderSkeleton();
      window.tsApi.searchTires(v)
        .then(function (data) { renderResults(data && data.results); })
        .catch(function () { renderState('error', 'Search unavailable', 'We could not reach live pricing just now. Please try again in a moment or call us — we can check your size in seconds.', true); })
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
