// Conteúdo real de Daniel dos Santos. Nada aqui é inventado; emulações e modelos usam dados fictícios declarados.
export const SITE = {
  nome: "Daniel dos Santos",
  cidade: "Jaú, SP",
  subtitulo: "Engenharia de Software, Infraestrutura & WebGL 3D",
  intro:
    "Desenvolvedor web em Jaú, SP. Construo sistemas corporativos em produção com React, Node e Supabase, administro servidores e redes críticas, e levo 3D com shaders ao navegador quando a história pede.",
  empresaTitulo: "Sites e sistemas que trazem clientes para sua empresa.",
  empresaSubtitulo:
    "Da marcenaria ao atendimento diário: você mostra o que faz com clareza, recebe contatos prontos no WhatsApp e sai do papel e da planilha.",
  empresaProvas: [
    "Império Móveis Planejados (Jaú/SP) no ar em 1ª página do Google",
    "Sistemas FlowCheck e FlowRequest em uso diário",
    "13 demonstrações prontas por segmento de negócio",
  ],
};

export const CONTATO = {
  email: "daniel_santos172@hotmail.com",
  github: "https://github.com/danielgodz1",
  linkedin: "https://www.linkedin.com/in/danieldossantos-ti",
};

export type CamaraInfo = {
  id: number;
  slug: string;
  anchor: string;
  nome: string;
  curto: string;
  cor: string;
  naviFala: string;
  naviSegredo: string;
};

export const CAMARAS: CamaraInfo[] = [
  {
    id: 0,
    slug: "globo",
    anchor: "#topo",
    nome: "Cota +0,00 m · Fundação Global & Globo NASA",
    curto: "+0,00 m · Globo",
    cor: "#38BDF8",
    naviFala: "PRUMO-NAVI online em Jaú/SP (22°17'S, 48°33'W). Acompanhe o fio de prumo e os cabos saindo da Terra.",
    naviSegredo: "Dica do Kernel: dê dois cliques no topo ou clique em SOLTAR PRUMO no HUD para soltar o peso em queda livre!",
  },
  {
    id: 1,
    slug: "flowcheck",
    anchor: "#proj-flowcheck",
    nome: "Cota +3,00 m · Engenharia de Campo (FlowCheck)",
    curto: "+3,00 m · FlowCheck",
    cor: "#10B981",
    naviFala: "Andar 1 (+3,00 m): checklists operacionais de frotas e máquinas com planos de ação gerados por IA.",
    naviSegredo: "No FlowCheck, cada laudo recebe assinatura digital, verificação RLS por usuário e plano 5W2H via IA.",
  },
  {
    id: 2,
    slug: "flowrequest",
    anchor: "#proj-flowrequest",
    nome: "Cota +6,00 m · Operação & Suprimentos (FlowRequest)",
    curto: "+6,00 m · FlowRequest",
    cor: "#6366F1",
    naviFala: "Andar 2 (+6,00 m): fluxo único do campo ao fornecedor, com fechamento automático em 48h no almoxarifado.",
    naviSegredo: "Apontador, encarregado, gestor e fornecedor operam papéis isolados em tempo real com exportação em PDF e Excel.",
  },
  {
    id: 3,
    slug: "imperio",
    anchor: "#camara-02",
    nome: "Cota +9,00 m · Arquitetura 3D (Império Móveis)",
    curto: "+9,00 m · Império 3D",
    cor: "#D4AF37",
    naviFala: "Andar 3 (+9,00 m): modo marcenaria 2700K — a planta a lápis se extruda em módulos até acender o LED.",
    naviSegredo: "Caso real: imperiomoveisplanejadosjau.com.br roda em produção com configurador 3D, SEO/AEO e 1ª página local em Jaú.",
  },
  {
    id: 4,
    slug: "modelos",
    anchor: "#camara-03",
    nome: "Cota +12,00 m · Showroom dos 13 Modelos",
    curto: "+12,00 m · 13 Modelos",
    cor: "#F8FAFC",
    naviFala: "Andar 4 (+12,00 m): 13 sistemas comerciais completos por ramo — filtre por setor e teste no navegador.",
    naviSegredo: "Quer ver ao vivo com o nome da sua empresa? Use o botão Testar com o nome da minha loja ao final do showroom!",
  },
  {
    id: 5,
    slug: "kernel",
    anchor: "#camara-04",
    nome: "Cota +15,00 m · O Núcleo / Kernel Room & Contato",
    curto: "+15,00 m · Kernel",
    cor: "#EAB308",
    naviFala: "Cota +15,00 m (Núcleo): servidores Windows AD, Hyper-V, MikroTik, Wazuh, hardware e engenharia reversa.",
    naviSegredo: "Achou o registrador 0x00401000? Abra o Inspetor Hexadecimal e digite zelda, stack ou prumo!",
  },
];

