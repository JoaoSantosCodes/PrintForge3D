-- =============================================================================
-- PRINTFORGE 3D — SCRIPT DE ROW LEVEL SECURITY (RLS) PARA SUPABASE POSTGRESQL
-- =============================================================================
-- Este script habilita a política RLS no banco de dados para garantir isolamento
-- estrito entre empresas (multi-tenant) no nível de tabela do PostgreSQL.

-- 1. Habilitar RLS em todas as tabelas multiempresa
ALTER TABLE "Empresa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Printer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Filament" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FilamentPriceHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tinta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Peca" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pedido" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cupom" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Configuracao" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RewardTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RewardRedemption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AchievementUnlocked" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MissionProgress" ENABLE ROW LEVEL SECURITY;

-- 2. Política de Isolamento para Impressoras (Printer)
DROP POLICY IF EXISTS tenant_isolation_printer ON "Printer";
CREATE POLICY tenant_isolation_printer ON "Printer"
  FOR ALL
  USING (
    "empresaId" = (current_setting('request.jwt.claims', true)::json ->> 'empresa_id')
    OR current_setting('request.jwt.claims', true)::json ->> 'role' = 'super_admin'
  );

-- 3. Política de Isolamento para Filamentos (Filament)
DROP POLICY IF EXISTS tenant_isolation_filament ON "Filament";
CREATE POLICY tenant_isolation_filament ON "Filament"
  FOR ALL
  USING (
    "empresaId" = (current_setting('request.jwt.claims', true)::json ->> 'empresa_id')
    OR current_setting('request.jwt.claims', true)::json ->> 'role' = 'super_admin'
  );

-- 4. Política de Isolamento para Peças (Peca)
DROP POLICY IF EXISTS tenant_isolation_peca ON "Peca";
CREATE POLICY tenant_isolation_peca ON "Peca"
  FOR ALL
  USING (
    "empresaId" = (current_setting('request.jwt.claims', true)::json ->> 'empresa_id')
    OR "publicada" = true
    OR current_setting('request.jwt.claims', true)::json ->> 'role' = 'super_admin'
  );

-- 5. Política de Isolamento para Pedidos (Pedido)
DROP POLICY IF EXISTS tenant_isolation_pedido ON "Pedido";
CREATE POLICY tenant_isolation_pedido ON "Pedido"
  FOR ALL
  USING (
    "empresaId" = (current_setting('request.jwt.claims', true)::json ->> 'empresa_id')
    OR "usuarioId" = auth.uid()::text
    OR current_setting('request.jwt.claims', true)::json ->> 'role' = 'super_admin'
  );

-- 6. Política de Isolamento para Transações Rewards (RewardTransaction)
DROP POLICY IF EXISTS tenant_isolation_rewards_tx ON "RewardTransaction";
CREATE POLICY tenant_isolation_rewards_tx ON "RewardTransaction"
  FOR ALL
  USING (
    "empresaId" = (current_setting('request.jwt.claims', true)::json ->> 'empresa_id')
    OR current_setting('request.jwt.claims', true)::json ->> 'role' = 'super_admin'
  );
