import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import parse, { attributesToProps, domToReact } from 'html-react-parser';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SiteFooter, SiteHeader, ThemeProvider } from './components/SiteChrome.jsx';
import { replaceFinderNode } from './components/TireSearch.jsx';
import { BookingProvider, replaceBookingNode } from './components/Booking.jsx';
import { MechanicAssistant } from './components/MechanicAssistant.jsx';
import { SmoothScrollProvider } from './components/SmoothScrollProvider.jsx';
import VariableProximity from './components/reactbits/VariableProximity.jsx';
import 'lenis/dist/lenis.css';
import './theme.css';

gsap.registerPlugin(ScrollTrigger);

const pageIds = {
  'index.html': ['hp', 'home'], 'tires.html': ['tp', 'tires'], 'services.html': ['sv', 'services'],
  'promotions.html': ['pr', 'promos'], 'book.html': ['bk', 'book'], 'contact.html': ['ct', 'contact'], 'privacy.html': ['pv', 'privacy'],
};
const pageContent = import.meta.glob('./pages/*.html', { query: '?raw', import: 'default' });

function PageContent({ content }) {
  return parse(content, { replace(node) {
    if (node.attribs?.['data-variable-proximity'] !== undefined) {
      const props = attributesToProps(node.attribs);
      delete props['data-variable-proximity'];
      const label = node.children?.map((child) => child.data ?? '').join('') ?? '';
      return <h1 {...props}><VariableProximity label={label} fromFontVariationSettings="'wght' 650, 'opsz' 48" toFontVariationSettings="'wght' 1000, 'opsz' 64" radius={72} /></h1>;
    }
    if (node.attribs?.['data-finder'] !== undefined) return replaceFinderNode(node);
    if (node.attribs?.id?.startsWith('book')) {
      const replacement = replaceBookingNode(node);
      if (replacement) return replacement;
    }
    if (node.attribs?.['data-bg']) {
      const props = attributesToProps(node.attribs);
      delete props['data-bg'];
      return <BackgroundMedia tag={node.name} props={props} filename={node.attribs['data-bg']}>{domToReact(node.children)}</BackgroundMedia>;
    }
    return undefined;
  } });
}

function BackgroundMedia({ tag: Tag, props, filename, children }) {
  const element = useRef(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setLoaded(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoaded(true); observer.disconnect(); }
    }, { rootMargin: '200px 0px' });
    if (element.current) observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  const style = loaded ? { ...props.style, backgroundImage: `url("${filename}")` } : props.style;
  return <Tag {...props} ref={element} style={style}>{children}</Tag>;
}

function PageMotion({ children }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = document.querySelector('main[data-page-root]');
    if (!root) return undefined;
    const context = gsap.context(() => {
      const hero = gsap.utils.toArray('[data-hero]', root);
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (hero.length) {
        timeline.from(hero, { autoAlpha: 0, y: 28, duration: 0.75, stagger: 0.1, delay: 0.08 });
        const ctas = root.querySelectorAll('[data-hero-cta] a');
        if (ctas.length) timeline.from(ctas, { scale: 0.9, autoAlpha: 0, duration: 0.3, stagger: 0.05, ease: 'back.out(1.7)', clearProps: 'scale', force3D: true }, '-=0.55');
      }
      const sections = [...root.querySelectorAll('section')].slice(1);
      sections.forEach((section) => gsap.from(section, { autoAlpha: 0, y: 44, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 86%', once: true } }));
    }, root);
    return () => context.revert();
  }, []);
  return children;
}

function SitePage({ page }) {
  return <SmoothScrollProvider><ThemeProvider><BookingProvider>
    <div id="site-header"><SiteHeader activePage={page.key} /></div>
    <PageMotion><main id={page.id} data-page-root><PageContent content={page.content} /></main></PageMotion>
    <div id="site-footer"><SiteFooter /></div>
    <div id="mechanic-root"><MechanicAssistant /></div>
  </BookingProvider></ThemeProvider></SmoothScrollProvider>;
}

const filename = pageIds[location.pathname.split('/').pop()] ? location.pathname.split('/').pop() : 'index.html';
const rootElement = document.getElementById('react-root');
if (rootElement) {
  pageContent[`./pages/${filename.replace('.html', '')}.html`]().then((content) => {
    createRoot(rootElement).render(<SitePage page={{ content, id: pageIds[filename][0], key: pageIds[filename][1] }} />);
  });
}
