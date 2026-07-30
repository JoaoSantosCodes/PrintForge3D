-- ==============================================================================
-- PRINTFORGE DATA PLATFORM (PFDP 1.0) — EXTENSÕES & ÍNDICES ENTERPRISE
-- ==============================================================================

-- 1. Habilitar Extensões de Alta Performance do PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Criar Índices GIN de Busca por Trigramas (pg_trgm)
CREATE INDEX IF NOT EXISTS idx_peca_nome_trgm ON "Peca" USING gin (nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_digital_asset_nome_trgm ON "DigitalAsset" USING gin (nome gin_trgm_ops);

-- 3. Índices Compostos Multi-Tenant de Alta Concorrência
CREATE INDEX IF NOT EXISTS idx_timeline_empresa_entity ON "TimelineEvent" (empresa_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_printer_telemetry_empresa_time ON "PrinterTelemetry" (empresa_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_digital_asset_hash ON "DigitalAsset" (hash_sha256);
