-- ============================================================
-- ARENA SQUAD - CORREÇÃO DE PERMISSÕES (SIMPLIFICADO)
-- Copie e cole TUDO no SQL Editor e clique em RUN
-- ============================================================

-- HABILITAR RLS
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- REMOVER POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Anon pode ler reservas" ON reservas;
DROP POLICY IF EXISTS "Anon pode inserir reservas" ON reservas;
DROP POLICY IF EXISTS "Anon pode atualizar reservas" ON reservas;
DROP POLICY IF EXISTS "Anon pode deletar reservas" ON reservas;
DROP POLICY IF EXISTS "Anon pode ler pedidos" ON pedidos;
DROP POLICY IF EXISTS "Anon pode inserir pedidos" ON pedidos;
DROP POLICY IF EXISTS "Anon pode atualizar pedidos" ON pedidos;
DROP POLICY IF EXISTS "Anon pode deletar pedidos" ON pedidos;
DROP POLICY IF EXISTS "Anon pode ler estoque" ON estoque;
DROP POLICY IF EXISTS "Anon pode inserir estoque" ON estoque;
DROP POLICY IF EXISTS "Anon pode atualizar estoque" ON estoque;
DROP POLICY IF EXISTS "Anon pode deletar estoque" ON estoque;
DROP POLICY IF EXISTS "Anon pode ler produtos" ON produtos;
DROP POLICY IF EXISTS "Anon pode inserir produtos" ON produtos;
DROP POLICY IF EXISTS "Anon pode atualizar produtos" ON produtos;
DROP POLICY IF EXISTS "Anon pode deletar produtos" ON produtos;
DROP POLICY IF EXISTS "Anon pode ler config" ON config;
DROP POLICY IF EXISTS "Anon pode inserir config" ON config;
DROP POLICY IF EXISTS "Anon pode atualizar config" ON config;
DROP POLICY IF EXISTS "Anon pode deletar config" ON config;

-- CRIAR POLÍTICAS NOVAS (TODAS PERMITEM ANÔNIMOS)
CREATE POLICY "Anon pode ler reservas" ON reservas FOR SELECT USING (true);
CREATE POLICY "Anon pode inserir reservas" ON reservas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon pode atualizar reservas" ON reservas FOR UPDATE USING (true);
CREATE POLICY "Anon pode deletar reservas" ON reservas FOR DELETE USING (true);

CREATE POLICY "Anon pode ler pedidos" ON pedidos FOR SELECT USING (true);
CREATE POLICY "Anon pode inserir pedidos" ON pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon pode atualizar pedidos" ON pedidos FOR UPDATE USING (true);
CREATE POLICY "Anon pode deletar pedidos" ON pedidos FOR DELETE USING (true);

CREATE POLICY "Anon pode ler estoque" ON estoque FOR SELECT USING (true);
CREATE POLICY "Anon pode inserir estoque" ON estoque FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon pode atualizar estoque" ON estoque FOR UPDATE USING (true);
CREATE POLICY "Anon pode deletar estoque" ON estoque FOR DELETE USING (true);

CREATE POLICY "Anon pode ler produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Anon pode inserir produtos" ON produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon pode atualizar produtos" ON produtos FOR UPDATE USING (true);
CREATE POLICY "Anon pode deletar produtos" ON produtos FOR DELETE USING (true);

CREATE POLICY "Anon pode ler config" ON config FOR SELECT USING (true);
CREATE POLICY "Anon pode inserir config" ON config FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon pode atualizar config" ON config FOR UPDATE USING (true);
CREATE POLICY "Anon pode deletar config" ON config FOR DELETE USING (true);

-- STORAGE BUCKET (para imagens dos produtos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Acesso publico produtos" ON storage.objects;
CREATE POLICY "Acesso publico produtos" ON storage.objects
  FOR ALL USING (bucket_id = 'produtos') WITH CHECK (bucket_id = 'produtos');
