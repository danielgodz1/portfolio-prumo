# Contexto para qualquer IA (portfolio-prumo)

Portfólio novo de Daniel dos Santos (dev web, Jaú/SP). Idioma: português, respostas enxutas.
- Stack: Next 15, React 19, React Three Fiber + drei + postprocessing, GSAP (ScrollTrigger, SplitText), Lenis. Sem Zustand: estado em `lib/store.ts`.
- Conceito "O Prumo": pêndulo 3D no hero; andares em linhas atravessados em profundidade Z pela rolagem; telas emuladas do FlowCheck/FlowRequest (`lib/telas.js`, dados fictícios); cena "Da planta ao quarto" (`lib/cena3d.js`, Three puro, canvas à parte).
- Arquivos: `app/page.tsx` (HTML semântico), `components/Experience.tsx` (toda a coreografia do DOM), `components/Scene.tsx` (canvas de fundo), `components/Cena3D.tsx`, `lib/dados.ts` (conteúdo real), `app/globals.css` e `app/emul.css`.
- Tokens: azul #0F2C7A, papel #ECEEF0, grafite #151817, giz #FFD23F; Bricolage Grotesque (wdth) + IBM Plex Mono só para cotas.
- Regras: só fatos reais (FlowCheck, FlowRequest, Império, 10 modelos); `prefers-reduced-motion` respeitado; evitar o "visual de IA" (creme+terracota, neon, caixa-alta com tracking, "→").
- Testar: `npx next build && npx next start -p 3100`; Playwright com `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
- Deploy: push na `main` publica na Vercel (https://portfolio-prumo-programacao1.vercel.app).
- Próximos passos e plano completo: `ANTIGRAVITY-PROMPT.md`. Repo irmão com os 10 modelos: github.com/danielgodz1/portfolio (leia o `CLAUDE.md` de lá).
