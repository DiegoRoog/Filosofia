'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Flip } from 'gsap/Flip';
import { gsap } from '@/lib/scroll';
import { philosophers } from '@/lib/content';
import { asset } from '@/lib/assetPath';
import styles from './Philosophers.module.css';
gsap.registerPlugin(Flip);

export function Philosophers({ reduced }: { reduced: boolean }) {
  const [selected, setSelected] = useState(0);
  const root = useRef<HTMLElement>(null), current = useRef(0), flipState = useRef<ReturnType<typeof Flip.getState> | null>(null), animation = useRef<gsap.core.Timeline | null>(null), touch = useRef<{x:number;y:number} | null>(null);
  const choose = (index: number, focus = false) => {
    const next = (index + 3) % 3;
    if (next === current.current) return;
    const cards = root.current!.querySelectorAll('[data-bust]');
    if (!reduced) { flipState.current = Flip.getState(cards); animation.current?.kill(); }
    current.current = next; setSelected(next);
    if (focus) root.current!.querySelector<HTMLButtonElement>(`#tab-${philosophers[next].slug}`)?.focus({ preventScroll:true });
  };
  useLayoutEffect(() => {
    if (!root.current) return;
    const panels = root.current.querySelectorAll<HTMLElement>('[data-panel]');
    gsap.killTweensOf(panels);
    panels.forEach((panel, i) => {
      gsap.to(panel, { opacity: i === selected ? 1 : 0, y: i === selected ? 0 : -16, duration: reduced ? .2 : .35, overwrite:true });
      if (i === selected && !reduced) {
        gsap.killTweensOf(panel.querySelectorAll('[data-name-letter]'));
        gsap.fromTo(panel.querySelectorAll('[data-name-letter]'), { yPercent:100 }, { yPercent:0, duration:.7, stagger:.025, delay:.15, ease:'expo.out', overwrite:true });
      }
    });
    if (flipState.current && !reduced) {
      animation.current = Flip.from(flipState.current,{ duration:.65, scale:true, ease:'power3.out', absolute:false, prune:true });
      flipState.current = null;
    }
  },[selected,reduced]);
  useEffect(() => {
    const el = root.current!;
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from('[data-text-area]',{ y:16,opacity:0,duration:.9,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 65%',once:true} });
      gsap.from('[data-selector]',{ y:40,opacity:0,duration:.9,delay:.3,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 65%',once:true} });
    },el);
    return () => { context.revert(); animation.current?.kill(); gsap.killTweensOf(el.querySelectorAll('[data-panel], [data-name-letter]')); };
  },[reduced]);
  return <section ref={root} id="filosofos" className={styles.section} aria-label="Três mestres da filosofia">
    <picture><source media="(max-width:899px)" srcSet={asset('/img/salao-mobile.webp')}/><img className={styles.background} src={asset('/img/salao.webp')} alt="" loading="lazy"/></picture>
    <div className={styles.shade}/>
    <div className={styles.texts} data-text-area>
      {philosophers.map((p,i)=><div key={p.slug} id={`panel-${p.slug}`} role="tabpanel" aria-labelledby={`tab-${p.slug}`} aria-hidden={i!==selected} className={styles.panel} data-panel style={{opacity:i===selected?1:0}}>
        <p className="eyebrow">{p.label}</p>
        <h2 className={`gold-text ${styles.name}`} aria-label={p.name}>{p.name.toUpperCase().split('').map((letter,j)=><span key={j} aria-hidden="true" data-name-letter>{letter}</span>)}</h2>
        <p className={styles.dates}>{p.dates}</p><p className={styles.description}>{p.text}</p>
        <ul className={styles.tags}>{p.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>
      </div>)}
      <p className="sr-only" aria-live="polite" aria-atomic="true">{philosophers[selected].name}. {philosophers[selected].text}</p>
    </div>
    <div className={styles.selector} data-selector onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}} onTouchEnd={e=>{if(!touch.current)return;const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy))choose(current.current+(dx<0?1:-1));touch.current=null;}}>
      <div className={styles.tabs} role="tablist" aria-label="Escolha um filósofo" onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();choose(current.current+(e.key==='ArrowRight'?1:-1),true);}if(e.key==='Home'||e.key==='End'){e.preventDefault();choose(e.key==='Home'?0:2,true);}}}>
        {philosophers.map((p,i)=><div className={styles.slot} key={p.slug}><button id={`tab-${p.slug}`} className={`${styles.bust} ${i===selected?styles.active:''}`} role="tab" aria-selected={i===selected} aria-controls={`panel-${p.slug}`} tabIndex={i===selected?0:-1} onClick={()=>choose(i)} data-bust>
          <span className={styles.glass}/><img src={asset(`/img/${p.slug}.webp`)} width="1000" height="1000" alt="" loading="lazy"/><span className={styles.bustName}>{p.name}</span>
        </button></div>)}
      </div>
      <div className={styles.controls}><button onClick={()=>choose(current.current-1)} aria-label="Filósofo anterior">‹</button><div className={styles.progress} aria-hidden="true"><span style={{transform:`translateX(${selected*100}%)`}}/></div><button onClick={()=>choose(current.current+1)} aria-label="Próximo filósofo">›</button></div>
    </div>
  </section>;
}
