import type { Metadata } from "next";
import Link from "next/link";
import CtaWhatsApp from "../../components/CtaWhatsApp";
import { FAQ_JAU, MODELOS, PROJETOS } from "../../lib/dados";
import { SITE_URL } from "../../lib/site";

export const metadata: Metadata = {
  title: "Criação de Sites em Jaú/SP para Empresas · Daniel dos Santos",
  description:
    "Desenvolvimento de sites rápidos, páginas que convertem no WhatsApp e sistemas sob medida para negócios em Jaú e região.",
  alternates: {
    canonical: `${SITE_URL}/sites-para-empresas-jau`,
  },
};

const SCHEMA_LOCAL = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/sites-para-empresas-jau#service`,
      name: "Daniel dos Santos · Desenvolvimento Web em Jaú",
      url: `${SITE_URL}/sites-para-empresas-jau`,
      telephone: "+55 14 99734-5164",
      email: "mailto:daniel_santos172@hotmail.com",
      areaServed: {
        "@type": "City",
        name: "Jaú",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaú",
        addressRegion: "SP",
        addressCountry: "BR",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_JAU.map((item) => ({
        "@type": "Question",
        name: item.pergunta,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.resposta,
        },
      })),
    },
  ],
};

export default function SitesEmpresasJauPage() {
  const imperio = PROJETOS.find((p) => p.id === "imperio")!;

  return (
    <main className="subpag">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_LOCAL) }} />

      <header className="subpag__topo">
        <span className="cota">CRIAÇÃO DE SITES EM JAÚ/SP · ATENDIMENTO DIRETO</span>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/" className="subpag__voltar cota">
            Ver experiência principal
          </Link>
          <Link href="/laboratorio" className="subpag__voltar cota">
            Laboratório técnico
          </Link>
        </div>
      </header>

      <section className="subpag__hero">
        <h1 className="disp">Criação de sites em Jaú para gerar contatos no WhatsApp</h1>
        <p>
          Quando um cliente procura seu serviço no Google ou abre seu link no celular, ele decide em segundos se confia
          ou fecha a aba. Eu construo sites rápidos, claros e com botão direto para o seu WhatsApp, do diagnóstico até a
          publicação no seu domínio.
        </p>
        <div>
          <CtaWhatsApp
            camara="seo-jau"
            mensagem="Oi Daniel! Vim pela página de criação de sites em Jaú e quero orçamento para a minha empresa."
          />
        </div>
      </section>

      <section aria-labelledby="prova-real">
        <h2 id="prova-real" className="disp">
          O que já está publicado e em operação
        </h2>
        <div className="subpag__cards">
          <article className="subpag__card">
            <span className="cota">MARCENARIA EM JAÚ · NO AR</span>
            <h3 className="disp">{imperio.nome}</h3>
            <p>{imperio.empresaResumo}</p>
            <a
              href="https://www.imperiomoveisplanejadosjau.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-giz"
            >
              Abrir site publicado
            </a>
          </article>
          <article className="subpag__card">
            <span className="cota">SISTEMA DE CHECKLISTS EM CAMPO</span>
            <h3 className="disp">FlowCheck</h3>
            <p>{PROJETOS.find((p) => p.id === "flowcheck")?.empresaResumo}</p>
          </article>
          <article className="subpag__card">
            <span className="cota">CONTROLE DE PEDIDOS INTERNOS</span>
            <h3 className="disp">FlowRequest</h3>
            <p>{PROJETOS.find((p) => p.id === "flowrequest")?.empresaResumo}</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="exemplos-setor">
        <h2 id="exemplos-setor" className="disp">
          13 demonstrações prontas por segmento
        </h2>
        <div className="subpag__cards">
          {MODELOS.slice(0, 6).map((m) => (
            <article key={m.slug} className="subpag__card">
              <span className="cota">{m.mecanica}</span>
              <h3 className="disp">{m.nome}</h3>
              <p>{m.conceito}</p>
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="link-giz">
                Ver demonstração
              </a>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq-jau" className="subpag__faq">
        <h2 id="faq-jau" className="disp">
          Dúvidas frequentes
        </h2>
        {FAQ_JAU.map((item) => (
          <details key={item.pergunta} open>
            <summary>{item.pergunta}</summary>
            <p>{item.resposta}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
