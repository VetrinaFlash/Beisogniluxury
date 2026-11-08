import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface Env {
  DB: D1Database;
  PHOTOS: R2Bucket;
  SITE_NAME: string;
  SITE_URL: string;
  OWNER_EMAIL: string;
  EMAIL_FROM: string;
  JWT_SECRET?: string;
  ADMIN_PASSWORD_HASH?: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
  ICAL_TOKEN?: string;
  RESEND_API_KEY?: string;
}

export function env(): Env {
  return getCloudflareContext().env as unknown as Env;
}
