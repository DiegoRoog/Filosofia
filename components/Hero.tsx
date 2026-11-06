'use client';
import { useEffect, useRef } from 'react';
import { preload as preloadFont } from 'react-dom';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/dm-serif-display/latin-400-italic.css';
import '@fontsource/manrope/latin-600.css';
import { gsap, ScrollTrigger, scrollTo } from '@/lib/scroll';
import { coverRect, clamp } from '@/lib/geometry';
import { asset } from '@/lib/assetPath';
import styles from './Hero.module.css';

export function Hero({ reduced, ready }: { reduced: boolean; ready: () => void }) {
  preloadFont(new URL('../node_modules/@fontsource/cinzel/files/cinzel-latin-700-normal.woff2', import.meta.url).href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  preloadFont(new URL('../node_modules/@fontsource/dm-serif-display/files/dm-serif-display-latin-400-italic.woff2', import.meta.url).href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  const section = useRef<HTMLElement>(null), back = useRef<HTMLCanvasElement>(null), front = useRef<HTMLCanvasElement>(null), video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = section.current!, media = video.current!, canvas = back.current!, foreground = front.current!;
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { ready(); return; }
    const context = canvas.getContext('2d', { alpha: false }), overlay = foreground.getContext('2d');
    if (!context || !overlay) media.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:1;object-fit:cover;transform:scale(1.015)';
    const mask = new Image(); mask.src = asset('/img/temple-mask.png');
    let dirty = true, visible = true, disposed = false, callback = 0, progress = 0, target = 0, lastTime = -1;
    let rect = coverRect(1920, 1080), width = 1920, height = 1080;
    const title = el.querySelector<HTMLElement>('[data-title]')!, quotes = el.querySelectorAll<HTMLElement>('[data-quote]');
    const stage = el.querySelector<HTMLElement>('[data-stage]')!;
    const resize = () => {
      const bounds = stage.getBoundingClientRect(); width = bounds.width; height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5, 1920 / width);
      for (const c of [canvas, foreground]) { c.width = Math.round(width * ratio); c.height = Math.round(height * ratio); }
      rect = coverRect(canvas.width, canvas.height);
      const cssRect = coverRect(width, height);
      stage.style.setProperty('--frame-top', `${cssRect.y}px`); stage.style.setProperty('--frame-height', `${cssRect.height}px`);
      dirty = true;
    };
    const observer = new ResizeObserver(resize); observer.observe(stage); resize();
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && !document.hidden) void media.play().catch(() => ready()); else media.pause(); }); intersection.observe(el);
    const onVisibility = () => { if (document.hidden) media.pause(); else if (visible) void media.play().catch(() => {}); };
    document.addEventListener('visibilitychange', onVisibility);
    const frameCallback = () => { dirty = true; if (!disposed && 'requestVideoFrameCallback' in media) callback = media.requestVideoFrameCallback(frameCallback); };
    const onLoad = () => { ready(); dirty = true; };
    media.addEventListener('loadeddata', onLoad); media.addEventListener('error', onLoad);
    media.src = asset(window.innerWidth < 900 ? '/video/hero-mobile.mp4' : '/video/hero.mp4'); media.load();
    if ('requestVideoFrameCallback' in media) callback = media.requestVideoFrameCallback(frameCallback);
    void media.play().catch(() => ready());
    const trigger = ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom bottom', onUpdate: self => { target = self.progress; } });
    const ctx = gsap.context(() => {
      gsap.from('[data-curtain]', { opacity: 1, duration: 1.2, ease: 'power2.inOut' });
      gsap.from('[data-label]', { y: 12, opacity: 0, duration: .7, delay: .3 });
      gsap.from('[data-letter]', { y: '.4em', opacity: 0, stagger: .07, duration: 1.4, delay: .5, ease: 'expo.out' });
      gsap.from('[data-quote-inner]', { x: i => i ? 28 : -28, opacity: 0, duration: 1.1, stagger: .15, delay: 1.4 });
      gsap.from('[data-scroll]', { opacity: 0, duration: .7, delay: 2.2 });
      gsap.to('[data-scroll-line]', { y: 12, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, el);
    const tick = () => {
      if (!visible || document.hidden) return;
      progress += (target - progress) * .1;
      title.style.transform = `translateY(${progress * height * .18}px)`; title.style.opacity = `${1 - progress * .85}`;
      quotes.forEach(q => { q.style.transform = `translateY(${-progress * height * .06}px)`; q.style.opacity = `${1 - clamp(progress / .6)}`; });
      if (media.currentTime !== lastTime) { dirty = true; lastTime = media.currentTime; }
      if (!dirty || media.readyState < 2 || !context || !overlay) return;
      context.drawImage(media, rect.x, rect.y, rect.width, rect.height);
      canvas.style.opacity = '1';
      overlay.clearRect(0, 0, foreground.width, foreground.height);
      if (mask.complete && mask.naturalWidth && width >= 900) {
        overlay.globalCompositeOperation = 'source-over'; overlay.drawImage(media, rect.x, rect.y, rect.width, rect.height);
        overlay.globalCompositeOperation = 'destination-in'; overlay.drawImage(mask, rect.x, rect.y, rect.width, rect.height);
        overlay.globalCompositeOperation = 'source-over';
      }
      dirty = false;
    };
    gsap.ticker.add(tick);
    return () => { disposed = true; ctx.revert(); trigger.kill(); gsap.ticker.remove(tick); observer.disconnect(); intersection.disconnect(); document.removeEventListener('visibilitychange', onVisibility); media.removeEventListener('loadeddata', onLoad); media.removeEventListener('error', onLoad); if (callback) media.cancelVideoFrameCallback(callback); media.pause(); media.removeAttribute('src'); media.load(); };
  }, [reduced, ready]);
  return <section ref={section} id="inicio" className={`${styles.hero} ${reduced ? styles.reduced : ''}`} aria-label="Filosofia, Grécia Antiga">
    <div className={styles.stage} data-stage>
      {/* The poster remains underneath both canvases, including during slow loads. */}
      <img className={styles.poster} src={asset(reduced ? '/img/hero-poster-day.webp' : '/img/hero-poster.webp')} alt="" fetchPriority="high" />
      <video ref={video} muted playsInline autoPlay loop preload="auto" poster={asset('/img/hero-poster.webp')} className={styles.source} aria-hidden="true" />
      <canvas ref={back} className={styles.background} aria-hidden="true" />
      <div className={styles.topScrim} />
      <p className={`eyebrow ${styles.label}`} data-label>ATENAS · SÉC. V a.C.</p>
      <div className={styles.titlePosition}><h1 className={`gold-text ${styles.title}`} data-title aria-label="Filosofia">{'FILOSOFIA'.split('').map((letter,i) => <span key={i} data-letter aria-hidden="true">{letter}</span>)}</h1></div>
      <figure className={`${styles.quote} ${styles.left}`} data-quote><div data-quote-inner><span className={styles.rule}/><blockquote>“Conhece-te a ti mesmo.”</blockquote><figcaption>INSCRIÇÃO NO TEMPLO DE DELFOS</figcaption></div></figure>
      <figure className={`${styles.quote} ${styles.right}`} data-quote><div data-quote-inner><span className={styles.rule}/><blockquote>“Uma vida sem questionamento não merece ser vivida.”</blockquote><figcaption>SÓCRATES</figcaption></div></figure>
      <canvas ref={front} className={styles.foreground} aria-hidden="true" />
      <div className={styles.bottomScrim} />
      <a href="#cabeca" onClick={e => { e.preventDefault(); scrollTo('#cabeca'); }} className={styles.scroll} data-scroll>ROLE PARA DESCOBRIR<span data-scroll-line /></a>
      <div className={styles.curtain} data-curtain />
    </div>
  </section>;
}