export type InfraItem = {
  modulo: string;
  titulo: string;
  resumoSimples: string;
  detalheTecnico: string;
  status: string;
};

export const INFRA_STACK: InfraItem[] = [
  {
    modulo: "SYS_WIN_AD",
    titulo: "Windows Server & Active Directory",
    resumoSimples: "Controle de acessos, usuários e políticas da rede corporativa sem dor de cabeça.",
    detalheTecnico: "GPOs, DNS/DHCP internos, permissões NTFS e auditoria de domínio.",
    status: "ONLINE",
  },
  {
    modulo: "VIRT_HYPERV",
    titulo: "Hyper-V Replica",
    resumoSimples: "Servidores virtualizados com réplica contínua para não parar a operação.",
    detalheTecnico: "Replicação assíncrona entre hosts físicos, snapshots e failover planejado.",
    status: "SYNC OK",
  },
  {
    modulo: "NET_MIKROTIK",
    titulo: "MikroTik & Firewall",
    resumoSimples: "Roteamento seguro, segmentação de rede e VPN entre unidades e campo.",
    detalheTecnico: "RouterOS, VLANs, regras de firewall L3/L4, failover de links e túneis VPN.",
    status: "PROTECTED",
  },
  {
    modulo: "SEC_WAZUH",
    titulo: "Wazuh & Zabbix",
    resumoSimples: "Monitoramento em tempo real de servidores, serviços e alertas de segurança.",
    detalheTecnico: "SIEM/EDR com coleta de logs, integridade de arquivos e métricas SNMP/agent.",
    status: "WATCHING",
  },
  {
    modulo: "ERP_TOTVS",
    titulo: "ERP TOTVS RM",
    resumoSimples: "Sustentação e integração de rotinas de gestão empresarial no dia a dia.",
    detalheTecnico: "Consultas SQL, apoio operacional a módulos corporativos e fluxos de dados.",
    status: "INTEGRATED",
  },
];

export type Projeto = {
  id: string;
  nome: string;
  resumo: string;
  texto: string;
  fatos: [string, string][];
  empresaResumo: string;
  empresaArco: {
    problema: string;
    construi: string;
    mudou: string;
  };
  link?: { t: string; u: string };
  links?: { t: string; u: string }[];
  cota: string;
};

export const PROJETOS: Projeto[] = [
  {
    id: "flowcheck",
    nome: "FlowCheck",
    cota: "+3,00",
    resumo: "Checklists e inspeções de segurança do trabalho, com IA, para frotas e obras.",
    texto:
      "Sistema real, em uso. Equipes de campo executam checklists de veículos, máquinas e equipamentos, registram não conformidades com foto e acompanham tudo numa central de aprovações. A IA sugere o plano de ação 5W2H e o relatório sai em PDF ou Excel.",
    empresaResumo: "Conferência de veículos e máquinas pelo celular, sem prancheta de papel.",
    empresaArco: {
      problema: "Inspeções em papel se perdiam na obra e falhas em máquinas demoravam a chegar para quem decide.",
      construi: "Sistema web para o operador marcar item a item no celular, anexar foto da falha e gerar plano de ação e laudo automático.",
      mudou: "Aprovações numa única tela, assinatura digital com histórico completo e relatório pronto em PDF ou Excel.",
    },
    fatos: [
      ["Tipo", "Sistema web corporativo, em produção"],
      ["Meu papel", "Concepção e desenvolvimento"],
      ["Destaques", "Assinatura digital, homologação externa por link e PIN, segurança por linha (RLS)"],
      ["Tecnologia", "React 19, TypeScript, Vite, Tailwind, Express, Supabase, Groq"],
    ],
  },
  {
    id: "flowrequest",
    nome: "FlowRequest",
    cota: "+6,00",
    resumo: "Requisições de alimentação, almoxarifado, material, peças e hospedagem, do campo à conclusão.",
    texto:
      "Sistema real, em uso. Apontadores, encarregados, administradores e fornecedores cuidam de todo o ciclo: emissão em campo, aprovação, conferência e fechamento. No almoxarifado, a requisição se conclui sozinha 48 horas depois. Comprovantes em PDF, dados em Excel.",
    empresaResumo: "Pedidos internos de material, peças e alimentação com acompanhamento do início ao fim.",
    empresaArco: {
      problema: "Pedidos de material, peças e marmitas chegavam espalhados em conversas soltas, sem saber o que foi aprovado ou entregue.",
      construi: "Fluxo único onde quem pede lança em segundos, a gerência aprova com um clique e o fornecedor enxerga só o que precisa entregar.",
      mudou: "Fim dos pedidos perdidos, encerramento automático após 48h no almoxarifado e comprovantes em PDF e Excel.",
    },
    fatos: [
      ["Tipo", "Sistema web corporativo, em produção"],
      ["Meu papel", "Concepção e desenvolvimento"],
      ["Perfis", "Administrador, apontador, encarregado e fornecedor"],
      ["Tecnologia", "React 19, TypeScript, Vite, Tailwind, TanStack Query, Supabase, Recharts"],
    ],
  },
  {
    id: "imperio",
    nome: "Império Móveis Planejados",
    cota: "+9,00",
    resumo: "Site e configurador 3D para uma marcenaria de Jaú.",
    texto:
      "A Império faz móveis planejados em Jaú, SP. Eu cuidei da direção de arte e do código. Tudo parte de uma linha de lápis: ela desenha a planta na abertura, guia a rolagem e contorna o ambiente no 3D.",
    empresaResumo: "O cliente visualiza os móveis em 3D antes de pedir orçamento — feito para marcenaria de Jaú.",
    empresaArco: {
      problema: "Em móveis planejados, fotos comuns raramente mostram o cuidado e a precisão do projeto antes da visita.",
      construi: "Site sob medida onde uma linha de projeto desenha a planta, levanta o ambiente em 3D conforme a rolagem e destaca os detalhes até o pedido de contato.",
      mudou: "Marca local apresentada no mesmo nível das grandes referências digitais, funcionando direto no navegador do cliente.",
    },
    fatos: [
      ["Cliente", "Império Móveis Planejados, Jaú/SP"],
      ["Meu papel", "Direção de arte e front-end"],
      ["Tecnologia", "React, TypeScript, Three.js, GSAP, Lenis, Zustand"],
    ],
    links: [
      { t: "Abrir site e configurador 3D em produção", u: "https://www.imperiomoveisplanejadosjau.com.br/" },
      { t: "Instagram da Império", u: "https://www.instagram.com/imperio.moveis.jau/" },
    ],
  },
];

