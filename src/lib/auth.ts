import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "review_saas_session";
const SECRET = process.env.JWT_SECRET || "reviewboost_super_secret_production_key_2026";

export interface SessionData {
  userId: string;
  email: string;
  businessId?: string;
  businessSlug?: string;
}

// Secure HMAC-SHA256 Session Token Signer
export function createSessionPayload(data: SessionData): string {
  const json = JSON.stringify(data);
  const base64Data = Buffer.from(json).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(base64Data).digest("base64url");
  return `${base64Data}.${signature}`;
}

// Secure HMAC-SHA256 Verification
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken || !sessionToken.includes(".")) {
    return null;
  }

  const [base64Data, signature] = sessionToken.split(".");
  if (!base64Data || !signature) {
    return null;
  }

  // Verify HMAC signature
  const expectedSignature = crypto.createHmac("sha256", SECRET).update(base64Data).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null; // Signature mismatch (tampering detected)
  }

  try {
    const decoded = JSON.parse(Buffer.from(base64Data, "base64url").toString("utf-8"));
    return decoded as SessionData;
  } catch {
    return null;
  }
}

// Secure Password Hasher using SHA-256 + Salt
export function hashPassword(password: string): string {
  const salt = crypto.createHmac("sha256", SECRET).update("salt_for_passwords").digest("hex").slice(0, 16);
  return crypto.scryptSync(password, salt, 32).toString("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const computed = hashPassword(password);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}

export { SESSION_COOKIE_NAME };
