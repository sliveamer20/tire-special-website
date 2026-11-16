import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const phone = '+18134433869';
const phoneText = '(813) 443-3869';
const address = '105 US-301, STE#103 · Tampa, FL 33619';
const navItems = [
  { label: 'Home', href: 'index.html', key: 'home' },
  { label: 'Tires', href: 'tires.html', key: 'tires' },
  { label: 'Services', href: 'services.html', key: 'services' },
  { label: 'Promotions', href: 'promotions.html', key: 'promos' },
  { label: 'Book', href: 'book.html', key: 'book' },
  { label: 'Contact', href: 'contact.html', key: 'contact' },
];

function initialTheme() {
  const current = document.documentElement.dataset.theme;
  if (current === 'light' || current === 'dark') return current;
  let theme;
  try {
    const stored = localStorage.getItem('tsTheme');
    if (stored === 'light' || stored === 'dark') theme = stored;
  } catch { /* Storage can be disabled; use the existing time-based default. */ }
  if (!theme) {
    const hour = new Date().getHours();
    theme = hour >= 6 && hour < 18 ? 'light' : 'dark';
  }
  document.documentElement.dataset.theme = theme;
  return theme;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('tsTheme', theme); } catch { /* Keep theme usable without storage. */ }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark') }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function PhoneIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}

function ThemeIcons() {
  return <>
    <span className="ts-sun"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg></span>
    <span className="ts-moon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" /></svg></span>
  </>;
}

export function SiteHeader({ activePage }) {
  const { toggleTheme } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return <header id="tsh">
    <div className="topbar"><div className="topbar-inner">
      <span className="topbar-addr"><span className="diamond">◆</span> {address}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span className="topbar-hours"><span className="diamond">◆</span> MON–FRI 8–6 · SAT 8–5</span>
        <a href={`tel:${phone}`}><PhoneIcon size={15} /> {phoneText}</a>
      </div>
    </div></div>
    <div className="mainbar"><div className="mainbar-inner">
      <a className="logo" href="index.html" aria-label="Tire Special & Auto Repair — home">
        <img className="ts-logo-light" src="assets/logo-light.png" alt="Tire Special & Auto Repair" />
        <img className="ts-logo-dark" src="assets/logo-dark.png" alt="Tire Special & Auto Repair" />
      </a>
      <nav className="desk-nav" aria-label="Main navigation">{navItems.map((item) => <a key={item.key} className={`nav-link${activePage === item.key ? ' active' : ''}`} aria-current={activePage === item.key ? 'page' : undefined} href={item.href}>{item.label}</a>)}</nav>
      <div className="head-actions">
        <button className="theme-toggle" type="button" data-theme-toggle aria-label="Toggle light or dark mode" title="Toggle theme" onClick={toggleTheme}><ThemeIcons /></button>
        <a className="call-btn" href={`tel:${phone}`}><PhoneIcon size={18} /> <span className="call-full">Call Now</span></a>
        <button className="burger" type="button" aria-label="Menu" aria-controls="tsMobileMenu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
      </div>
    </div>
      <nav id="tsMobileMenu" className="mobile-menu" hidden={!menuOpen} aria-label="Mobile navigation"><div className="inner">{navItems.map((item) => <a key={item.key} className={`mnav-link${activePage === item.key ? ' active' : ''}`} aria-current={activePage === item.key ? 'page' : undefined} href={item.href} onClick={closeMenu}>{item.label}</a>)}</div></nav>
    </div>
  </header>;
}

export function SiteFooter() {
  const footerLinks = navItems.slice(0, 5).map((item) => ({ ...item, label: item.key === 'services' ? 'Auto Services' : item.key === 'book' ? 'Book Appointment' : item.label }));
  return <footer id="tsf">
    <div className="fgrid">
      <div>
        <a href="index.html" style={{ display: 'inline-block', background: '#fff', borderRadius: 10, padding: '8px 14px', lineHeight: 0, marginBottom: 18 }}><img loading="lazy" src="assets/logo-light.png" alt="Tire Special & Auto Repair" style={{ height: 52, width: 'auto', display: 'block' }} /></a>
        <p style={{ color: '#9a9aa1', fontSize: 15, lineHeight: 1.65, maxWidth: 320, margin: 0 }}>Tampa's trusted full-service tire &amp; auto repair shop. New &amp; used tires, brakes, oil changes, alignments, A/C and more — all under one roof.</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}><a className="soc" href="https://www.facebook.com/TireSpecialAutoRepair" aria-label="Facebook">f</a><a className="soc" href="https://www.yelp.com/biz/tire-special-and-auto-repair-tampa-2" aria-label="Yelp">Y</a><a className="soc" href="https://g.co/kgs/cJTYi28" aria-label="Google">G</a></div>
      </div>
      <div><h4>Explore</h4><div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 15 }}>{footerLinks.map((item) => <a key={item.key} className="foot-link" href={item.href}>{item.label}</a>)}</div></div>
      <div><h4>Hours</h4><div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 15, color: '#d4d4d8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Mon–Fri</span><span style={{ color: '#9a9aa1' }}>8:00–6:00</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Saturday</span><span style={{ color: '#9a9aa1' }}>8:00–5:00</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Sunday</span><span style={{ color: '#9a9aa1' }}>Closed</span></div>
      </div></div>
      <div><h4>Get In Touch</h4><div style={{ display: 'flex', flexDirection: 'column', gap: 13, fontSize: 15 }}>
        <a className="foot-link" href={`tel:${phone}`} style={{ color: '#fff', fontWeight: 700, fontSize: 20, fontFamily: 'Barlow Condensed, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 8 }}><PhoneIcon /> {phoneText}</a>
        <a className="foot-link" href="mailto:tirespecialfl@gmail.com">tirespecialfl@gmail.com</a>
        <span style={{ color: '#9a9aa1', lineHeight: 1.5 }}>105 US-301, STE#103<br />Tampa, FL 33619</span>
      </div></div>
    </div>
    <div className="foot-bottom"><div className="foot-bottom-inner"><span>© 2026 Tire Special &amp; Auto Repair · Tampa, FL. All rights reserved.</span><a className="foot-link" href="privacy.html">Privacy Policy</a></div></div>
  </footer>;
}
