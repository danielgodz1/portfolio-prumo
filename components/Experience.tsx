"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { S } from "../lib/store";

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Toda a coreografia do DOM: rolagem suave, preloader, revelações, cursor magnético, marquee, contadores. */
export default function Experience() {
  useEffect(() => {
    const html = document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    S.reduced = reduced;
    const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

    // ponteiro: posição e velocidade para o prumo
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / innerWidth) * 2 - 1, ny = -((e.clientY / innerHeight) * 2 - 1);
      S.pvx += nx - S.px; S.pvy += ny - S.py; S.px = nx; S.py = ny;
    };
    addEventListener("pointermove", onMove, { passive: true });
    // easter egg: dois cliques no topo (ou a tecla P) soltam o prumo
    const soltar = () => { S.swing += 1; };
    const dbl = (e: MouseEvent) => { if (scrollY < innerHeight * 0.9 && !(e.target as HTMLElement).closest("a,button")) soltar(); };
    const tecla = (e: KeyboardEvent) => { if (e.key.toLowerCase() === "p" && !e.ctrlKey && !e.metaKey && !e.altKey) soltar(); };
    addEventListener("dblclick", dbl); addEventListener("keydown", tecla);

    // contadores (valor final sempre presente no DOM para reduce/noscript)
    const contadores = $("[data-conta]");
    if (reduced) { contadores.forEach((c) => (c.textContent = c.dataset.conta!)); $(".emul").forEach((em) => { const n = Number(em.dataset.passos); $(".tela", em).forEach((t) => t.classList.toggle("on", Number(t.dataset.t) === n - 1)); $(".emul__passos li", em).forEach((l) => l.classList.add("on")); }); html.classList.add("pronto"); return cleanup0(); }

    function cleanup0() { return () => { removeEventListener("pointermove", onMove); removeEventListener("dblclick", dbl); removeEventListener("keydown", tecla); }; }

    // ---- rolagem suave: um Lenis só, movido pelo ticker do GSAP ----
    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on("scroll", (l: any) => { S.vel = l.velocity; S.progress = clamp(l.progress, 0, 1); ScrollTrigger.update(); });
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    lenis.stop(); // parado até o preloader terminar

    // links de âncora usam o Lenis
    const ancora = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]'); if (!a) return;
      const alvo = document.querySelector(a.getAttribute("href")!); if (!alvo) return;
      e.preventDefault(); lenis.scrollTo(alvo as HTMLElement, { duration: 1.6 });
    };
    addEventListener("click", ancora);

    const limpar: (() => void)[] = [];
    const ctx = gsap.context(() => {
      // ---- skew sutil por velocidade (só no conteúdo, nunca no cabeçalho nem no canvas) ----
      const skew = gsap.quickTo(".skew", "skewY", { duration: 0.5, ease: "power3" });
      const skewTick = () => { skew(clamp(S.vel * -0.05, -2.2, 2.2)); };
      gsap.ticker.add(skewTick); limpar.push(() => gsap.ticker.remove(skewTick));

      // ---- cenas: entrar, segurar e sair (nada surge do nada) ----
      $("[data-cena]").forEach((cena) => {
        const palco = cena.querySelector(".palco")!; const hero = cena.dataset.cena === "hero";
        const tl = gsap.timeline({ scrollTrigger: hero ? { trigger: cena, start: "top top", end: "bottom top", scrub: 0.6 } : { trigger: cena, start: "top bottom", end: "bottom top", scrub: 0.6 }, defaults: { ease: "none" } });
        if (hero) {
          tl.to(palco, { opacity: 1, duration: 0.4 }).to(palco, { opacity: 0, yPercent: -8, filter: "blur(10px)", duration: 0.25 }).to({}, { duration: 0.35 });
        } else {
          tl.fromTo(palco, { opacity: 0, yPercent: 8, filter: "blur(10px)" }, { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.25 }, 0.05)
            .to(palco, { opacity: 1, duration: 0.4 }, 0.3)
            .to(palco, { opacity: 0, yPercent: -8, filter: "blur(10px)", duration: 0.25 }, 0.7)
            .to({}, { duration: 0.05 }, 0.95);
        }
      });

      // ---- emulações dos sistemas: a rolagem troca a tela (palco sticky, sem pin) ----
      $(".emul").forEach((em) => {
        em.classList.add("com-js");
        const n = Number(em.dataset.passos), telas = $(".tela", em), lis = $(".emul__passos li", em), navs = $(".s-nav__i", em);
        em.style.height = `${n * 70 + 100}vh`;
        let atual = -1;
        const ir = (i: number) => {
          if (i === atual) return; atual = i; em.dataset.passo = String(i);
          telas.forEach((t) => t.classList.toggle("on", Number(t.dataset.t) === i));
          lis.forEach((l) => l.classList.toggle("on", Number(l.dataset.i) === i));
          navs.forEach((x) => x.classList.toggle("ativo", x.dataset.ativo === String(i)));
        };
        ir(0);
        ScrollTrigger.create({ trigger: em, start: "top top", end: "bottom bottom", onUpdate: (st) => ir(Math.min(n - 1, Math.floor(st.progress * n))) });
      });

      // ---- contadores ----
      contadores.forEach((c) => {
        const alvo = Number(c.dataset.conta); const o = { v: 0 };
        ScrollTrigger.create({ trigger: c, start: "top 85%", once: true, onEnter: () => gsap.to(o, { v: alvo, duration: 1.6, ease: "expo.out", onUpdate: () => (c.textContent = String(Math.round(o.v))) }) });
      });

      // ---- sobre: texto por palavra ----
      $("[data-palavras]").forEach((p) => {
        const sp = SplitText.create(p, { type: "words" });
        gsap.fromTo(sp.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 45%", scrub: true } });
      });

      // ---- modelos: cartão que segue o cursor ----
      const card = $("[data-prev-card]")[0];
      if (fine && card) {
        const cx = gsap.quickTo(card, "x", { duration: 0.45, ease: "power3" }), cy = gsap.quickTo(card, "y", { duration: 0.45, ease: "power3" });
        addEventListener("pointermove", (e) => { cx(e.clientX + 24); cy(e.clientY + 24); });
        $("[data-prev]").forEach((a) => {
          a.addEventListener("pointerenter", () => { card.textContent = a.dataset.prev ?? ""; gsap.to(card, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }); });
          a.addEventListener("pointerleave", () => gsap.to(card, { opacity: 0, scale: 0.7, duration: 0.25 }));
        });
      }

      // ---- botão magnético ----
      $("[data-mag]").forEach((m) => {
        const qx = gsap.quickTo(m, "x", { duration: 0.6, ease: "elastic.out(1,0.4)" }), qy = gsap.quickTo(m, "y", { duration: 0.6, ease: "elastic.out(1,0.4)" });
        m.addEventListener("pointermove", (e) => { const r = m.getBoundingClientRect(); qx((e.clientX - (r.left + r.width / 2)) * 0.25); qy((e.clientY - (r.top + r.height / 2)) * 0.35); });
        m.addEventListener("pointerleave", () => { qx(0); qy(0); });
      });

      // ---- troca de letras no hover ----
      const LET = "abcdefghijklmnopqrstuvwxyz";
      $("[data-swap]").forEach((el) => {
        const original = el.textContent ?? ""; if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", original);
        el.addEventListener("pointerenter", () => {
          const o = { p: 0 };
          gsap.to(o, { p: 1, duration: 0.5, ease: "none", onUpdate: () => {
            const n = Math.floor(o.p * original.length);
            el.textContent = original.split("").map((ch, i) => (i < n || ch === " " ? ch : LET[Math.floor(Math.random() * 26)])).join("");
          }, onComplete: () => (el.textContent = original) });
        });
      });

      // ---- marquee que acelera com a rolagem ----
      $("[data-faixa]").forEach((f) => {
        const linha = f.querySelector(".faixa__linha")!;
        const tw = gsap.to(linha, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
        const faixaTick = () => { tw.timeScale(1 + Math.min(Math.abs(S.vel) * 0.35, 6)); };
        gsap.ticker.add(faixaTick); limpar.push(() => gsap.ticker.remove(faixaTick));
      });

      // ---- abertura: contador 0 a 100, cortina e entrada do herói ----
      const num = $("[data-pre-num]")[0]; const nome = $("[data-hero-nome]")[0];
      const abrir = () => {
        const sp = SplitText.create(nome.querySelectorAll(".split"), { type: "chars" });
        nome.classList.add("dividido");
        const tl = gsap.timeline({ onComplete: () => { html.classList.add("pronto"); S.ready = true; lenis.start(); ScrollTrigger.refresh(); } });
        const o = { v: 0 };
        tl.to(o, { v: 100, duration: 1.8, ease: "power2.inOut", onUpdate: () => (num.textContent = String(Math.round(o.v)).padStart(3, "0")) })
          .to(".pre", { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, ">0.15")
          .from(sp.chars, { yPercent: 115, rotate: 6, duration: 1.1, ease: "expo.out", stagger: 0.035 }, "-=0.55")
          .to(".entra", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 }, "-=0.6");
        gsap.set(".entra", { y: 20 });
      };
      document.fonts.ready.then(abrir);
    });

    return () => {
      limpar.forEach((f) => f()); ctx.revert(); lenis.destroy(); gsap.ticker.remove(tick); removeEventListener("click", ancora);
      cleanup0()();
    };
  }, []);
  return null;
}
