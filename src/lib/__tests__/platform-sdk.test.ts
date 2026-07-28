import { describe, it, expect } from "vitest";
import { pluginSDK, PluginManifest } from "../sdk/plugin-manifest";
import { connectorRegistry } from "@/modules/connectors/connector-registry";
import { analisarGeometriaSTL } from "@/modules/ai/services/stlIntelligenceService";
import { generateAPIKey, hashAPIKey } from "../api-keys";
import { signWebhookPayload } from "../webhooks";

describe("PrintForge Platform 1.0 — Ecosystem & SDK Architecture", () => {
  describe("Plugin SDK & Manifest Validator", () => {
    it("deve registrar e validar um plugin válido", () => {
      const manifest: PluginManifest = {
        id: "klipper-plugin",
        name: "Klipper Moonraker Connector",
        version: "1.0.0",
        author: "PrintForge Community",
        permissions: ["printers:read", "events:listen"],
        hooks: ["PEDIDO_CRIADO"],
      };

      const instance = pluginSDK.registerPlugin("emp-1", manifest);
      expect(instance.manifest.id).toBe("klipper-plugin");
      expect(pluginSDK.isPluginEnabled("emp-1", "klipper-plugin")).toBe(true);
    });

    it("deve rejeitar um manifesto inválido sem nome ou id malformatado", () => {
      expect(() =>
        pluginSDK.registerPlugin("emp-1", {
          id: "ID INVALIDO COM ESPACO",
          version: "1.0.0",
          author: "Dev",
          permissions: [],
          hooks: [],
        })
      ).toThrow();
    });
  });

  describe("Connectors Domain Registry", () => {
    it("deve listar os conectores padrão Klipper e OctoPrint", () => {
      const list = connectorRegistry.listConnectors();
      const ids = list.map((c) => c.id);
      expect(ids).toContain("klipper");
      expect(ids).toContain("octoprint");
    });

    it("deve sincronizar o status de uma impressora via conector Klipper", async () => {
      const klipper = connectorRegistry.getConnector("klipper");
      expect(klipper).toBeDefined();

      const status = await klipper!.syncStatus({
        connectorId: "klipper",
        companyId: "emp-1",
        active: true,
        credentials: { hostUrl: "http://192.168.1.50:7125" },
      });

      expect(status.state).toBe("printing");
      expect(status.progressPercent).toBe(42.5);
    });
  });

  describe("STL AI Intelligence Engine", () => {
    it("deve analisar uma geometria STL e gerar insights de precificação e suporte", async () => {
      const res = await analisarGeometriaSTL({
        filename: "action_figure_dragon.stl",
        volumeCm3: 150, // 150 cm3
        boundingBoxMm: { x: 120, y: 120, z: 220 },
        infillPercent: 20,
        materialType: "PLA",
      });

      expect(res.complexidade).toBe("alta");
      expect(res.pesoEstimadoGramas).toBeGreaterThan(50);
      expect(res.tempoEstimadoHoras).toBeGreaterThan(3);
      expect(res.precoSugeridoBRL).toBeGreaterThan(15);
      expect(res.insightsIA.length).toBeGreaterThan(0);
      expect(res.disclaimerEstimativaIA).toContain("fatiador");
    });
  });

  describe("Public API Keys & Signed Webhooks", () => {
    it("deve gerar chave API com prefixo pf_live_ e hash SHA256", () => {
      const { rawKey, keyId, hashedKey } = generateAPIKey("emp-1", "MercadoLivre Integration");
      expect(rawKey).toMatch(/^pf_live_[a-f0-9]{48}$/);
      expect(keyId).toMatch(/^key_[a-f0-9]{16}$/);
      expect(hashAPIKey(rawKey)).toBe(hashedKey);
    });

    it("deve assinar um payload de webhook com HMAC SHA-256", () => {
      const payload = JSON.stringify({ event: "PEDIDO_CRIADO", id: "ped-123" });
      const secret = "whsec_test_secret_key_123";
      const sig = signWebhookPayload(payload, secret);
      expect(sig).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
