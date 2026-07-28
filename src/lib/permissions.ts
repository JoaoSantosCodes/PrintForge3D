export type PersonaKey =
  | "super_admin"
  | "admin"
  | "gerente"
  | "operador"
  | "designer"
  | "estoque"
  | "financeiro"
  | "comercial"
  | "cliente";

export type PermissionKey =
  | "printers:read"
  | "printers:write"
  | "printers:delete"
  | "printers:manage"
  | "inventory:read"
  | "inventory:write"
  | "inventory:delete"
  | "inventory:adjust"
  | "financial:read"
  | "financial:export"
  | "financial:manage"
  | "reports:export"
  | "reports:share"
  | "users:invite"
  | "users:remove"
  | "users:edit"
  | "orders:read"
  | "orders:write"
  | "orders:manage"
  | "stl:ai"
  | "rewards:read"
  | "rewards:manage";

export interface PersonaDefinition {
  key: PersonaKey;
  label: string;
  description: string;
  icon: string;
  defaultPermissions: PermissionKey[];
}

export const PERSONA_DEFINITIONS: Record<PersonaKey, PersonaDefinition> = {
  super_admin: {
    key: "super_admin",
    label: "Super Admin",
    description: "Acesso global ilimitado a todas as empresas e configurações do sistema.",
    icon: "ShieldAlert",
    defaultPermissions: [
      "printers:read", "printers:write", "printers:delete", "printers:manage",
      "inventory:read", "inventory:write", "inventory:delete", "inventory:adjust",
      "financial:read", "financial:export", "financial:manage",
      "reports:export", "reports:share",
      "users:invite", "users:remove", "users:edit",
      "orders:read", "orders:write", "orders:manage",
      "stl:ai", "rewards:read", "rewards:manage"
    ],
  },
  admin: {
    key: "admin",
    label: "Administrador da Empresa",
    description: "Gestão completa da empresa, incluindo cadastros, plano e integrações.",
    icon: "Building2",
    defaultPermissions: [
      "printers:read", "printers:write", "printers:delete", "printers:manage",
      "inventory:read", "inventory:write", "inventory:delete", "inventory:adjust",
      "financial:read", "financial:export", "financial:manage",
      "reports:export", "reports:share",
      "users:invite", "users:remove", "users:edit",
      "orders:read", "orders:write", "orders:manage",
      "stl:ai", "rewards:read", "rewards:manage"
    ],
  },
  gerente: {
    key: "gerente",
    label: "Gerente Operacional",
    description: "Gerencia a produção, aprova pedidos e acompanha métricas operacionais.",
    icon: "Briefcase",
    defaultPermissions: [
      "printers:read", "printers:write", "printers:manage",
      "inventory:read", "inventory:write", "inventory:adjust",
      "financial:read",
      "reports:export",
      "users:invite",
      "orders:read", "orders:write", "orders:manage",
      "stl:ai", "rewards:read"
    ],
  },
  operador: {
    key: "operador",
    label: "Operador de Chão de Fábrica",
    description: "Interface ultra-simples para iniciar, pausar e concluir impressões.",
    icon: "Printer",
    defaultPermissions: [
      "printers:read", "printers:write",
      "inventory:read",
      "orders:read"
    ],
  },
  designer: {
    key: "designer",
    label: "Designer 3D",
    description: "Foco na gestão de arquivos STL, 3MF e análise de inteligência geométrica.",
    icon: "Palette",
    defaultPermissions: [
      "printers:read",
      "inventory:read",
      "stl:ai",
      "orders:read"
    ],
  },
  estoque: {
    key: "estoque",
    label: "Gerente de Estoque",
    description: "Controle de entrada, saída e movimentação de filamentos e tintas.",
    icon: "Package",
    defaultPermissions: [
      "inventory:read", "inventory:write", "inventory:delete", "inventory:adjust",
      "printers:read"
    ],
  },
  financeiro: {
    key: "financeiro",
    label: "Analista Financeiro",
    description: "Acesso a DRE, receitas, despesas e emissão de relatórios fiscais.",
    icon: "DollarSign",
    defaultPermissions: [
      "financial:read", "financial:export", "financial:manage",
      "reports:export", "reports:share",
      "orders:read"
    ],
  },
  comercial: {
    key: "comercial",
    label: "Consultor Comercial / Vendas",
    description: "Gestão de orçamentos, CRM de clientes e recepção de encomendas.",
    icon: "Users",
    defaultPermissions: [
      "orders:read", "orders:write", "orders:manage",
      "inventory:read",
      "rewards:read"
    ],
  },
  cliente: {
    key: "cliente",
    label: "Cliente Final",
    description: "Acompanhamento transparente dos pedidos em andamento.",
    icon: "User",
    defaultPermissions: [
      "orders:read"
    ],
  },
};

export function hasPermission(
  persona: PersonaKey | string,
  requiredPermission: PermissionKey,
  customPermissions?: PermissionKey[]
): boolean {
  if (persona === "super_admin") return true;

  if (customPermissions && customPermissions.includes(requiredPermission)) {
    return true;
  }

  const def = PERSONA_DEFINITIONS[persona as PersonaKey];
  if (!def) return false;

  return def.defaultPermissions.includes(requiredPermission);
}
