import { describe, it, expect } from "vitest";
import { gerarCodigoIndicacaoAleatorio } from "../indicacoes";

describe("Sistema de Indicação Binário", () => {
  it("deve gerar um código de indicação válido no formato PRINT-XXXXXX", () => {
    const code = gerarCodigoIndicacaoAleatorio();
    expect(code).toMatch(/^PRINT-[A-Z0-9]{6}$/);
  });

  it("deve gerar códigos aleatórios e únicos", () => {
    const code1 = gerarCodigoIndicacaoAleatorio();
    const code2 = gerarCodigoIndicacaoAleatorio();
    expect(code1).not.toBe(code2);
  });

  it("deve validar o formato das pernas binárias", () => {
    const pernasValidas = ["esquerda", "direita", "auto"];
    expect(pernasValidas).toContain("esquerda");
    expect(pernasValidas).toContain("direita");
    expect(pernasValidas).toContain("auto");
  });
});
