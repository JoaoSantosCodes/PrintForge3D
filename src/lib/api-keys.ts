import crypto from "crypto";
import { logger } from "./logger";

export interface APIKeyPayload {
  keyId: string;
  companyId: string;
  name: string;
  scopes: string[];
  createdAt: string;
  expiresAt?: string;
}

export function generateAPIKey(companyId: string, name: string, scopes: string[] = ["*"]): { rawKey: string; keyId: string; hashedKey: string } {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const rawKey = `pf_live_${randomBytes}`;
  const keyId = `key_${crypto.randomBytes(8).toString("hex")}`;
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

  logger.info(`[APIKeys] API Key '${name}' criada para a empresa ${companyId}`, {
    action: "apikey_created",
    companyId,
    metadata: { keyId, scopes },
  });

  return { rawKey, keyId, hashedKey };
}

export function hashAPIKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}
