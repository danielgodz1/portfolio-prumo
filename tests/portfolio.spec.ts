import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const SCREENSHOT_DIR = process.env.PW_SCREENSHOT_DIR;

async function shot(page: import("@playwright/test").Page, nome: string) {
  if (!SCREENSHOT_DIR) return;
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, nome), fullPage: false });
}

test.describe("portfolio-prumo — Mundo 3D 5 Câmaras & UI", () => {
  test("carrega câmara 00 sem erros JS, renderiza WebGL e responde à NAVI-KERNEL", async ({ page }) => {
    const erros: string[] = [];
    page.on("pageerror", (err) => erros.push(String(err)));
    page.on("response", (res) => {
      if (res.status() >= 400) erros.push(`HTTP ${res.status()} em ${res.url()}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") erros.push(msg.text());
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Pula o preloader caso ainda esteja na abertura
    const pular = page.locator("[data-pre-pular]");
    if (await pular.isVisible({ timeout: 2500 }).catch(() => false)) {
      await pular.click();
    }
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    // Verifica título hero, painel chanfrado e ausência de overflow horizontal
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Daniel");
    await expect(page.locator(".painel-chanfrado").first()).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    // Canvas 3D montado e redimensionado ao viewport (aguarda dynamic import + ResizeObserver)
    const canvas = page.locator(".canvas-fundo canvas").first();
    await expect(canvas).toBeVisible({ timeout: 12_000 });
    await expect.poll(async () => (await canvas.boundingBox())?.width ?? 0, { timeout: 10_000 }).toBeGreaterThan(800);
    await expect.poll(async () => (await canvas.boundingBox())?.height ?? 0, { timeout: 10_000 }).toBeGreaterThan(500);

    await page.waitForTimeout(800);
    await shot(page, "01-camara00-hero.png");

    // Interação com a assistente NAVI-KERNEL
    const btnNavi = page.locator(".navi-hud__btn");
    await expect(btnNavi).toBeVisible();
    const textoAntes = await page.locator(".navi-hud__txt").innerText();
    await btnNavi.click();
    const textoDepois = await page.locator(".navi-hud__txt").innerText();
    expect(textoDepois).not.toBe(textoAntes);

    expect(erros).toEqual([]);
  });

  test("percorre câmaras 01..04, emuladores, Império 3D, 10 Modelos, Hex Viewer e Contato", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator("[data-pre-pular]").click().catch(() => {});
    await page.waitForFunction(() => document.documentElement.classList.contains("pronto"), { timeout: 10_000 });

    // Câmara 01: Infraestrutura (5 módulos reais)
    await page.locator("#camara-01").scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    await expect(page.locator(".infra-card")).toHaveCount(5);
    await shot(page, "02-camara01-infra.png");

    // Emulador FlowCheck interativo
    await page.locator("#emul-flowcheck").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const passoCheck = page.locator("#emul-flowcheck .emul__passo-btn").nth(1);
    await passoCheck.click();
    await expect(passoCheck).toHaveClass(/on/);
    await shot(page, "03-camara01-flowcheck.png");

    // Câmara 02: Império Móveis Planejados & Cena 3D
    await page.locator("#camara-02").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(page.locator("#t-imperio")).toBeVisible();
    await expect(page.locator("#camara-02 .cena3d")).toBeVisible();

    // Câmara 03: Portal dos 10 Modelos
    await page.locator("#camara-03").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(page.locator("#camara-03 .mod-card:not(.mod-card--cta)")).toHaveCount(10);
    await shot(page, "04-camara03-modelos.png");

    // Câmara 04: Memory Dump (Hex Viewer) & Contato
    await page.locator("#camara-04").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const secondHex = page.locator(".kernel-row").nth(1);
    await secondHex.click();
    await expect(secondHex).toHaveAttribute("aria-selected", "true");
    await shot(page, "05-camara04-kernel.png");

    await page.locator("#contato").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(page.locator(".contato__copiar")).toBeVisible();
    await expect(page.locator(".contato__whats")).toBeVisible();
    await shot(page, "06-contato.png");
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
