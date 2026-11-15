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
    "Império Móveis Planejados (Jaú/SP) no ar",
    "Sistemas FlowCheck e FlowRequest em uso diário",
    "Demonstrações prontas para 10 ramos de negócio",
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
    nome: "Câmara 00 · O Globo & A Rede",
    curto: "00 Globo",
    cor: "#38BDF8",
    naviFala: "Hey! Listen! Origem travada em Jaú/SP (22°17'S, 48°33'W). Role para viajar pelo núcleo.",
    naviSegredo: "Dica de radar: passe o mouse sobre as 2.000 partículas orbitais para gerar repulsão magnética em GLSL.",
  },
  {
    id: 1,
    slug: "nucleo",
    anchor: "#camara-01",
    nome: "Câmara 01 · Sala do Núcleo & Sistemas",
    curto: "01 Núcleo",
    cor: "#00FF9C",
    naviFala: "Entrando no corredor de racks: infraestrutura real, firewall e os sistemas FlowCheck e FlowRequest.",
    naviSegredo: "Dica do sistema: role devagar para operar o FlowCheck e o FlowRequest ao vivo, ou clique nas abas do terminal.",
  },
  {
    id: 2,
    slug: "imperio",
    anchor: "#camara-02",
    nome: "Câmara 02 · Engenharia 3D Comercial",
    curto: "02 Império 3D",
    cor: "#FFD27A",
    naviFala: "Modo marcenaria 2700K: a planta baixa sobe em wireframe até acender os perfis de LED da Império.",
    naviSegredo: "Fato real: a Império Móveis Planejados está no ar em imperiomoveisplanejadosjau.com.br com linha de lápis em 3D.",
  },
  {
    id: 3,
    slug: "modelos",
    anchor: "#camara-03",
    nome: "Câmara 03 · Portal dos 10 Modelos",
    curto: "03 Modelos",
    cor: "#7DD3FC",
    naviFala: "10 cartuchos interativos de negócio: de academia a engenharia civil, cada um com física própria.",
    naviSegredo: "Passe o cursor sobre cada cartucho para inclinar em 3D e disparar o preview da mecânica de rolagem.",
  },
  {
    id: 4,
    slug: "kernel",
    anchor: "#camara-04",
    nome: "Câmara 04 · Memory Dump & Contato",
    curto: "04 Kernel",
    cor: "#FFD23F",
    naviFala: "Setor 0x00401000: código, infraestrutura, hardware e engenharia reversa reunidos antes da transmissão.",
    naviSegredo: "Ative o áudio ou clique em qualquer canal de contato abaixo para enviar o pacote de transmissão!",
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
      { t: "Visitar site ao vivo ↗", u: "https://www.imperiomoveisplanejadosjau.com.br/" },
      { t: "Instagram da Império ↗", u: "https://www.instagram.com/imperio.moveis.jau/" },
    ],
  },
];

const BASE = "https://portfolio-programacao1.vercel.app/modelos/";
export type Modelo = {
  slug: string;
  nome: string;
  conceito: string;
  mecanica: string;
  url: string;
};

export const MODELOS: Modelo[] = [
  ["academia", "Academia", "A rolagem carrega a barra; treinos como repetições.", "FÍSICA DE BARRA NO SCROLL"],
  ["roupas", "Roupas", "Arara que balança com a rolagem e provador de cores.", "PROVADOR DE CORES"],
  ["perfumes", "Perfumes", "A rolagem é o tempo do perfume na pele.", "PIRÂMIDE OLFATIVA NO TEMPO"],
  ["beleza", "Beleza", "Olho real ganha cílios na rolagem; agenda e sacola.", "CAMADAS & AGENDA AO VIVO"],
  ["restaurante", "Restaurante", "O prato se monta em camadas; cardápio e reserva.", "MONTAGEM EM CAMADAS"],
  ["hamburgueria", "Hamburgueria", "Lanche que se monta e pedido pelo WhatsApp.", "MONTAGEM & PEDIDO WHATSAPP"],
  ["pizzaria", "Pizzaria", "Pizza que se monta e pedido pelo WhatsApp.", "FATIAS & MONTE A PIZZA"],
  ["arquitetura", "Arquitetura", "A casa se constrói na rolagem; maquete 3D.", "MAQUETE 3D NA ROLAGEM"],
  ["marcenaria", "Marcenaria", "Armário 3D que abre em peças e vira orçamento.", "EXPLODED VIEW 3D"],
  ["engenharia", "Engenharia", "Prédio que sobe andar por andar; quantitativo ao vivo.", "QUANTITATIVO AO VIVO"],
].map(([slug, nome, conceito, mecanica]) => ({ slug, nome, conceito, mecanica, url: BASE + slug + "/" }));

export const KERNEL_DUMP = [
  { addr: "0x00401000", hex: "4A 41 55 2D 53 50 00 01", label: "ORIGIN", desc: "Daniel dos Santos · Jaú, SP · Do briefing ao deploy em produção." },
  { addr: "0x00401018", hex: "52 45 41 43 54 31 39 2B", label: "WEB_CORE", desc: "React 19, Next.js, Node, Supabase e TypeScript para sistemas corporativos reais." },
  { addr: "0x00401030", hex: "57 45 42 47 4C 5F 33 44", label: "SHADER_GLSL", desc: "Three.js, R3F, shaders customizados e GSAP quando a narrativa pede profundidade." },
  { addr: "0x00401048", hex: "4E 45 54 5F 53 45 43 00", label: "INFRA_SEC", desc: "Windows Server, Active Directory, Hyper-V Replica, MikroTik, Wazuh, Zabbix e TOTVS RM." },
  { addr: "0x00401060", hex: "5A 45 4C 44 41 5F 52 45", label: "HARDWARE_RE", desc: "Hardware, arquitetura de baixo nível e engenharia reversa / decompilação de games." },
];

export const STACK = [
  "React 19",
  "Next.js",
  "Three.js",
  "Node.js",
  "Supabase",
  "TOTVS RM",
  "MikroTik",
  "Wazuh",
  "Zabbix",
  "Windows Server",
  "Hyper-V",
  "Reverse Engineering",
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
      "Sim. Tenho 10 demonstrações prontas (academia, roupas, perfumes, beleza, restaurante, hamburgueria, pizzaria, arquitetura, marcenaria e engenharia) além do site real da Império Móveis Planejados em Jaú.",
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
