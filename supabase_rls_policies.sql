-- ============================================================
-- ARENA SQUAD - Correção de permissões RLS definitiva
-- Execute TUDO no SQL Editor do Supabase
-- ============================================================

-- 1. Primeiro, garantir que RLS está habilitado nas tabelas
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver) e criar novas
-- Isso evita erro "policy already exists"

-- RESERVAS
DROP POLICY IF EXISTS "Anon select reservas" ON reservas;
DROP POLICY IF EXISTS "Anon insert reservas" ON reservas;
DROP POLICY IF EXISTS "Anon update reservas" ON reservas;
DROP POLICY IF EXISTS "Anon delete reservas" ON reservas;

CREATE POLICY "Anon select reservas" ON reservas FOR SELECT USING (true);
CREATE POLICY "Anon insert reservas" ON reservas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update reservas" ON reservas FOR UPDATE USING (true);
CREATE POLICY "Anon delete reservas" ON reservas FOR DELETE USING (true);

-- PEDIDOS
DROP POLICY IF EXISTS "Anon select pedidos" ON pedidos;
DROP POLICY IF EXISTS "Anon insert pedidos" ON pedidos;
DROP POLICY IF EXISTS "Anon update pedidos" ON pedidos;
DROP POLICY IF EXISTS "Anon delete pedidos" ON pedidos;

CREATE POLICY "Anon select pedidos" ON pedidos FOR SELECT USING (true);
CREATE POLICY "Anon insert pedidos" ON pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update pedidos" ON pedidos FOR UPDATE USING (true);
CREATE POLICY "Anon delete pedidos" ON pedidos FOR DELETE USING (true);

-- ESTOQUE
DROP POLICY IF EXISTS "Anon select estoque" ON estoque;
DROP POLICY IF EXISTS "Anon insert estoque" ON estoque;
DROP POLICY IF EXISTS "Anon update estoque" ON estoque;
DROP POLICY IF EXISTS "Anon delete estoque" ON estoque;

CREATE POLICY "Anon select estoque" ON estoque FOR SELECT USING (true);
CREATE POLICY "Anon insert estoque" ON estoque FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update estoque" ON estoque FOR UPDATE USING (true);
CREATE POLICY "Anon delete estoque" ON estoque FOR DELETE USING (true);

-- PRODUTOS
DROP POLICY IF EXISTS "Anon select produtos" ON produtos;
DROP POLICY IF EXISTS "Anon insert produtos" ON produtos;
DROP POLICY IF EXISTS "Anon update produtos" ON produtos;
DROP POLICY IF EXISTS "Anon delete produtos" ON produtos;

CREATE POLICY "Anon select produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Anon insert produtos" ON produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update produtos" ON produtos FOR UPDATE USING (true);
CREATE POLICY "Anon delete produtos" ON produtos FOR DELETE USING (true);

-- CONFIG
DROP POLICY IF EXISTS "Anon select config" ON config;
DROP POLICY IF EXISTS "Anon insert config" ON config;
DROP POLICY IF EXISTS "Anon update config" ON config;
DROP POLICY IF EXISTS "Anon delete config" ON config;

CREATE POLICY "Anon select config" ON config FOR SELECT USING (true);
CREATE POLICY "Anon insert config" ON config FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update config" ON config FOR UPDATE USING (true);
CREATE POLICY "Anon delete config" ON config FOR DELETE USING (true);

-- 3. Realtime - adicionar tabelas à publicação (ignora erro se já existir)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE reservas;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'reservas já está na publicação ou outro erro ignorado';
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pedidos já está na publicação ou outro erro ignorado';
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE estoque;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'estoque já está na publicação ou outro erro ignorado';
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE produtos;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'produtos já está na publicação ou outro erro ignorado';
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE config;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'config já está na publicação ou outro erro ignorado';
  END;
END $$;

-- 4. Bucket Storage "produtos" (para imagens)
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

-- Política do bucket
DROP POLICY IF EXISTS "Acesso publico produtos" ON storage.objects;
CREATE POLICY "Acesso publico produtos" ON storage.objects
  FOR ALL USING (bucket_id = 'produtos') WITH CHECK (bucket_id = 'produtos');

-- ============================================================
-- PRONTO! Agora qualquer usuário pode ler/escrever no banco.
-- Recarregue o site e veja se o indicador verde "online" aparece.
-- ============================================================
