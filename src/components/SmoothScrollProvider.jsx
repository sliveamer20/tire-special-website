import React, { useEffect, useRef } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function ScrollTriggerSync() {
  useLenis(() => ScrollTrigger.update());
  return null;
}

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const updateLenis = (time) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(updateLenis);
    return () => gsap.ticker.remove(updateLenis);
  }, []);

  return <ReactLenis root options={{ autoRaf: false, anchors: true, stopInertiaOnNavigate: true }} ref={lenisRef}>
    <ScrollTriggerSync />
    {children}
  </ReactLenis>;
}
