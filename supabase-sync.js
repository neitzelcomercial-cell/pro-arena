// ============================================================
// ARENA SQUAD - Supabase Sync Layer v2
// Sincroniza dados entre dispositivos + Storage para imagens
// ============================================================

console.log('[SYNC] supabase-sync.js v2 carregado!');

const SUPABASE_URL = 'https://fjuxuqcvuafshfaejggl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdXh1cWN2dWFmc2hmYWVqZ2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTkwMDYsImV4cCI6MjA5ODA3NTAwNn0.t-dM3Kv-toU2WeM_Bew94suPjcjbdSVzggy1uCRPopY';

let supabase = null;
if (!window.supabase) {
  console.error('[SYNC] ERRO: Supabase SDK nao carregado!');
} else {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 10 } },
    auth: { persistSession: false }
  });
}

const SYNC = {
  ready: false,
  loading: true,
  error: null,
  onReservasChanged: null,
  onPedidosChanged: null,
  onEstoqueChanged: null,
  onConfigChanged: null,
  onProdutosChanged: null,
};

// ============================================================
// UTILITARIOS
// ============================================================

function rowToReserva(row) {
  return {
    nome: row.nome || '',
    tel: row.tel || '',
    date: row.date || '',
    time: row.time || '',
    estilo: row.estilo || '',
    tipo: row.tipo || '',
    numJog: row.num_jog || 0,
    senha: row.senha || '',
    vagas: row.vagas || [],
    pago: row.pago || false,
    timestamp: row.timestamp || 0,
  };
}

function reservaToRow(key, r) {
  return {
    slot_key: key,
    nome: r.nome || '',
    tel: r.tel || '',
    date: r.date || '',
    time: r.time || '',
    estilo: r.estilo || '',
    tipo: r.tipo || '',
    num_jog: r.numJog || 0,
    senha: r.senha || '',
    vagas: r.vagas || [],
    pago: r.pago || false,
    timestamp: r.timestamp || Date.now(),
    updated_at: new Date().toISOString(),
  };
}

function rowToPedido(row) {
  return {
    id: row.id,
    cliente: row.cliente || '',
    telefone: row.telefone || '',
    dataRetirada: row.data_retirada || '',
    dataPedido: row.data_pedido || '',
    itens: row.itens || [],
    total: parseFloat(row.total || 0),
    obs: row.obs || '',
  };
}

function pedidoToRow(p) {
  return {
    id: p.id,
    cliente: p.cliente || '',
    telefone: p.telefone || '',
    data_retirada: p.dataRetirada || '',
    data_pedido: p.dataPedido || new Date().toISOString(),
    itens: p.itens || [],
    total: p.total || 0,
    obs: p.obs || '',
  };
}

function produtoToRow(p) {
  return {
    id: p.id,
    cat: p.cat || 'outros',
    nome: p.nome || '',
    descricao: p.desc || '',
    desc_curta: p.descCurta || '',
    desc_longa: p.descLonga || '',
    preco: p.preco || 0,
    ico: p.ico || '◆',
    badge: p.badge || null,
    est: p.est || 0,
    imagem_url: p.imagem || null,
  };
}

function rowToProduto(row) {
  return {
    id: row.id,
    cat: row.cat || 'outros',
    nome: row.nome || '',
    desc: row.descricao || '',
    descCurta: row.desc_curta || '',
    descLonga: row.desc_longa || '',
    preco: parseFloat(row.preco || 0),
    ico: row.ico || '◆',
    badge: row.badge || null,
    est: row.est || 0,
    imagem: row.imagem_url || null,
  };
}

// ============================================================
// STORAGE - UPLOAD DE IMAGENS
// ============================================================

async function syncUploadImagem(file, path) {
  try {
    const { data, error } = await supabase.storage
      .from('produtos')
      .upload(path, file, { upsert: true, cacheControl: '31536000' });
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('produtos')
      .getPublicUrl(path);

    console.log('[SYNC] Imagem enviada:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (e) {
    console.error('[SYNC] Erro upload imagem:', e.message || e);
    // Fallback: tenta Data URL
    return null;
  }
}

async function syncDeleteImagem(path) {
  try {
    await supabase.storage.from('produtos').remove([path]);
    return true;
  } catch (e) {
    console.error('[SYNC] Erro deletar imagem:', e.message || e);
    return false;
  }
}

// ============================================================
// RESERVAS
// ============================================================

async function syncLoadReservas() {
  try {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const slots = {};
    (data || []).forEach(row => { slots[row.slot_key] = rowToReserva(row); });

    if (Object.keys(slots).length > 0) {
      if (typeof reservaSlots !== 'undefined') {
        Object.keys(reservaSlots).forEach(k => delete reservaSlots[k]);
        Object.assign(reservaSlots, slots);
      }
      localStorage.setItem('proarena_reservas', JSON.stringify({ events: [], reservas: slots }));
    }
    return slots;
  } catch (e) {
    console.error('[SYNC] Erro load reservas:', e.message || e);
    return null;
  }
}

async function syncSaveReserva(key, reservaData) {
  try {
    const { error } = await supabase
      .from('reservas')
      .upsert(reservaToRow(key, reservaData), { onConflict: 'slot_key' });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('[SYNC] Erro save reserva:', e.message || e);
    return false;
  }
}

let _saveReservasTimer = null;

async function syncSaveAllReservas(slots) {
  if (!slots || typeof slots !== 'object') return;
  if (_saveReservasTimer) clearTimeout(_saveReservasTimer);
  _saveReservasTimer = setTimeout(async () => {
    try {
      const rows = Object.entries(slots).map(([key, r]) => reservaToRow(key, r));
      if (rows.length === 0) return;
      const batchSize = 200;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await supabase.from('reservas').upsert(batch, { onConflict: 'slot_key' });
        if (error) throw error;
      }
    } catch (e) {
      console.error('[SYNC] Erro save lote reservas:', e.message || e);
    }
  }, 500);
}

