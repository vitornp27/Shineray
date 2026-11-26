(() => {
  const initExperience = () => {
    const $ = (id) => document.getElementById(id);
    const ignitionBtn = $('ignition');
    const machineStage = $('machineStage');
    if (!ignitionBtn || !machineStage) return;

    const state = {
      on: false,
      light: false,
      high: false,
      left: false,
      right: false,
      hazard: false,
      sound: false,
      throttle: 0,
      brake: false
    };

    let ctx, engine, gain;
    const controls = [
      'headlight',
      'highbeam',
      'leftSignal',
      'rightSignal',
      'hazard',
      'horn',
      'throttle',
      'brake'
    ];

    const tabs = [$('tabLive'), $('tabSpin')].filter(Boolean);

    function selectTab(i) {
      tabs.forEach((b, n) => {
        b.setAttribute('aria-selected', String(i === n));
        b.tabIndex = i === n ? 0 : -1;
      });
      if ($('viewLive')) $('viewLive').hidden = i !== 0;
      if ($('view360')) $('view360').hidden = i !== 1;
      if (i === 1) {
        state.throttle = 0;
        state.sound = false;
        state.brake = false;
        if ($('throttle')) $('throttle').value = 0;
        update();
      }
    }

    tabs.forEach((b, i) => {
      b.addEventListener('click', () => selectTab(i));
      b.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          const n = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1 - i;
          selectTab(n);
          tabs[n].focus();
        }
      });
    });

    function audio() {
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        ctx = new AudioCtx();
        engine = ctx.createOscillator();
        engine.type = 'sawtooth';
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 160;
        gain = ctx.createGain();
        gain.gain.value = 0;
        engine.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        engine.start();
      }
      if (ctx.state === 'suspended') ctx.resume();
    }

    function updateAudio() {
      if (!ctx) return;
      engine.frequency.setTargetAtTime(24 + state.throttle * 0.48, ctx.currentTime, 0.15);
      const vol = state.sound && state.on ? 0.045 + state.throttle * 0.0002 : 0;
      gain.gain.setTargetAtTime(vol, ctx.currentTime, 0.12);
    }

    function press(id, active, text) {
      const el = $(id);
      if (!el) return;
      el.setAttribute('aria-pressed', String(active));
      if (text) el.innerHTML = text;
    }

    function update() {
      const motion = state.on && state.throttle > 0 && !state.brake;
      const left = state.on && (state.left || state.hazard);
      const right = state.on && (state.right || state.hazard);

      machineStage.classList.toggle('running', state.on);
      machineStage.classList.toggle('moving', motion);

      const src = state.brake
        ? 'assets/spin-15.webp'
        : motion
          ? 'assets/spin-8.webp'
          : 'assets/spin-1.webp';

      const img = $('machineImage');
      const frame = $('machineFrame');

      if (img && img.getAttribute('src') !== src) img.src = src;
      if (img) {
        img.alt = state.brake
          ? 'SHI 175 vista de trás com luz de freio'
          : motion
            ? 'SHI 175 em vista lateral com rodas em movimento simulado'
            : 'SHI 175 em vista frontal';
      }

      if (frame) {
        frame.style.setProperty('--wheel-duration', (0.65 - state.throttle * 0.004) + 's');
      }

      machineStage.classList.toggle('lights-on', state.on && state.light);
      machineStage.classList.toggle('high-on', state.on && state.high);
      machineStage.classList.toggle('signal-l', left);
      machineStage.classList.toggle('signal-r', right);
      machineStage.classList.toggle('braking', state.brake);

      if ($('dash')) $('dash').classList.toggle('active', state.on);
      if ($('dashLeft')) $('dashLeft').classList.toggle('blink', left);
      if ($('dashRight')) $('dashRight').classList.toggle('blink', right);

      if ($('speed')) $('speed').textContent = String(Math.round(state.throttle * 0.6)).padStart(2, '0');
      if ($('gearDisplay')) $('gearDisplay').textContent = state.on ? (state.throttle > 0 ? 'D' : 'N') : '—';
      if ($('rpmText')) {
        $('rpmText').textContent = state.on
          ? `${Math.round(1200 + state.throttle * 48).toLocaleString('pt-BR')} RPM VIRTUAIS`
          : 'IGNIÇÃO DESLIGADA';
      }
      if ($('lightDisplay')) {
        $('lightDisplay').textContent = state.high ? 'LUZ ALTA' : state.light ? 'LUZ ON' : 'LUZ OFF';
      }
      if ($('throttleValue')) $('throttleValue').textContent = state.throttle + '%';
      if ($('sceneLabel')) {
        $('sceneLabel').textContent = state.brake
          ? 'FREIO ACIONADO'
          : motion
            ? 'MOVIMENTO SIMULADO'
            : state.on
              ? 'MOTOR LIGADO'
              : 'PRONTA PARA A PARTIDA';
      }

      document.querySelectorAll('.rpm-bars i').forEach((bar, i) => {
        bar.classList.toggle('lit', state.on && i < 2 + state.throttle / 7);
      });

      controls.forEach((id) => {
        const el = $(id);
        if (el) {
          el.disabled = !state.on;
          if (state.on) el.removeAttribute('disabled');
        }
      });

      press('ignition', state.on);
      if ($('ignitionText')) $('ignitionText').textContent = state.on ? 'Desligar a moto' : 'Dar partida';
      press('headlight', state.light, `Farol <span>${state.light ? 'ON' : 'OFF'}</span>`);
      press('highbeam', state.high, `Farol alto <span>${state.high ? 'ON' : 'OFF'}</span>`);
      press('leftSignal', state.left || state.hazard);
      press('rightSignal', state.right || state.hazard);
      press('hazard', state.hazard, `Pisca-alerta <span>${state.hazard ? 'ON' : 'OFF'}</span>`);
      press('brake', state.brake, `${state.brake ? 'Soltar freio' : 'Acionar freio'} <span>■</span>`);
      press('sound', state.sound, `${state.sound ? 'Silenciar' : 'Ativar som'} <span>♪</span>`);

      updateAudio();
    }

    function status(t) {
      if ($('machineStatus')) $('machineStatus').textContent = t;
    }

    function clearBrake() {
      state.brake = false;
    }

    ignitionBtn.addEventListener('click', () => {
      state.on = !state.on;
      clearBrake();
      state.throttle = 0;
      if ($('throttle')) $('throttle').value = 0;
      state.light = state.on;
      state.high = false;
      state.left = false;
      state.right = false;
      state.hazard = false;
      status(state.on ? 'Motor ligado. Farol aceso. Experimente os comandos.' : 'Moto desligada. Todos os comandos foram reiniciados.');
      update();
    });

    $('headlight')?.addEventListener('click', () => {
      clearBrake();
      state.light = !state.light;
      if (!state.light) state.high = false;
      status(state.light ? 'Farol aceso.' : 'Farol apagado.');
      update();
    });

    $('highbeam')?.addEventListener('click', () => {
      clearBrake();
      state.high = !state.high;
      if (state.high) state.light = true;
      status(state.high ? 'Farol alto ativado.' : 'Farol alto desativado.');
      update();
    });

    ['left', 'right'].forEach((side) => {
      $(side + 'Signal')?.addEventListener('click', () => {
        clearBrake();
        state[side] = !state[side];
        state[side === 'left' ? 'right' : 'left'] = false;
        state.hazard = false;
        status(state[side] ? `Seta ${side === 'left' ? 'esquerda' : 'direita'} ligada.` : 'Setas desligadas.');
        update();
      });
    });

    $('hazard')?.addEventListener('click', () => {
      clearBrake();
      state.hazard = !state.hazard;
      state.left = false;
      state.right = false;
      status(state.hazard ? 'Pisca-alerta ligado.' : 'Pisca-alerta desligado.');
      update();
    });

    $('throttle')?.addEventListener('input', () => {
      clearBrake();
      state.throttle = Number($('throttle').value);
      update();
    });

    $('brake')?.addEventListener('click', () => {
      state.brake = !state.brake;
      if (state.brake) {
        state.throttle = 0;
        if ($('throttle')) $('throttle').value = 0;
        status('Freio acionado. Toque novamente para soltar e voltar à vista frontal.');
        if (window.innerWidth <= 650) machineStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        status('Freio liberado. Vista frontal.');
      }
      update();
    });

    $('sound')?.addEventListener('click', () => {
      try {
        state.sound = !state.sound;
        if (state.sound) {
          document.dispatchEvent(new CustomEvent('shineray:audio-start', { detail: { source: 'simulator' } }));
          audio();
        }
        status(state.sound ? 'Som ilustrativo ativado. Use a partida ou a buzina.' : 'Som desativado.');
        update();
      } catch (e) {
        state.sound = false;
        status('Este navegador não disponibilizou o áudio. Os efeitos visuais continuam ativos.');
        update();
      }
    });

    $('horn')?.addEventListener('click', () => {
      if (!state.sound) { status('Ative o som para ouvir a buzina ilustrativa.'); return; }
      audio();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = 420;
      g.gain.value = 0.08;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.setTargetAtTime(0, ctx.currentTime + 0.22, 0.04);
      o.stop(ctx.currentTime + 0.4);
      status('Buzina ilustrativa acionada.');
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        state.sound = false;
        state.throttle = 0;
        if ($('throttle')) $('throttle').value = 0;
        update();
      }
    });

    const frame = $('machineFrame');
    function perspective(x, y = 0) {
      if (!frame) return;
      frame.style.setProperty('--ry', x + 'deg');
      frame.style.setProperty('--rx', y + 'deg');
    }

    $('depth')?.addEventListener('input', () => perspective(Number($('depth').value) * 0.28));
    $('resetDepth')?.addEventListener('click', () => { if ($('depth')) $('depth').value = 0; perspective(0, 0); });

    const angleInput = $('angle');
    const spinImage = $('spinImage');
    if (angleInput && spinImage) {
      angleInput.addEventListener('input', () => {
        const val = Math.min(29, Math.max(1, Number(angleInput.value) || 1));
        const nextSrc = `assets/spin-${val}.webp`;
        if (spinImage.getAttribute('src') !== nextSrc) spinImage.src = nextSrc;
        angleInput.setAttribute('aria-valuetext', `Ângulo ${val} de 29`);
      });
    }

    update();
  };

  const initRadianShowcase = () => {
    // Modal de vídeo do topo
    const openBtn = document.getElementById('openHeroVideo');
    const dialog = document.getElementById('heroVideoDialog');
    const closeBtn = document.getElementById('closeHeroVideo');
    const player = document.getElementById('heroVideoPlayer');

    if (openBtn && dialog && player) {
      const closeVideo = () => {
        player.pause();
        dialog.close();
      };
      openBtn.addEventListener('click', () => {
        dialog.showModal();
        player.play().catch(() => {});
      });
      closeBtn?.addEventListener('click', closeVideo);
      dialog.addEventListener('click', (e) => { if (e.target === dialog) closeVideo(); });
      dialog.addEventListener('cancel', () => player.pause());
    }

    // Seletor de cores da SHI 175
    const img = document.getElementById('colorBikeImg');
    const badge = document.getElementById('colorBadge');
    const waBtn = document.getElementById('colorWaBtn');
    const swatches = document.querySelectorAll('.color-swatches .swatch');

    if (img) {
      img.addEventListener('error', () => {
        const fb = img.dataset.fallback;
        if (fb && img.getAttribute('src') !== fb) img.src = fb;
      });
    }

    swatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        swatches.forEach((s) => {
          s.classList.remove('active');
          s.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        const colorName = btn.dataset.color || 'Vermelha';
        const src = btn.dataset.src;
        if (img && src) img.src = src;
        if (badge) badge.textContent = colorName.toUpperCase();
        if (waBtn) {
          waBtn.href = `https://wa.me/5535998174929?text=${encodeURIComponent(`Olá! Tenho interesse na SHI 175 na cor ${colorName}.`)}`;
        }
      });
    });
  };

  const initLgpd = () => {
    const banner = document.getElementById('lgpdBanner');
    const dialog = document.getElementById('lgpdDialog');
    if (!banner || !dialog) return;

    const STORAGE_KEY = 'shineray_lgpd_consent';
    if (!localStorage.getItem(STORAGE_KEY)) banner.hidden = false;

    const saveConsent = (level) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ level, date: new Date().toISOString() }));
      banner.hidden = true;
      document.dispatchEvent(new CustomEvent('shineray:lgpd-consent', { detail: { level } }));
    };

    document.getElementById('lgpdAccept')?.addEventListener('click', () => saveConsent('all'));
    document.getElementById('lgpdEssential')?.addEventListener('click', () => saveConsent('essential'));
    document.getElementById('openLgpdPolicy')?.addEventListener('click', () => dialog.showModal());
    document.getElementById('closeLgpdDialog')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  };

  const start = () => {
    initExperience();
    initRadianShowcase();
    initLgpd();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();


/* Efeito animado ao trocar as cores da SHI 175 */
(() => {
  const enhanceColorSwitch = () => {
    const img = document.getElementById('colorBikeImg');
    const stage = document.querySelector('.color-stage-visual');
    const badge = document.getElementById('colorBadge');
    const waBtn = document.getElementById('colorWaBtn');
    const oldSwatches = Array.from(document.querySelectorAll('.color-swatches .swatch'));
    if (!img || !oldSwatches.length) return;

    const tints = {
      Vermelha: 'rgba(215, 25, 32, 0.10)',
      Preta: 'rgba(20, 20, 24, 0.10)',
      Branca: 'rgba(180, 185, 195, 0.14)',
      Areia: 'rgba(216, 179, 140, 0.18)'
    };

    // Pré-carrega as 4 cores para troca instantânea
    oldSwatches.forEach((b) => { if (b.dataset.src) { const p = new Image(); p.src = b.dataset.src; } });

    // Substitui os botões para limpar o clique seco antigo
    const swatches = oldSwatches.map((b) => {
      const clone = b.cloneNode(true);
      b.replaceWith(clone);
      return clone;
    });

    let currentIdx = Math.max(0, swatches.findIndex((s) => s.classList.contains('active')));
    let swapTimer;

    swatches.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if (idx === currentIdx) return;
        const dir = idx > currentIdx ? 'left' : 'right';
        currentIdx = idx;

        swatches.forEach((s) => {
          s.classList.remove('active');
          s.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');

        const colorName = btn.dataset.color || 'Vermelha';
        const nextSrc = btn.dataset.src;

        if (stage) stage.style.setProperty('--stage-tint', tints[colorName] || tints.Vermelha);
        if (badge) {
          badge.textContent = colorName.toUpperCase();
          badge.classList.add('is-popping');
          setTimeout(() => badge.classList.remove('is-popping'), 240);
        }
        if (waBtn) {
          waBtn.href = `https://wa.me/5535998174929?text=${encodeURIComponent(`Olá! Tenho interesse na SHI 175 na cor ${colorName}.`)}`;
        }

        clearTimeout(swapTimer);
        img.classList.remove('bike-exit-left', 'bike-exit-right', 'bike-prep-left', 'bike-prep-right');
        img.classList.add(dir === 'left' ? 'bike-exit-left' : 'bike-exit-right');

        swapTimer = setTimeout(() => {
          const reveal = () => {
            img.classList.remove('bike-exit-left', 'bike-exit-right');
            img.classList.add(dir === 'left' ? 'bike-prep-right' : 'bike-prep-left');
            void img.offsetWidth;
            requestAnimationFrame(() => {
              img.classList.remove('bike-prep-left', 'bike-prep-right');
            });
          };

          if (nextSrc && img.getAttribute('src') !== nextSrc) {
            img.onload = reveal;
            img.src = nextSrc;
            img.alt = `Shineray SHI 175 ${colorName}`;
            if (img.complete) reveal();
          } else {
            reveal();
          }
        }, 210);
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(enhanceColorSwitch, 0));
  } else {
    setTimeout(enhanceColorSwitch, 0);
  }
})();

/* Exibe imagens das motos selecionadas no Comparador e no Simulador Financeiro */
(() => {
  const norm = (s) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const imageMap = new Map();
  const catalogFiles = new Set();

  const registerFromDom = () => {
    document.querySelectorAll('#catalogGrid .model-card').forEach((card) => {
      const name = card.querySelector('h3')?.textContent?.trim();
      const src = card.querySelector('img')?.getAttribute('src');
      if (name && src) {
        imageMap.set(norm(name), src);
        catalogFiles.add(src);
      }
    });
  };

  const scanScriptForImages = async (url, depth = 0) => {
    if (depth > 2) return;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const text = await res.text();
      const matches = text.match(/assets\/catalog\/[a-zA-Z0-9._-]+\.(?:webp|png|jpe?g)/gi) || [];
      matches.forEach((m) => catalogFiles.add(m));

      const pairRe = /(?:name|title|modelo)\s*:\s*['"]([^'"]+)['"][\s\S]{0,400}?(assets\/catalog\/[a-zA-Z0-9._-]+\.(?:webp|png|jpe?g))/gi;
      let m;
      while ((m = pairRe.exec(text))) imageMap.set(norm(m[1]), m[2]);

      const imports = [...text.matchAll(/import[\s\S]*?from\s*['"](\.\/[^'"]+)['"]/g)];
      for (const imp of imports) await scanScriptForImages(imp[1], depth + 1);
    } catch (_) {}
  };

  const resolveBikeImage = (value, label) => {
    registerFromDom();
    const keys = [norm(label), norm(value)].filter(Boolean);
    for (const k of keys) {
      if (imageMap.has(k)) return imageMap.get(k);
    }

    const files = Array.from(catalogFiles);
    for (const k of keys) {
      const exact = files.find((f) => norm(f.split('/').pop().replace(/\.[^.]+$/, '')) === k);
      if (exact) return exact;
    }

    let bestFile = null;
    let bestScore = 0;
    const tokens = (keys[0] || '').split('-').filter((t) => t.length > 1);
    for (const f of files) {
      const base = norm(f.split('/').pop().replace(/\.[^.]+$/, ''));
      const fTokens = base.split('-');
      let score = 0;
      tokens.forEach((t) => {
        if (fTokens.includes(t)) score += 3;
        else if (base.includes(t)) score += 1;
      });
      if (score > bestScore) {
        bestScore = score;
        bestFile = f;
      }
    }
    if (bestFile && bestScore >= 3) return bestFile;

    const slug = keys[0] || 'shi-175';
    return `assets/catalog/${slug}.webp`;
  };

  const applyFallback = (img) => {
    img.onerror = () => {
      const tried = Number(img.dataset.fb || 0);
      if (tried === 0 && img.src.endsWith('.webp')) {
        img.dataset.fb = '1';
        img.src = img.src.replace(/\.webp$/, '.png');
      } else if (tried <= 1) {
        img.dataset.fb = '2';
        img.src = 'assets/spin-5.webp';
      } else {
        img.onerror = null;
      }
    };
  };

  const decorateCompareCards = () => {
    const container = document.getElementById('compareResults');
    if (!container) return;
    const selA = document.getElementById('compareModelA');
    const selB = document.getElementById('compareModelB');
    const selects = [selA, selB];

    container.querySelectorAll('.compare-card').forEach((card, idx) => {
      const title = card.querySelector('h4')?.textContent?.trim() || '';
      const sel = selects[idx];
      const val = sel?.value || '';
      const label = title || sel?.options?.[sel.selectedIndex]?.text?.trim() || '';
      if (!label) return;

      const src = resolveBikeImage(val, label);
      let box = card.querySelector('.compare-bike-media');
      if (!box) {
        box = document.createElement('div');
        box.className = 'compare-bike-media';
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.className = 'is-swapping';
        applyFallback(img);
        box.appendChild(img);

        const anchor = card.querySelector('h4');
        if (anchor && anchor.nextSibling) anchor.parentNode.insertBefore(box, anchor.nextSibling);
        else card.prepend(box);
      }

      const img = box.querySelector('img');
      if (img && img.getAttribute('src') !== src) {
        img.dataset.fb = '0';
        img.classList.add('is-swapping');
        img.alt = `Shineray ${label}`;
        img.onload = () => requestAnimationFrame(() => img.classList.remove('is-swapping'));
        img.src = src;
        if (img.complete) requestAnimationFrame(() => img.classList.remove('is-swapping'));
      }
    });
  };

  const setupFinancePreview = () => {
    const select = document.getElementById('financeModel');
    const panel = document.querySelector('#simulador-financeiro .finance-panel');
    if (!select || !panel) return;

    let preview = document.getElementById('financeBikePreview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'financeBikePreview';
      preview.className = 'finance-bike-preview';
      preview.innerHTML = '<span class="finance-bike-badge" id="financeBikeBadge"></span><img id="financeBikeImg" alt="" loading="lazy" decoding="async">';
      const labelEl = panel.querySelector('.finance-model-label');
      if (labelEl) labelEl.insertAdjacentElement('afterend', preview);
      else panel.prepend(preview);
    }

    const img = document.getElementById('financeBikeImg');
    const badge = document.getElementById('financeBikeBadge');
    if (!img) return;
    applyFallback(img);

    const updateFinanceBike = () => {
      const opt = select.options?.[select.selectedIndex];
      const label = opt?.text?.trim() || '';
      if (!label) return;
      const src = resolveBikeImage(select.value, label);
      if (badge) badge.textContent = label;
      if (img.getAttribute('src') !== src) {
        img.dataset.fb = '0';
        img.classList.add('is-swapping');
        img.alt = `Shineray ${label}`;
        setTimeout(() => {
          img.onload = () => requestAnimationFrame(() => img.classList.remove('is-swapping'));
          img.src = src;
          if (img.complete) requestAnimationFrame(() => img.classList.remove('is-swapping'));
        }, 120);
      }
    };

    select.addEventListener('change', updateFinanceBike);
    new MutationObserver(updateFinanceBike).observe(select, { childList: true });
    updateFinanceBike();
    return updateFinanceBike;
  };

  const initConversionImages = async () => {
    registerFromDom();
    await scanScriptForImages('catalog.js');

    const compareResults = document.getElementById('compareResults');
    if (compareResults) {
      new MutationObserver(() => decorateCompareCards()).observe(compareResults, { childList: true });
      decorateCompareCards();
    }

    const updateFinance = setupFinancePreview();

    const catalogGrid = document.getElementById('catalogGrid');
    if (catalogGrid) {
      new MutationObserver(() => {
        registerFromDom();
        decorateCompareCards();
        if (updateFinance) updateFinance();
      }).observe(catalogGrid, { childList: true });
    }

    setTimeout(() => {
      decorateCompareCards();
      if (updateFinance) updateFinance();
    }, 600);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConversionImages);
  } else {
    initConversionImages();
  }
})();

