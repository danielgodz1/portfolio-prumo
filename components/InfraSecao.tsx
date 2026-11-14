import { INFRA_STACK } from "../lib/dados";

export default function InfraSecao() {
  return (
    <section className="infra-sec" id="camara-01" aria-labelledby="t-infra">
      <div className="infra-wrap painel-chanfrado">
        <header className="infra-cabecalho">
          <div>
            <p className="cota">Câmara 01 · Sala do Núcleo · Infraestrutura, Firewall &amp; Sistemas</p>
            <h2 id="t-infra" className="disp">
              Servidores, rede segura e sistemas no ar.
            </h2>
          </div>
          <p className="infra-lead">
            Antes do primeiro pixel no navegador, existe operação real: domínio corporativo, virtualização com réplica, firewall de borda, monitoramento contínuo e ERP funcionando.
          </p>
        </header>

        <ul className="infra-grid">
          {INFRA_STACK.map((item) => (
            <li key={item.modulo} className="infra-card">
              <div className="infra-card__topo">
                <span className="cota infra-card__mod">{item.modulo}</span>
                <span className="cota infra-card__status">{item.status}</span>
              </div>
              <h3>{item.titulo}</h3>
              <p className="infra-card__simples">{item.resumoSimples}</p>
              <p className="infra-card__tec cota">{item.detalheTecnico}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
