const { defineConfig } = require("@playwright/test"); module.exports = defineConfig({ use: { headless: true, viewport: { width: 1280, height: 720 } }, projects: [{ name: "chromium", use: { browserName: "chromium" } }, { name: "firefox", use: { browserName: "firefox" } }], reporter: [["html", { open: "never" }]], testDir: "./tests" });
Updated configuration for 2024-12-12
Updated configuration for 2024-12-17
Updated configuration for 2024-12-20
Updated configuration for 2024-12-26
Updated configuration for 2024-12-31
Updated configuration for 2025-01-01
Updated configuration for 2025-01-02
Updated configuration for 2025-01-03
Updated configuration for 2025-01-06
Updated configuration for 2025-01-07
Updated configuration for 2025-01-13
Updated configuration for 2025-01-14
Updated configuration for 2025-01-15
Updated configuration for 2025-01-15
Updated configuration for 2025-01-16
