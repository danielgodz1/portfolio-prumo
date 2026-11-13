# portfolio-prumo

Portfólio imersivo "O Prumo": pêndulo 3D no hero e uma obra em linhas atravessada em profundidade pela rolagem.
Next 15, React Three Fiber, GSAP (ScrollTrigger, SplitText), Lenis. Conteúdo real em `lib/dados.ts`.

- `npm run dev` (porta 3100) ou `npm run build && npm start`.
- Foto: coloque `public/daniel.jpg` e rode com `NEXT_PUBLIC_FOTO=1` (vira ASCII). Sem ela, aparece um prumo em ASCII como espaço reservado.
- Dois cliques no topo (ou a tecla P) soltam o prumo.
- `prefers-reduced-motion`: sem preloader, sem Lenis, cena estática, contadores no valor final.
