const { execSync } = require("child_process");

const ALIAS = "mdsaikothossain.vercel.app";
const URL_PATTERN = /https:\/\/mdsaikothossain-[a-z0-9]+-mr-thalamus\.vercel\.app/;

console.log("Deploying to Vercel...\n");
const output = execSync("npx vercel --prod --yes", { encoding: "utf8" });
console.log(output);

const match = output.match(URL_PATTERN);
if (!match) {
  console.error(`Could not find the deployment URL in Vercel's output.\nRe-point it manually: npx vercel alias set <deployment-url> ${ALIAS}`);
  process.exit(1);
}

const deploymentUrl = match[0];
console.log(`Pointing ${ALIAS} -> ${deploymentUrl}\n`);
execSync(`npx vercel alias set ${deploymentUrl} ${ALIAS}`, { stdio: "inherit" });
console.log(`\nDone. Live at https://${ALIAS}`);
