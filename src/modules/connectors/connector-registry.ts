import { logger } from "@/lib/logger";

export type ConnectorType =
  | "klipper"
  | "octoprint"
  | "bambu"
  | "orcaslicer"
  | "mercadolivre"
  | "shopee"
  | "whatsapp"
  | "correios"
  | "stripe"
  | "mercadopago";

export interface ConnectorMetadata {
  id: ConnectorType;
  name: string;
  category: "3d_printer_server" | "ecommerce" | "logistics" | "payment";
  description: string;
  icon: string;
  version: string;
}

export interface ConnectorConfig {
  connectorId: ConnectorType;
  companyId: string;
  active: boolean;
  credentials: Record<string, string>; // ex: apiKey, hostUrl, accessToken, webhookSecret
  settings?: Record<string, unknown>;
}

export interface PrinterStatusPayload {
  printerName: string;
  state: "idle" | "printing" | "paused" | "error" | "offline";
  progressPercent: number;
  currentFile?: string;
  targetTempNozzle?: number;
  actualTempNozzle?: number;
  targetTempBed?: number;
  actualTempBed?: number;
  printTimeSeconds?: number;
  timeRemainingSeconds?: number;
}

export abstract class BaseConnector {
  abstract readonly metadata: ConnectorMetadata;

  abstract testConnection(config: ConnectorConfig): Promise<{ success: boolean; message: string }>;
  abstract syncStatus(config: ConnectorConfig): Promise<PrinterStatusPayload | Record<string, unknown>>;
}

class ConnectorRegistry {
  private connectors: Map<ConnectorType, BaseConnector> = new Map();
  private companyConfigs: Map<string, Map<ConnectorType, ConnectorConfig>> = new Map();

  registerConnector(connector: BaseConnector) {
    this.connectors.set(connector.metadata.id, connector);
    logger.info(`[Connectors] Conector '${connector.metadata.name}' registrado com sucesso.`, {
      action: "connector_registered",
      metadata: { connectorId: connector.metadata.id, category: connector.metadata.category },
    });
  }

  getConnector(type: ConnectorType): BaseConnector | undefined {
    return this.connectors.get(type);
  }

  listConnectors(): ConnectorMetadata[] {
    return Array.from(this.connectors.values()).map((c) => c.metadata);
  }

  setCompanyConfig(companyId: string, config: ConnectorConfig) {
    const companyMap = this.companyConfigs.get(companyId) || new Map();
    companyMap.set(config.connectorId, config);
    this.companyConfigs.set(companyId, companyMap);
  }

  getCompanyConfig(companyId: string, type: ConnectorType): ConnectorConfig | undefined {
    return this.companyConfigs.get(companyId)?.get(type);
  }
}

export const connectorRegistry = new ConnectorRegistry();

// Mock / Sample Implementações para Klipper e OctoPrint
export class KlipperMoonrakerConnector extends BaseConnector {
  readonly metadata: ConnectorMetadata = {
    id: "klipper",
    name: "Klipper (Moonraker)",
    category: "3d_printer_server",
    description: "Conexão direta com firmware Klipper via API REST/WebSocket Moonraker.",
    icon: "Cpu",
    version: "1.0.0",
  };

  async testConnection(config: ConnectorConfig): Promise<{ success: boolean; message: string }> {
    const host = config.credentials.hostUrl || "http://localhost:7125";
    return { success: true, message: `Conexão bem sucedida com Moonraker em ${host}` };
  }

  async syncStatus(config: ConnectorConfig): Promise<PrinterStatusPayload> {
    return {
      printerName: "Ender 3 Klipper Pro",
      state: "printing",
      progressPercent: 42.5,
      currentFile: "suporte_capa.gcode",
      actualTempNozzle: 205.2,
      targetTempNozzle: 205.0,
      actualTempBed: 60.1,
      targetTempBed: 60.0,
      printTimeSeconds: 3600,
      timeRemainingSeconds: 4800,
    };
  }
}

export class OctoPrintConnector extends BaseConnector {
  readonly metadata: ConnectorMetadata = {
    id: "octoprint",
    name: "OctoPrint Server",
    category: "3d_printer_server",
    description: "Integração via REST API para gerenciamento remoto do OctoPrint.",
    icon: "Printer",
    version: "1.0.0",
  };

  async testConnection(config: ConnectorConfig): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "Conexão estabelecida com servidor OctoPrint." };
  }

  async syncStatus(config: ConnectorConfig): Promise<PrinterStatusPayload> {
    return {
      printerName: "Voron 2.4",
      state: "idle",
      progressPercent: 100,
      actualTempNozzle: 25.0,
      targetTempNozzle: 0,
      actualTempBed: 24.5,
      targetTempBed: 0,
    };
  }
}

// Registrar conectores padrão
connectorRegistry.registerConnector(new KlipperMoonrakerConnector());
connectorRegistry.registerConnector(new OctoPrintConnector());
