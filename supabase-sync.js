// ============================================================
// ARENA SQUAD - Supabase Sync Layer
// Sincroniza dados entre dispositivos em tempo real
// ============================================================

console.log('[SYNC] supabase-sync.js carregado!');

const SUPABASE_URL = 'https://fjuxuqcvuafshfaejggl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdXh1cWN2dWFmc2hmYWVqZ2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTkwMDYsImV4cCI6MjA5ODA3NTAwNn0.t-dM3Kv-toU2WeM_Bew94suPjcjbdSVzggy1uCRPopY';

console.log('[SYNC] Supabase URL:', SUPABASE_URL);

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
};

// Helper: converte row de reservas para formato do app
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

// Helper: converte reserva do app para formato da tabela
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

// Helper: converte row de pedido para formato do app
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

// Helper: converte pedido do app para formato da tabela
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
    (data || []).forEach(row => {
      slots[row.slot_key] = rowToReserva(row);
    });

    console.log('[SYNC] Reservas carregadas:', Object.keys(slots).length);

    // Atualiza cache localStorage e variável global do app (só se tiver dados)
    if (Object.keys(slots).length > 0) {
      if (typeof reservaSlots !== 'undefined') {
        Object.keys(reservaSlots).forEach(k => delete reservaSlots[k]);
        Object.assign(reservaSlots, slots);
      }
      localStorage.setItem('proarena_reservas', JSON.stringify({
        events: [],
        reservas: slots,
      }));
    } else {
      console.log('[SYNC] Servidor vazio, mantendo dados locais');
    }

    return slots;
  } catch (e) {
    console.error('[SYNC] Erro ao carregar reservas:', e.message || e);
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
    console.error('[SYNC] Erro ao salvar reserva:', key, e.message || e);
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
        const { error } = await supabase
          .from('reservas')
          .upsert(batch, { onConflict: 'slot_key' });
        if (error) throw error;
      }
      console.log('[SYNC] Lote de reservas salvo:', rows.length);
    } catch (e) {
      console.error('[SYNC] Erro ao salvar lote:', e.message || e);
    }
  }, 500);
}

async function syncDeleteReserva(key) {
  try {
    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('slot_key', key);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('[SYNC] Erro ao excluir reserva:', key, e.message || e);
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
    console.log('[SYNC] Pedidos carregados:', pedidos.length);

    // Atualiza localStorage só se tiver dados (para nao perder registros locais)
    if (pedidos.length > 0) {
      localStorage.setItem('arenaPed', JSON.stringify(pedidos));
    }

    return pedidos;
  } catch (e) {
    console.error('[SYNC] Erro ao carregar pedidos:', e.message || e);
    return null;
  }
}

async function syncSavePedido(pedido) {
  try {
    const { error } = await supabase
      .from('pedidos')
      .insert(pedidoToRow(pedido));

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('[SYNC] Erro ao salvar pedido:', e.message || e);
    return false;
  }
}

async function syncDeletePedido(pedidoId) {
  try {
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', pedidoId);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('[SYNC] Erro ao excluir pedido:', pedidoId, e.message || e);
    return false;
  }
}

async function syncReplaceAllPedidos(pedidos) {
  try {
    const { error: delError } = await supabase
      .from('pedidos')
      .delete()
      .neq('id', '_');

    if (delError && !delError.message?.includes('PGRST116')) throw delError;

    if (pedidos.length > 0) {
      const { error: insError } = await supabase
        .from('pedidos')
        .insert(pedidos.map(p => pedidoToRow(p)));

      if (insError) throw insError;
    }

    return true;
  } catch (e) {
    console.error('[SYNC] Erro ao substituir pedidos:', e.message || e);
    return false;
  }
}

// ============================================================
// ESTOQUE
// ============================================================

async function syncLoadEstoque() {
  try {
    const { data, error } = await supabase
      .from('estoque')
      .select('*');

    if (error) throw error;

    const estMap = {};
    (data || []).forEach(row => {
      estMap[row.id] = row.quantidade;
    });
    console.log('[SYNC] Estoque carregado:', Object.keys(estMap).length, 'itens');
    // Atualiza cache localStorage se tiver dados
    if (Object.keys(estMap).length > 0) {
      localStorage.setItem('arenaEst', JSON.stringify(estMap));
      // Tenta atualizar variavel global (let est no app.html)
      if (typeof est !== 'undefined' && est !== null) {
        Object.keys(est).forEach(function(k) { delete est[k]; });
        Object.assign(est, estMap);
      }
    } else {
      console.log('[SYNC] Servidor estoque vazio, mantendo dados locais');
    }
    return estMap;
    return estMap;
  } catch (e) {
    console.error('[SYNC] Erro ao carregar estoque:', e.message || e);
    return null;
  }
}

