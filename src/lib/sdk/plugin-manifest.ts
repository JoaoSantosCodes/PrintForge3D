import { z } from "zod";
import { eventBus, DomainEvent, EventPayload } from "../event-bus";
import { logger } from "../logger";

export const PluginPermissionSchema = z.enum([
  "printers:read",
  "printers:write",
  "inventory:read",
  "inventory:write",
  "orders:read",
  "orders:write",
  "rewards:read",
  "events:listen",
  "storage:write",
]);

export type PluginPermission = z.infer<typeof PluginPermissionSchema>;

export const PluginManifestSchema = z.object({
  id: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  version: z.string().min(1),
  author: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(PluginPermissionSchema),
  hooks: z.array(z.string()),
  entryPoint: z.string().optional(),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

export interface ActivePluginInstance {
  manifest: PluginManifest;
  companyId: string;
  enabled: boolean;
  installedAt: string;
  config?: Record<string, unknown>;
}

class PluginSDKRegistry {
  private activePlugins: Map<string, ActivePluginInstance[]> = new Map();

  registerPlugin(companyId: string, manifestInput: unknown, config?: Record<string, unknown>): ActivePluginInstance {
    const manifest = PluginManifestSchema.parse(manifestInput);

    const companyPlugins = this.activePlugins.get(companyId) || [];
    const existingIndex = companyPlugins.findIndex((p) => p.manifest.id === manifest.id);

    const instance: ActivePluginInstance = {
      manifest,
      companyId,
      enabled: true,
      installedAt: new Date().toISOString(),
      config,
    };

    if (existingIndex >= 0) {
      companyPlugins[existingIndex] = instance;
    } else {
      companyPlugins.push(instance);
    }

    this.activePlugins.set(companyId, companyPlugins);

    logger.info(`[PluginSDK] Plugin '${manifest.name}' (${manifest.id}) instalado na empresa ${companyId}`, {
      action: "plugin_registered",
      companyId,
      metadata: { pluginId: manifest.id, permissions: manifest.permissions },
    });

    // Subcrever aos hooks do evento do plugin se tiver permissão events:listen
    if (manifest.permissions.includes("events:listen")) {
      manifest.hooks.forEach((hookName) => {
        eventBus.subscribe(hookName as DomainEvent, async (payload: EventPayload) => {
          if (payload.companyId === companyId) {
            logger.info(`[PluginSDK] Hook '${hookName}' disparado para plugin '${manifest.id}'`, {
              action: "plugin_hook_triggered",
              companyId,
              correlationId: payload.correlationId,
              metadata: { pluginId: manifest.id, event: payload.event },
            });
          }
        });
      });
    }

    return instance;
  }

  getPluginsForCompany(companyId: string): ActivePluginInstance[] {
    return this.activePlugins.get(companyId) || [];
  }

  isPluginEnabled(companyId: string, pluginId: string): boolean {
    const plugins = this.getPluginsForCompany(companyId);
    const p = plugins.find((item) => item.manifest.id === pluginId);
    return p ? p.enabled : false;
  }
}

export const pluginSDK = new PluginSDKRegistry();
