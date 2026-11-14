// Conteúdo real, vindo do portfólio atual (src/data.mjs). Nada aqui é inventado.
export const SITE = {
  nome: "Daniel dos Santos",
  cidade: "Jaú, SP",
  intro: "Desenvolvedor web em Jaú, SP. Faço sites e sistemas com React, Node e Supabase, e levo movimento e 3D ao navegador quando a história pede.",
};
export const CONTATO = {
  email: "daniel_santos172@hotmail.com",
  github: "https://github.com/danielgodz1",
  linkedin: "https://www.linkedin.com/in/danieldossantos-ti",
};
export type Projeto = {
  id: string;
  nome: string;
  resumo: string;
  texto: string;
  fatos: [string, string][];
  link?: { t: string; u: string };
  links?: { t: string; u: string }[];
  cota: string;
};
export const PROJETOS: Projeto[] = [
  {
    id: "flowcheck", nome: "FlowCheck", cota: "+3,00",
    resumo: "Checklists e inspeções de segurança do trabalho, com IA, para frotas e obras.",
    texto: "Sistema real, em uso. Equipes de campo executam checklists de veículos, máquinas e equipamentos, registram não conformidades com foto e acompanham tudo numa central de aprovações. A IA sugere o plano de ação 5W2H e o relatório sai em PDF ou Excel.",
    fatos: [["Tipo", "Sistema web corporativo, em produção"], ["Meu papel", "Concepção e desenvolvimento"], ["Destaques", "Assinatura digital, homologação externa por link e PIN, segurança por linha (RLS)"], ["Tecnologia", "React 19, TypeScript, Vite, Tailwind, Express, Supabase, Groq"]],
  },
  {
    id: "flowrequest", nome: "FlowRequest", cota: "+6,00",
    resumo: "Requisições de alimentação, almoxarifado, material, peças e hospedagem, do campo à conclusão.",
    texto: "Sistema real, em uso. Apontadores, encarregados, administradores e fornecedores cuidam de todo o ciclo: emissão em campo, aprovação, conferência e fechamento. No almoxarifado, a requisição se conclui sozinha 48 horas depois. Comprovantes em PDF, dados em Excel.",
    fatos: [["Tipo", "Sistema web corporativo, em produção"], ["Meu papel", "Concepção e desenvolvimento"], ["Perfis", "Administrador, apontador, encarregado e fornecedor"], ["Tecnologia", "React 19, TypeScript, Vite, Tailwind, TanStack Query, Supabase, Recharts"]],
  },
  {
    id: "imperio", nome: "Império Móveis Planejados", cota: "+9,00",
    resumo: "Site e configurador 3D para uma marcenaria de Jaú.",
    texto: "A Império faz móveis planejados em Jaú, SP. Eu cuidei da direção de arte e do código. Tudo parte de uma linha de lápis: ela desenha a planta na abertura, guia a rolagem e contorna o ambiente no 3D.",
    fatos: [["Cliente", "Império Móveis Planejados, Jaú/SP"], ["Meu papel", "Direção de arte e front-end"], ["Tecnologia", "React, TypeScript, Three.js, GSAP, Lenis, Zustand"]],
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
export const STACK = ["React 19", "TypeScript", "Next.js", "Three.js", "GSAP", "Lenis", "Supabase", "PostgreSQL", "Node.js", "Tailwind", "Vercel", "Groq"];
