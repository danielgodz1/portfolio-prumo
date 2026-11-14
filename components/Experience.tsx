"use client";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { S } from "../lib/store";
import { tocarIgnicao, tocarKonami, tocarPulso } from "../lib/som";

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

/** Toda a coreografia do DOM: calibração inicial, rolagem Lenis, cenas, emulações, Konami e prumo. */
export default function Experience() {
  const [motionRev, setMotionRev] = useState(0);

  useEffect(() => {
    const onMotion = () => setMotionRev((v) => v + 1);
    window.addEventListener("prumo:motion", onMotion);
    return () => window.removeEventListener("prumo:motion", onMotion);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    let pref: string | null = null;
    try {
      pref = localStorage.getItem("prumo-motion");
    } catch {
      pref = null;
    }
    const reduced = pref ? pref === "reduzido" : matchMedia("(prefers-reduced-motion: reduce)").matches;
    S.reduced = reduced;
    html.classList.toggle("reduzir", reduced);
    html.classList.toggle("js", !reduced);
    html.classList.toggle("movimento-forcado", !reduced && pref === "ativo");
    const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

    // ponteiro: posição e velocidade para o prumo e constelação
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = -((e.clientY / innerHeight) * 2 - 1);
      S.pvx += nx - S.px;
      S.pvy += ny - S.py;
      S.px = nx;
      S.py = ny;
    };
    addEventListener("pointermove", onMove, { passive: true });

    // easter egg: dois cliques no topo soltam o prumo em queda livre; tecla P dá impulso; Konami calibra 100%
    const soltar = () => {
      if (scrollY < innerHeight * 0.95) {
        S.dropPending = true;
      } else {
        S.swing += 1;
      }
      tocarPulso(360);
    };
    const dbl = (e: MouseEvent) => {
      if (scrollY < innerHeight * 0.9 && !(e.target as HTMLElement).closest("a,button")) soltar();
    };
    let kIdx = 0;
    const tecla = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "p" && !e.ctrlKey && !e.metaKey && !e.altKey) soltar();
      if (k === KONAMI[kIdx]) {
        kIdx += 1;
        if (kIdx === KONAMI.length) {
          kIdx = 0;
          S.konami = true;
          S.swing += 2.2;
          tocarKonami();
        }
      } else {
        kIdx = k === KONAMI[0] ? 1 : 0;
      }
    };
    addEventListener("dblclick", dbl);
    addEventListener("keydown", tecla);

    const contadores = $("[data-conta]");
    if (reduced) {
      contadores.forEach((c) => (c.textContent = c.dataset.conta!));
      $(".emul").forEach((em) => {
        const n = Number(em.dataset.passos);
        $(".tela", em).forEach((t) => t.classList.toggle("on", Number(t.dataset.t) === n - 1));
        $(".emul__passos li", em).forEach((l) => l.classList.add("on"));
      });
      const onRedScroll = () => {
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        S.progress = clamp(scrollY / max, 0, 1);
      };
      onRedScroll();
      addEventListener("scroll", onRedScroll, { passive: true });
      html.classList.add("pronto");
      S.ready = true;
      return () => {
        removeEventListener("pointermove", onMove);
        removeEventListener("dblclick", dbl);
        removeEventListener("keydown", tecla);
        removeEventListener("scroll", onRedScroll);
      };
    }

    // ---- rolagem suave: um Lenis só, movido pelo ticker do GSAP ----
    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on("scroll", (l: { velocity: number; progress: number }) => {
      S.vel = l.velocity;
      S.progress = clamp(l.progress, 0, 1);
      ScrollTrigger.update();
    });
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.stop();

    const onVis = () => {
      if (document.hidden) {
        lenis.stop();
        gsap.globalTimeline.pause();
      } else {
        gsap.globalTimeline.resume();
        if (S.ready) lenis.start();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const ancora = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const alvo = document.querySelector(a.getAttribute("href")!);
      if (!alvo) return;
      e.preventDefault();
      lenis.scrollTo(alvo as HTMLElement, { duration: 1.5 });
    };
    addEventListener("click", ancora);

    const limpar: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const skew = gsap.quickTo(".skew", "skewY", { duration: 0.5, ease: "power3" });
      const skewTick = () => {
        skew(clamp(S.vel * -0.05, -2.0, 2.0));
      };
      gsap.ticker.add(skewTick);
      limpar.push(() => gsap.ticker.remove(skewTick));

      $("[data-cena]").forEach((cena) => {
        const palco = cena.querySelector(".palco")!;
        const hero = cena.dataset.cena === "hero";
        const tl = gsap.timeline({
          scrollTrigger: hero
            ? { trigger: cena, start: "top top", end: "bottom top", scrub: 0.6 }
            : { trigger: cena, start: "top bottom", end: "bottom top", scrub: 0.6 },
          defaults: { ease: "none" },
        });
        if (hero) {
          tl.to(palco, { opacity: 1, duration: 0.45 }).to(palco, { opacity: 0, yPercent: -8, filter: "blur(8px)", duration: 0.25 }).to({}, { duration: 0.3 });
        } else {
          tl.fromTo(palco, { opacity: 0, yPercent: 8, filter: "blur(8px)" }, { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.25 }, 0.05)
            .to(palco, { opacity: 1, duration: 0.4 }, 0.3)
            .to(palco, { opacity: 0, yPercent: -8, filter: "blur(8px)", duration: 0.25 }, 0.7)
            .to({}, { duration: 0.05 }, 0.95);
        }
      });

      $(".emul").forEach((em) => {
        em.classList.add("com-js");
        const n = Number(em.dataset.passos),
          telas = $(".tela", em),
          lis = $(".emul__passos li", em),
          navs = $(".s-nav__i", em);
        em.style.height = `${n * 70 + 100}vh`;
        let atual = -1;
        const ir = (i: number) => {
          if (i === atual) return;
          atual = i;
          em.dataset.passo = String(i);
          telas.forEach((t) => t.classList.toggle("on", Number(t.dataset.t) === i));
          lis.forEach((l) => l.classList.toggle("on", Number(l.dataset.i) === i));
          navs.forEach((x) => x.classList.toggle("ativo", x.dataset.ativo === String(i)));
        };
        ir(0);
        ScrollTrigger.create({
          trigger: em,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (st) => ir(Math.min(n - 1, Math.floor(st.progress * n))),
        });
      });

      contadores.forEach((c) => {
        const alvo = Number(c.dataset.conta);
        const o = { v: 0 };
        ScrollTrigger.create({
          trigger: c,
          start: "top 85%",
          once: true,
          onEnter: () =>
            gsap.to(o, {
              v: alvo,
              duration: 1.5,
              ease: "expo.out",
              onUpdate: () => (c.textContent = String(Math.round(o.v))),
            }),
        });
      });

      $("[data-palavras]").forEach((p) => {
        const sp = SplitText.create(p, { type: "words" });
        gsap.fromTo(
          sp.words,
          { opacity: 0.14 },
          { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 45%", scrub: true } },
        );
      });

      const card = $("[data-prev-card]")[0];
      if (fine && card) {
        const cx = gsap.quickTo(card, "x", { duration: 0.45, ease: "power3" }),
          cy = gsap.quickTo(card, "y", { duration: 0.45, ease: "power3" });
        addEventListener("pointermove", (e) => {
          cx(e.clientX + 24);
          cy(e.clientY + 24);
        });
        $("[data-prev]").forEach((a) => {
          a.addEventListener("pointerenter", () => {
            card.textContent = a.dataset.prev ?? "";
            gsap.to(card, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" });
          });
          a.addEventListener("pointerleave", () => gsap.to(card, { opacity: 0, scale: 0.7, duration: 0.25 }));
        });
      }

      $("[data-mag]").forEach((m) => {
        const qx = gsap.quickTo(m, "x", { duration: 0.6, ease: "elastic.out(1,0.4)" }),
          qy = gsap.quickTo(m, "y", { duration: 0.6, ease: "elastic.out(1,0.4)" });
        m.addEventListener("pointermove", (e) => {
          const r = m.getBoundingClientRect();
          qx((e.clientX - (r.left + r.width / 2)) * 0.25);
          qy((e.clientY - (r.top + r.height / 2)) * 0.35);
        });
        m.addEventListener("pointerleave", () => {
          qx(0);
          qy(0);
        });
      });

      const LET = "abcdefghijklmnopqrstuvwxyz";
      $("[data-swap]").forEach((el) => {
        const original = el.textContent ?? "";
        if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", original);
        el.addEventListener("pointerenter", () => {
          const o = { p: 0 };
          gsap.to(o, {
            p: 1,
            duration: 0.5,
            ease: "none",
            onUpdate: () => {
              const n = Math.floor(o.p * original.length);
              el.textContent = original
                .split("")
                .map((ch, i) => (i < n || ch === " " ? ch : LET[Math.floor(Math.random() * 26)]))
                .join("");
            },
            onComplete: () => (el.textContent = original),
          });
        });
      });

      $("[data-faixa]").forEach((f) => {
        const linha = f.querySelector(".faixa__linha")!;
        const tw = gsap.to(linha, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
        const faixaTick = () => {
          tw.timeScale(1 + Math.min(Math.abs(S.vel) * 0.35, 6));
        };
        gsap.ticker.add(faixaTick);
        limpar.push(() => gsap.ticker.remove(faixaTick));
      });

      // ---- Ato 0: checklist técnica + contagem 3-2-1 -> ignição -> herói ----
      const num = $("[data-pre-num]")[0];
      const nome = $("[data-hero-nome]")[0];
      const checks = $("[data-pre-check]");
      const pularBt = $("[data-pre-pular]")[0];
      let tlAbertura: gsap.core.Timeline | null = null;
      let encerrado = false;

      const concluirAbertura = () => {
        if (encerrado) return;
        encerrado = true;
        html.classList.add("pronto");
        S.ready = true;
        S.ignition = 1;
        tocarIgnicao();
        lenis.start();
        ScrollTrigger.refresh();
      };

      const pular = () => {
        if (encerrado) return;
        if (tlAbertura) tlAbertura.progress(1);
        concluirAbertura();
      };
      pularBt?.addEventListener("click", pular);
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !encerrado) pular();
      };
      addEventListener("keydown", onEsc);
      limpar.push(() => removeEventListener("keydown", onEsc));

      const abrir = () => {
        if (S.ready) {
          html.classList.add("pronto");
          gsap.set(".entra", { opacity: 1, y: 0 });
          lenis.start();
          ScrollTrigger.refresh();
          return;
        }
        const sp = SplitText.create(nome.querySelectorAll(".split"), { type: "chars" });
        nome.classList.add("dividido");
        gsap.set(".entra", { y: 20 });
        tlAbertura = gsap.timeline({ onComplete: concluirAbertura });

        checks.forEach((el, i) => {
          tlAbertura!.to(el, { opacity: 1, x: 0, duration: 0.16, ease: "power2.out" }, i * 0.14);
        });
        tlAbertura
          .call(() => { if (num) num.textContent = "03"; }, undefined, 0.25)
          .call(() => { if (num) num.textContent = "02"; }, undefined, 0.58)
          .call(() => { if (num) num.textContent = "01"; }, undefined, 0.91)
          .call(() => { if (num) num.textContent = "PRUMO"; S.ignition = 1; }, undefined, 1.2)
          .to(".pre", { clipPath: "inset(0 0 100% 0)", duration: 0.85, ease: "expo.inOut" }, 1.35)
          .from(sp.chars, { yPercent: 115, rotate: 6, duration: 0.95, ease: "expo.out", stagger: 0.03 }, "-=0.45")
          .to(".entra", { opacity: 1, y: 0, duration: 0.75, ease: "power3.out", stagger: 0.1 }, "-=0.5");
      };
      document.fonts.ready.then(abrir);
    });

    return () => {
      limpar.forEach((f) => f());
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(tick);
      removeEventListener("click", ancora);
      document.removeEventListener("visibilitychange", onVis);
      removeEventListener("pointermove", onMove);
      removeEventListener("dblclick", dbl);
      removeEventListener("keydown", tecla);
    };
  }, [motionRev]);
  return null;
}