async function syncUpdateEstoque(id, quantidade) {
  try {
    const { error } = await supabase
      .from('estoque')
      .upsert({
        id: id,
        quantidade: Math.max(0, quantidade),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('[SYNC] Erro ao atualizar estoque:', id, e.message || e);
    return false;
  }
}

// ============================================================
// PRODUTOS
// ============================================================

async function syncLoadProdutos() {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const produtos = (data || []).map(row => ({
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
      imagem: row.imagem || undefined,
    }));
    console.log('[SYNC] Produtos carregados:', produtos.length);
    return produtos;
  } catch (e) {
    console.error('[SYNC] Erro ao carregar produtos:', e.message || e);
    return null;
  }
}

async function syncSaveAllProdutos(produtos) {
  try {
    const rows = produtos.map(p => ({
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
      imagem: p.imagem || null,
    }));

    const { error } = await supabase
      .from('produtos')
      .upsert(rows, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('[SYNC] Erro ao salvar produtos:', e.message || e);
    return false;
  }
}

// ============================================================
// CONFIG
// ============================================================

async function syncLoadConfig() {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('*');

    if (error) throw error;

    const cfg = {};
    (data || []).forEach(row => {
      cfg[row.chave] = row.valor;
    });

    if (cfg.pix) localStorage.setItem('arenaPix', cfg.pix);
    if (cfg.admin_password && typeof SENHA_ADMIN_SYNC !== 'undefined') {
      SENHA_ADMIN_SYNC = cfg.admin_password;
    }

    console.log('[SYNC] Config carregada');
    return cfg;
  } catch (e) {
    console.error('[SYNC] Erro ao carregar config:', e.message || e);
    return null;
  }
}

async function syncSaveConfig(chave, valor) {
  try {
    const { error } = await supabase
      .from('config')
      .upsert({
        chave: chave,
        valor: valor,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'chave' });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('[SYNC] Erro ao salvar config:', chave, e.message || e);
    return false;
  }
}

// ============================================================
// REALTIME
// ============================================================

let _channelReservas = null, _channelPedidos = null;
let _channelEstoque = null, _channelConfig = null;

function subscribeRealtime() {
  console.log('[SYNC] Ativando subscriptions em tempo real...');

  _channelReservas = supabase
    .channel('reservas-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'reservas' },
      async (payload) => {
        console.log('[SYNC] 🔄 Mudanca reservas:', payload.eventType);
        const slots = await syncLoadReservas();
        if (slots && SYNC.onReservasChanged) SYNC.onReservasChanged(true);
      }
    )
    .subscribe();

  _channelPedidos = supabase
    .channel('pedidos-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'pedidos' },
      async (payload) => {
        console.log('[SYNC] 🔄 Mudanca pedidos:', payload.eventType);
        await syncLoadPedidos();
        if (SYNC.onPedidosChanged) SYNC.onPedidosChanged(true);
      }
    )
    .subscribe();

  _channelEstoque = supabase
    .channel('estoque-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'estoque' },
      async (payload) => {
        console.log('[SYNC] 🔄 Mudanca estoque:', payload.eventType);
        const estData = await syncLoadEstoque();
        if (estData && SYNC.onEstoqueChanged) SYNC.onEstoqueChanged(true);
      }
    )
    .subscribe();

  _channelConfig = supabase
    .channel('config-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'config' },
      async (payload) => {
        console.log('[SYNC] 🔄 Mudanca config:', payload.eventType);
        await syncLoadConfig();
        if (SYNC.onConfigChanged) SYNC.onConfigChanged(true);
      }
    )
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
  }

  _initPromise = (async () => {
    SYNC.loading = true;
    console.log('[SYNC] 🚀 Iniciando sync...');

    try {
      const [reservas, pedidos, estoque, produtos, config] = await Promise.all([
        syncLoadReservas(),
        syncLoadPedidos(),
        syncLoadEstoque(),
        syncLoadProdutos(),
        syncLoadConfig(),
      ]);

      console.log('[SYNC] Resultados:', {
        reservas: reservas ? Object.keys(reservas).length + ' itens' : 'falhou',
        pedidos: pedidos ? pedidos.length + ' itens' : 'falhou',
        estoque: estoque ? Object.keys(estoque).length + ' itens' : 'falhou',
        produtos: produtos ? produtos.length + ' itens' : 'falhou',
        config: config ? 'ok' : 'falhou',
      });

      SYNC.ready = true;
      SYNC.loading = false;
      SYNC.error = null;
      console.log('[SYNC] ✅ Sync concluido!');

      subscribeRealtime();
      return true;
    } catch (e) {
      console.error('[SYNC] ❌ Erro:', e.message || e);
      SYNC.ready = false;
      SYNC.loading = false;
      SYNC.error = 'Falha na conexao.';
      return false;
    }
  })();

  return _initPromise;
}

function getSyncStatus() {
  if (SYNC.loading) return 'loading';
  if (SYNC.ready) return 'online';
  return 'offline';
}

// Exporta para uso global
window.supabaseSync = {
  init: initSync,
  status: getSyncStatus,
  loadReservas: syncLoadReservas,
  saveReserva: syncSaveReserva,
  saveAllReservas: syncSaveAllReservas,
  deleteReserva: syncDeleteReserva,
  loadPedidos: syncLoadPedidos,
  savePedido: syncSavePedido,
  deletePedido: syncDeletePedido,
  replaceAllPedidos: syncReplaceAllPedidos,
  loadEstoque: syncLoadEstoque,
  updateEstoque: syncUpdateEstoque,
  loadProdutos: syncLoadProdutos,
  saveAllProdutos: syncSaveAllProdutos,
  loadConfig: syncLoadConfig,
  saveConfig: syncSaveConfig,
  error: () => SYNC.error,
  ready: () => SYNC.ready,
};
