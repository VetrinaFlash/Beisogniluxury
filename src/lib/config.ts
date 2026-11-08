import { getCloudflareContext } from "@opennextjs/cloudflare";
import { env } from "./env";
import { SCHEMA, SEED_ROOMS } from "./schema";

export interface Cfg {
  JWT_SECRET: string;
  ICAL_TOKEN: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  RESEND_API_KEY?: string;
}

let ready: Promise<void> | null = null;
let cached: Cfg | null = null;

/** Crea le tabelle (se mancano) e inserisce le camere iniziali. Una sola volta per isolate. */
export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const db = env().DB;
      await db.batch(SCHEMA.map((s) => db.prepare(s)));
      const n = await db.prepare("SELECT COUNT(*) n FROM rooms").first<{ n: number }>();
      if (!n || n.n === 0) await db.exec(SEED_ROOMS.replace(/\s*\n\s*/g, " "));
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

const b64u = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b as ArrayBuffer))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const rand = (n: number) => [...crypto.getRandomValues(new Uint8Array(n))].map((x) => x.toString(16).padStart(2, "0")).join("");

async function setting(key: string, make: () => Promise<string>): Promise<string> {
  const db = env().DB;
  const cur = await db.prepare("SELECT value FROM settings WHERE key=?").bind(key).first<{ value: string }>();
  if (cur) return cur.value;
  await db.prepare("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)").bind(key, await make()).run();
  return (await db.prepare("SELECT value FROM settings WHERE key=?").bind(key).first<{ value: string }>())!.value;
}

/** Segreti: se presenti come secret Cloudflare vincono; altrimenti l'app li genera da sola e li tiene in D1. */
export async function cfg(): Promise<Cfg> {
  if (cached) return cached;
  await ensureSchema();
  const e = env();
  const JWT_SECRET = e.JWT_SECRET || (await setting("JWT_SECRET", async () => rand(32)));
  const ICAL_TOKEN = e.ICAL_TOKEN || (await setting("ICAL_TOKEN", async () => rand(16)));
  let pub = e.VAPID_PUBLIC_KEY as string, priv = e.VAPID_PRIVATE_KEY as string;
  if (!pub || !priv) {
    const pair = await setting("VAPID", async () => {
      const kp = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"])) as CryptoKeyPair;
      const jwk = (await crypto.subtle.exportKey("jwk", kp.privateKey)) as JsonWebKey;
      return JSON.stringify({ pub: b64u(await crypto.subtle.exportKey("raw", kp.publicKey)), priv: jwk.d });
    });
    ({ pub, priv } = JSON.parse(pair));
  }
  cached = { JWT_SECRET, ICAL_TOKEN, VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, RESEND_API_KEY: e.RESEND_API_KEY };
  return cached;
}

/** Hash password admin: secret Cloudflare oppure impostata al primo accesso (null = ancora da impostare). */
export async function adminHash(): Promise<string | null> {
  const e = env();
  if (e.ADMIN_PASSWORD_HASH) return e.ADMIN_PASSWORD_HASH;
  await ensureSchema();
  const r = await e.DB.prepare("SELECT value FROM settings WHERE key='ADMIN_PASSWORD_HASH'").first<{ value: string }>();
  return r?.value ?? null;
}

export async function claimAdminPassword(hash: string): Promise<boolean> {
  if (env().ADMIN_PASSWORD_HASH) return false;
  await ensureSchema();
  const r = await env().DB.prepare("INSERT OR IGNORE INTO settings (key,value) VALUES ('ADMIN_PASSWORD_HASH',?)").bind(hash).run();
  return (r.meta.changes ?? 0) > 0;
}

export function waitUntil(p: Promise<unknown>) {
  try { getCloudflareContext().ctx.waitUntil(p); } catch { /* dev */ }
}