/* Intercepta TODOS os botoes e links de WhatsApp com o pop-up de cadastro */
(() => {
  const initGlobalWaPopup = () => {
    const oldOverlay = document.getElementById('creditModalOverlay');
    if (!oldOverlay) return;

    // Clona o modal para assumir controle unico sem conflitar com o script antigo
    const overlay = oldOverlay.cloneNode(true);
    oldOverlay.replaceWith(overlay);

    const closeBtn = overlay.querySelector('#creditModalClose');
    const form = overlay.querySelector('#creditModalForm');
    const titleEl = overlay.querySelector('#creditModalTitle');
    const contextEl = overlay.querySelector('#creditModalContext');
    const nomeInput = overlay.querySelector('#creditNome');
    const cpfInput = overlay.querySelector('#creditCpf');
    const whatsInput = overlay.querySelector('#creditWhatsapp');
    const emailInput = overlay.querySelector('#creditEmail');
    const nomeError = overlay.querySelector('#creditNomeError');
    const cpfError = overlay.querySelector('#creditCpfError');
    const whatsError = overlay.querySelector('#creditWhatsError');
    const emailError = overlay.querySelector('#creditEmailError');
    const submitBtn = overlay.querySelector('.credit-modal-submit');
    if (!form) return;

    const WHATSAPP_LOJA = '5535998174929';
    let resumoPedido = 'Atendimento via site';

    const limparErros = () => {
      [nomeInput, cpfInput, whatsInput, emailInput].forEach((el) => el?.classList.remove('is-invalid'));
      [nomeError, cpfError, whatsError, emailError].forEach((el) => el?.classList.remove('is-visible'));
    };

    const abrirModal = (titulo, textoContexto, resumo) => {
      const productDialog = document.getElementById('productDialog');
      if (productDialog && productDialog.hasAttribute('open') && typeof productDialog.close === 'function') {
        productDialog.close();
      }
      limparErros();
      if (titleEl) titleEl.textContent = titulo || 'Seus dados para continuar';
      if (contextEl) contextEl.textContent = textoContexto;
      if (submitBtn) submitBtn.innerHTML = 'Continuar no WhatsApp <span aria-hidden="true">↗</span>';
      resumoPedido = resumo;
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('credit-modal-open');
      setTimeout(() => nomeInput?.focus(), 50);
    };

    const fecharModal = () => {
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('credit-modal-open');
    };

    const extrairTextoUrl = (href) => {
      try {
        const u = new URL(href, window.location.href);
        return u.searchParams.get('text') || '';
      } catch (_) {
        return '';
      }
    };

    closeBtn?.addEventListener('click', fecharModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) fecharModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) fecharModal(); });

    // Captura em window (antes de document) para cobrir 100% dos botoes de WhatsApp
    window.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target || overlay.contains(target)) return;

      const href = target.getAttribute('href') || '';
      const text = (target.textContent || '').trim();
      const dataWa = target.getAttribute('data-wa') || '';
      const isWaUrl = /wa\.me|whatsapp\.com/i.test(href);
      const isSpecialId = ['financeWhatsapp', 'testRideWhatsapp', 'colorWaBtn'].includes(target.id);
      const isWaClass = target.classList.contains('whatsapp') || target.classList.contains('compare-wa') || target.classList.contains('quiz-share');
      const inCardOrDialog = Boolean(target.closest('.compare-card, #productDialog, .model-card, .quiz-result'));
      const isCardWaAction = inCardOrDialog && (isWaUrl || Boolean(dataWa) || /whatsapp|consultar este modelo|quero essa|enviar/i.test(text));

      if (!isWaUrl && !dataWa && !isSpecialId && !isWaClass && !isCardWaAction) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (target.id === 'financeWhatsapp') {
        const select = document.getElementById('financeModel');
        const modelo = select && select.selectedIndex >= 0 ? select.options[select.selectedIndex].text.trim() : 'Modelo selecionado';
        const entrada = document.getElementById('financeDownValue')?.textContent?.trim() || '—';
        const parcela = document.getElementById('financeInstallment')?.textContent?.trim() || '—';
        const prazoBtn = document.querySelector('.finance-terms button[aria-pressed="true"]');
        const prazo = prazoBtn ? prazoBtn.textContent.trim() : '36x';
        abrirModal(
          'Seus dados para simulação',
          `Simulação: ${modelo} · Entrada ${entrada} · ${prazo} de ${parcela}`,
          `*Assunto:* Simulação de financiamento\n*Modelo:* ${modelo}\n*Entrada:* ${entrada}\n*Prazo:* ${prazo}\n*Parcela estimada:* ${parcela}`
        );
        return;
      }

      if (target.id === 'colorWaBtn') {
        const cor = document.getElementById('colorBadge')?.textContent?.trim() || 'Vermelha';
        abrirModal(
          'Interesse na SHI 175',
          `Cor escolhida: ${cor}. Preencha seus dados para falar com a equipe no WhatsApp.`,
          `*Assunto:* Interesse na SHI 175\n*Cor escolhida:* ${cor}`
        );
        return;
      }

      if (target.id === 'testRideWhatsapp') {
        abrirModal(
          'Agendar Test Ride',
          'Preencha seus dados abaixo para agendar seu Test Ride em Poços de Caldas pelo WhatsApp.',
          '*Assunto:* Agendamento de Test Ride na loja de Poços de Caldas'
        );
        return;
      }

      const compareCard = target.closest('.compare-card');
      if (compareCard) {
        const modelo = compareCard.querySelector('h4')?.textContent?.trim() || 'Modelo Shineray';
        abrirModal(
          'Consultar modelo',
          `Modelo escolhido: ${modelo}. Preencha seus dados para continuar no WhatsApp.`,
          `*Assunto:* Interesse no modelo\n*Modelo:* ${modelo}`
        );
        return;
      }

      const inProductDialog = target.closest('#productDialog');
      const inCatalogCard = target.closest('.model-card');
      if (inProductDialog || inCatalogCard) {
        const modelo =
          (inProductDialog && document.getElementById('productTitle')?.textContent?.trim()) ||
          (inCatalogCard && inCatalogCard.querySelector('h3')?.textContent?.trim()) ||
          'Modelo Shineray';
        abrirModal(
          'Consultar modelo',
          `Modelo escolhido: ${modelo}. Preencha seus dados para continuar no WhatsApp.`,
          `*Assunto:* Interesse no modelo\n*Modelo:* ${modelo}`
        );
        return;
      }

      const msgOriginal = dataWa || extrairTextoUrl(href) || text || 'Atendimento pelo site';
      const tituloLimpo = /revis/i.test(text)
        ? 'Agendar revisão'
        : /pe[cç]a/i.test(text)
          ? 'Orçamento de peças'
          : 'Falar no WhatsApp';

      abrirModal(
        tituloLimpo,
        'Preencha seus dados abaixo para continuar o atendimento direto no WhatsApp da loja.',
        `*Mensagem:* ${msgOriginal}`
      );
    }, true);

    cpfInput?.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      e.target.value = v;
      cpfInput.classList.remove('is-invalid');
      cpfError?.classList.remove('is-visible');
    });

    whatsInput?.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      else if (v.length > 0) v = v.replace(/^(\d*)/, '($1');
      e.target.value = v;
      whatsInput.classList.remove('is-invalid');
      whatsError?.classList.remove('is-visible');
    });

    nomeInput?.addEventListener('input', () => { nomeInput.classList.remove('is-invalid'); nomeError?.classList.remove('is-visible'); });
    emailInput?.addEventListener('input', () => { emailInput.classList.remove('is-invalid'); emailError?.classList.remove('is-visible'); });

    const validarCPF = (cpf) => {
      const n = cpf.replace(/\D/g, '');
      if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
      let soma = 0; for (let i = 0; i < 9; i++) soma += parseInt(n[i], 10) * (10 - i);
      let resto = (soma * 10) % 11; if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(n[9], 10)) return false;
      soma = 0; for (let i = 0; i < 10; i++) soma += parseInt(n[i], 10) * (11 - i);
      resto = (soma * 10) % 11; if (resto === 10 || resto === 11) resto = 0;
      return resto === parseInt(n[10], 10);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      limparErros();
      const nome = nomeInput.value.trim();
      const cpf = cpfInput.value.trim();
      const whatsapp = whatsInput.value.trim();
      const email = emailInput.value.trim();

      if (nome.length < 3) { nomeInput.classList.add('is-invalid'); nomeError?.classList.add('is-visible'); nomeInput.focus(); return; }
      if (!validarCPF(cpf)) { cpfInput.classList.add('is-invalid'); cpfError?.classList.add('is-visible'); cpfInput.focus(); return; }
      if (whatsapp.replace(/\D/g, '').length < 10) { whatsInput.classList.add('is-invalid'); whatsError?.classList.add('is-visible'); whatsInput.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailInput.classList.add('is-invalid'); emailError?.classList.add('is-visible'); emailInput.focus(); return; }

      const mensagem = encodeURIComponent(
        `Olá! Vim pelo site da Shineray Poços de Caldas.\n\n${resumoPedido}\n\n*Dados do cliente:*\n*Nome:* ${nome}\n*CPF:* ${cpf}\n*WhatsApp:* ${whatsapp}\n*E-mail:* ${email}`
      );
      const waUrl = `https://wa.me/${WHATSAPP_LOJA}?text=${mensagem}`;
      fecharModal();
      const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (!win) window.location.href = waUrl;
    });
  };

  if (document.readyState === 'complete') setTimeout(initGlobalWaPopup, 80);
  else window.addEventListener('load', () => setTimeout(initGlobalWaPopup, 80));
})();
