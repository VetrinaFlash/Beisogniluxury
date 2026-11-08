import { adminHash, cfg } from "./config";

const enc = new TextEncoder();
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b as ArrayBuffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
const unhex = (s: string) => new Uint8Array(s.match(/../g)!.map((h) => parseInt(h, 16)));

export async function hashPassword(pw: string, saltHex: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unhex(saltHex), iterations: 100000 }, key, 256);
  return hex(bits);
}

export async function checkPassword(pw: string): Promise<boolean> {
  const [salt, hash] = ((await adminHash()) ?? "").split(":");
  if (!salt || !hash) return false;
  const got = await hashPassword(pw, salt);
  let diff = got.length ^ hash.length;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ (hash.charCodeAt(i) || 0);
  return diff === 0;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode((await cfg()).JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export async function makeSession(days = 30): Promise<string> {
  const exp = Date.now() + days * 86400000;
  return `${exp}.${await hmac(String(exp))}`;
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = await hmac(exp);
  return good.length === sig.length && good === sig;
}

export async function isAdmin(req: Request): Promise<boolean> {
  const m = /(?:^|;\s*)admin=([^;]+)/.exec(req.headers.get("cookie") ?? "");
  return verifySession(m?.[1]);
}

export const unauthorized = () => Response.json({ error: "non autorizzato" }, { status: 401 });
