import type { Metadata } from 'next';
import { Cinzel, Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
const cinzel = Cinzel({ subsets: ['latin'], weight: ['500','600','700'], display: 'swap', variable: '--font-cinzel', preload: false });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500','600','700'], style: ['normal','italic'], display: 'swap', variable: '--font-cormorant', preload: false });
const manrope = Manrope({ subsets: ['latin'], weight: ['400','500','600','700'], display: 'swap', variable: '--font-manrope', preload: false });
const titlePreload = Cinzel({ subsets: ['latin'], weight: '700', display: 'swap', preload: true });
const quotePreload = Cormorant_Garamond({ subsets: ['latin'], weight: '600', display: 'swap', preload: true });
export const metadata: Metadata = { title: 'Filosofia — Uma vida examinada', description: 'Uma travessia pela Grécia Antiga, pela arte de perguntar e por uma vida guiada pela razão.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${cinzel.variable} ${cormorant.variable} ${manrope.variable}`}><span hidden className={`${titlePreload.className} ${quotePreload.className}`} /><a className="skip-link" href="#filosofos">Pular para os filósofos</a>{children}</body></html>;
}
