(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const WHATSAPP = () => window.SHINERAY_WHATSAPP_NUMBER || '5535998717094';

  // Valores de referência atualizados conforme catálogo WhatsApp (R$).
  const PRECOS_BASE = {
    'PHOENIX 50 S': 10990,
    'PHOENIX 50 EFI': 11990,
    'JET 50S': 12990,
    'JET 125 SS': 13690,
    'URBAN LITE 150': 14490,
    'URBAN 150 EFI': null,
    'FREE 150': 14990,
    'JET 125 EFI': 15590,
    'RIO 125 EFI': 15590,
    'SHI 170': 15690,
    'JEF 150s EFI': 16690,
    'JEF 170': 16990,
    'SBM 150S': 18290,
    'SHI 175 S': 18890,
    'SHI 175s EFI': 20490,
    '250F FLASH': 21990,
    'STORM 200 EFI': 24790,
    'DENVER 250': 24990,
    'SHI 250': 24990,
    'SBM IRON 250': 25490,
    'SBM 250S': 25890,
    'SBM 250T': 26990,
    'SHI 400 SC': 26990,
    'TITANIUM 250': 28990,
    'DENVER 400': 33990,
    'SBM 400S': 36200,
    'SBM 400 SS': 39990,
    'SBM 600': 39990,
    'SBM 600T': 48990,
    'SBM 600V': 53490,
    'SBM 600 RC': 53990
  };

  const TAXA_MENSAL = 0.022;

  // Dados técnicos detalhados com consumo e autonomia estimados (varia conforme uso e terreno).
  const MODELOS = {
    'PHOENIX 50 S': { categoria: 'Ciclomotor · cidade', cc: '47,9 cc', partida: 'Elétrica / pedal', freios: 'Tambor dianteiro / tambor traseiro', consumo: '~45 km/l · Tanque 3 L (~135 km est.)', destaque: 'Leve, econômica e prática para trajetos curtos', url: 'https://www.shineray.com.br/produto/phoenix-50/' },
    'PHOENIX 50 EFI': { categoria: 'Ciclomotor · cidade', cc: '47,6 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / tambor traseiro', consumo: '~48 km/l · Tanque 3,5 L (~165 km est.)', destaque: 'Injeção eletrônica e máxima economia urbana', url: 'https://www.shineray.com.br/produto/phoenix-50-efi/' },
    'JET 50S': { categoria: 'Ciclomotor · cidade', cc: '49,4 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / tambor traseiro', consumo: '~45 km/l · Tanque 3 L (~135 km est.)', destaque: 'Câmbio semiautomático e porta-objetos sob o banco', url: 'https://www.shineray.com.br/produto/jet-50/' },
    'JET 125 SS': { categoria: 'Urbana · cidade', cc: '123,67 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / tambor traseiro', consumo: '~38 km/l · Tanque 3 L (~115 km est.)', destaque: 'Agilidade no trânsito com painel digital e porta USB', url: 'https://www.shineray.com.br/produto/jet-125/' },
    'URBAN LITE 150': { categoria: 'Scooter · cidade', cc: '149,48 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro', consumo: '~38 km/l · Tanque 8 L (~300 km est.)', destaque: 'Câmbio automático CVT, 13,5 CV e entradas USB-A/C', url: 'https://www.shineray.com.br/produto/urban-lite/' },
    'URBAN 150 EFI': { categoria: 'Scooter · cidade', cc: '149 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS)', consumo: '36 a 45 km/l · Tanque 13,5 L (até ~600 km)', destaque: 'Refrigeração líquida, CVT e ótimo pacote tecnológico', url: 'https://www.shineray.com.br/produto/urban-150/' },
    'FREE 150': { categoria: 'Urbana · cidade', cc: '149 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / tambor traseiro', consumo: '~35 a 40 km/l · Tanque 12 L (~450 km est.)', destaque: 'Conforto diário com ótimo custo-benefício na categoria 150', url: 'https://www.shineray.com.br/produto/free-150/' },
    'JET 125 EFI': { categoria: 'Urbana · cidade', cc: '123,67 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / tambor traseiro', consumo: '~40 a 45 km/l · Tanque 4,2 L (~180 km est.)', destaque: 'Injeção eletrônica e praticidade urbana', url: 'https://www.shineray.com.br/produto/jet-125ss-efi/' },
    'RIO 125 EFI': { categoria: 'Urbana · cidade', cc: '123,67 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / tambor traseiro', consumo: '~40 a 45 km/l · Tanque 4,2 L (~180 km est.)', destaque: 'Injeção eletrônica, painel 100% digital e suspensão bi-shock', url: 'https://www.shineray.com.br/produto/rio-125-efi/' },
    'SHI 170': { categoria: 'Urbana · cidade', cc: '169,30 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / tambor traseiro', consumo: '~30 a 35 km/l · Tanque 12 L (~390 km est.)', destaque: 'Motor 170 cc leve (104 kg) com ótima resposta urbana', url: 'https://www.shineray.com.br/produto/shi-170-cs/' },
    'JEF 150s EFI': { categoria: 'Street · cidade', cc: '149 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / tambor traseiro', consumo: '~35 a 40 km/l · Tanque 12 L (~450 km est.)', destaque: 'Visual street esportivo com injeção eletrônica', url: 'https://www.shineray.com.br/produto/jef-150s-efi/' },
    'JEF 170': { categoria: 'Street · cidade', cc: '169,30 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / tambor traseiro', consumo: '~30 a 35 km/l · Tanque 12 L (~390 km est.)', destaque: 'Motor 170 cc e proposta versátil', url: 'https://www.shineray.com.br/produto/jef-170/' },
    'SBM 150S': { categoria: 'Street · cidade', cc: '149,05 cc', partida: 'Elétrica', freios: 'Disco dianteiro ABS / disco traseiro', consumo: '~35 a 40 km/l · Tanque 12 L (~450 km est.)', destaque: 'Painel 100% digital, Full LED e suspensão monoshock', url: 'https://www.shineray.com.br/produto/sbm-150/' },
    'SHI 175 S': { categoria: 'Trail · uso misto', cc: '175,11 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / disco traseiro', consumo: '~25 a 30 km/l · Tanque 14,5 L (~400 km est.)', destaque: 'Proposta trail com freios a disco nas duas rodas', url: 'https://www.shineray.com.br/produto/shi-175/' },
    'SHI 175s EFI': { categoria: 'Trail · uso misto', cc: '175,11 cc', partida: 'Elétrica / pedal', freios: 'Disco dianteiro / disco traseiro', consumo: '~30 a 35 km/l · Tanque 14,5 L (~470 km est.)', destaque: 'Injeção eletrônica e freios a disco nas duas rodas', url: 'https://www.shineray.com.br/produto/shi-175s-efi/' },
    '250F FLASH': { categoria: 'Street · cidade', cc: '248,92 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS)', consumo: '~26 a 30 km/l · Tanque 13,5 L (~380 km est.)', destaque: 'Motor 250 cc de 27,9 CV e câmbio de 6 marchas', url: 'https://www.shineray.com.br/produto/250f/' },
    'STORM 200 EFI': { categoria: 'Trail · crossover', cc: '198,1 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~28 a 32 km/l · Tanque 13 L (~390 km est.)', destaque: 'Injeção eletrônica, 20,4 CV e iluminação Full LED', url: 'https://www.shineray.com.br/produto/storm-200/' },
    'DENVER 250': { categoria: 'Custom · estrada', cc: '248,92 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~25 a 28 km/l · Tanque 17 L (~450 km est.)', destaque: 'Motor bicilíndrico em V, estilo clássico e Full LED', url: 'https://www.shineray.com.br/produto/denver/' },
    'SHI 250': { categoria: 'Trail · uso misto', cc: '249,9 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (CBS)', consumo: '~28 a 32 km/l · Tanque 18 L (até ~540 km est.)', destaque: 'Motor 250 cc e proposta para diferentes terrenos', url: 'https://www.shineray.com.br/produto/shi-250/' },
    'SBM IRON 250': { categoria: 'Custom · estrada', cc: '249,60 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~25 a 28 km/l · Tanque 14 L (~370 km est.)', destaque: 'Estilo custom de 27,67 CV com refrigeração líquida', url: 'https://www.shineray.com.br/produto/iron/' },
    'SBM 250S': { categoria: 'Street · esportiva', cc: '249 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~26 a 30 km/l · Tanque 12,5 L (~350 km est.)', destaque: 'Motor 27,5 CV, garfo invertido e câmbio de 6 marchas', url: 'https://www.shineray.com.br/produto/sbm-250s/' },
    'SBM 250T': { categoria: 'Trail · uso misto', cc: '249 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS)', consumo: '~25 a 28 km/l · Tanque 13 L (~345 km est.)', destaque: 'Motor 30,8 CV, refrigeração líquida e chave presencial', url: 'https://www.shineray.com.br/produto/sbm-250t/' },
    'SHI 400 SC': { categoria: 'Clássica · estrada', cc: '399,7 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~22 a 25 km/l · Tanque 14 L (~330 km est.)', destaque: 'Estilo scrambler clássico de 400 cc e iluminação Full LED', url: 'https://www.shineray.com.br/produto/shi-400sc/' },
    'TITANIUM 250': { categoria: 'Custom · estrada', cc: '248,92 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~26 a 29 km/l · Tanque 15 L (~410 km est.)', destaque: 'Motor V-Twin de 250 cc com acabamento premium', url: 'https://www.shineray.com.br/produto/titanium/' },
    'DENVER 400': { categoria: 'Custom · estrada', cc: '397 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~20 a 24 km/l · Tanque 16 L (~350 km est.)', destaque: 'Motor bicilíndrico em V de 39,43 CV e transmissão por correia', url: 'https://www.shineray.com.br/produto/denver-400-2/' },
    'SBM 400S': { categoria: 'Naked · estrada', cc: '399,73 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~22 a 25 km/l · Tanque 13,5 L (~315 km est.)', destaque: 'Bicilíndrica de 41,46 CV, painel TFT e garfo invertido', url: 'https://www.shineray.com.br/produto/sbm-400/' },
    'SBM 400 SS': { categoria: 'Trail · turismo', cc: '378 cc', partida: 'Elétrica', freios: 'Duplo disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~20 a 24 km/l · Tanque 19 L (~420 km est.)', destaque: 'Bicilíndrica de 45,5 CV, painel TFT e baús de fábrica', url: 'https://www.shineray.com.br/produto/sbm-400ss-2/' },
    'SBM 600': { categoria: 'Cruiser · estrada', cc: '554 cc', partida: 'Elétrica', freios: 'Disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~18 a 22 km/l · Tanque 17 L (~340 km est.)', destaque: 'Bicilíndrica de 56,1 CV, controle de tração e correia', url: 'https://www.shineray.com.br/produto/sbm-600/' },
    'SBM 600T': { categoria: 'Trail · turismo', cc: '554 cc', partida: 'Elétrica', freios: 'Duplo disco dianteiro Brembo (ABS duplo canal)', consumo: '~18 a 22 km/l · Tanque 20 L (~400 km est.)', destaque: '56 CV, suspensões Marzocchi, freios Brembo e painel TFT', url: 'https://www.shineray.com.br/produto/sbm-600t/' },
    'SBM 600V': { categoria: 'Cruiser · estrada', cc: '561,9 cc', partida: 'Elétrica', freios: 'Duplo disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~17 a 20 km/l · Tanque 16,5 L (~305 km est.)', destaque: 'Motor V4 de 68,7 CV, painel TFT e transmissão por correia', url: 'https://www.shineray.com.br/produto/sbm-600v/' },
    'SBM 600 RC': { categoria: 'Esportiva · estrada', cc: '600 cc', partida: 'Elétrica', freios: 'Duplo disco dianteiro / disco traseiro (ABS duplo canal)', consumo: '~16 a 19 km/l · Tanque 16,4 L (~285 km est.)', destaque: '4 cilindros em linha de 88,4 CV e painel TFT com Bluetooth', url: 'https://www.shineray.com.br/produto/sbm-600rc/' }
  };

  const PROVA_GOOGLE = { nota: '4,7', quantidade: '24 avaliações no Google' };
  window.SHINERAY_CONVERSION_CONFIG = { PRECOS_BASE, TAXA_MENSAL, PROVA_GOOGLE };

  const googleRating = document.querySelector('.google-stars');
  const googleCount = document.querySelector('.google-proof strong');
  if (googleRating) googleRating.innerHTML = `${PROVA_GOOGLE.nota} <span aria-hidden="true">★</span>`;
  if (googleCount) googleCount.textContent = PROVA_GOOGLE.quantidade;

  window.trackEvent = function (eventName, params = {}) {
    const payload = { ...params };
    try { if (typeof window.fbq === 'function') window.fbq('trackCustom', eventName, payload); } catch (e) {}
    try { if (typeof window.gtag === 'function') window.gtag('event', eventName, payload); } catch (e) {}
    try { if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: eventName, ...payload }); } catch (e) {}
  };

  const wa = message => `https://wa.me/${WHATSAPP()}?text=${encodeURIComponent(message)}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let options = Object.keys(MODELOS);
  const compareA = $('compareModelA');
  const compareB = $('compareModelB');
  const financeModel = $('financeModel');
  const down = $('financeDown');
  let term = 36;

  const fillSelect = (el, selected) => {
    if (!el) return;
    const current = options.includes(selected) ? selected : options[0];
    el.innerHTML = options.map(name => `<option value="${esc(name)}" ${name === current ? 'selected' : ''}>${esc(name)}</option>`).join('');
  };

  function renderCompare() {
    if (!compareA || !compareB) return;
    const names = [compareA.value, compareB.value];
    $('compareResults').innerHTML = names.map((name, index) => {
      const m = MODELOS[name];
      if (!m) return '';
      const message = `Olá! Quero conhecer melhor a ${name}. Poderiam me passar disponibilidade e condições?`;
      return `<article class="compare-card"><div class="compare-card-top"><span>MODELO 0${index + 1}</span><h4>${esc(name)}</h4><a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">Ficha oficial ↗</a></div><dl>${[
        ['Categoria / uso', m.categoria],
        ['Cilindrada / Potência', m.cc],
        ['Partida', m.partida],
        ['Freios', m.freios],
        ['Consumo / Autonomia', m.consumo],
        ['Destaque principal', m.destaque]
      ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><a class="button red compare-wa" data-wa-origin="comparador" href="${wa(message)}" target="_blank" rel="noopener noreferrer">Quero essa no WhatsApp <span aria-hidden="true">↗</span></a></article>`;
    }).join('');
  }

  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

  function financeValues() {
    if (!financeModel) return;
    const model = financeModel.value;
    const price = PRECOS_BASE[model];

    if (!price || price <= 0) {
      down.disabled = true;
      down.max = '0';
      down.value = '0';
      $('financePrice').textContent = 'Sob consulta';
      $('financeDownValue').textContent = 'Sob consulta';
      $('financeDownPercent').textContent = '—';
      $('financeMaxDown').textContent = 'Sob consulta';
      $('financeInstallment').textContent = 'Sob consulta';
      $('financeRate').textContent = `Prazo selecionado: ${term} parcelas · consulte valor atualizado na loja`;
      const msg = `Olá! Gostaria de consultar o valor e receber uma simulação oficial para a ${model} em ${term}x.`;
      $('financeWhatsapp').href = wa(msg);
      $('financeWhatsapp').dataset.model = model;
      $('financeWhatsapp').dataset.entry = '0';
      $('financeWhatsapp').dataset.term = String(term);
      $('financeWhatsapp').dataset.installment = '0';
      return;
    }

    down.disabled = false;
    const max = Math.floor(price * 0.6 / 500) * 500;
    down.max = String(max);
    if (Number(down.value) > max) down.value = String(max);
    const entry = Number(down.value);
    const principal = Math.max(0, price - entry);
    const factor = Math.pow(1 + TAXA_MENSAL, term);
    const installment = principal === 0 ? 0 : principal * (TAXA_MENSAL * factor) / (factor - 1);

    $('financePrice').textContent = brl(price);
    $('financeDownValue').textContent = brl(entry);
    $('financeDownPercent').textContent = Math.round(entry / price * 100) + '%';
    $('financeMaxDown').textContent = brl(max);
    $('financeInstallment').textContent = brl(installment);
    $('financeRate').textContent = `Taxa de referência: ${(TAXA_MENSAL * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}% a.m. · ${term} parcelas`;

    const msg = `Olá! Gostaria de receber uma simulação oficial para a ${model}. Entrada pretendida: ${brl(entry)}. Prazo desejado: ${term}x. Parcela estimada no simulador: ${brl(installment)}. Sei que os valores dependem de análise de crédito e condições da loja.`;
    $('financeWhatsapp').href = wa(msg);
    $('financeWhatsapp').dataset.model = model;
    $('financeWhatsapp').dataset.entry = String(entry);
    $('financeWhatsapp').dataset.term = String(term);
    $('financeWhatsapp').dataset.installment = String(installment.toFixed(2));
  }

  function buildFromCatalog(p) {
    const specs = Array.isArray(p.specs) ? p.specs : [];
    const powerSpec = specs.find(s => /^Potência/i.test(s));
    const autonomySpec = specs.find(s => /^Autonomia|^Consumo/i.test(s));
    const terrainMap = { city: 'cidade', mixed: 'uso misto', road: 'estrada' };
    return {
      categoria: `${p.category} · ${terrainMap[p.terrain] || 'uso urbano'}`,
      cc: p.cc || (powerSpec ? powerSpec.split(':').slice(1).join(':').trim() : 'Elétrica'),
      partida: p.power === 'electric' ? 'Elétrica' : 'Consulte ficha da versão',
      freios: 'Consulte ficha da versão',
      consumo: autonomySpec ? autonomySpec.split(':').slice(1).join(':').trim() : 'Consulte na loja',
      destaque: specs.slice(0, 2).join(' · ') || 'Consulte a ficha oficial',
      url: p.source || 'https://www.shineray.com.br/'
    };
  }

  function refreshSelectors() {
    const selA = compareA?.value || 'JET 125 EFI';
    const selB = compareB?.value || 'SHI 175s EFI';
    const selFin = financeModel?.value || 'JET 125 EFI';
    fillSelect(compareA, selA);
    fillSelect(compareB, selB);
    fillSelect(financeModel, selFin);
    renderCompare();
    financeValues();
  }

  refreshSelectors();

  fetch('./catalog.json', { cache: 'no-cache' })
    .then(res => (res.ok ? res.json() : Promise.reject(new Error('catalog'))))
    .then(catalog => {
      if (!Array.isArray(catalog) || !catalog.length) return;
      const preferred = ['JET 125 EFI', 'JEF 170', 'SHI 175 S', 'SHI 175s EFI', 'SHI 250'];
      catalog.forEach(p => {
        if (!MODELOS[p.name]) MODELOS[p.name] = buildFromCatalog(p);
        if (typeof p.price === 'number') PRECOS_BASE[p.name] = p.price;
        else if (!(p.name in PRECOS_BASE)) PRECOS_BASE[p.name] = null;
      });
      options = Object.keys(MODELOS).sort((a, b) => {
        const aI = preferred.indexOf(a);
        const bI = preferred.indexOf(b);
        return (aI < 0 ? 99 : aI) - (bI < 0 ? 99 : bI) || a.localeCompare(b, 'pt-BR');
      });
      refreshSelectors();
    })
    .catch(() => {});

  [compareA, compareB].forEach(el => el?.addEventListener('change', renderCompare));
  financeModel?.addEventListener('change', () => { down.value = '0'; financeValues(); });
  down?.addEventListener('input', financeValues);
  document.querySelectorAll('[data-term]').forEach(btn => btn.addEventListener('click', () => {
    term = Number(btn.dataset.term);
    document.querySelectorAll('[data-term]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    financeValues();
  }));

  const testRide = $('testRideWhatsapp');
  if (testRide) {
    testRide.href = wa('Olá! Gostaria de consultar a disponibilidade para fazer um Test Ride na loja Shineray da Av. João Pinheiro, 99, Centro, em Poços de Caldas. Quais horários estão disponíveis?');
    testRide.addEventListener('click', () => window.trackEvent('test_ride_click', { origem: 'test_ride', local: 'Av. João Pinheiro, 99 - Poços de Caldas' }));
  }

  $('financeWhatsapp')?.addEventListener('click', () => window.trackEvent('finance_simulate_click', {
    modelo: $('financeWhatsapp').dataset.model,
    entrada: Number($('financeWhatsapp').dataset.entry),
    prazo: Number($('financeWhatsapp').dataset.term)
  }));

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href*="wa.me/"]');
    if (!link) return;
    const origem = link.dataset.waOrigin || link.dataset.origin || (link.classList.contains('whatsapp') ? 'floating_button' : link.closest('#quizContent') ? 'quiz' : link.closest('#comparador') ? 'comparador' : link.closest('#simulador-financeiro') ? 'simulador' : link.closest('#visite-loja') ? 'test_ride' : link.closest('#contactForm') ? 'contact_form' : 'whatsapp_link');
    window.trackEvent('whatsapp_lead', { origem, href: link.href });
  }, true);
})();

