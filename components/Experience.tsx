"use client";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { S } from "../lib/store";
import { tocarCliqueCota, tocarIgnicao, tocarKonami, tocarPulso } from "../lib/som";

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

/** Toda a coreografia do DOM: calibração inicial, rolagem Lenis, cenas, emulações, Konami e prumo. */
export default function Experience() {
  const [motionRev, setMotionRev] = useState(0);

  useEffect(() => {
    const onMotion = () => setMotionRev((v) => v + 1);
    const onModo2D = () => setMotionRev((v) => v + 1);
    window.addEventListener("prumo:motion", onMotion);
    window.addEventListener("prumo:modo2d", onModo2D);
    return () => {
      window.removeEventListener("prumo:motion", onMotion);
      window.removeEventListener("prumo:modo2d", onModo2D);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    let pref: string | null = null;
    try {
      pref = localStorage.getItem("prumo-motion");
    } catch {
      pref = null;
    }
    // Regra Windows/UX: WebGL e animações permanecem ativos por padrão; só reduz se o usuário ativou explicitamente no HUD.
    const reduced = pref === "reduzido";
    S.reduced = reduced;
    html.classList.toggle("reduzir", reduced);
    html.classList.toggle("js", !reduced);
    html.classList.toggle("movimento-forcado", !reduced);

    // Economia automática em celular simples ou conexão com economia de dados
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    const modo2DSalvo = (() => {
      try {
        return sessionStorage.getItem("prumo-modo2d");
      } catch {
        return null;
      }
    })();
    if (modo2DSalvo === null && (nav.connection?.saveData || (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4))) {
      S.modo2D = true;
      html.classList.add("modo-2d");
      window.dispatchEvent(new CustomEvent("prumo:modo2d", { detail: { modo2D: true } }));
    }

    let ultimoDegrau = 0;
    const atualizarCota = (p: number) => {
      const metros = Math.round(clamp(p, 0, 1) * 15 * 100) / 100;
      S.cotaMeters = metros;
      S.wireTension = Math.round((98.4 + Math.min(28.0, Math.abs(S.vel) * 1.35)) * 10) / 10;
      const degrau =
        metros >= 14.2 ? 15 : metros >= 11.2 ? 12 : metros >= 8.2 ? 9 : metros >= 5.2 ? 6 : metros >= 2.4 ? 3 : 0;
      S.camara = degrau / 3;
      S.cotaLabel =
        degrau === 15
          ? "KERNEL ROOM"
          : degrau === 12
            ? "13 MODELOS"
            : degrau === 9
              ? "IMPÉRIO 3D"
              : degrau === 6
                ? "FLOWREQUEST"
                : degrau === 3
                  ? "FLOWCHECK"
                  : "FUNDAÇÃO GLOBAL";
      if (degrau !== ultimoDegrau) {
        ultimoDegrau = degrau;
        if (degrau > 0) tocarCliqueCota(degrau);
        window.dispatchEvent(
          new CustomEvent("prumo:cota", {
            detail: { degrau, texto: `Cota +${degrau},00 m alcançada (${S.cotaLabel})` },
          }),
        );
      }
    };

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
    const onSoltarPeso = () => soltar();
    addEventListener("dblclick", dbl);
    addEventListener("keydown", tecla);
    window.addEventListener("prumo:soltar-peso", onSoltarPeso);

    const contadores = $("[data-conta]");
    if (reduced) {
      contadores.forEach((c) => (c.textContent = c.dataset.conta!));
      const onRedScroll = () => {
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        S.progress = clamp(scrollY / max, 0, 1);
        atualizarCota(S.progress);
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
      atualizarCota(S.progress);
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

      if (S.modo2D) {
        gsap.set(".palco", { clearProps: "opacity,transform,filter" });
      }

      $("[data-cena]").forEach((cena) => {
        if (S.modo2D) return;
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

      contadores.forEach((c) => {
        const alvo = Number(c.dataset.target ?? c.dataset.conta);
        c.textContent = String(alvo);
        const o = { v: 0 };
        ScrollTrigger.create({
          trigger: c,
          start: "top 88%",
          once: true,
          onEnter: () => {
            c.classList.add("rodando");
            gsap.fromTo(
              o,
              { v: 0 },
              {
                v: alvo,
                duration: 1.1,
                ease: "expo.out",
                onUpdate: () => {
                  c.textContent = String(Math.round(o.v));
                },
                onComplete: () => {
                  c.textContent = String(alvo);
                  c.classList.remove("rodando");
                  c.classList.add("cravado");
                },
              },
            );
          },
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
        const splitsVisiveis = Array.from(nome.querySelectorAll<HTMLElement>(".split")).filter((el) => el.offsetParent !== null);
        const sp = splitsVisiveis.length ? SplitText.create(splitsVisiveis, { type: "chars" }) : null;
        nome.classList.add("dividido");
        gsap.set(".entra", { y: 18 });
        tlAbertura = gsap.timeline({ onComplete: concluirAbertura });

        checks.forEach((el, i) => {
          tlAbertura!.to(el, { opacity: 1, x: 0, duration: 0.12, ease: "power2.out" }, i * 0.08);
        });
        tlAbertura
          .to(".pre__fio", { scaleY: 1, duration: 0.45, ease: "expo.out" }, 0.05)
          .call(() => { if (num) num.textContent = "00"; }, undefined, 0.05)
          .call(() => { if (num) num.textContent = "50"; }, undefined, 0.22)
          .call(() => { if (num) num.textContent = "100"; S.ignition = 1; }, undefined, 0.42)
          .to(".pre", { clipPath: "inset(0 0 100% 0)", duration: 0.55, ease: "expo.inOut" }, 0.48);
        if (sp) {
          tlAbertura.from(sp.chars, { yPercent: 110, rotate: 4, duration: 0.68, ease: "expo.out", stagger: 0.02 }, "-=0.3");
        }
        tlAbertura.to(".entra", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 }, "-=0.4");
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
      window.removeEventListener("prumo:soltar-peso", onSoltarPeso);
    };
  }, [motionRev]);
  return null;
}