const BASE = "https://portfolio-programacao1.vercel.app/modelos/";
export type SetorModelo =
  | "Gastronomia & Delivery"
  | "Moda & Beleza"
  | "Engenharia & Indústria"
  | "Serviços";

export type Modelo = {
  slug: string;
  nome: string;
  conceito: string;
  mecanica: string;
  setor: SetorModelo;
  url: string;
};

export const MODELOS: Modelo[] = (
  [
    ["academia", "Academia", "Barra olímpica que soma peso na rolagem + aula experimental no WhatsApp.", "FÍSICA DE BARRA NO SCROLL", "Serviços"],
    ["roupas", "Roupas", "Arara com física de balanço na rolagem + provador de cores ao vivo.", "PROVADOR DE CORES", "Moda & Beleza"],
    ["perfumes", "Perfumes", "Pirâmide olfativa no tempo da rolagem (saída, coração e fundo) + névoa.", "PIRÂMIDE OLFATIVA NO TEMPO", "Moda & Beleza"],
    ["beleza", "Beleza & Cílios", "Olho real que ganha extensão de cílios no scroll + agenda e editor sem código.", "CAMADAS & AGENDA AO VIVO", "Moda & Beleza"],
    ["restaurante", "Restaurante", "Brasas vivas e prato montado em camadas + reserva de mesa pelo WhatsApp.", "MONTAGEM EM CAMADAS", "Gastronomia & Delivery"],
    ["hamburgueria", "Hamburgueria", "Burger que se monta peça a peça no scroll + montador de pedido no WhatsApp.", "MONTAGEM & PEDIDO WHATSAPP", "Gastronomia & Delivery"],
    ["pizzaria", "Pizzaria", "Pizza saindo do forno com queijo esticando + montador meio a meio.", "FATIAS & MEIO A MEIO", "Gastronomia & Delivery"],
    ["arquitetura", "Arquitetura", "Casa que sobe do terreno à entrega + maquete 3D fachada, corte e planta.", "MAQUETE 3D NA ROLAGEM", "Engenharia & Indústria"],
    ["marcenaria", "Marcenaria", "Armário 3D em visão explodida + lista de corte e cálculo de orçamento ao vivo.", "EXPLODED VIEW 3D", "Engenharia & Indústria"],
    ["engenharia", "Engenharia Civil", "Prédio 3D andar por andar + simulador de quantitativo e cronograma ao vivo.", "QUANTITATIVO AO VIVO", "Engenharia & Indústria"],
    ["metalurgica", "Metalúrgica", "Linha de produção 3D (corte a plasma, dobra, solda) + cálculo de peça por peso.", "LINHA INDUSTRIAL 3D", "Engenharia & Indústria"],
    ["empresa", "Empresa em Geral", "Monólito 3D modular com a inicial da marca + editor sem código ao vivo.", "MONÓLITO & EDITOR AO VIVO", "Serviços"],
    ["calcados", "Calçados", "Sapato em visão explodida (cabedal, palmilha, solado) + configurador Monte seu Par.", "MONTE SEU PAR 3D", "Moda & Beleza"],
  ] as [string, string, string, string, SetorModelo][]
).map(([slug, nome, conceito, mecanica, setor]) => ({ slug, nome, conceito, mecanica, setor, url: BASE + slug + "/" }));

