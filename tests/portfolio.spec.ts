import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const SCREENSHOT_DIR = process.env.PW_SCREENSHOT_DIR;

async function shot(page: import("@playwright/test").Page, nome: string) {
  if (!SCREENSHOT_DIR) return;
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, nome), fullPage: false });
}

test.describe("portfolio-prumo — Awwwards Scrollytelling Z, Empresas, Devs & SEO", () => {
  test("carrega Hero cinematográfico sem erros JS, com WhatsApp UTM, Monólito 3D e troca de perfil", async ({ page }) => {
    const erros: string[] = [];
    page.on("pageerror", (err) => erros.push(String(err)));
    page.on("response", (res) => {
      if (res.status() >= 400) erros.push(`HTTP ${res.status()} em ${res.url()}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") erros.push(msg.text());
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const pular = page.locator("[data-pre-pular]");
    if (await pular.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pular.click().catch(() => {});
    }
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    await expect(page.locator("html")).toHaveAttribute("data-para", "empresa");
    await expect(page.locator(".hero__titulo-emp")).toBeVisible();
    await expect(page.locator(".hero__titulo-emp")).toContainText("vende");

    const linkWhatsHero = page.locator(".hero-palco a[href*='wa.me/']").first();
    await expect(linkWhatsHero).toBeVisible();
    const hrefWhats = await linkWhatsHero.getAttribute("href");
    expect(hrefWhats).toContain("wa.me/5514997345164");
    expect(decodeURIComponent(hrefWhats ?? "")).toContain("utm_source=prumo");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const canvas = page.locator(".canvas-fundo canvas").first();
    await expect(canvas).toBeVisible({ timeout: 12_000 });
    await expect.poll(async () => (await canvas.boundingBox())?.width ?? 0, { timeout: 10_000 }).toBeGreaterThan(800);

    // Verifica botão de áudio espacial no Hero sincronizado com o HUD
    const somHero = page.locator(".hero-som-btn").first();
    await expect(somHero).toBeVisible();
    await somHero.click();
    await expect(somHero).toContainText("Áudio espacial: Ligado");
    await expect(page.locator(".hud-min")).toContainText("Som: On");

    await page.waitForTimeout(750);
    await expect(page.locator(".planeta-tag").first()).toContainText("PLANETA 01");
    await expect(page.locator(".navi-hud")).toBeVisible();
    await shot(page, "01-hero-terra-foguete.png");

    // Verifica Ato 01 em profundidade Z e atualização planetária no HUD
    await page.locator("#ato-01").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 320));
    await page.waitForTimeout(550);
    await shot(page, "02-ato01-mercurio-venus.png");

    // Verifica Ato 02 perto de Vênus (superfície Magellan + atmosfera) e Marte
    await page.locator("#ato-02").scrollIntoViewIfNeeded();
    await page.waitForTimeout(550);
    await shot(page, "02b-venus-marte-cabos.png");

    // Verifica Ato 04 próximo a Saturno com anéis
    await page.locator("#ato-04").scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await shot(page, "03-saturno-foguete.png");

    // Alterna para perfil dev/recrutador
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("tab", { name: "Sou recrutador ou dev" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-para", "dev");
    expect(page.url()).toContain("para=dev");
    await expect(page.locator(".hero__titulo-dev")).toBeVisible();
    await expect(page.locator(".hero__titulo-dev")).toContainText("Daniel");

    expect(erros).toEqual([]);
  });

  test("percorre fluxo completo (?para=dev): infra, FlowCheck, Império 3D, 13 Modelos, Hex Viewer e Contato", async ({ page }) => {
    await page.goto("/?para=dev", { waitUntil: "domcontentloaded" });
    await page.locator("[data-pre-pular]").click({ timeout: 2000 }).catch(() => {});
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    await page.locator("#camara-01").scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await expect(page.locator(".infra-card")).toHaveCount(5);

    await page.locator("#emul-flowcheck").scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    const passoCheck = page.locator("#emul-flowcheck .emul__passo-btn").nth(1);
    await passoCheck.click();
    await expect(passoCheck).toHaveClass(/on/);
    await page.locator("#emul-flowcheck .emul__dica-btn").first().click();
    await expect(page.locator("#emul-flowcheck .emul__dica-painel")).toContainText("Row-Level Security");

    await page.locator("#camara-02").scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    await expect(page.locator("#t-imperio")).toBeVisible();
    await shot(page, "03-imperio-3d.png");

    await page.locator("#camara-03").scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await expect(page.locator("#camara-03 .mod-card:not(.mod-card--cta)")).toHaveCount(13);
    await expect(page.locator("#camara-03 .mod-card__acao").first()).toContainText("Abrir demonstração");
    await page.getByRole("button", { name: "Gastronomia & Delivery" }).click();
    await expect(page.locator("#camara-03 .mod-card:not(.mod-card--cta)")).toHaveCount(3);
    await page.getByRole("button", { name: "Todos" }).click();
    await expect(page.locator("#camara-03 .mod-card:not(.mod-card--cta)")).toHaveCount(13);
    await shot(page, "04-modelos.png");

    await page.locator("#camara-04").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const secondHex = page.locator(".kernel-row").nth(1);
    await secondHex.click();
    await expect(secondHex).toHaveAttribute("aria-selected", "true");
    await page.locator(".kernel-toggle").click();
    await page.locator(".kernel-term__chip", { hasText: "zelda" }).click();
    await expect(page.locator(".kernel-term__log")).toContainText("RTX 5060 Ti");

    await page.locator("#contato").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Oportunidade / Recrutamento TI & Dev" }).click();
    await expect(page.locator(".contato__copiar")).toBeVisible();
    await expect(page.locator(".cta--whats")).toHaveAttribute("href", /Recrutamento/);
    await shot(page, "05-contato.png");
  });

  test("subpáginas /sites-para-empresas-jau e /laboratorio renderizam sem erro", async ({ page }) => {
    const erros: string[] = [];
    page.on("pageerror", (err) => erros.push(String(err)));

    await page.goto("/sites-para-empresas-jau", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator(".subpag__faq details")).toHaveCount(5);
    const ldJson = await page.locator('script[type="application/ld+json"]').last().innerText();
    expect(ldJson).toContain("FAQPage");
    expect(ldJson).not.toContain("aggregateRating");

    await page.goto("/laboratorio", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator(".lab-demo")).toHaveCount(3);
    await page.getByRole("button", { name: "Disparar cota +3,00 m" }).click();
    await expect(page.locator(".lab-demo").nth(2)).toContainText("Cota +3,00 m disparada");

    expect(erros).toEqual([]);
  });

  test("Acesso Rápido 2D alterna layout instantaneamente e volta para Modo 3D", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("[data-pre-pular]").click({ timeout: 2000 }).catch(() => {});
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    const btnModo = page.locator(".topo__modo");
    await btnModo.click();
    await expect(page.locator("html")).toHaveClass(/modo-2d/);
    await expect(btnModo).toHaveAttribute("aria-pressed", "true");

    await btnModo.click();
    await expect(page.locator("html")).not.toHaveClass(/modo-2d/);
  });

  test("mobile 390x844 mantém zero overflow horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("[data-pre-pular]").click({ timeout: 2000 }).catch(() => {});
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await shot(page, "06-mobile-hero.png");
  });

  test("Windows prefers-reduced-motion não desliga WebGL nem esconde elementos sem clique explícito", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("[data-pre-pular]").click({ timeout: 2000 }).catch(() => {});
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    await expect(page.locator("html")).not.toHaveClass(/reduzir/);
    await expect(page.locator(".canvas-fundo canvas").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".hero__titulo-emp")).toBeVisible();
  });
});
