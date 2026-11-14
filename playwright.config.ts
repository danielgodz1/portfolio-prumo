import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@playwright/test";

function resolverExecutavelChrome(): string | undefined {
  if (process.env.PW_CHROME && fs.existsSync(process.env.PW_CHROME)) {
    return process.env.PW_CHROME;
  }
  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    const msPw = path.join(localAppData, "ms-playwright");
    if (fs.existsSync(msPw)) {
      const pasta = fs.readdirSync(msPw).find((d) => d.startsWith("chromium-"));
      if (pasta) {
        const exe = path.join(msPw, pasta, "chrome-win64", "chrome.exe");
        if (fs.existsSync(exe)) return exe;
      }
    }
  }
  const sysChrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (fs.existsSync(sysChrome)) return sysChrome;
  return undefined;
}

const executablePath = resolverExecutavelChrome();

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      ...(executablePath ? { executablePath } : {}),
      args: [
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
        "--ignore-gpu-blocklist",
      ],
    },
  },
  webServer: {
    command: "npx next start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