export const PILARES_KERNEL = [
  {
    codigo: "01 // FRONT & 3D",
    titulo: "Front-End & Experiência 3D",
    resumo: "Interfaces rápidas e interativas no navegador, com movimento só onde ajuda a vender ou operar.",
    itens: ["React 19", "Next.js", "TypeScript", "Vite", "Tailwind CSS", "Three.js / R3F", "GSAP", "Lenis"],
  },
  {
    codigo: "02 // BACK & IA",
    titulo: "Back-End, Dados & Automação com IA",
    resumo: "Sistemas multiperfil com banco relacional, segurança por linha e automações de fluxo.",
    itens: ["Node.js", "Express", "Supabase (PostgreSQL + RLS)", "ERP TOTVS RM", "n8n", "APIs de IA (Groq / LLMs)"],
  },
  {
    codigo: "03 // INFRA & SEC",
    titulo: "Infraestrutura Crítica, Redes & Cibersegurança",
    resumo: "Sustentação completa de servidores, redes entre unidades, failover e monitoramento 24h.",
    itens: ["Windows Server", "Active Directory & GPOs", "Hyper-V Replica", "MikroTik RouterOS", "UniFi", "Zabbix", "Wazuh SIEM", "Sysmon", "Bitdefender GravityZone"],
  },
];

export const KERNEL_DUMP = [
  { addr: "0x00401000", hex: "4A 41 55 2D 53 50 00 01", label: "ORIGIN", desc: "Daniel dos Santos · Jaú, SP · Do servidor local ao WebGL 3D em produção." },
  { addr: "0x00401018", hex: "52 45 41 43 54 31 39 2B", label: "WEB_CORE", desc: "React 19, Next.js, Node, Supabase RLS, n8n e IA Groq para sistemas corporativos reais." },
  { addr: "0x00401030", hex: "57 45 42 47 4C 5F 33 44", label: "SHADER_GLSL", desc: "Three.js, R3F, shaders customizados GLSL, GSAP e física de mola no Prumo." },
  { addr: "0x00401048", hex: "4E 45 54 5F 53 45 43 00", label: "INFRA_SEC", desc: "Windows Server, AD, Hyper-V Replica, MikroTik, UniFi, Zabbix, Wazuh, Sysmon e Bitdefender." },
  { addr: "0x00401060", hex: "5A 45 4C 44 41 5F 52 45", label: "HARDWARE_RE", desc: "i5-14600KF / RTX 5060 Ti · Hardware, baixo nível e engenharia reversa / decompilação estilo Zelda." },
];

export const STACK = [
  "React 19",
  "Next.js",
  "Three.js",
  "Node.js",
  "Supabase RLS",
  "TOTVS RM",
  "MikroTik",
  "Wazuh SIEM",
  "Zabbix",
  "Windows Server",
  "Hyper-V",
  "Engenharia Reversa",
];

export const FAQ_JAU = [
  {
    pergunta: "Preciso entender de programação ou servidor para ter um site desses?",
    resposta:
      "Não. Eu cuido de toda a parte técnica: desenho das telas, programação, publicação no ar e ligação direta com o seu WhatsApp comercial.",
  },
  {
    pergunta: "Funciona rápido no celular de clientes com 4G simples?",
    resposta:
      "Sim. O site abre primeiro o texto e os botões essenciais e adapta os gráficos pesados automaticamente — celulares mais simples recebem a versão leve de leitura rápida.",
  },
  {
    pergunta: "Posso ver uma ideia parecida com o meu ramo antes de fechar?",
    resposta:
      "Sim. Tenho 13 demonstrações prontas (academia, roupas, perfumes, beleza, restaurante, hamburgueria, pizzaria, arquitetura, marcenaria, engenharia, metalúrgica, empresa e calçados) além do site real da Império Móveis Planejados em Jaú.",
  },
  {
    pergunta: "Como o cliente entra em contato comigo pelo site?",
    resposta:
      "Todo o percurso leva para botões diretos que abrem o seu WhatsApp já com uma mensagem pronta do visitante, sem formulários longos que espantam no celular.",
  },
  {
    pergunta: "Você atende só empresas de Jaú/SP ou outras cidades também?",
    resposta:
      "Fico baseado em Jaú, SP, o que facilita reuniões presenciais na região, e também desenvolvo projetos completos de forma remota para empresas de outras cidades.",
  },
];
