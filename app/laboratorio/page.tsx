import type { Metadata } from "next";
import Link from "next/link";
import { DemoCelularRapido, DemoPendulo, DemoSomCota } from "../../components/LaboratorioDemos";
import { SITE_URL } from "../../lib/site";

export const metadata: Metadata = {
  title: "Laboratório 3D e Performance · Daniel dos Santos",
  description:
    "Notas técnicas curtas com demonstração ao vivo extraídas do código real de O Prumo: física de prumo, orçamento 3D em celular simples e áudio Web Audio.",
  alternates: {
    canonical: `${SITE_URL}/laboratorio`,
  },
};

export default function LaboratorioPage() {
  return (
    <main className="subpag">
      <header className="subpag__topo">
        <span className="cota">LABORATÓRIO · ENGENHARIA FRONT-END · JAÚ/SP</span>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/" className="subpag__voltar cota">
            Voltar ao início
          </Link>
          <Link href="/sites-para-empresas-jau" className="subpag__voltar cota">
            Para empresas em Jaú
          </Link>
        </div>
      </header>

      <section className="subpag__hero">
        <h1 className="disp">Por dentro do 3D leve e tátil</h1>
        <p>
          Três mecanismos reais implementados neste portfólio, explicados direto a partir do código em produção, sem
          mágica escondida nem dependência pesada.
        </p>
      </section>

      <article className="subpag__card">
        <span className="cota">01 · FÍSICA DE MOLA (SCENE.TSX)</span>
        <h2 className="disp">O fio de prumo com mola e amortecimento, por dentro</h2>
        <p>
          Em vez de usar uma biblioteca de física inteira só para balançar um peso, o prumo roda uma equação de mola
          amortecida direto no loop do frame: aceleração angular proporcional ao desvio menos o amortecimento da
          velocidade. Quando o visitante rola rápido ou passa o cursor, o torque responde na hora sem bloquear a thread.
        </p>
        <DemoPendulo />
      </article>

      <article className="subpag__card">
        <span className="cota">02 · CARREGAMENTO PROGRESSIVO (SCENELOADER + SCENE.TSX)</span>
        <h2 className="disp">Como um site com 3D abre rápido em celular simples</h2>
        <p>
          O texto e os links principais vêm prontos no HTML antes de qualquer código 3D baixar. O Three.js entra por
          importação dinâmica separada, detecta renderização por software ou baixa memória (`deviceMemory &lt;= 4` /
          `saveData`) e desliga passes pesados de pós-processamento automaticamente quando o tempo por quadro sobe.
        </p>
        <DemoCelularRapido />
      </article>

      <article className="subpag__card">
        <span className="cota">03 · ÁUDIO PROCEDURAL (LIB/SOM.TS)</span>
        <h2 className="disp">Clique mecânico por cota sem baixar um único MP3</h2>
        <p>
          Ao cruzar cada marco (+3,00 m, +6,00 m e +9,00 m), o navegador sintetiza um pulso curto com oscilador
          triangular e filtro passa-banda via Web Audio API. O som começa mudo por padrão, só inicializa após gesto
          explícito do usuário e salva a preferência no `localStorage`.
        </p>
        <DemoSomCota />
      </article>
    </main>
  );
}
