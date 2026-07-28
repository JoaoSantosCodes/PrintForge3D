import { logger } from "@/lib/logger";

export interface AiAgent {
  id: string;
  name: string;
  domain: "production" | "finance" | "inventory" | "sales" | "support";
  description: string;
  status: "active" | "idle" | "learning";
  tasksCompletedToday: number;
}

export async function getAiWorkforceStatus(companyId: string): Promise<AiAgent[]> {
  return [
    {
      id: "agent-prod",
      name: "AI Production Agent",
      domain: "production",
      description: "Otimiza a fila de fatiamento, aloca jobs e prevê manutenção de bicos.",
      status: "active",
      tasksCompletedToday: 42,
    },
    {
      id: "agent-fin",
      name: "AI Finance Agent",
      domain: "finance",
      description: "Analisa o DRE, recalcula custos fixos/variáveis e identifica inadimplência.",
      status: "active",
      tasksCompletedToday: 18,
    },
    {
      id: "agent-inv",
      name: "AI Inventory Agent",
      domain: "inventory",
      description: "Calcula a taxa de consumo de filamentos/tintas e gera ordens de compra.",
      status: "active",
      tasksCompletedToday: 29,
    },
    {
      id: "agent-sales",
      name: "AI Sales & CRM Agent",
      domain: "sales",
      description: "Gera orçamentos inteligentes, responde clientes e calcula margem de venda.",
      status: "idle",
      tasksCompletedToday: 15,
    },
  ];
}
