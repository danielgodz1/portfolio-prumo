import Link from "next/link";
import { Fragment } from "react";
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
import AudienciaSwitch from "../components/AudienciaSwitch";
import CtaWhatsApp from "../components/CtaWhatsApp";
import TransicaoLiquida from "../components/TransicaoLiquida";

export default function Page() {
  const projetosNucleo = PROJETOS.filter((p) => p.id !== "imperio");
  const imperio = PROJETOS.find((p) => p.id === "imperio")!;

  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>

      <div className="pre" role="region" aria-label="Calibração da página">
        <div className="pre__leg">
          <span>Daniel dos Santos</span>
          <span className="cota">22°17&apos;47&quot;S 48°33&apos;28&quot;W · Jaú/SP</span>
        </div>
        <ul className="pre__check cota">
          <li data-pre-check>[OK] EIXO_DE_PRUMO</li>
          <li data-pre-check>[OK] GLOBO_SHADER_GLSL</li>
          <li data-pre-check>[OK] ORIGEM_JAU_SP</li>
        </ul>
        <div className="pre__leg" style={{ alignItems: "end" }}>
          <span className="pre__num disp" data-pre-num>
            03
          </span>
          <div className="pre__acoes">
            <span className="cota">prumo // câmara 00</span>
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

      <main id="conteudo" className="skew palco-fluxo">
        {/* CÂMARA 00: GLOBO PLANETÁRIO REALISTA & HERO */}
        <section className="cena cena--hero ord-hero" id="topo" data-cena="hero" aria-label="Apresentação">
          <div className="palco palco--hero">
            <div className="hero__col-esq">
              <p className="cota hero__kicker entra" data-only="dev">
                Câmara 00 · 22°17&apos;47&quot;S 48°33&apos;28&quot;W · Jaú/SP
              </p>
              <p className="cota hero__kicker entra" data-only="empresa">
                Daniel dos Santos · Jaú/SP · +0,00 m
              </p>

              <h1 className="hero__nome disp" data-hero-nome>
                <span className="hero__titulo-dev" data-only="dev">
                  <span className="linha">
                    <span className="split">Daniel</span>
                  </span>
                  <span className="linha">
                    <span className="split">dos Santos</span>
                  </span>
                </span>
                <span className="hero__titulo-emp" data-only="empresa">
                  {SITE.empresaTitulo}
                </span>
              </h1>

              <p className="hero__sub hero__sub--legivel entra" data-only="dev">
                {SITE.subtitulo}
              </p>
              <p className="hero__sub hero__sub--legivel entra" data-only="empresa">
                {SITE.empresaSubtitulo}
              </p>

              <AudienciaSwitch />
            </div>

            <div className="hero__painel painel-chanfrado entra">
              <div data-only="dev">
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
                  Role para viajar pelas 5 câmaras 3D · Clique no marcador de Jaú no globo ou na NAVI-KERNEL
                </p>
              </div>

              <div data-only="empresa">
                <p className="hero__intro">
                  Site feito sob medida para a sua empresa aparecer bem no Google, passar confiança imediata e levar o cliente direto para o seu WhatsApp.
                </p>
                <ul className="hero__provas hero__provas--emp" aria-label="O que já está funcionando">
                  {SITE.empresaProvas.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <CtaWhatsApp
                  camara="hero"
                  mensagem="Oi Daniel! Vi o seu portfólio em Jaú e quero conversar sobre um site ou sistema para a minha empresa."
                />
                <div className="hero__acoes hero__acoes--emp">
                  <a href="#projetos" className="hero__cta hero__cta--sec" data-cursor="hover">
                    Ver projetos reais
                  </a>
                  <a href="#camara-03" className="hero__cta hero__cta--sec" data-cursor="hover">
                    Ver 10 exemplos por área
                  </a>
                  <Link href="/sites-para-empresas-jau" className="hero__cta hero__cta--sec">
                    Criação de sites em Jaú
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CÂMARA 01: INFRAESTRUTURA (SOMENTE MODO DEV/RECRUTADOR) */}
        <div className="ord-infra" data-only="dev">
          <InfraSecao />
        </div>

        {/* SISTEMAS REAIS: FLOWCHECK & FLOWREQUEST */}
        <section id="projetos" className="ord-projetos" aria-label="Sistemas em produção">
          {projetosNucleo.map((p, i) => (
            <Fragment key={p.id}>
              <article className="cena" id={`proj-${p.id}`} data-cena="proj" aria-labelledby={`t-${p.id}`}>
                <div className="palco">
                  <div className={`proj ${i % 2 ? "proj--esq" : ""}`}>
                    <p className="proj__cota disp" aria-hidden="true">
                      {p.cota}
                    </p>
                    <div className="proj__corpo painel-chanfrado">
                      <p className="cota" data-only="dev">
                        Câmara 01 · Módulo {i + 1} · cota {p.cota} m
                      </p>
                      <p className="cota" data-only="empresa">
                        Sistema em uso diário · cota {p.cota} m
                      </p>
                      <h2 id={`t-${p.id}`} className="disp">
                        {p.nome}
                      </h2>

                      <div data-only="dev">
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

                      {p.empresaArco && (
                        <div className="arco-empresa" data-only="empresa">
                          <p className="arco-empresa__resumo">{p.empresaResumo}</p>
                          <dl className="arco-empresa__grade">
                            <div>
                              <dt className="cota">O problema</dt>
                              <dd>{p.empresaArco.problema}</dd>
                            </div>
                            <div>
                              <dt className="cota">O que construí</dt>
                              <dd>{p.empresaArco.construi}</dd>
                            </div>
                            <div>
                              <dt className="cota">O que mudou</dt>
                              <dd>{p.empresaArco.mudou}</dd>
                            </div>
                          </dl>
                          <CtaWhatsApp
                            camara={p.id}
                            compacto
                            mensagem={`Oi Daniel! Vi o sistema ${p.nome} no seu portfólio e quero conversar sobre algo parecido para a minha empresa.`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
              {(p.id === "flowcheck" || p.id === "flowrequest") && <EmulLoader id={p.id} />}
            </Fragment>
          ))}
        </section>

        {/* CÂMARA 02: ENGENHARIA 3D & WEBGL COMERCIAL (IMPÉRIO MÓVEIS) */}
        <section id="camara-02" className="ord-imperio" aria-label="Império Móveis Planejados em 3D">
          <article className="cena" id={`proj-${imperio.id}`} data-cena="proj" aria-labelledby={`t-${imperio.id}`}>
            <div className="palco">
              <div className="proj">
                <p className="proj__cota disp" aria-hidden="true">
                  {imperio.cota}
                </p>
                <div className="proj__corpo painel-chanfrado">
                  <p className="cota" data-only="dev">
                    Câmara 02 · Arquitetura &amp; WebGL · cota {imperio.cota} m
                  </p>
                  <p className="cota" data-only="empresa">
                    Case real em Jaú · cota {imperio.cota} m
                  </p>
                  <h2 id={`t-${imperio.id}`} className="disp">
                    {imperio.nome}
                  </h2>

                  <div data-only="dev">
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
                  </div>

                  {imperio.empresaArco && (
                    <div className="arco-empresa" data-only="empresa">
                      <p className="arco-empresa__resumo">{imperio.empresaResumo}</p>
                      <dl className="arco-empresa__grade">
                        <div>
                          <dt className="cota">O desafio</dt>
                          <dd>{imperio.empresaArco.problema}</dd>
                        </div>
                        <div>
                          <dt className="cota">O que foi ao ar</dt>
                          <dd>{imperio.empresaArco.construi}</dd>
                        </div>
                        <div>
                          <dt className="cota">Para quem visita</dt>
                          <dd>{imperio.empresaArco.mudou}</dd>
                        </div>
                      </dl>
                    </div>
                  )}

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

        <div className="faixa ord-faixa" aria-hidden="true" data-faixa data-only="dev">
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

        <section className="nums ord-nums" aria-label="Números reais">
          <p className="nums__rot cota">Números verificáveis</p>
          <div>
            <b className="disp nums__odometro" data-conta="10" data-target="10" aria-label="10 modelos de site">
              10
            </b>
            <span>modelos prontos por segmento, de academia a engenharia civil</span>
          </div>
          <div>
            <b className="disp nums__odometro" data-conta="3" data-target="3" aria-label="3 projetos mostrados aqui">
              3
            </b>
            <span>projetos principais publicados e em uso real</span>
          </div>
          <div>
            <b className="disp nums__odometro" data-conta="1" data-target="1" aria-label="1 pessoa do briefing à entrega">
              1
            </b>
            <span>responsável direto do diagnóstico até a entrega no ar</span>
          </div>
        </section>

        {/* CÂMARA 03: PORTAL DOS 10 MODELOS */}
        <div className="ord-modelos">
          <ModelosShowcase />
        </div>

        {/* CÂMARA 04: MEMORY DUMP (SOMENTE MODO DEV/RECRUTADOR) */}
        <div className="ord-kernel" data-only="dev">
          <KernelDumpSecao />
        </div>

        <div className="ord-transicao">
          <TransicaoLiquida />
        </div>

        <div className="ord-contato">
          <ContatoCanal />
        </div>
      </main>

      <footer className="rodape cota">
        <span>Daniel dos Santos · {SITE.cidade}</span>
        <nav className="rodape__links" aria-label="Páginas de apoio">
          <Link href="/sites-para-empresas-jau">Criação de sites em Jaú</Link>
          <Link href="/laboratorio">Laboratório 3D</Link>
        </nav>
      </footer>

      <Experience />
    </>
  );
}
