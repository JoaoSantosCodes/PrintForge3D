import { describe, it, expect, vi } from "vitest";
import { createSuccessResult, createFallbackResult } from "../service-result";
import { CircuitBreaker } from "../circuit-breaker";
import { withRetry } from "../retry";
import { transactionalOutbox } from "../outbox";

describe("PrintForge Platform 1.2 — Resiliência e Confiabilidade", () => {
  describe("ServiceResult<T> Wrapper", () => {
    it("deve criar um resultado de sucesso com correlationId", () => {
      const res = createSuccessResult({ saldo: 1500 });
      expect(res.success).toBe(true);
      expect(res.data.saldo).toBe(1500);
      expect(res.isFallback).toBe(false);
      expect(res.correlationId).toMatch(/^corr_/);
    });

    it("deve criar um resultado de fallback com mensagem de erro", () => {
      const res = createFallbackResult("BANCO_INDISPONIVEL", { saldo: 0 });
      expect(res.success).toBe(false);
      expect(res.error).toBe("BANCO_INDISPONIVEL");
      expect(res.data.saldo).toBe(0);
      expect(res.isFallback).toBe(true);
    });
  });

  describe("Circuit Breaker Pattern", () => {
    it("deve manter o circuito CLOSED durante chamadas normais", async () => {
      const cb = new CircuitBreaker("test-service-1");
      const action = vi.fn().mockResolvedValue("sucesso");
      const fallback = vi.fn().mockResolvedValue("fallback");

      const { result, usedFallback } = await cb.execute(action, fallback);
      expect(result).toBe("sucesso");
      expect(usedFallback).toBe(false);
      expect(cb.getState()).toBe("CLOSED");
    });

    it("deve mudar para OPEN após 3 falhas consecutivas e acionar o fallback", async () => {
      const cb = new CircuitBreaker("test-service-failing", { failureThreshold: 3 });
      const action = vi.fn().mockRejectedValue(new Error("Conexão recusada"));
      const fallback = vi.fn().mockResolvedValue("dados_fallback");

      await cb.execute(action, fallback);
      await cb.execute(action, fallback);
      await cb.execute(action, fallback);

      expect(cb.getState()).toBe("OPEN");

      // Na 4ª chamada com circuito OPEN, o fallback é executado sem chamar o action
      const { result, usedFallback } = await cb.execute(action, fallback);
      expect(result).toBe("dados_fallback");
      expect(usedFallback).toBe(true);
    });
  });

  describe("Retry Engine com Backoff Exponencial", () => {
    it("deve tentar novamente e ter sucesso na 2ª tentativa", async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts === 1) throw new Error("Erro temporário");
        return "sucesso_na_retry";
      };

      const result = await withRetry(fn, { maxAttempts: 3, delayMs: 10 });
      expect(result).toBe("sucesso_na_retry");
      expect(attempts).toBe(2);
    });

    it("deve lançar exceção se todas as tentativas falharem", async () => {
      const fn = async () => {
        throw new Error("Falha persistente");
      };

      await expect(withRetry(fn, { maxAttempts: 2, delayMs: 10 })).rejects.toThrow("Falha persistente");
    });
  });

  describe("Transactional Event Outbox Pattern", () => {
    it("deve enfileirar e processar eventos no Outbox", async () => {
      const msg = transactionalOutbox.enqueue("emp-1", "PEDIDO_CONCLUIDO", { id: "ped-999" });
      expect(msg.status).toBe("pending");

      const count = await transactionalOutbox.processPendingMessages();
      expect(count).toBeGreaterThan(0);
      expect(msg.status).toBe("processed");
    });
  });
});