async function syncDeleteReserva(key) {
  try {
    await supabase.from('reservas').delete().eq('slot_key', key);
    return true;
  } catch (e) {
    console.error('[SYNC] Erro delete reserva:', e.message || e);
    return false;
  }
}

// ============================================================
// PEDIDOS
// ============================================================

async function syncLoadPedidos() {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const pedidos = (data || []).map(row => rowToPedido(row));
    if (pedidos.length > 0) localStorage.setItem('arenaPed', JSON.stringify(pedidos));
    return pedidos;
  } catch (e) {
    console.error('[SYNC] Erro load pedidos:', e.message || e);
    return null;
  }
}

async function syncSavePedido(pedido) {
  try {
    await supabase.from('pedidos').insert(pedidoToRow(pedido));
    return true;
  } catch (e) {
    console.error('[SYNC] Erro save pedido:', e.message || e);
    return false;
  }
}

async function syncDeletePedido(pedidoId) {
  try {
    await supabase.from('pedidos').delete().eq('id', pedidoId);
    return true;
  } catch (e) {
    console.error('[SYNC] Erro delete pedido:', e.message || e);
    return false;
  }
}

// ============================================================
// ESTOQUE
// ============================================================

async function syncLoadEstoque() {
  try {
    const { data, error } = await supabase.from('estoque').select('*');
    if (error) throw error;
    const estMap = {};
    (data || []).forEach(row => { estMap[row.id] = row.quantidade; });
    if (Object.keys(estMap).length > 0) {
      localStorage.setItem('arenaEst', JSON.stringify(estMap));
      if (typeof est !== 'undefined' && est !== null) {
        Object.keys(est).forEach(k => delete est[k]);
        Object.assign(est, estMap);
      }
    }
    return estMap;
  } catch (e) {
    console.error('[SYNC] Erro load estoque:', e.message || e);
    return null;
  }
}

