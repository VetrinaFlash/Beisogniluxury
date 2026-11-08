// Genera tutte le chiavi/segreti locali. Uso: npm run setup [--push]  (--push li carica su Cloudflare con wrangler)
import { webcrypto as c, randomBytes, createHash } from "node:crypto";
import { writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const b64u = (b) => Buffer.from(b).toString("base64url");
const kp = await c.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const pub = b64u(await c.subtle.exportKey("raw", kp.publicKey));
const jwk = await c.subtle.exportKey("jwk", kp.privateKey);
const priv = jwk.d; // già base64url, 32 byte

const salt = randomBytes(16).toString("hex");
const password = randomBytes(9).toString("base64url");
const key = await c.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
const bits = await c.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: Buffer.from(salt, "hex"), iterations: 100000 }, key, 256);

const secrets = {
  JWT_SECRET: randomBytes(32).toString("hex"),
  ICAL_TOKEN: randomBytes(16).toString("hex"),
  ADMIN_PASSWORD_HASH: `${salt}:${Buffer.from(bits).toString("hex")}`,
  VAPID_PUBLIC_KEY: pub,
  VAPID_PRIVATE_KEY: priv,
};

if (existsSync(".dev.vars") && !process.argv.includes("--force")) {
  console.error(".dev.vars esiste già: non lo sovrascrivo (usa --force per rigenerare e invalidare password/sessioni/push).");
  process.exit(1);
}
writeFileSync(".dev.vars", Object.entries(secrets).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
console.log("\n✔ .dev.vars creato (non committarlo)\n");
console.log("PASSWORD ADMIN (salvala ora, non viene mostrata di nuovo):", password, "\n");

if (process.argv.includes("--push")) {
  for (const [k, v] of Object.entries(secrets)) {
    execSync(`npx wrangler secret put ${k}`, { input: v, stdio: ["pipe", "inherit", "inherit"] });
  }
  console.log("✔ Secret caricati su Cloudflare");
} else {
  console.log("Per caricarli su Cloudflare: npm run setup -- --force --push (dopo aver fatto wrangler login)");
}
