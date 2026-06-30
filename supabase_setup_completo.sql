-- ============================================================
-- ARENA SQUAD - Setup Completo do Supabase
-- Execute TUDO no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Função trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Tabela de Reservas
CREATE TABLE IF NOT EXISTS reservas (
  slot_key TEXT PRIMARY KEY,
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
CREATE INDEX IF NOT EXISTS idx_reservas_date ON reservas (date);
DROP TRIGGER IF EXISTS trg_reservas_updated_at ON reservas;
CREATE TRIGGER trg_reservas_updated_at BEFORE UPDATE ON reservas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,
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

-- 4. Tabela de Estoque
CREATE TABLE IF NOT EXISTS estoque (
  id TEXT PRIMARY KEY,
  quantidade INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS trg_estoque_updated_at ON estoque;
CREATE TRIGGER trg_estoque_updated_at BEFORE UPDATE ON estoque FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Tabela de Produtos (com imagem_url para Storage)
CREATE TABLE IF NOT EXISTS produtos (
  id TEXT PRIMARY KEY,
  cat TEXT NOT NULL DEFAULT 'outros',
  nome TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  desc_curta TEXT NOT NULL DEFAULT '',
  desc_longa TEXT NOT NULL DEFAULT '',
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  ico TEXT NOT NULL DEFAULT '◆',
  badge TEXT,
  est INTEGER NOT NULL DEFAULT 0,
  imagem_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS trg_produtos_updated_at ON produtos;
CREATE TRIGGER trg_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Tabela de Config
CREATE TABLE IF NOT EXISTS config (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS trg_config_updated_at ON config;
CREATE TRIGGER trg_config_updated_at BEFORE UPDATE ON config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO config (chave, valor) VALUES ('pix', '00.000.000/0001-00') ON CONFLICT (chave) DO NOTHING;

-- ============================================================
-- 7. ATIVAR REPLICAÇÃO EM TEMPO REAL
-- Execute isso para ativar o Realtime nas tabelas
-- ============================================================
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE reservas;
  ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
  ALTER PUBLICATION supabase_realtime ADD TABLE estoque;
  ALTER PUBLICATION supabase_realtime ADD TABLE produtos;
  ALTER PUBLICATION supabase_realtime ADD TABLE config;
COMMIT;

-- ============================================================
-- 8. CRIAR BUCKET DE STORAGE PARA IMAGENS
-- Acesse: Storage > Create bucket "produtos" (público)
-- Política:
--   - Nome: "Acesso público produtos"
--   - Allowed operations: SELECT, INSERT, UPDATE, DELETE
--   - Policy definition: true
-- ============================================================
-- Alternativamente, execute no SQL Editor:
INSERT INTO storage.buckets (id, name, public) VALUES ('produtos', 'produtos', true) ON CONFLICT (id) DO NOTHING;

-- Permitir upload anônimo para produtos
DROP POLICY IF EXISTS "Acesso publico produtos" ON storage.objects;
CREATE POLICY "Acesso publico produtos" ON storage.objects
  FOR ALL USING (bucket_id = 'produtos') WITH CHECK (bucket_id = 'produtos');
