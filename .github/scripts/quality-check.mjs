import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

function fail(message) {
  console.error(`QUALITY CHECK FAILED: ${message}`);
  process.exit(1);
}

const root = process.cwd();
const indexPath = path.join(root, "index.html");
const studioPath = path.join(root, "ECON205_Midterm1_Study_Studio.html");

if (!fs.existsSync(indexPath)) fail("Missing index.html");
if (!fs.existsSync(studioPath)) fail("Missing ECON205_Midterm1_Study_Studio.html");

const indexHtml = fs.readFileSync(indexPath, "utf8");
const studioHtml = fs.readFileSync(studioPath, "utf8");

if (indexHtml !== studioHtml) {
  fail("index.html and ECON205_Midterm1_Study_Studio.html are out of sync.");
}

if (indexHtml.includes("Authorized names:")) {
  fail("Front gate should not disclose authorized names.");
}

const scriptMatches = [...indexHtml.matchAll(/<script>\s*([\s\S]*?)\s*<\/script>/g)];
if (scriptMatches.length < 2) {
  fail("Expected MathJax config script and app script blocks.");
}

const appScript = scriptMatches[1][1];
try {
  // Parse-only syntax validation for the inline app script.
  new vm.Script(appScript);
} catch (error) {
  fail(`Inline app script has syntax issues: ${String(error)}`);
}

const requiredSnippets = [
  "const AUTH_USERS =",
  "const AUTH_ALIASES =",
  "function resolveAuthorizedUser(",
  "function resetAuthThrottle(",
  "function isAuthTemporarilyLocked(",
  "commandReturnFocus"
];

for (const snippet of requiredSnippets) {
  if (!appScript.includes(snippet)) {
    fail(`Missing required logic snippet: ${snippet}`);
  }
}

console.log("QUALITY CHECK PASSED");
