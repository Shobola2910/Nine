export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const buf = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(buf);
}

export async function createSessionToken(secret: string): Promise<string> {
  const payload = `admin.${Date.now()}`;
  const signature = await sign(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
  secret: string
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [prefix, issuedAtRaw, signature] = parts;
  if (prefix !== "admin") return false;

  const expectedSignature = await sign(`${prefix}.${issuedAtRaw}`, secret);
  if (signature !== expectedSignature) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;

  return Date.now() - issuedAt < SESSION_MAX_AGE_MS;
}
