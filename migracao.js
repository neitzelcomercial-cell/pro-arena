// ============================================================
// ARENA SQUAD - Script de Migracao v2
// Envia dados do localStorage + imagens para o Supabase
// ============================================================

async function migrarDadosLocais() {
  console.log('%c=== ARENA SQUAD - MIGRACAO DE DADOS v2 ===', 'font-size:16px;font-weight:bold;color:#22c55e');

  if (!window.supabaseSync) {
    console.error('❌ supabaseSync nao encontrado');
    return;
  }

  if (!supabaseSync.ready()) {
    console.log('⏳ Aguardando conexao Supabase...');
    try { await supabaseSync.init(); } catch(e) {
      console.error('❌ Falha ao conectar:', e);
      return;
    }
  }

  if (!supabaseSync.ready()) {
    console.error('❌ Supabase nao esta pronto.');
    return;
  }

  console.log('✅ Supabase conectado.\n');

  var totalMigrado = 0;
  var erros = 0;

  // 1. RESERVAS
  console.log('📅 [1/5] Migrando reservas...');
  if (typeof reservaSlots !== 'undefined' && Object.keys(reservaSlots).length > 0) {
    await supabaseSync.saveAllReservas(reservaSlots);
    var qtd = Object.keys(reservaSlots).length;
    console.log('  ✅ ' + qtd + ' reservas migradas');
    totalMigrado += qtd;
  } else { console.log('  ⏭️ Nenhuma reserva local'); }

  // 2. PEDIDOS
  console.log('📦 [2/5] Migrando pedidos...');
  var pedidosLocais = JSON.parse(localStorage.getItem('arenaPed') || '[]');
  if (pedidosLocais.length > 0) {
    for (var p of pedidosLocais) {
      var ok = await supabaseSync.savePedido(p);
      if (ok) totalMigrado++; else erros++;
    }
    console.log('  ✅ ' + pedidosLocais.length + ' pedidos migrados');
  } else { console.log('  ⏭️ Nenhum pedido local'); }

  // 3. ESTOQUE
  console.log('📊 [3/5] Migrando estoque...');
  var estoqueLocal = JSON.parse(localStorage.getItem('arenaEst') || '{}');
  var chaves = Object.keys(estoqueLocal);
  if (chaves.length > 0) {
    for (var k of chaves) {
      var ok = await supabaseSync.updateEstoque(k, estoqueLocal[k]);
      if (ok) totalMigrado++; else erros++;
    }
    console.log('  ✅ ' + chaves.length + ' itens de estoque migrados');
  } else { console.log('  ⏭️ Nenhum estoque local'); }

  // 4. PRODUTOS + IMAGENS
  console.log('🏷️ [4/5] Migrando produtos...');
  var produtosLocais = JSON.parse(localStorage.getItem('arenaFisicos') || '[]');
  if (produtosLocais.length > 0) {
    // Para cada produto, verifica se tem imagem em base64 e faz upload
    for (var prod of produtosLocais) {
      if (prod.imagem && prod.imagem.startsWith('data:')) {
        // Converte base64 para blob e envia ao Storage
        try {
          var resp = await fetch(prod.imagem);
          var blob = await resp.blob();
          var ext = blob.type.split('/')[1] || 'png';
          var path = 'produtos/' + prod.id + '.' + ext;
          var url = await supabaseSync.uploadImagem(blob, path);
          if (url) prod.imagem = path; // salva ref, nao URL completa
        } catch(e) {
          console.warn('  ⚠️ Erro upload imagem de ' + prod.nome + ': ' + (e.message||e));
        }
      }
    }
    var ok = await supabaseSync.saveAllProdutos(produtosLocais);
    if (ok) {
      console.log('  ✅ ' + produtosLocais.length + ' produtos migrados');
      totalMigrado += produtosLocais.length;
    }
  } else { console.log('  ⏭️ Nenhum produto local'); }

  // 5. CONFIG
  console.log('⚙️ [5/5] Migrando configuracoes...');
  var pixLocal = localStorage.getItem('arenaPix');
  if (pixLocal) {
    var ok = await supabaseSync.saveConfig('pix', pixLocal);
    if (ok) { console.log('  ✅ Chave PIX migrada'); totalMigrado++; }
  }

  console.log('\n%c=== MIGRACAO CONCLUIDA ===', 'font-size:14px;font-weight:bold;color:#22c55e');
  console.log('Total: ' + totalMigrado + ' itens | Erros: ' + erros);

  // Recarrega dados do servidor
  await supabaseSync.loadReservas();
  await supabaseSync.loadPedidos();
  var estData = await supabaseSync.loadEstoque();
  if (estData && typeof window.est !== 'undefined') {
    Object.keys(window.est).forEach(k => delete window.est[k]);
    Object.assign(window.est, estData);
  }

  return { total: totalMigrado, erros: erros };
}

window.migrar = migrarDadosLocais;
console.log('%c📋 Para migrar dados para o Supabase, digite: migrar()', 'font-size:14px;font-weight:bold;color:#22c55e');
