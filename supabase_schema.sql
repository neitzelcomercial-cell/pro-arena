-- ============================================================
-- ARENA SQUAD - Supabase Schema
-- Execute este SQL no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Tabela de Reservas (horários do calendário)
CREATE TABLE IF NOT EXISTS reservas (
  slot_key TEXT PRIMARY KEY,          -- "YYYY-MM-DD-HH:MM"
  nome TEXT NOT NULL DEFAULT '',
  tel TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  time TEXT NOT NULL DEFAULT '',
  estilo TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL DEFAULT '',
  num_jog INTEGER NOT NULL DEFAULT 0,
  senha TEXT NOT NULL DEFAULT '',
  vagas JSONB NOT NULL DEFAULT '[]',
  pago BOOLEAN NOT NULL DEFAULT false,
  timestamp BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para buscar por data
CREATE INDEX IF NOT EXISTS idx_reservas_date ON reservas (date);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reservas_updated_at ON reservas;
CREATE TRIGGER trg_reservas_updated_at
  BEFORE UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Tabela de Pedidos da Loja
CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,                -- código único do pedido
  cliente TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL DEFAULT '',
  data_retirada TEXT NOT NULL DEFAULT '',
  data_pedido TEXT NOT NULL DEFAULT '',
  itens JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  obs TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos (data_retirada);

-- 3. Tabela de Estoque (produtos físicos)
CREATE TABLE IF NOT EXISTS estoque (
  id TEXT PRIMARY KEY,                -- id do produto
  quantidade INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_estoque_updated_at ON estoque;
CREATE TRIGGER trg_estoque_updated_at
  BEFORE UPDATE ON estoque
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Tabela de Produtos Físicos (catálogo)
CREATE TABLE IF NOT EXISTS produtos (
  id TEXT PRIMARY KEY,                -- id do produto
  cat TEXT NOT NULL DEFAULT 'outros',
  nome TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  desc_curta TEXT NOT NULL DEFAULT '',
  desc_longa TEXT NOT NULL DEFAULT '',
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  ico TEXT NOT NULL DEFAULT '◆',
  badge TEXT,
  est INTEGER NOT NULL DEFAULT 0,
  imagem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_produtos_updated_at ON produtos;
CREATE TRIGGER trg_produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Tabela de Configurações (chave PIX, etc.)
CREATE TABLE IF NOT EXISTS config (
  chave TEXT PRIMARY KEY,             -- 'pix', 'admin_password', etc
  valor TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_config_updated_at ON config;
CREATE TRIGGER trg_config_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Inserir configuração padrão da chave PIX
INSERT INTO config (chave, valor)
VALUES ('pix', '00.000.000/0001-00')
ON CONFLICT (chave) DO NOTHING;

-- 6. Ativar Realtime para todas as tabelas
-- Use a interface: Project Settings > Realtime > Replication
-- Ative MANUALMENTE: reservas, pedidos, estoque, produtos, config

-- (Comandos abaixo podem falhar se a publicação já existir - é normal)
-- ALTER PUBLICATION supabase_realtime ADD TABLE reservas;
-- ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
-- ALTER PUBLICATION supabase_realtime ADD TABLE estoque;
-- ALTER PUBLICATION supabase_realtime ADD TABLE produtos;
-- ALTER PUBLICATION supabase_realtime ADD TABLE config;
