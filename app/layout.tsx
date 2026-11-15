import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
import "./emul.css";
import { SITE_URL } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Daniel dos Santos · Desenvolvedor Web em Jaú/SP | O Prumo",
  description:
    "Portfólio de Daniel dos Santos, desenvolvedor web em Jaú, SP. Sistemas em produção (FlowCheck e FlowRequest), configurador 3D da Império Móveis Planejados e modelos interativos em React, Next.js, Three.js e GSAP.",
  keywords: [
    "Daniel dos Santos",
    "Desenvolvedor Web Jaú SP",
    "Next.js",
    "React Three Fiber",
    "Three.js",
    "GSAP",
    "FlowCheck",
    "FlowRequest",
    "Império Móveis Planejados",
  ],
  authors: [{ name: "Daniel dos Santos", url: SITE_URL }],
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/`,
    siteName: "O Prumo · Daniel dos Santos",
    title: "Daniel dos Santos · Desenvolvedor Web & 3D em Jaú/SP",
    description:
      "Sites e sistemas com React, Node e Supabase, com movimento e 3D no navegador quando a história pede.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel dos Santos · Desenvolvedor Web em Jaú/SP",
    description:
      "FlowCheck, FlowRequest, Império Móveis Planejados 3D e 13 modelos interativos para empresas.",
  },
};

export const viewport: Viewport = { themeColor: "#0F2C7A", width: "device-width", initialScale: 1 };

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Daniel dos Santos",
      jobTitle: "Desenvolvedor Full-Stack & Especialista em Infraestrutura de TI",
      url: `${SITE_URL}/`,
      email: "mailto:daniel_santos172@hotmail.com",
      telephone: "+55 14 99734-5164",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaú",
        addressRegion: "SP",
        addressCountry: "BR",
      },
      sameAs: [
        "https://github.com/danielgodz1",
        "https://www.linkedin.com/in/danieldossantos-ti",
      ],
      knowsAbout: [
        "React 19",
        "Next.js",
        "TypeScript",
        "Three.js",
        "React Three Fiber",
        "GSAP",
        "Node.js",
        "Supabase",
        "Windows Server",
        "Hyper-V",
        "MikroTik",
        "Wazuh SIEM",
        "Zabbix",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "O Prumo // The Kernel Tower · Daniel dos Santos",
      url: `${SITE_URL}/`,
      inLanguage: "pt-BR",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "ItemList",
      name: "Sistemas e Projetos em Produção de Daniel dos Santos",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "SoftwareApplication",
            name: "FlowCheck",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Sistema web corporativo de checklists e inspeções de segurança do trabalho com IA 5W2H para frotas e obras.",
            author: { "@id": `${SITE_URL}/#person` },
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "SoftwareApplication",
            name: "FlowRequest",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Sistema web de requisições de alimentação, almoxarifado, material, peças e hospedagem do campo à conclusão em 48h.",
            author: { "@id": `${SITE_URL}/#person` },
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@type": "CreativeWork",
            name: "Império Móveis Planejados",
            url: "https://www.imperiomoveisplanejadosjau.com.br/",
            description:
              "Site institucional pré-renderizado e configurador 3D sob medida para a marcenaria Império Móveis Planejados de Jaú, SP.",
            creator: { "@id": `${SITE_URL}/#person` },
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@type": "CreativeWork",
            name: "Catálogo de 13 Modelos Comerciais Interativos",
            url: "https://portfolio-programacao1.vercel.app/modelos/",
            description:
              "13 demonstrações interativas por segmento (academia, roupas, perfumes, beleza, restaurante, hamburgueria, pizzaria, arquitetura, marcenaria, engenharia, metalúrgica, empresa e calçados).",
            creator: { "@id": `${SITE_URL}/#person` },
          },
        },
      ],
    },
  ],
};

// Regra Windows: WebGL e animações permanecem ativos por padrão; modo reduzido só ativa por clique explícito salvo no HUD.
const ANTES = `try{var h=document.documentElement;var q=new URLSearchParams(location.search).get('para');var s=localStorage.getItem('prumo-para');var p=(q==='dev'||q==='empresa')?q:(s==='dev'||s==='empresa'?s:'empresa');h.dataset.para=p;var pref=localStorage.getItem('prumo-motion');var red=pref==='reduzido';h.classList.add(red?'reduzir':'js');if(!red)h.classList.add('movimento-forcado');if(matchMedia('(hover:hover) and (pointer:fine)').matches)h.classList.add('mouse')}catch(e){}`;

export default function Raiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANTES }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body>
        <noscript><style>{`.pre{display:none!important}.entra{opacity:1!important}`}</style></noscript>
        {children}
      </body>
    </html>
  );
}
