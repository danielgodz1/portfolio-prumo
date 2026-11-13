import { SITE, CONTATO, PROJETOS, MODELOS, STACK } from "../lib/dados";
import Experience from "../components/Experience";
import Cursor from "../components/Cursor";
import SceneLoader from "../components/SceneLoader";
import AsciiFoto from "../components/AsciiFoto";
import Cena3D from "../components/Cena3D";
import { CHECK, REQ } from "../lib/telas.js";
import { Fragment } from "react";

const EMULS: Record<string, any> = { flowcheck: CHECK, flowrequest: REQ };
const Emul = ({ e }: { e: any }) => (
  <section className={`emul emul--${e.tema}`} id={`emul-${e.id}`} data-passos={e.passos.length} data-passo="0" aria-labelledby={`em-${e.id}`}>
    <div className="emul__palco">
      <div className="emul__texto">
        <p className="emul__kicker">Por dentro: {e.titulo}</p>
        <h3 id={`em-${e.id}`} className="disp">O sistema real, passo a passo.</h3>
        <ol className="emul__passos">{e.passos.map(([t, d]: string[], i: number) => (<li key={i} data-i={i}><strong>{t}</strong><span>{d}</span></li>))}</ol>
        <p className="emul__aviso">Emulação feita por mim, com dados fictícios.</p>
      </div>
      <div className="emul__janela" aria-hidden="true">
        <div className="jan__barra"><i /><i /><i /><span>{e.titulo}</span></div>
        <div className="jan__corpo" dangerouslySetInnerHTML={{ __html: e.html }} />
      </div>
    </div>
  </section>
);

const SOBRE = "Faço sites e sistemas que funcionam no dia a dia de quem trabalha: checklists de campo, requisições, configuradores 3D. Quando a história pede, a rolagem vira narrativa. Quando não pede, o site só precisa ser rápido e claro.";

export default function Page() {
  return (
    <>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>

      <div className="pre" aria-hidden="true">
        <div className="pre__leg"><span>Daniel dos Santos</span><span className="cota">Jaú, SP</span></div>
        <span />
        <div className="pre__leg" style={{ alignItems: "end" }}>
          <span className="pre__num disp" data-pre-num>000</span>
          <span className="cota">carregando a obra</span>
        </div>
      </div>

      <SceneLoader />
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
            <p className="hero__intro entra">{SITE.intro}</p>
            <p className="hero__dica cota entra">Role: a obra sobe. Dê dois cliques no topo para soltar o prumo.</p>
          </div>
        </section>

        <section id="projetos" aria-label="Projetos">
          {PROJETOS.map((p, i) => (
            <Fragment key={p.id}>
            <article className="cena" data-cena="proj" aria-labelledby={`t-${p.id}`}>
              <div className="palco">
                <div className={`proj ${i % 2 ? "proj--esq" : ""}`}>
                  <p className="proj__cota disp" aria-hidden="true">{p.cota}</p>
                  <div className="proj__corpo">
                    <p className="cota">Andar {i + 1}, cota {p.cota} m</p>
                    <h2 id={`t-${p.id}`} className="disp">{p.nome}</h2>
                    <p>{p.resumo}</p>
                    <p>{p.texto}</p>
                    <dl>{p.fatos.map(([k, v]) => (<div key={k} style={{ display: "contents" }}><dt>{k}</dt><dd>{v}</dd></div>))}</dl>
                    {p.link && <a className="link-giz" href={p.link.u} target="_blank" rel="noopener noreferrer" data-cursor="view" data-swap>{p.link.t}</a>}
                  </div>
                </div>
              </div>
            </article>
            {EMULS[p.id] && <Emul e={EMULS[p.id]} />}
            {p.id === "imperio" && <Cena3D />}
            </Fragment>
          ))}
        </section>

        <div className="faixa" aria-hidden="true" data-faixa>
          <div className="faixa__linha">
            {[0, 1].map((k) => (<div key={k} style={{ display: "flex" }}>{STACK.map((s) => <span key={s + k} className="faixa__item disp">{s}</span>)}</div>))}
          </div>
        </div>

        <section className="nums" aria-label="Em números">
          <div><b className="disp" data-conta="10">0</b><span>modelos de site, de academia a engenharia civil</span></div>
          <div><b className="disp" data-conta="3">0</b><span>projetos mostrados aqui, dois em produção</span></div>
          <div><b className="disp" data-conta="1">0</b><span>pessoa do briefing ao deploy</span></div>
        </section>

        <section className="sec" id="modelos" aria-labelledby="t-modelos">
          <h2 id="t-modelos" className="disp">Modelos para o seu negócio</h2>
          <ul className="lista">
            {MODELOS.map((m, i) => (
              <li key={m.slug}>
                <a href={m.url} target="_blank" rel="noopener noreferrer" data-cursor="view" data-prev={m.conceito}>
                  <span className="n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="nome disp" data-swap>{m.nome}</span>
                  <span className="conc">{m.conceito}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

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

        <section className="contato" id="contato" aria-labelledby="t-contato">
          <h2 id="t-contato" className="cota">Contato</h2>
          <a className="cta disp" href={`mailto:${CONTATO.email}`} data-mag data-cursor="hover" aria-label="Vamos conversar: enviar e-mail">Vamos conversar</a>
          <p>{CONTATO.email}</p>
        </section>
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
