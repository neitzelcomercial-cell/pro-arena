-- ============================================================
-- ARENA SQUAD - Correção de permissões RLS
-- EXECUTE UMA LINHA POR VEZ se preferir
-- ============================================================

-- 1. HABILITAR RLS NAS TABELAS
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS - RESERVAS
DROP POLICY IF EXISTS "Anon select reservas" ON reservas;
CREATE POLICY "Anon select reservas" ON reservas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon insert reservas" ON reservas;
CREATE POLICY "Anon insert reservas" ON reservas FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anon update reservas" ON reservas;
CREATE POLICY "Anon update reservas" ON reservas FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anon delete reservas" ON reservas;
CREATE POLICY "Anon delete reservas" ON reservas FOR DELETE USING (true);

-- 3. POLÍTICAS - PEDIDOS
DROP POLICY IF EXISTS "Anon select pedidos" ON pedidos;
CREATE POLICY "Anon select pedidos" ON pedidos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon insert pedidos" ON pedidos;
CREATE POLICY "Anon insert pedidos" ON pedidos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anon update pedidos" ON pedidos;
CREATE POLICY "Anon update pedidos" ON pedidos FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anon delete pedidos" ON pedidos;
CREATE POLICY "Anon delete pedidos" ON pedidos FOR DELETE USING (true);

-- 4. POLÍTICAS - ESTOQUE
DROP POLICY IF EXISTS "Anon select estoque" ON estoque;
CREATE POLICY "Anon select estoque" ON estoque FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon insert estoque" ON estoque;
CREATE POLICY "Anon insert estoque" ON estoque FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anon update estoque" ON estoque;
CREATE POLICY "Anon update estoque" ON estoque FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anon delete estoque" ON estoque;
CREATE POLICY "Anon delete estoque" ON estoque FOR DELETE USING (true);

-- 5. POLÍTICAS - PRODUTOS
DROP POLICY IF EXISTS "Anon select produtos" ON produtos;
CREATE POLICY "Anon select produtos" ON produtos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon insert produtos" ON produtos;
CREATE POLICY "Anon insert produtos" ON produtos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anon update produtos" ON produtos;
CREATE POLICY "Anon update produtos" ON produtos FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anon delete produtos" ON produtos;
CREATE POLICY "Anon delete produtos" ON produtos FOR DELETE USING (true);

-- 6. POLÍTICAS - CONFIG
DROP POLICY IF EXISTS "Anon select config" ON config;
CREATE POLICY "Anon select config" ON config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anon insert config" ON config;
CREATE POLICY "Anon insert config" ON config FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anon update config" ON config;
CREATE POLICY "Anon update config" ON config FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anon delete config" ON config;
CREATE POLICY "Anon delete config" ON config FOR DELETE USING (true);

-- 7. REALTIME
-- IMPORTANTE: Se a linha abaixo falhar, ative manualmente em:
--    Project Settings > Realtime > Replication
--    Marque as tabelas: reservas, pedidos, estoque, produtos, config
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE reservas;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Tabela reservas ja esta na publicacao ou publicacao nao existe';
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Tabela pedidos ja esta na publicacao ou publicacao nao existe';
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE estoque;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Tabela estoque ja esta na publicacao ou publicacao nao existe';
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE produtos;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Tabela produtos ja esta na publicacao ou publicacao nao existe';
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE config;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Tabela config ja esta na publicacao ou publicacao nao existe';
END $$;

-- 8. BUCKET STORAGE PARA IMAGENS
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Acesso publico produtos" ON storage.objects;
CREATE POLICY "Acesso publico produtos" ON storage.objects
  FOR ALL USING (bucket_id = 'produtos') WITH CHECK (bucket_id = 'produtos');

-- PRONTO! Recarregue o site.
