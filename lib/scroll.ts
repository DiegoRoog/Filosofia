'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
let lenis: Lenis | undefined;
export function startScroll() {
  lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - 2 ** (-10 * t)), smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
  return () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = undefined; };
}
export function scrollTo(target: number | string, duration = 1.5) {
  if (lenis) lenis.scrollTo(target, { duration });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'instant' });
  else document.querySelector(target)?.scrollIntoView();
}
export { gsap, ScrollTrigger };
