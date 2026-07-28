import crypto from "crypto";
import { logger } from "./logger";

export interface WebhookEndpoint {
  id: string;
  companyId: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

export function signWebhookPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function dispatchWebhook(
  endpoint: WebhookEndpoint,
  event: string,
  data: unknown
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  if (!endpoint.active || (!endpoint.events.includes("*") && !endpoint.events.includes(event))) {
    return { success: false, error: "Evento não inscrito ou webhook inativo." };
  }

  const payloadObject = {
    event,
    companyId: endpoint.companyId,
    timestamp: new Date().toISOString(),
    data,
  };

  const bodyString = JSON.stringify(payloadObject);
  const signature = signWebhookPayload(bodyString, endpoint.secret);

  try {
    const res = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PrintForge-Signature": signature,
        "X-PrintForge-Event": event,
      },
      body: bodyString,
    });

    logger.info(`[Webhooks] Disparo para ${endpoint.url} status ${res.status}`, {
      action: "webhook_dispatched",
      companyId: endpoint.companyId,
      metadata: { event, url: endpoint.url, status: res.status },
    });

    return { success: res.ok, statusCode: res.status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[Webhooks] Falha ao disparar webhook para ${endpoint.url}`, {
      action: "webhook_dispatch_failed",
      companyId: endpoint.companyId,
      error: message,
    });

    return { success: false, error: message };
  }
}
