import { logger } from "./logger";
import { eventBus, DomainEvent, EventPayload } from "./event-bus";

export type AutomationTrigger =
  | "ESTOQUE_BAIXO"
  | "PEDIDO_PAGO"
  | "IMPRESSAO_CONCLUIDA"
  | "RECOMPENSA_RESGATADA"
  | "FALHA_IMPRESSAO";

export type AutomationAction =
  | "ENVIAR_WHATSAPP"
  | "CRIAR_NOTIFICACAO"
  | "ABRIR_ORDEM_COMPRA"
  | "DISPARAR_WEBHOOK"
  | "REORGANIZAR_FILA_IA";

export interface AutomationRule {
  id: string;
  name: string;
  companyId: string;
  trigger: AutomationTrigger;
  active: boolean;
  conditions?: Record<string, unknown>;
  actions: {
    type: AutomationAction;
    target?: string;
    template?: string;
  }[];
}

class AutomationsEngine {
  private rules: Map<string, AutomationRule[]> = new Map();

  constructor() {
    // Escutar eventos do Domain Event Bus para disparar automações
    eventBus.subscribe("PEDIDO_CONCLUIDO", async (payload) => {
      await this.evaluateTrigger("IMPRESSAO_CONCLUIDA", payload);
    });

    eventBus.subscribe("ESTOQUE_BAIXADO", async (payload) => {
      await this.evaluateTrigger("ESTOQUE_BAIXO", payload);
    });
  }

  registerRule(rule: AutomationRule): AutomationRule {
    const list = this.rules.get(rule.companyId) || [];
    list.push(rule);
    this.rules.set(rule.companyId, list);

    logger.info(`[Automations] Regra '${rule.name}' criada para a empresa ${rule.companyId}`, {
      action: "automation_registered",
      companyId: rule.companyId,
      metadata: { ruleId: rule.id, trigger: rule.trigger, actionsCount: rule.actions.length },
    });

    return rule;
  }

  getRulesForCompany(companyId: string): AutomationRule[] {
    return this.rules.get(companyId) || [];
  }

  async evaluateTrigger(trigger: AutomationTrigger, payload: EventPayload): Promise<number> {
    const rules = this.getRulesForCompany(payload.companyId).filter(
      (r) => r.active && r.trigger === trigger
    );

    let executedCount = 0;

    for (const rule of rules) {
      logger.info(`[Automations] Executando regra '${rule.name}' (${rule.id})`, {
        action: "automation_executed",
        companyId: payload.companyId,
        correlationId: payload.correlationId,
        metadata: { trigger, actions: rule.actions.map((a) => a.type) },
      });

      for (const action of rule.actions) {
        await this.executeAction(action, payload);
      }

      executedCount++;
    }

    return executedCount;
  }

  private async executeAction(
    action: AutomationRule["actions"][0],
    payload: EventPayload
  ): Promise<void> {
    logger.info(`[Automations Action] Ação ${action.type} executada`, {
      action: `auto_action_${action.type.toLowerCase()}`,
      companyId: payload.companyId,
      correlationId: payload.correlationId,
      metadata: { target: action.target, payloadData: payload.data },
    });
  }
}

export const automationsEngine = new AutomationsEngine();
