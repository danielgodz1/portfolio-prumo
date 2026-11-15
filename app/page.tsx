import Link from "next/link";
import { Fragment } from "react";
import { SITE, PROJETOS, STACK } from "../lib/dados";
import Experience from "../components/Experience";
import Cursor from "../components/Cursor";
import SceneLoader from "../components/SceneLoader";
import Cena3D from "../components/Cena3D";
import HudMissao from "../components/HudMissao";
import NaviHud from "../components/NaviHud";
import EmulLoader from "../components/EmulLoader";
import ModelosShowcase from "../components/ModelosShowcase";
import ContatoCanal from "../components/ContatoCanal";
import NavegacaoTopo from "../components/NavegacaoTopo";
import InfraSecao from "../components/InfraSecao";
import KernelDumpSecao from "../components/KernelDumpSecao";
import AudienciaSwitch from "../components/AudienciaSwitch";
import CtaWhatsApp from "../components/CtaWhatsApp";
import TransicaoLiquida from "../components/TransicaoLiquida";
import AtoProfundidadeZ from "../components/AtoProfundidadeZ";
import BotaoSomHero from "../components/BotaoSomHero";

export default function Page() {
  const projetosNucleo = PROJETOS.filter((p) => p.id !== "imperio");
  const imperio = PROJETOS.find((p) => p.id === "imperio")!;

  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>

      {/* Preloader tático com fio de prumo e botão pular imediato */}
      <div className="pre pre--limpo" role="region" aria-label="Abertura">
        <div className="pre__topo cota">
          <span>O PRUMO // THE KERNEL TOWER</span>
          <button type="button" className="pre__pular cota" data-pre-pular>
            Pular [ESC]
          </button>
        </div>
        <div className="pre__centro">
          <span className="pre__fio" aria-hidden="true" />
          <span className="pre__num disp" data-pre-num>
            03
          </span>
          <ul className="pre__lista cota" aria-label="Checagem inicial">
            <li>
              <b>[OK]</b> KERNEL_PRUMO_OS // BOOT
            </li>
            <li>
              <b>[OK]</b> R3F_SHADER_PIPELINE // 60_FPS
            </li>
            <li>
              <b>[OK]</b> INFRA_LINK // JAU_SP_22°17&apos;S
            </li>
            <li>
              <b>[OK]</b> AI_COMPANION // ONLINE
            </li>
          </ul>
        </div>
        <div className="pre__base cota">
          <span data-pre-check>DO ZERO AO AR</span>
        </div>
      </div>

      <SceneLoader />
      <NavegacaoTopo />
      <HudMissao />
      <NaviHud />
      <Cursor />

      <main id="conteudo" className="skew palco-fluxo">
        {/* HERO CINEMATOGRÁFICO ABERTO: COTA +0,00 m */}
        <section className="hero-palco ord-hero" id="topo" data-cena="hero" aria-label="Apresentação">
          <div className="hero-palco__miolo">
            <p className="cota hero-palco__eyebrow entra">
              JAÚ, SP · SISTEMAS EM PRODUÇÃO, INFRAESTRUTURA CRÍTICA &amp; WEBGL 3D
            </p>

            <h1 className="hero-palco__titulo disp" data-hero-nome>
              <span className="hero__titulo-emp" data-only="empresa">
                Do zero ao site que vende de verdade.
              </span>
              <span className="hero__titulo-dev" data-only="dev">
                <span className="linha">
                  <span className="split">Daniel</span>
                </span>
                <span className="linha">
                  <span className="split">dos Santos</span>
                </span>
              </span>
            </h1>

            <p className="hero-palco__sub entra" data-only="empresa">
              {SITE.empresaSubtitulo}
            </p>
            <p className="hero-palco__sub entra" data-only="dev">
              {SITE.subtitulo} · Sistemas web em produção, infraestrutura corporativa e WebGL 3D.
            </p>

            <div className="hero-palco__acoes entra">
              <div data-only="empresa" className="hero-palco__cta-linha">
                <CtaWhatsApp
                  camara="hero"
                  rotulo="Quero conversar no WhatsApp"
                  microcopy="Atendimento direto de Jaú/SP"
                  mensagem="Oi Daniel! Vi o seu site novo e quero conversar sobre um projeto para a minha empresa."
                />
                <a href="#camara-03" className="hero__cta hero__cta--sec" data-cursor="hover">
                  Ver os 13 modelos para empresas
                </a>
                <a href="#projetos" className="hero-palco__scroll" data-cursor="hover">
                  Inspecionar sistemas e obras
                </a>
                <BotaoSomHero />
              </div>
              <div data-only="dev" className="hero-palco__cta-linha">
                <a href="#projetos" className="hero__cta hero__cta--prim" data-mag data-cursor="hover">
                  Inspecionar sistemas e obras
                </a>
                <a href="#camara-03" className="hero__cta hero__cta--sec" data-cursor="hover">
                  Ver os 13 modelos para empresas
                </a>
                <a href="#contato" className="hero__cta hero__cta--sec" data-cursor="hover">
                  Quero conversar no WhatsApp
                </a>
                <BotaoSomHero />
              </div>
            </div>

            <p className="cota hero-palco__micro entra">
              Role para subir os andares da obra · Dê dois cliques para soltar o prumo em queda livre
            </p>

            <AudienciaSwitch />
          </div>
        </section>

        {/* ATO 01: ORIGEM EM JAÚ (TEXTO VEM DO FUNDO EM PROFUNDIDADE Z) */}
        <AtoProfundidadeZ
          id="ato-01"
          className="ord-ato01"
          ato="ATO 01 · +0,00 m · TERRA A MERCÚRIO · A FUNDAÇÃO"
          titulo="Tudo começou resolvendo problema real no chão de operação."
          subtitulo="Antes de qualquer linha de código virar efeito 3D, ela precisava tirar papel perdido da mão da equipe, evitar pedido atrasado e dar visibilidade para quem decide."
        >
          <div className="ato-z__metricas cota">
            <span>JAÚ, SP</span>
            <span>SISTEMAS EM USO DIÁRIO</span>
            <span>DO ZERO AO AR</span>
          </div>
        </AtoProfundidadeZ>

        {/* ATO 02: SISTEMAS EM USO REAL (FLOWCHECK & FLOWREQUEST) */}
        <AtoProfundidadeZ
          id="ato-02"
          className="ord-ato02"
          ato="ATO 02 · +3,00 m · VÊNUS A MARTE · SISTEMAS NO AR"
          titulo="Ferramentas que saíram do papel para o celular da equipe."
          subtitulo="FlowCheck e FlowRequest foram construídos para uso diário real: checklist de campo com plano de ação e requisição de materiais do pedido à conclusão."
        />

        <div className="ord-infra" data-only="dev">
          <InfraSecao />
        </div>

        <section id="projetos" className="ord-projetos" aria-label="Sistemas em produção">
          {projetosNucleo.map((p, i) => (
            <Fragment key={p.id}>
              <article className="cena-limpa" id={`proj-${p.id}`} aria-labelledby={`t-${p.id}`}>
                <div className="cena-limpa__grade">
                  <div className="cena-limpa__texto">
                    <span className="cota" data-only="dev">
                      Módulo {i + 1} · cota {p.cota} m
                    </span>
                    <span className="cota" data-only="empresa">
                      Sistema em operação real · cota {p.cota} m
                    </span>
                    <h3 id={`t-${p.id}`} className="disp">
                      {p.nome}
                    </h3>
                    <div data-only="dev">
                      <p>{p.resumo}</p>
                      <p>{p.texto}</p>
                      <dl className="cena-limpa__fatos">
                        {p.fatos.map(([k, v]) => (
                          <div key={k}>
                            <dt className="cota">{k}</dt>
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
                          mensagem={`Oi Daniel! Vi o sistema ${p.nome} no seu site e quero conversar sobre algo parecido.`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </article>
              {(p.id === "flowcheck" || p.id === "flowrequest") && <EmulLoader id={p.id} />}
            </Fragment>
          ))}
        </section>

        {/* ATO 03: DA PLANTA AO QUARTO 3D (IMPÉRIO MÓVEIS PLANEJADOS SE MONTANDO NA TELA) */}
        <AtoProfundidadeZ
          id="ato-03"
          className="ord-ato03"
          ato="ATO 03 · +9,00 m · ÓRBITA DE JÚPITER · ARQUITETURA 3D"
          titulo="Depois a planta baixa virou um quarto 3D se montando diante de você."
          subtitulo="Para a Império Móveis Planejados de Jaú, o site nasceu como extensão da marcenaria: do traço inicial até acender os perfis de LED 2700K e posicionar na primeira página do Google."
        />

        <section id="camara-02" className="ord-imperio" aria-label="Império Móveis Planejados em 3D">
          <Cena3D />
          <article className="cena-limpa" id={`proj-${imperio.id}`} aria-labelledby={`t-${imperio.id}`}>
            <div className="cena-limpa__grade">
              <div className="cena-limpa__texto">
                <span className="cota">Case real em Jaú · cota {imperio.cota} m</span>
                <h3 id={`t-${imperio.id}`} className="disp">
                  {imperio.nome}
                </h3>
                <p data-only="dev">{imperio.resumo} — {imperio.texto}</p>
                {imperio.empresaArco && (
                  <p className="arco-empresa__resumo" data-only="empresa">
                    {imperio.empresaResumo}
                  </p>
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
                      >
                        {lk.t}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        </section>

        {/* ATO 04: 13 MODELOS INTERATIVOS + FECHAMENTO WHATSAPP */}
        <AtoProfundidadeZ
          id="ato-04"
          className="ord-ato04"
          ato="ATO 04 · +12,00 m · SATURNO A NETUNO · PARA O SEU NEGÓCIO"
          titulo="Agora escolha o ponto de partida da sua empresa."
          subtitulo="Treze segmentos com identidade visual própria e navegação imediata. Você filtra, testa ao vivo e me chama direto no WhatsApp."
        />

        <div className="ord-modelos">
          <ModelosShowcase />
        </div>

        <section className="nums ord-nums" aria-label="Números reais">
          <p className="nums__rot cota">Números verificáveis</p>
          <div>
            <b className="disp nums__odometro" data-conta="13" data-target="13">
              13
            </b>
            <span>modelos prontos por segmento, de academia a engenharia civil</span>
          </div>
          <div>
            <b className="disp nums__odometro" data-conta="3" data-target="3">
              3
            </b>
            <span>projetos principais publicados e em uso real</span>
          </div>
          <div>
            <b className="disp nums__odometro" data-conta="1" data-target="1">
              1
            </b>
            <span>responsável direto do diagnóstico até a entrega no ar</span>
          </div>
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

        <div className="ord-kernel">
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
