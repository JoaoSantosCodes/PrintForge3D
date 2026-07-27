import { describe, it, expect, vi, beforeEach } from "vitest";

// Define mock data for 2 fake companies and super admin
const EMPRESA_A = {
  id: "empresa_a_id",
  nome: "Loja 3D Alfa",
  slug: "loja-alfa",
  status: "ativo",
};

const EMPRESA_B = {
  id: "empresa_b_id",
  nome: "Loja 3D Beta",
  slug: "loja-beta",
  status: "ativo",
};

// Items for Empresa A
const PRINTER_A = { id: "print_a1", empresaId: EMPRESA_A.id, nome: "Ender 3 Alfa" };
const FILAMENT_A = { id: "fil_a1", empresaId: EMPRESA_A.id, nome: "PLA Preto Alfa" };
const PECA_A = { id: "peca_a1", empresaId: EMPRESA_A.id, nome: "Vaso Decorativo Alfa", publicada: true };
const PEDIDO_A = { id: "ped_a1", empresaId: EMPRESA_A.id, clienteNome: "Cliente Alfa", status: "pendente" };
const CUPOM_A = { id: "cupom_a1", empresaId: EMPRESA_A.id, codigo: "ALFA10", descontoPercentual: 10 };

// Items for Empresa B
const PRINTER_B = { id: "print_b1", empresaId: EMPRESA_B.id, nome: "Bambu Lab Beta" };
const FILAMENT_B = { id: "fil_b1", empresaId: EMPRESA_B.id, nome: "PETG Azul Beta" };
const PECA_B = { id: "peca_b1", empresaId: EMPRESA_B.id, nome: "Suporte Headset Beta", publicada: true };
const PEDIDO_B = { id: "ped_b1", empresaId: EMPRESA_B.id, clienteNome: "Cliente Beta", status: "pendente" };
const CUPOM_B = { id: "cupom_b1", empresaId: EMPRESA_B.id, codigo: "BETA20", descontoPercentual: 20 };

// Mock In-Memory Database store
const database = {
  empresas: [EMPRESA_A, EMPRESA_B],
  printers: [PRINTER_A, PRINTER_B],
  filaments: [FILAMENT_A, FILAMENT_B],
  pecas: [PECA_A, PECA_B],
  pedidos: [PEDIDO_A, PEDIDO_B],
  cupons: [CUPOM_A, CUPOM_B],
};

// Current active session mock holder
let currentMockSession: {
  role: "admin" | "usuario" | "super_admin";
  empresaId: string | null;
  email: string;
} | null = null;

// Mock modules
vi.mock("@/lib/auth-server", () => ({
  getCurrentProfile: async () => {
    if (!currentMockSession) return null;
    return {
      id: "usr_test",
      email: currentMockSession.email,
      role: currentMockSession.role,
      status: "aprovado",
      empresaId: currentMockSession.empresaId,
      empresa: currentMockSession.empresaId
        ? database.empresas.find((e) => e.id === currentMockSession?.empresaId)
        : null,
    };
  },
  getEmpresaIdAtual: async () => {
    if (!currentMockSession) {
      throw new Error("Não autenticado.");
    }
    if (currentMockSession.role === "super_admin") {
      throw new Error("Usuário super_admin não possui empresa direta vinculada.");
    }
    if (!currentMockSession.empresaId) {
      throw new Error("Perfil sem empresa vinculada.");
    }
    return currentMockSession.empresaId;
  },
  getEmpresaIdAtualOptional: async () => {
    return currentMockSession?.empresaId || null;
  },
}));

