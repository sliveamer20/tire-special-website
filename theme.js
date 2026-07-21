(function () {
  var KEY = 'tsTheme';
  function preferred() {
    try { var s = localStorage.getItem(KEY); if (s === 'light' || s === 'dark') return s; } catch (e) {}
    var h = new Date().getHours();
    return (h >= 6 && h < 18) ? 'light' : 'dark';
  }
  function ensureStyle() {
    if (document.getElementById('ts-theme-vars')) return;
    var st = document.createElement('style');
    st.id = 'ts-theme-vars';
    st.textContent = [
      'html[data-theme="light"]{color-scheme:light;',
      '--bg:#f5f4f1;--surface:#ffffff;--text:#16171b;--muted:#6c6d73;--strong:#3a3b41;',
      '--border:#ebeae6;--eyebrow:#c99a00;--chip:#fffbe8;--chip-border:#f2e3a0;',
      '--band:linear-gradient(180deg,#fbfaf8,#f2f1ed);',
      '--media:linear-gradient(160deg,#f3f2ee,#e7e6e1);',
      '--mapbg:#e8e7e3;--header-bg:rgba(255,255,255,.96);--header-border:#e7e6e2;--logo-plate:transparent;}',
      'html[data-theme="dark"]{color-scheme:dark;',
      '--bg:#0e0f12;--surface:#17181c;--text:#f4f4f5;--muted:#a1a1aa;--strong:#d4d4d8;',
      '--border:#2a2b30;--eyebrow:#f0c43a;--chip:rgba(255,210,30,.12);--chip-border:rgba(255,210,30,.32);',
      '--band:linear-gradient(180deg,#16181f,#0e0f12);',
      '--media:linear-gradient(160deg,#24262c,#15161a);',
      '--mapbg:#24262c;--header-bg:rgba(18,19,23,.96);--header-border:#2a2b30;--logo-plate:#ffffff;}',
      '[data-theme-toggle] .ts-moon{display:none !important;}',
      'html[data-theme="dark"] .ts-logo-light{display:none !important;}',
      'html[data-theme="light"] .ts-logo-dark{display:none !important;}',
      '[data-theme-toggle] .ts-sun{display:flex;}',
      'html[data-theme="dark"] [data-theme-toggle] .ts-sun{display:none !important;}',
      'html[data-theme="dark"] [data-theme-toggle] .ts-moon{display:flex !important;}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }
  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { window.dispatchEvent(new CustomEvent('tsthemechange', { detail: t })); } catch (e) {}
  }
  window.tsGetTheme = function () { return document.documentElement.getAttribute('data-theme') || preferred(); };
  window.tsSetTheme = function (t) { try { localStorage.setItem(KEY, t); } catch (e) {} apply(t); };
  window.tsToggleTheme = function () { window.tsSetTheme(window.tsGetTheme() === 'dark' ? 'light' : 'dark'); };
  ensureStyle();
  apply(preferred());
  document.addEventListener('DOMContentLoaded', function () { ensureStyle(); apply(window.tsGetTheme()); });
})();
