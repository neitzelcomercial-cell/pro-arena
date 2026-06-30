-- ============================================================
-- ARENA SQUAD - Políticas de Segurança (RLS) para Anônimos
-- Permite que qualquer usuário (anon key) leia/escreva dados
-- ============================================================

-- 1. RESERVAS
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon pode ler reservas" ON reservas;
CREATE POLICY "Anon pode ler reservas" ON reservas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon pode inserir reservas" ON reservas;
CREATE POLICY "Anon pode inserir reservas" ON reservas
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon pode atualizar reservas" ON reservas;
CREATE POLICY "Anon pode atualizar reservas" ON reservas
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anon pode deletar reservas" ON reservas;
CREATE POLICY "Anon pode deletar reservas" ON reservas
  FOR DELETE USING (true);

-- 2. PEDIDOS
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon pode ler pedidos" ON pedidos;
CREATE POLICY "Anon pode ler pedidos" ON pedidos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon pode inserir pedidos" ON pedidos;
CREATE POLICY "Anon pode inserir pedidos" ON pedidos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon pode atualizar pedidos" ON pedidos;
CREATE POLICY "Anon pode atualizar pedidos" ON pedidos
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anon pode deletar pedidos" ON pedidos;
CREATE POLICY "Anon pode deletar pedidos" ON pedidos
  FOR DELETE USING (true);

-- 3. ESTOQUE
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon pode ler estoque" ON estoque;
CREATE POLICY "Anon pode ler estoque" ON estoque
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon pode inserir estoque" ON estoque;
CREATE POLICY "Anon pode inserir estoque" ON estoque
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon pode atualizar estoque" ON estoque;
CREATE POLICY "Anon pode atualizar estoque" ON estoque
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anon pode deletar estoque" ON estoque;
CREATE POLICY "Anon pode deletar estoque" ON estoque
  FOR DELETE USING (true);

-- 4. PRODUTOS
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon pode ler produtos" ON produtos;
CREATE POLICY "Anon pode ler produtos" ON produtos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon pode inserir produtos" ON produtos;
CREATE POLICY "Anon pode inserir produtos" ON produtos
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon pode atualizar produtos" ON produtos;
CREATE POLICY "Anon pode atualizar produtos" ON produtos
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anon pode deletar produtos" ON produtos;
CREATE POLICY "Anon pode deletar produtos" ON produtos
  FOR DELETE USING (true);

-- 5. CONFIG
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon pode ler config" ON config;
CREATE POLICY "Anon pode ler config" ON config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon pode inserir config" ON config;
CREATE POLICY "Anon pode inserir config" ON config
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon pode atualizar config" ON config;
CREATE POLICY "Anon pode atualizar config" ON config
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anon pode deletar config" ON config;
CREATE POLICY "Anon pode deletar config" ON config
  FOR DELETE USING (true);

-- ============================================================
-- Realtime - Ativar publicação para todas as tabelas
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE reservas;
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE estoque;
ALTER PUBLICATION supabase_realtime ADD TABLE produtos;
ALTER PUBLICATION supabase_realtime ADD TABLE config;
