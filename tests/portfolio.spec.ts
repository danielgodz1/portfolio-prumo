import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const SCREENSHOT_DIR = process.env.PW_SCREENSHOT_DIR;

async function shot(page: import("@playwright/test").Page, nome: string) {
  if (!SCREENSHOT_DIR) return;
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, nome), fullPage: false });
}

test.describe("portfolio-prumo — Empresas, Devs, 3D & SEO", () => {
  test("carrega modo empresa por padrão sem erros JS, com WhatsApp UTM e alterna para modo dev", async ({ page }) => {
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
    if (await pular.isVisible({ timeout: 2500 }).catch(() => false)) {
      await pular.click();
    }
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    // Verifica modo empresa por padrão, CTA WhatsApp com número e UTM reais, e zero overflow
    await expect(page.locator("html")).toHaveAttribute("data-para", "empresa");
    await expect(page.locator(".hero__titulo-emp")).toBeVisible();
    await expect(page.locator(".hero__titulo-emp")).toContainText("clientes para sua empresa");

    const linkWhatsHero = page.locator(".hero__painel a[href*='wa.me/']").first();
    await expect(linkWhatsHero).toBeVisible();
    const hrefWhats = await linkWhatsHero.getAttribute("href");
    expect(hrefWhats).toContain("wa.me/5514997345164");
    expect(decodeURIComponent(hrefWhats ?? "")).toContain("utm_source=prumo");
    expect(decodeURIComponent(hrefWhats ?? "")).toContain("utm_campaign=hero");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    // Canvas 3D montado e redimensionado
    const canvas = page.locator(".canvas-fundo canvas").first();
    await expect(canvas).toBeVisible({ timeout: 12_000 });
    await expect.poll(async () => (await canvas.boundingBox())?.width ?? 0, { timeout: 10_000 }).toBeGreaterThan(800);

    await page.waitForTimeout(500);
    await shot(page, "01-camara00-empresa-hero.png");

    // Alterna para perfil dev/recrutador e valida URL + NAVI easter egg
    await page.getByRole("tab", { name: "Sou recrutador ou dev" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-para", "dev");
    expect(page.url()).toContain("para=dev");
    await expect(page.locator(".hero__titulo-dev")).toBeVisible();
    await expect(page.locator(".hero__titulo-dev")).toContainText("Daniel");

    await page.locator(".navi-hud__orb-btn").click();
    const btnNavi = page.locator(".navi-hud__btn");
    await expect(btnNavi).toBeVisible();
    const textoAntes = await page.locator(".navi-hud__txt").innerText();
    await btnNavi.click();
    expect(await page.locator(".navi-hud__txt").innerText()).not.toBe(textoAntes);

    expect(erros).toEqual([]);
  });

  test("percorre fluxo dev completo (?para=dev): infra, FlowCheck, Império 3D, 10 Modelos, Hex Viewer e Contato", async ({ page }) => {
    await page.goto("/?para=dev", { waitUntil: "domcontentloaded" });
    await page.locator("[data-pre-pular]").click().catch(() => {});
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    await page.locator("#camara-01").scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await expect(page.locator(".infra-card")).toHaveCount(5);
    await shot(page, "02-camara01-infra.png");

    await page.locator("#emul-flowcheck").scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    const passoCheck = page.locator("#emul-flowcheck .emul__passo-btn").nth(1);
    await passoCheck.click();
    await expect(passoCheck).toHaveClass(/on/);

    await page.locator("#camara-02").scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await expect(page.locator("#t-imperio")).toBeVisible();

    await page.locator("#camara-03").scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await expect(page.locator("#camara-03 .mod-card:not(.mod-card--cta)")).toHaveCount(10);
    await expect(page.locator("#camara-03 .mod-card__acao").first()).toContainText("Ver demonstração");
    await shot(page, "04-camara03-modelos.png");

    await page.locator("#camara-04").scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    const secondHex = page.locator(".kernel-row").nth(1);
    await secondHex.click();
    await expect(secondHex).toHaveAttribute("aria-selected", "true");

    await page.locator("#contato").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(page.locator(".contato__copiar")).toBeVisible();
    await expect(page.locator(".cta--whats")).toHaveAttribute("href", /wa\.me\/5514997345164/);
    await shot(page, "06-contato.png");
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
    await page.locator("[data-pre-pular]").click().catch(() => {});
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    const btnModo = page.locator(".topo__modo");
    await btnModo.click();
    await expect(page.locator("html")).toHaveClass(/modo-2d/);
    await expect(btnModo).toHaveAttribute("aria-pressed", "true");

    await page.locator("#camara-03").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await shot(page, "07-modo2d-bento.png");

    await btnModo.click();
    await expect(page.locator("html")).not.toHaveClass(/modo-2d/);
  });

  test("mobile 390x844 mantém zero overflow horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("[data-pre-pular]").click().catch(() => {});
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await shot(page, "08-mobile-hero.png");
  });
});