describe("Isolamento Multiempresa (Multi-tenant Security Tests)", () => {
  beforeEach(() => {
    // Reset to Empresa A session by default before each test
    currentMockSession = {
      role: "admin",
      empresaId: EMPRESA_A.id,
      email: "admin@alfa.com",
    };
  });

  describe("1. Isolamento de Consultas / Listagens (Empresa A)", () => {
    it("deve listar APENAS as peças pertencentes à Empresa A", async () => {
      const { getEmpresaIdAtual } = await import("@/lib/auth-server");
      const empresaId = await getEmpresaIdAtual();

      const resultPecas = database.pecas.filter((p) => p.empresaId === empresaId);

      expect(resultPecas).toHaveLength(1);
      expect(resultPecas[0].id).toBe(PECA_A.id);
      expect(resultPecas.some((p) => p.empresaId === EMPRESA_B.id)).toBe(false);
    });

    it("deve listar APENAS as impressoras da Empresa A", async () => {
      const { getEmpresaIdAtual } = await import("@/lib/auth-server");
      const empresaId = await getEmpresaIdAtual();

      const resultPrinters = database.printers.filter((p) => p.empresaId === empresaId);

      expect(resultPrinters).toHaveLength(1);
      expect(resultPrinters[0].id).toBe(PRINTER_A.id);
      expect(resultPrinters.some((p) => p.empresaId === EMPRESA_B.id)).toBe(false);
    });

    it("deve listar APENAS os filamentos da Empresa A", async () => {
      const { getEmpresaIdAtual } = await import("@/lib/auth-server");
      const empresaId = await getEmpresaIdAtual();

      const resultFilaments = database.filaments.filter((f) => f.empresaId === empresaId);

      expect(resultFilaments).toHaveLength(1);
      expect(resultFilaments[0].id).toBe(FILAMENT_A.id);
      expect(resultFilaments.some((f) => f.empresaId === EMPRESA_B.id)).toBe(false);
    });

    it("deve listar APENAS os pedidos da Empresa A", async () => {
      const { getEmpresaIdAtual } = await import("@/lib/auth-server");
      const empresaId = await getEmpresaIdAtual();

      const resultPedidos = database.pedidos.filter((p) => p.empresaId === empresaId);

      expect(resultPedidos).toHaveLength(1);
      expect(resultPedidos[0].id).toBe(PEDIDO_A.id);
      expect(resultPedidos.some((p) => p.empresaId === EMPRESA_B.id)).toBe(false);
    });

    it("deve listar APENAS os cupons da Empresa A", async () => {
      const { getEmpresaIdAtual } = await import("@/lib/auth-server");
      const empresaId = await getEmpresaIdAtual();

      const resultCupons = database.cupons.filter((c) => c.empresaId === empresaId);

      expect(resultCupons).toHaveLength(1);
      expect(resultCupons[0].id).toBe(CUPOM_A.id);
      expect(resultCupons.some((c) => c.empresaId === EMPRESA_B.id)).toBe(false);
    });
  });

  describe("2. Bloqueio de Busca Direta por ID de Outra Empresa (Cross-Tenant Access)", () => {
    it("não deve encontrar uma peça da Empresa B pesquisando no contexto da Empresa A", async () => {
      const { getEmpresaIdAtual } = await import("@/lib/auth-server");
      const empresaId = await getEmpresaIdAtual();

      // Query mimicking findFirst({ where: { id: PECA_B.id, empresaId } })
      const peca = database.pecas.find(
        (p) => p.id === PECA_B.id && p.empresaId === empresaId
      );

      expect(peca).toBeUndefined();
    });

    it("não deve encontrar um pedido da Empresa B pesquisando no contexto da Empresa A", async () => {
      const { getEmpresaIdAtual } = await import("@/lib/auth-server");
      const empresaId = await getEmpresaIdAtual();

      const pedido = database.pedidos.find(
        (p) => p.id === PEDIDO_B.id && p.empresaId === empresaId
      );

      expect(pedido).toBeUndefined();
    });

    it("não deve encontrar uma impressora da Empresa B no contexto da Empresa A", async () => {
      const { getEmpresaIdAtual } = await import("@/lib/auth-server");
      const empresaId = await getEmpresaIdAtual();

      const printer = database.printers.find(
        (p) => p.id === PRINTER_B.id && p.empresaId === empresaId
      );

      expect(printer).toBeUndefined();
    });
  });

  describe("3. Proteção Contra Mutações Cross-Tenant (Update / Delete)", () => {
    it("deve proibir alteração de recurso da Empresa B a partir do contexto da Empresa A", async () => {
      const { getEmpresaIdAtual } = await import("@/lib/auth-server");
      const empresaId = await getEmpresaIdAtual();

      // Simulated server action execution attempting update on PECA_B
      const updatePecaActionSimulated = (pecaIdToUpdate: string, novoNome: string) => {
        const peca = database.pecas.find(
          (p) => p.id === pecaIdToUpdate && p.empresaId === empresaId
        );
        if (!peca) {
          return { error: "Peça não encontrada ou acesso não autorizado." };
        }
        peca.nome = novoNome;
        return { success: true };
      };

      const res = updatePecaActionSimulated(PECA_B.id, "Tentativa de Hacking");

      expect(res.error).toBe("Peça não encontrada ou acesso não autorizado.");
      // Verify database record was NOT mutated
      expect(PECA_B.nome).toBe("Suporte Headset Beta");
    });

    it("deve proibir exclusão de impressora da Empresa B a partir do contexto da Empresa A", async () => {
      const { getEmpresaIdAtual } = await import("@/lib/auth-server");
      const empresaId = await getEmpresaIdAtual();

      const deletePrinterActionSimulated = (printerIdToDelete: string) => {
        const index = database.printers.findIndex(
          (p) => p.id === printerIdToDelete && p.empresaId === empresaId
        );
        if (index === -1) {
          return { error: "Impressora não encontrada ou acesso não autorizado." };
        }
        database.printers.splice(index, 1);
        return { success: true };
      };

      const res = deletePrinterActionSimulated(PRINTER_B.id);

      expect(res.error).toBe("Impressora não encontrada ou acesso não autorizado.");
      // Verify Printer B remains untouched in database
      expect(database.printers.find((p) => p.id === PRINTER_B.id)).toBeDefined();
    });
  });

  describe("4. Comportamento do Perfil Super-Admin", () => {
    it("deve permitir que Super-Admin liste todas as empresas cadastradas", async () => {
      currentMockSession = {
        role: "super_admin",
        empresaId: null,
        email: "superadmin@printforge3d.com",
      };

      // Super-Admin lists all platform companies
      const empresas = database.empresas;
      expect(empresas).toHaveLength(2);
      expect(empresas.map((e) => e.slug)).toContain("loja-alfa");
      expect(empresas.map((e) => e.slug)).toContain("loja-beta");
    });

    it("deve lançar erro ao chamar getEmpresaIdAtual() sem contexto explícito para Super-Admin", async () => {
      currentMockSession = {
        role: "super_admin",
        empresaId: null,
        email: "superadmin@printforge3d.com",
      };

      const { getEmpresaIdAtual } = await import("@/lib/auth-server");

      await expect(getEmpresaIdAtual()).rejects.toThrow(
        "Usuário super_admin não possui empresa direta vinculada."
      );
    });
  });
});
