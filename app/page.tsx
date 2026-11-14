import { SITE, CONTATO, PROJETOS, STACK } from "../lib/dados";
import Experience from "../components/Experience";
import Cursor from "../components/Cursor";
import SceneLoader from "../components/SceneLoader";
import AsciiFoto from "../components/AsciiFoto";
import Cena3D from "../components/Cena3D";
import HudMissao from "../components/HudMissao";
import EmulLoader from "../components/EmulLoader";
import ModelosShowcase from "../components/ModelosShowcase";
import ContatoCanal from "../components/ContatoCanal";
import { Fragment } from "react";

const SOBRE = "Faço sites e sistemas que funcionam no dia a dia de quem trabalha: checklists de campo, requisições, configuradores 3D. Quando a história pede, a rolagem vira narrativa. Quando não pede, o site só precisa ser rápido e claro.";

export default function Page() {
  return (
    <>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>

      <div className="pre" role="region" aria-label="Calibração do eixo de prumo">
        <div className="pre__leg"><span>Daniel dos Santos</span><span className="cota">22°17&apos;47&quot;S 48°33&apos;28&quot;W · Jaú/SP</span></div>
        <ul className="pre__check cota">
          <li data-pre-check>[OK] EIXO_DE_PRUMO</li>
          <li data-pre-check>[OK] TENSAO_CABO_R3F</li>
          <li data-pre-check>[OK] COTAS_DE_OBRA</li>
          <li data-pre-check>[OK] ORIGEM_JAU_SP</li>
        </ul>
        <div className="pre__leg" style={{ alignItems: "end" }}>
          <span className="pre__num disp" data-pre-num>03</span>
          <div className="pre__acoes">
            <span className="cota">prumo // calibração 00</span>
            <button type="button" className="pre__pular cota" data-pre-pular>Pular [ESC]</button>
          </div>
        </div>
      </div>

      <SceneLoader />
      <HudMissao />
      <Cursor />

      <header className="topo">
        <a href="#topo" data-cursor="hover" data-swap>Daniel dos Santos</a>
        <nav aria-label="Principal">
          <a href="#projetos" data-cursor="hover" data-swap>Projetos</a>
          <a href="#modelos" data-cursor="hover" data-swap>Modelos</a>
          <a href="#sobre" data-cursor="hover" data-swap>Sobre</a>
          <a href="#contato" data-cursor="hover" data-swap>Contato</a>
        </nav>
      </header>

      <main id="conteudo" className="skew">
        <section className="cena cena--hero" id="topo" data-cena="hero" aria-label="Apresentação">
          <div className="palco">
            <h1 className="hero__nome disp" data-hero-nome>
              <span className="linha"><span className="split">Daniel</span></span>
              <span className="linha"><span className="split">dos Santos</span></span>
            </h1>
            <div className="hero__painel entra">
              <p className="hero__intro">{SITE.intro}</p>
              <ul className="hero__provas cota" aria-label="Evidências em produção">
                <li>FlowCheck e FlowRequest em uso</li>
                <li>Império 3D publicado</li>
                <li>10 modelos por segmento</li>
              </ul>
              <div className="hero__acoes">
                <a href="#proj-flowcheck" className="hero__cta hero__cta--prim" data-mag data-cursor="hover">
                  Ver sistemas e obras ↓
                </a>
                <a href="#contato" className="hero__cta hero__cta--sec" data-cursor="hover" data-swap>
                  Falar sobre um projeto →
                </a>
              </div>
              <p className="hero__dica cota">Role: a obra sobe · Duplo clique no topo solta o prumo</p>
            </div>
          </div>
        </section>

        <section id="projetos" aria-label="Projetos">
          {PROJETOS.map((p, i) => (
            <Fragment key={p.id}>
            <article className="cena" id={`proj-${p.id}`} data-cena="proj" aria-labelledby={`t-${p.id}`}>
              <div className="palco">
                <div className={`proj ${i % 2 ? "proj--esq" : ""}`}>
                  <p className="proj__cota disp" aria-hidden="true">{p.cota}</p>
                  <div className="proj__corpo">
                    <p className="cota">Andar {i + 1}, cota {p.cota} m</p>
                    <h2 id={`t-${p.id}`} className="disp">{p.nome}</h2>
                    <p>{p.resumo}</p>
                    <p>{p.texto}</p>
                    <dl>{p.fatos.map(([k, v]) => (<div key={k} style={{ display: "contents" }}><dt>{k}</dt><dd>{v}</dd></div>))}</dl>
                    {p.links && (
                      <div className="proj__links">
                        {p.links.map((lk) => (
                          <a key={lk.u} className="link-giz" href={lk.u} target="_blank" rel="noopener noreferrer" data-cursor="view" data-swap>
                            {lk.t}
                          </a>
                        ))}
                      </div>
                    )}
                    {!p.links && p.link && <a className="link-giz" href={p.link.u} target="_blank" rel="noopener noreferrer" data-cursor="view" data-swap>{p.link.t}</a>}
                  </div>
                </div>
              </div>
            </article>
            {(p.id === "flowcheck" || p.id === "flowrequest") && <EmulLoader id={p.id} />}
            {p.id === "imperio" && <Cena3D />}
            </Fragment>
          ))}
        </section>

        <div className="faixa" aria-hidden="true" data-faixa>
          <div className="faixa__linha">
            {[0, 1].map((k) => (<div key={k} style={{ display: "flex" }}>{STACK.map((s) => <span key={s + k} className="faixa__item disp">{s}</span>)}</div>))}
          </div>
        </div>

        <section className="nums" aria-label="Diário de bordo">
          <p className="nums__rot cota">Diário de bordo</p>
          <div>
            <b className="disp nums__odometro" data-conta="10" data-target="10" aria-label="10 modelos de site">10</b>
            <span>modelos de site, de academia a engenharia civil</span>
          </div>
          <div>
            <b className="disp nums__odometro" data-conta="3" data-target="3" aria-label="3 projetos mostrados aqui">3</b>
            <span>projetos mostrados aqui, dois em produção</span>
          </div>
          <div>
            <b className="disp nums__odometro" data-conta="1" data-target="1" aria-label="1 pessoa do briefing ao deploy">1</b>
            <span>pessoa do briefing ao deploy</span>
          </div>
        </section>

        <ModelosShowcase />

        <section className="sec" id="sobre" aria-labelledby="t-sobre">
          <h2 id="t-sobre" className="disp">Sobre</h2>
          <div className="sobre">
            <figure className="foto"><AsciiFoto /></figure>
            <div>
              <p className="sobre__txt" data-palavras>{SOBRE}</p>
              <div className="sobre__links">
                <a href={CONTATO.github} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-swap>GitHub</a>
                <a href={CONTATO.linkedin} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-swap>LinkedIn</a>
              </div>
            </div>
          </div>
        </section>

        <ContatoCanal />
      </main>

      <footer className="rodape cota">
        <span>Daniel dos Santos, {SITE.cidade}</span>
        <span>Feito com Next.js, React Three Fiber e GSAP</span>
      </footer>

      <div className="prev" data-prev-card aria-hidden="true" />
      <Experience />
    </>
  );
}
