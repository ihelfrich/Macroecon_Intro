// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  timeout: 90000,
  expect: { timeout: 15000 },
  use: { headless: true },
  reporter: "line"
};
