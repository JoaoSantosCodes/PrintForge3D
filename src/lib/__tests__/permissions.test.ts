import { describe, it, expect } from "vitest";
import { hasPermission, PERSONA_DEFINITIONS } from "../permissions";

describe("Sistema de Permissões Granulares & Personas (RBAC)", () => {
  it("deve permitir acesso absoluto para o Super Admin", () => {
    expect(hasPermission("super_admin", "printers:delete")).toBe(true);
    expect(hasPermission("super_admin", "financial:manage")).toBe(true);
    expect(hasPermission("super_admin", "users:remove")).toBe(true);
  });

  it("deve validar as permissões padrão da persona Operador", () => {
    expect(hasPermission("operador", "printers:read")).toBe(true);
    expect(hasPermission("operador", "printers:write")).toBe(true);
    expect(hasPermission("operador", "financial:manage")).toBe(false);
    expect(hasPermission("operador", "users:invite")).toBe(false);
  });

  it("deve validar as permissões padrão da persona Financeiro", () => {
    expect(hasPermission("financeiro", "financial:read")).toBe(true);
    expect(hasPermission("financeiro", "financial:export")).toBe(true);
    expect(hasPermission("financeiro", "printers:delete")).toBe(false);
  });

  it("deve respeitar permissões customizadas concedidas extra à persona", () => {
    // Operador com permissão extra customizada de ajuste de estoque
    const canAdjustInventory = hasPermission("operador", "inventory:adjust", ["inventory:adjust"]);
    expect(canAdjustInventory).toBe(true);
  });

  it("deve conter todas as 9 personas configuradas", () => {
    const keys = Object.keys(PERSONA_DEFINITIONS);
    expect(keys).toContain("super_admin");
    expect(keys).toContain("admin");
    expect(keys).toContain("gerente");
    expect(keys).toContain("operador");
    expect(keys).toContain("designer");
    expect(keys).toContain("estoque");
    expect(keys).toContain("financeiro");
    expect(keys).toContain("comercial");
    expect(keys).toContain("cliente");
  });
});
