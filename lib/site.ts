/** Configuração centralizada de URL canônica, WhatsApp comercial e tracking sem dados pessoais. */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://portfolio-prumo.vercel.app").replace(/\/$/, "");

export const MODELOS_BASE_URL = "https://portfolio-programacao1.vercel.app/modelos/";

/** Recurso "Ver no nome da minha empresa" (?n=&c=&w=) fica oculto até ser ativado no repositório dos modelos. */
export const MODELO_CUSTOM_ATIVO = process.env.NEXT_PUBLIC_MODELO_PERSONALIZADO === "1";

export const WHATSAPP_NUMERO = (process.env.NEXT_PUBLIC_WHATSAPP || "5514997345164").replace(/\D/g, "");

export type UtmParams = {
  camara: string;
  mensagem?: string;
};

/** Gera link do WhatsApp com mensagem pronta e UTMs padrão (Skill 112). */
export function linkWhatsApp({ camara, mensagem }: UtmParams): string {
  const ref = `${SITE_URL}/?utm_source=prumo&utm_medium=site&utm_campaign=${encodeURIComponent(camara)}`;
  const corpo =
    mensagem ||
    `Oi Daniel! Vi seu portfólio e quero conversar sobre um site ou sistema para a minha empresa. (origem: ${camara})`;
  const texto = encodeURIComponent(`${corpo}\n\nRef: ${ref}`);
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;
}

/** Dispara evento anônimo de clique de conversão sem nenhum dado pessoal. */
export function registrarCliqueWhatsApp(camara: string, audiencia: "empresa" | "dev") {
  if (typeof window === "undefined") return;
  const detalhe = { event: "whatsapp_click", camara, audiencia, utm_source: "prumo", utm_medium: "site", utm_campaign: camara };
  window.dispatchEvent(new CustomEvent("prumo:lead-click", { detail: detalhe }));
  const dl = (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer;
  if (Array.isArray(dl)) dl.push(detalhe);
}
