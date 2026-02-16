const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.APP_URL || "http://127.0.0.1:4173";

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE_URL}?v=${Date.now()}`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/ECON 205/i);
});

test("auth aliases, admin controls, and lock flow", async ({ page }) => {
  await expect(page.locator("#authGate")).toBeVisible();
  await expect(page.locator("#authGate")).not.toContainText("Authorized names:");

  await page.fill("#authNameInput", "not real");
  await page.click("#authUnlockBtn");
  await expect(page.locator("#authMessage")).toContainText("Name not recognized");

  await page.fill("#authNameInput", "Hanna");
  await page.click("#authUnlockBtn");
  await expect(page.locator("body")).toHaveAttribute("data-role", "student");
  await expect(page.locator("#recallOptions .recall-option")).toHaveCount(4);

  await page.click("#submitAnswerBtn");
  await expect(page.locator("#recallFeedback")).toContainText("Select an option before submitting");

  await page.locator("#recallOptions .recall-option input").first().check();
  await page.click("#submitAnswerBtn");
  await expect(page.locator("#flashAttemptMeta")).toContainText("Status: Submitted");
  await expect(page.locator("#rateGoodBtn")).toBeEnabled();

  await page.click("#switchUserBtn");
  await expect(page.locator("body")).toHaveAttribute("data-role", "locked");

  await page.fill("#authNameInput", "Dr. Ian Helfrich");
  await page.click("#authUnlockBtn");
  await expect(page.locator("body")).toHaveAttribute("data-role", "admin");
  await expect(page.locator("#adminConsole")).toBeVisible();
  await expect(page.locator("#missionControl")).toBeVisible();

  await page.click("#generateQuestBtn");
  await expect(page.locator("#questList .quest-item")).toHaveCount(4);
  await page.click("#runNextQuestBtn");
  await expect(page.locator("#liveStatus")).toContainText("Quest focus loaded");

  await page.fill("#adminIdleMinutes", "35");
  await page.click("#adminSaveIdleBtn");
  await expect(page.locator("#adminSecurityMeta")).toContainText("Idle lock: 35 minutes");

  await page.keyboard.press("Control+K");
  await page.fill("#commandInput", "lock session");
  await page.keyboard.press("Enter");
  await expect(page.locator("body")).toHaveAttribute("data-role", "locked");
  await expect(page.locator("#authMessage")).toContainText("Session locked");
});

test("core downloadable resources are reachable", async ({ page }) => {
  const assets = [
    "/ECON205_Midterm1_Complete_Study_Pack.pdf",
    "/ECON205_Midterm1_Master_Study_Tool.pdf",
    "/ECON205_Midterm1_Master_Study_Tool.md",
    "/ECON205_Midterm1_Active_Recall_Bank.pdf",
    "/ECON205_Midterm1_Active_Recall_Bank_Key.pdf",
    "/ECON205_Midterm1_Mock_Exam_A.pdf",
    "/ECON205_Midterm1_Mock_Exam_A_Key.pdf",
    "/ECON205_Midterm1_Mock_Exam_B.pdf",
    "/ECON205_Midterm1_Mock_Exam_B_Key.pdf",
    "/ECON205_Midterm1_Mock_Exam_C.pdf",
    "/ECON205_Midterm1_Mock_Exam_C_Key.pdf",
    "/ECON205_Midterm1_Cram_Sheet_OnePage.pdf"
  ];

  for (const path of assets) {
    const response = await page.request.get(`${BASE_URL}${path}`);
    expect(response.ok(), `Asset failed: ${path}`).toBeTruthy();
  }
});
