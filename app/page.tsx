import { SITE, PROJETOS, STACK } from "../lib/dados";
import Experience from "../components/Experience";
import Cursor from "../components/Cursor";
import SceneLoader from "../components/SceneLoader";
import Cena3D from "../components/Cena3D";
import HudMissao from "../components/HudMissao";
import EmulLoader from "../components/EmulLoader";
import ModelosShowcase from "../components/ModelosShowcase";
import ContatoCanal from "../components/ContatoCanal";
import NavegacaoTopo from "../components/NavegacaoTopo";
import ReguaCamaras from "../components/ReguaCamaras";
import NaviHud from "../components/NaviHud";
import InfraSecao from "../components/InfraSecao";
import KernelDumpSecao from "../components/KernelDumpSecao";
import { Fragment } from "react";

export default function Page() {
  const projetosNucleo = PROJETOS.filter((p) => p.id !== "imperio");
  const imperio = PROJETOS.find((p) => p.id === "imperio")!;

  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>

      <div className="pre" role="region" aria-label="Calibração do núcleo 3D">
        <div className="pre__leg">
          <span>Daniel dos Santos</span>
          <span className="cota">22°17&apos;47&quot;S 48°33&apos;28&quot;W · Jaú/SP</span>
        </div>
        <ul className="pre__check cota">
          <li data-pre-check>[OK] EIXO_DE_PRUMO</li>
          <li data-pre-check>[OK] GLOBO_SHADER_GLSL</li>
          <li data-pre-check>[OK] NAVI_KERNEL_INIT</li>
          <li data-pre-check>[OK] ORIGEM_JAU_SP</li>
        </ul>
        <div className="pre__leg" style={{ alignItems: "end" }}>
          <span className="pre__num disp" data-pre-num>
            03
          </span>
          <div className="pre__acoes">
            <span className="cota">kernel // câmara 00</span>
            <button type="button" className="pre__pular cota" data-pre-pular>
              Pular [ESC]
            </button>
          </div>
        </div>
      </div>

      <SceneLoader />
      <NavegacaoTopo />
      <ReguaCamaras />
      <NaviHud />
      <HudMissao />
      <Cursor />

      <main id="conteudo" className="skew">
        {/* CÂMARA 00: GLOBO PLANETÁRIO REALISTA & HERO */}
        <section className="cena cena--hero" id="topo" data-cena="hero" aria-label="Apresentação">
          <div className="palco palco--hero">
            <div className="hero__col-esq">
              <p className="cota hero__kicker entra">Câmara 00 · 22°17&apos;47&quot;S 48°33&apos;28&quot;W · Jaú/SP</p>
              <h1 className="hero__nome disp" data-hero-nome>
                <span className="linha">
                  <span className="split">Daniel</span>
                </span>
                <span className="linha">
                  <span className="split">dos Santos</span>
                </span>
              </h1>
              <p className="hero__sub entra">{SITE.subtitulo}</p>
            </div>

            <div className="hero__painel painel-chanfrado entra">
              <p className="hero__intro">{SITE.intro}</p>
              <ul className="hero__provas cota" aria-label="Evidências em produção">
                <li>FlowCheck &amp; FlowRequest em uso</li>
                <li>Império 3D publicado</li>
                <li>Windows Server · MikroTik · Wazuh · TOTVS RM</li>
              </ul>
              <div className="hero__acoes">
                <a href="#camara-01" className="hero__cta hero__cta--prim" data-mag data-cursor="hover">
                  Explorar sistemas &amp; infra
                </a>
                <a href="#camara-03" className="hero__cta hero__cta--sec" data-cursor="hover" data-swap>
                  Ver 10 modelos
                </a>
                <a href="#contato" className="hero__cta hero__cta--sec" data-cursor="hover" data-swap>
                  Falar comigo
                </a>
              </div>
              <p className="hero__dica cota">
                Role para viajar pelas 5 câmaras 3D · Clique na NAVI-KERNEL ou use o Acesso Rápido 2D no topo
              </p>
            </div>
          </div>
        </section>

        {/* CÂMARA 01: SALA DO NÚCLEO (INFRA, FIREWALL & SISTEMAS CORPORATIVOS) */}
        <InfraSecao />

        <section id="projetos" aria-label="Sistemas em produção">
          {projetosNucleo.map((p, i) => (
            <Fragment key={p.id}>
              <article className="cena" id={`proj-${p.id}`} data-cena="proj" aria-labelledby={`t-${p.id}`}>
                <div className="palco">
                  <div className={`proj ${i % 2 ? "proj--esq" : ""}`}>
                    <p className="proj__cota disp" aria-hidden="true">
                      {p.cota}
                    </p>
                    <div className="proj__corpo painel-chanfrado">
                      <p className="cota">
                        Câmara 01 · Módulo {i + 1} · cota {p.cota} m
                      </p>
                      <h2 id={`t-${p.id}`} className="disp">
                        {p.nome}
                      </h2>
                      <p>{p.resumo}</p>
                      <p>{p.texto}</p>
                      <dl>
                        {p.fatos.map(([k, v]) => (
                          <div key={k} style={{ display: "contents" }}>
                            <dt>{k}</dt>
                            <dd>{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </div>
              </article>
              {(p.id === "flowcheck" || p.id === "flowrequest") && <EmulLoader id={p.id} />}
            </Fragment>
          ))}
        </section>

        {/* CÂMARA 02: ENGENHARIA 3D & WEBGL COMERCIAL (IMPÉRIO MÓVEIS) */}
        <section id="camara-02" aria-label="Engenharia 3D Comercial">
          <article className="cena" id={`proj-${imperio.id}`} data-cena="proj" aria-labelledby={`t-${imperio.id}`}>
            <div className="palco">
              <div className="proj">
                <p className="proj__cota disp" aria-hidden="true">
                  {imperio.cota}
                </p>
                <div className="proj__corpo painel-chanfrado">
                  <p className="cota">Câmara 02 · Arquitetura &amp; WebGL · cota {imperio.cota} m</p>
                  <h2 id={`t-${imperio.id}`} className="disp">
                    {imperio.nome}
                  </h2>
                  <p>{imperio.resumo}</p>
                  <p>{imperio.texto}</p>
                  <dl>
                    {imperio.fatos.map(([k, v]) => (
                      <div key={k} style={{ display: "contents" }}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {imperio.links && (
                    <div className="proj__links">
                      {imperio.links.map((lk) => (
                        <a
                          key={lk.u}
                          className="link-giz"
                          href={lk.u}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor="view"
                          data-swap
                        >
                          {lk.t}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
          <Cena3D />
        </section>

        <div className="faixa" aria-hidden="true" data-faixa>
          <div className="faixa__linha">
            {[0, 1].map((k) => (
              <div key={k} style={{ display: "flex" }}>
                {STACK.map((s) => (
                  <span key={s + k} className="faixa__item disp">
                    {s}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="nums" aria-label="Diário de bordo">
          <p className="nums__rot cota">Telemetria consolidada</p>
          <div>
            <b className="disp nums__odometro" data-conta="10" data-target="10" aria-label="10 modelos de site">
              10
            </b>
            <span>modelos de site, de academia a engenharia civil</span>
          </div>
          <div>
            <b className="disp nums__odometro" data-conta="3" data-target="3" aria-label="3 projetos mostrados aqui">
              3
            </b>
            <span>projetos principais mostrados aqui, em operação real</span>
          </div>
          <div>
            <b className="disp nums__odometro" data-conta="1" data-target="1" aria-label="1 pessoa do briefing ao deploy">
              1
            </b>
            <span>pessoa do briefing à infraestrutura e deploy</span>
          </div>
        </section>

        {/* CÂMARA 03: PORTAL DOS 10 MODELOS */}
        <ModelosShowcase />

        {/* CÂMARA 04: MEMORY DUMP, ENGENHARIA REVERSA & CONTATO */}
        <KernelDumpSecao />
        <ContatoCanal />
      </main>

      <footer className="rodape cota">
        <span>Daniel dos Santos · {SITE.cidade}</span>
        <span>Next.js · React Three Fiber · Custom GLSL · GSAP · Lenis</span>
      </footer>

      <Experience />
    </>
  );
}
