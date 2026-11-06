'use client';
import { useCallback, useEffect, useState } from 'react';
import { startScroll, scrollTo } from '@/lib/scroll';
import { Hero } from './Hero';
import { StorySequence } from './StorySequence';
import { Philosophers } from './Philosophers';
import styles from './Experience.module.css';

export function Experience() {
  const [reduced,setReduced] = useState(false), [heroReady,setHeroReady] = useState(false), [crownReady,setCrownReady] = useState(false), [active,setActive] = useState(0);
  const onHeroReady = useCallback(()=>setHeroReady(true),[]);
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>setReduced(media.matches); change(); media.addEventListener('change',change);
    return ()=>media.removeEventListener('change',change);
  },[]);
  useEffect(()=>{if(!reduced && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)return startScroll();},[reduced]);
  useEffect(()=>{
    const sections=[...document.querySelectorAll<HTMLElement>('main>section')];
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive(sections.indexOf(entry.target as HTMLElement));},{rootMargin:'-45% 0px -45% 0px',threshold:0});
    sections.forEach(s=>observer.observe(s));
    const preload=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setCrownReady(true);preload.disconnect();}},{rootMargin:'100% 0px'});
    const philosophers=document.getElementById('filosofos');if(philosophers)preload.observe(philosophers);
    return()=>{observer.disconnect();preload.disconnect();};
  },[reduced]);
  const [headPreload,setHeadPreload]=useState(false);
  useEffect(()=>{
    if(!heroReady)return;
    if('requestIdleCallback' in window){const id=window.requestIdleCallback(()=>setHeadPreload(true),{timeout:2000});return()=>window.cancelIdleCallback(id);}
    const id=setTimeout(()=>setHeadPreload(true),400);return()=>clearTimeout(id);
  },[heroReady]);
  return <>
    <nav className={styles.chapters} aria-label="Capítulos">{['inicio','cabeca','filosofos','coroa'].map((id,i)=><a key={id} href={`#${id}`} aria-label={['I — Início','II — Uma vida examinada','III — Filósofos','IV — Epílogo'][i]} aria-current={active===i?'location':undefined} className={active===i?styles.active:''} onClick={e=>{e.preventDefault();scrollTo(`#${id}`);}}><span>{['I','II','III','IV'][i]}</span><i/></a>)}</nav>
    <main><Hero reduced={reduced} ready={onHeroReady}/><StorySequence part={2} reduced={reduced} preload={headPreload}/><Philosophers reduced={reduced}/><StorySequence part={4} reduced={reduced} preload={crownReady}/></main>
  </>;
}
