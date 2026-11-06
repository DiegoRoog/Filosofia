'use client';
import { useEffect, useRef, type CSSProperties } from 'react';
import { FrameSequence } from '@/lib/frameSequence';
import { clamp, coverRect, envelope, sequenceIndex } from '@/lib/geometry';
import { gsap, ScrollTrigger, scrollTo } from '@/lib/scroll';
import { headBlocks, crownBlocks } from '@/lib/content';
import { asset } from '@/lib/assetPath';
import styles from './StorySequence.module.css';

type Connection = { saveData?: boolean };
export function StorySequence({ part, reduced, preload }: { part: 2 | 4; reduced: boolean; preload: boolean }) {
  const section = useRef<HTMLElement>(null), canvas = useRef<HTMLCanvasElement>(null), loader = useRef<FrameSequence | null>(null);
  const crown = part === 4, blocks = crown ? crownBlocks : headBlocks;
  const count = crown ? 482 : 242;
  const staticIndex = crown ? count : Math.round(count * .7);
  useEffect(() => { if (preload && !reduced) void loader.current?.preload(); }, [preload, reduced]);
  useEffect(() => {
    const root = section.current!, surface = canvas.current!;
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = surface.getContext('2d'); if (!ctx || !('createImageBitmap' in window)) return;
    const mobile = window.innerWidth < 900 || !!(navigator as Navigator & { connection?: Connection }).connection?.saveData;
    const sequence = new FrameSequence(`/frames/parte${part}${mobile ? '/mobile' : ''}`, mobile ? count / 2 : count, mobile ? 16 : 32);
    loader.current = sequence;
    const stage = root.querySelector<HTMLElement>('[data-stage]')!;
    const cards = [...root.querySelectorAll<HTMLElement>('[data-story]')];
    const children = cards.map(c => [...c.querySelectorAll<HTMLElement>('[data-reveal]')]);
    let measures: { center: number; height: number }[] = [], start = 0, viewport = 1, visible = false, current = 0, target = 0, previous = -1, revision = -1;
    let rect = coverRect(1920,1080), dirty = true, lastSeek = -1;
    const opacity = cards.map(() => [0,0,0,0]);
    const measure = () => {
      viewport = stage.clientHeight;
      start = root.getBoundingClientRect().top + window.scrollY;
      const width = stage.clientWidth, ratio = Math.min(window.devicePixelRatio || 1, 1.5, 1920 / width);
      surface.width = Math.round(width * ratio); surface.height = Math.round(viewport * ratio);
      const fit = !crown && width < 900 && viewport > width;
      rect = coverRect(surface.width, surface.height, 1920, 1080, fit);
      if (fit) rect.y -= surface.height * .14;
      const cssRect = coverRect(width, viewport);
      const safeLeft = Math.max(24, cssRect.x + cssRect.width * .06);
      const safeWidth = Math.min(crown ? 400 : 440, width * .26, cssRect.x + cssRect.width * .32 - safeLeft);
      root.style.setProperty('--story-left', `${safeLeft}px`); root.style.setProperty('--story-width', `${Math.max(150,safeWidth)}px`);
      cards.forEach(c => { c.style.transform = ''; });
      measures = cards.map(c => ({ center: c.offsetTop + c.offsetHeight / 2, height: c.offsetHeight }));
      dirty = true;
    };
    const resize = new ResizeObserver(measure); resize.observe(stage); measure();
    document.fonts.ready.then(() => { if (loader.current === sequence) measure(); });
    const trigger = ScrollTrigger.create({ trigger: root, start: 'top top', end: () => `+=${root.querySelector<HTMLElement>('[data-narrative]')!.offsetHeight - viewport}`, onUpdate: self => { target = self.progress; }, onRefresh: measure });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { void sequence.preload(); sequence.seek(sequenceIndex(target, sequence.count, crown)); lastSeek = -1; dirty = true; }
      else sequence.release();
    }, { rootMargin: '15% 0px' }); observer.observe(root);
    if (preload) void sequence.preload();
    const tick = () => {
      if (!visible || document.hidden) return;
      current += (target - current) * (crown ? .1 : .12);
      const index = Math.round(sequenceIndex(current, sequence.count, crown));
      if (index !== lastSeek) { sequence.seek(index, index >= lastSeek ? 1 : -1); lastSeek = index; }
      if (dirty || index !== previous || revision !== sequence.revision) {
        const frame = sequence.nearest(index);
        if (frame && (dirty || frame.index !== previous)) { ctx.clearRect(0,0,surface.width,surface.height); ctx.drawImage(frame.bitmap,rect.x,rect.y,rect.width,rect.height); previous = frame.index; surface.style.opacity = '1'; }
        revision = sequence.revision; dirty = false;
      }
      const scroll = window.scrollY - start;
      cards.forEach((card,i) => {
        const factor = crown ? (i % 2 ? .14 : .08) : (i % 2 ? .18 : .1);
        const rawDistance = measures[i].center - scroll - viewport * .5;
        // Hold the final signature in view while the scene breathes for its last 20svh.
        const distance = crown && i === 5 ? Math.max(rawDistance, -viewport * .08) : rawDistance;
        const parallax = distance * factor + distance - rawDistance;
        card.style.transform = `translateY(${parallax}px)`;
        const c = (rawDistance + parallax) / viewport;
        children[i].forEach((child,j) => {
          let value = envelope(c + j * .06);
          if (crown && i === 5 && j === 3 && target < .85) value = 0;
          opacity[i][j] += (value - opacity[i][j]) * (crown ? .08 : .1);
          const v = opacity[i][j]; child.style.opacity = `${v}`; child.style.transform = `translateY(${(1-v)*24}px)`;
          child.style.filter = v > .99 ? 'none' : `blur(${(1-v)*6}px)`;
        });
      });
      if (!crown) {
        const t = clamp((current - .3)/.25);
        root.style.setProperty('--accent', `rgb(${Math.round(212-149*t)} ${Math.round(166+18*t)} ${Math.round(74+85*t)})`);
      } else root.style.setProperty('--glow', `${clamp((current-.55)/.25)*.4}`);
      root.dataset.frame = String(index+1); root.dataset.decoded = String(sequence.decodedCount); root.dataset.peakDecoded = String(sequence.peakDecoded); root.dataset.closed = String(sequence.closed); root.dataset.downloaded = String(sequence.downloadedCount);
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); trigger.kill(); observer.disconnect(); resize.disconnect(); sequence.destroy(); loader.current = null; };
  }, [part, crown, count, reduced]); // Preloading changes never reset the decoded sequence.

  return <section ref={section} id={crown ? 'coroa' : 'cabeca'} className={`${styles.section} ${crown ? styles.crown : styles.head} ${reduced ? styles.reduced : ''}`} aria-label={crown ? 'Epílogo: a coroa' : 'Uma vida examinada'}>
    <div className={styles.stage} data-stage>
      <img className={styles.poster} src={asset(`/frames/parte${part}/f_${String(reduced ? staticIndex : 1).padStart(4,'0')}.webp`)} alt="" loading="lazy" />
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
      <div className={styles.scrim} />
    </div>
    <p className="sr-only">{crown ? 'Uma coroa de louros dourada desce em direção a um pedestal de pedra numa caverna iluminada' : 'Uma cabeça de bronze dourado se abre e revela um crânio de bronze esverdeado'}</p>
    <div className={styles.narrative} data-narrative>
      {blocks.map((block,i) => {
        const [before, after] = block.title.split(block.highlight);
        return <article key={block.label} className={`${styles.block} ${i%2 ? styles.right : styles.left}`} style={{gridRowStart:block.top+1} as CSSProperties} data-story>
          <div data-reveal className={styles.label}><span/>{block.label}</div>
          <h2 data-reveal>{before}<em>{block.highlight}</em>{after}</h2>
          <p data-reveal>{block.text}{!crown && i===5 ? <a className={styles.next} href="#filosofos" aria-label="Conhecer os filósofos" onClick={e=>{e.preventDefault();scrollTo('#filosofos');}}>↓</a> : null}</p>
          {crown && i===5 ? <div data-reveal className={styles.ending}><a href="#inicio" onClick={e=>{e.preventDefault();scrollTo(0,2.4);}} className={styles.back}>VOLTAR AO INÍCIO ↑</a><p className={styles.signature}>Roog</p></div> : null}
        </article>;
      })}
    </div>
  </section>;
}
