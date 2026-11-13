import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daniel dos Santos, desenvolvedor web",
  description: "Portfólio de Daniel dos Santos, desenvolvedor web em Jaú, SP. Sites e sistemas com React, Node e Supabase, com movimento e 3D quando a história pede.",
};
export const viewport: Viewport = { themeColor: "#0F2C7A", width: "device-width", initialScale: 1 };

// Roda antes da pintura: define se há movimento (classe js) ou não (classe reduzir).
const ANTES = `try{var h=document.documentElement;h.classList.add(matchMedia('(prefers-reduced-motion: reduce)').matches?'reduzir':'js');if(matchMedia('(hover:hover) and (pointer:fine)').matches)h.classList.add('mouse')}catch(e){}`;

export default function Raiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: ANTES }} /></head>
      <body>
        <noscript><style>{`.pre{display:none!important}.rev{opacity:1!important}`}</style></noscript>
        {children}
      </body>
    </html>
  );
}