async function syncUpdateEstoque(id, quantidade) {
  try {
    await supabase.from('estoque').upsert({
      id: id,
      quantidade: Math.max(0, quantidade),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    return true;
  } catch (e) {
    console.error('[SYNC] Erro update estoque:', e.message || e);
    return false;
  }
}

// ============================================================
// PRODUTOS + IMAGENS
// ============================================================

async function syncLoadProdutos() {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;

    const produtos = (data || []).map(row => {
      const p = rowToProduto(row);
      // So monta URL do Storage se comecar com 'produtos/' (imagem enviada)
      // Senao mantem como esta (arquivo local na pasta do site)
      if (p.imagem && p.imagem.startsWith('produtos/')) {
        const { data: urlData } = supabase.storage.from('produtos').getPublicUrl(p.imagem);
        p.imagem = urlData.publicUrl;
      }
      return p;
    });

    localStorage.setItem('arenaFisicos', JSON.stringify(produtos));
    console.log('[SYNC] Produtos carregados:', produtos.length);
    return produtos;
  } catch (e) {
    console.error('[SYNC] Erro load produtos:', e.message || e);
    return null;
  }
}

async function syncSaveAllProdutos(produtos) {
  try {
    const rows = produtos.map(p => produtoToRow(p));
    await supabase.from('produtos').upsert(rows, { onConflict: 'id' });
    return true;
  } catch (e) {
    console.error('[SYNC] Erro save produtos:', e.message || e);
    return false;
  }
}

async function syncSaveProduto(produto) {
  try {
    await supabase.from('produtos').upsert(produtoToRow(produto), { onConflict: 'id' });
    return true;
  } catch (e) {
    console.error('[SYNC] Erro save produto:', e.message || e);
    return false;
  }
}

async function syncDeleteProduto(id) {
  try {
    // Se tiver imagem no storage, deleta
    const { data } = await supabase.from('produtos').select('imagem_url').eq('id', id).single();
    if (data && data.imagem_url && data.imagem_url.startsWith('produtos/')) {
      await syncDeleteImagem(data.imagem_url);
    }
    await supabase.from('produtos').delete().eq('id', id);
    return true;
  } catch (e) {
    console.error('[SYNC] Erro delete produto:', e.message || e);
    return false;
  }
}

// ============================================================
// CONFIG
// ============================================================

async function syncLoadConfig() {
  try {
    const { data, error } = await supabase.from('config').select('*');
    if (error) throw error;
    const cfg = {};
    (data || []).forEach(row => { cfg[row.chave] = row.valor; });
    if (cfg.pix) localStorage.setItem('arenaPix', cfg.pix);
    if (cfg.admin_password && typeof SENHA_ADMIN_SYNC !== 'undefined') {
      SENHA_ADMIN_SYNC = cfg.admin_password;
    }
    return cfg;
  } catch (e) {
    console.error('[SYNC] Erro load config:', e.message || e);
    return null;
  }
}

async function syncSaveConfig(chave, valor) {
  try {
    await supabase.from('config').upsert({
      chave: chave,
      valor: valor,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'chave' });
    return true;
  } catch (e) {
    console.error('[SYNC] Erro save config:', e.message || e);
    return false;
  }
}

// ============================================================
// REALTIME
// ============================================================

function subscribeRealtime() {
  supabase
    .channel('reservas-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, async () => {
      await syncLoadReservas();
      if (SYNC.onReservasChanged) SYNC.onReservasChanged(true);
    })
    .subscribe();

  supabase
    .channel('pedidos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, async () => {
      await syncLoadPedidos();
      if (SYNC.onPedidosChanged) SYNC.onPedidosChanged(true);
    })
    .subscribe();

  supabase
    .channel('estoque-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque' }, async () => {
      const estData = await syncLoadEstoque();
      if (estData && SYNC.onEstoqueChanged) SYNC.onEstoqueChanged(true);
    })
    .subscribe();

  supabase
    .channel('config-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'config' }, async () => {
      await syncLoadConfig();
      if (SYNC.onConfigChanged) SYNC.onConfigChanged(true);
    })
    .subscribe();

  supabase
    .channel('produtos-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, async () => {
      const prods = await syncLoadProdutos();
      if (prods && SYNC.onProdutosChanged) SYNC.onProdutosChanged(true);
    })
    .subscribe();
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

let _initPromise = null;

async function initSync(callbacks) {
  if (_initPromise) return _initPromise;

  if (callbacks) {
    if (callbacks.onReservasChanged) SYNC.onReservasChanged = callbacks.onReservasChanged;
    if (callbacks.onPedidosChanged) SYNC.onPedidosChanged = callbacks.onPedidosChanged;
    if (callbacks.onEstoqueChanged) SYNC.onEstoqueChanged = callbacks.onEstoqueChanged;
    if (callbacks.onConfigChanged) SYNC.onConfigChanged = callbacks.onConfigChanged;
    if (callbacks.onProdutosChanged) SYNC.onProdutosChanged = callbacks.onProdutosChanged;
  }

  _initPromise = (async () => {
    SYNC.loading = true;
    try {
      const [reservas, pedidos, estoque, produtos, config] = await Promise.all([
        syncLoadReservas(),
        syncLoadPedidos(),
        syncLoadEstoque(),
        syncLoadProdutos(),
        syncLoadConfig(),
      ]);

      SYNC.ready = true;
      SYNC.loading = false;
      SYNC.error = null;

      subscribeRealtime();
      return true;
    } catch (e) {
      console.error('[SYNC] Erro init:', e.message || e);
      SYNC.ready = false;
      SYNC.loading = false;
      SYNC.error = 'Falha na conexao.';
      return false;
    }
  })();

  return _initPromise;
}

window.supabaseSync = {
  init: initSync,
  status: () => SYNC.loading ? 'loading' : SYNC.ready ? 'online' : 'offline',
  ready: () => SYNC.ready,
  uploadImagem: syncUploadImagem,
  deleteImagem: syncDeleteImagem,
  loadReservas: syncLoadReservas,
  saveReserva: syncSaveReserva,
  saveAllReservas: syncSaveAllReservas,
  deleteReserva: syncDeleteReserva,
  loadPedidos: syncLoadPedidos,
  savePedido: syncSavePedido,
  deletePedido: syncDeletePedido,
  loadEstoque: syncLoadEstoque,
  updateEstoque: syncUpdateEstoque,
  loadProdutos: syncLoadProdutos,
  saveProduto: syncSaveProduto,
  saveAllProdutos: syncSaveAllProdutos,
  deleteProduto: syncDeleteProduto,
  loadConfig: syncLoadConfig,
  saveConfig: syncSaveConfig,
};
