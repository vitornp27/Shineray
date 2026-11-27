(() => {
  const initShi250Effects = () => {
    // 1) Remapeia as fotos do Estúdio Interativo para a SHI 250
    const machineImg = document.getElementById('machineImage');
    const swapMap = {
      'assets/spin-1.webp': 'assets/shi250/cores/vermelha-cut.webp',
      'assets/spin-8.webp': 'assets/shi250/cores/preta-cut.webp',
      'assets/spin-15.webp': 'assets/shi250/detalhes/traseira.webp'
    };
    const enforceShi250Src = () => {
      if (!machineImg) return;
      const cur = machineImg.getAttribute('src') || '';
      if (swapMap[cur]) machineImg.setAttribute('src', swapMap[cur]);
    };
    if (machineImg) {
      new MutationObserver(enforceShi250Src).observe(machineImg, { attributes: true, attributeFilter: ['src'] });
      enforceShi250Src();
    }

    // 2) Botão Modo Noite no Estúdio
    const stage = document.getElementById('machineStage');
    const dash = document.getElementById('dash');
    if (stage && !document.getElementById('studioNightToggle')) {
      const moon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
      const sun = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"/></svg>';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.id = 'studioNightToggle';
      toggle.className = 'studio-night-toggle';
      toggle.setAttribute('aria-pressed', 'false');
      toggle.innerHTML = `${moon}<span>Modo Noite</span>`;
      let night = false;
      toggle.addEventListener('click', () => {
        night = !night;
        stage.classList.toggle('night-mode', night);
        if (dash) dash.classList.toggle('night-mode', night);
        toggle.setAttribute('aria-pressed', String(night));
        toggle.innerHTML = night ? `${sun}<span>Modo Dia</span>` : `${moon}<span>Modo Noite</span>`;
      });
      stage.appendChild(toggle);
    }

    // 3) Giro 3D interativo com os quadros extraídos da SHI 250
    const spinFrames = Array.from({ length: 24 }, (_, i) => ({
      src: `assets/shi250/spin/spin-${String(i + 1).padStart(2, '0')}.webp`,
      label: `SHI 250 3D · ÂNGULO ${String(i + 1).padStart(2, '0')}/24`
    }));
    spinFrames.forEach((f) => { const p = new Image(); p.src = f.src; });

    const angleInput = document.getElementById('angle');
    const spinImg = document.getElementById('spinImage');
    const spinLabel = document.querySelector('#view360 .spin-label');
    const spinStage = document.getElementById('spinStage');
    const spinStatus = document.getElementById('spinLiveStatus');
    let spinIdx = 0, spinOn = true, spinHaz = true, spinBrk = false;

    const renderSpin = () => {
      const f = spinFrames[spinIdx];
      if (spinImg && f) spinImg.src = f.src;
      if (spinLabel && f) spinLabel.textContent = f.label;
      if (angleInput) angleInput.value = String(spinIdx + 1);
      if (spinStage) {
        spinStage.classList.toggle('spin-is-on', spinOn);
        spinStage.classList.toggle('spin-is-hazard', spinOn && spinHaz);
        spinStage.classList.toggle('spin-is-brake', spinOn && spinBrk);
      }
      if (spinStatus) {
        spinStatus.textContent = !spinOn
          ? '○ MOTOR DESLIGADO'
          : spinBrk
            ? '● FREIO ACIONADO · LANTERNA INTENSA'
            : '● MOTOR LIGADO · LUZES ATIVAS';
      }
    };

    if (angleInput) {
      angleInput.min = '1';
      angleInput.max = String(spinFrames.length);
      angleInput.value = '1';
      angleInput.addEventListener('input', () => {
        spinIdx = Math.max(0, Math.min(spinFrames.length - 1, Number(angleInput.value) - 1));
        renderSpin();
      });
    }
    document.getElementById('spinPrev')?.addEventListener('click', () => {
      spinIdx = (spinIdx - 1 + spinFrames.length) % spinFrames.length;
      renderSpin();
    });
    document.getElementById('spinNext')?.addEventListener('click', () => {
      spinIdx = (spinIdx + 1) % spinFrames.length;
      renderSpin();
    });
    document.getElementById('spinPower')?.addEventListener('click', (e) => {
      spinOn = !spinOn;
      e.currentTarget.setAttribute('aria-pressed', String(spinOn));
      e.currentTarget.textContent = spinOn ? '⏻ Desligar' : '⏻ Ligar';
      renderSpin();
    });
    document.getElementById('spinHazards')?.addEventListener('click', (e) => {
      spinHaz = !spinHaz;
      e.currentTarget.setAttribute('aria-pressed', String(spinHaz));
      e.currentTarget.textContent = spinHaz ? 'Pisca-alerta ON' : 'Pisca-alerta OFF';
      renderSpin();
    });
    document.getElementById('spinBrake')?.addEventListener('click', (e) => {
      spinBrk = !spinBrk;
      e.currentTarget.setAttribute('aria-pressed', String(spinBrk));
      e.currentTarget.textContent = spinBrk ? 'Soltar freio' : 'Acionar freio';
      renderSpin();
    });

    if (spinStage && !spinStage.dataset.dragReady) {
      spinStage.dataset.dragReady = '1';
      let dragging = false, startX = 0, startIdx = 0;
      spinStage.addEventListener('pointerdown', (e) => {
        dragging = true; startX = e.clientX; startIdx = spinIdx;
        spinStage.setPointerCapture?.(e.pointerId);
        spinStage.style.cursor = 'grabbing';
      });
      spinStage.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const step = Math.max(8, spinStage.clientWidth / (spinFrames.length * 1.15));
        const delta = Math.round((e.clientX - startX) / step);
        const next = Math.max(0, Math.min(spinFrames.length - 1, startIdx + delta));
        if (next !== spinIdx) { spinIdx = next; renderSpin(); }
      });
      const stopDrag = () => { dragging = false; spinStage.style.cursor = 'grab'; };
      spinStage.addEventListener('pointerup', stopDrag);
      spinStage.addEventListener('pointercancel', stopDrag);
    }
    renderSpin();

    // 4) Secção "De perto, faz a diferença"
    const detailItems = [
      {
        src: 'assets/shi250/detalhes/led.webp',
        alt: 'Iluminação Full LED com DRL da SHI 250',
        meter: 'FULL LED',
        status: 'Farol Full LED + DRL prontos',
        action: 'Testar farol Full LED',
        activeStatus: 'Farol alto e DRL acesos no máximo',
        cls: 'fx-led-active'
      },
      {
        src: 'assets/shi250/detalhes/roda.webp',
        alt: 'Roda raiada e freio a disco da SHI 250',
        meter: 'EM MOVIMENTO',
        status: 'Roda girando · experimente o freio',
        action: 'Acionar freio a disco',
        activeStatus: 'Freio acionado · desaceleração firme',
        cls: 'fx-brake-active'
      },
      {
        src: 'assets/shi250/detalhes/suspensao.webp',
        alt: 'Suspensão dianteira e conjunto trail da SHI 250',
        meter: 'REPOUSO',
        status: 'Suspensão em repouso',
        action: 'Comprimir suspensão',
        activeStatus: 'Absorvendo impacto · retorno progressivo',
        cls: 'fx-fork-active'
      }
    ];

    const photoBox = document.querySelector('#detalhes .detail-photo');
    const detailImg = document.getElementById('detailImage');
    const counter = document.getElementById('detailCounter');
    const meter = document.getElementById('detailEffectMeter');
    const statusEl = document.getElementById('detailEffectStatus');
    const actionBtn = document.getElementById('detailAction');
    const btns = Array.from(document.querySelectorAll('#detalhes .detail'));
    let activeDetail = 0, fxTimer;

    const selectDetail = (idx) => {
      activeDetail = idx;
      clearTimeout(fxTimer);
      const item = detailItems[idx];
      if (photoBox) {
        photoBox.dataset.effect = String(idx);
        photoBox.classList.remove('fx-led-active', 'fx-brake-active', 'fx-fork-active');
      }
      if (detailImg) { detailImg.src = item.src; detailImg.alt = item.alt; }
      if (counter) counter.textContent = `0${idx + 1} / 03`;
      if (meter) meter.textContent = item.meter;
      if (statusEl) statusEl.textContent = item.status;
      if (actionBtn) { actionBtn.textContent = item.action; actionBtn.setAttribute('aria-pressed', 'false'); }
      btns.forEach((b, i) => {
        const on = i === idx;
        b.classList.toggle('active', on);
        b.setAttribute('aria-expanded', String(on));
        const txt = document.getElementById(`detail${i}`);
        if (txt) txt.hidden = !on;
        const plus = b.querySelector('.detail-plus');
        if (plus) plus.textContent = on ? '−' : '+';
      });
    };

    btns.forEach((b, i) => b.addEventListener('click', () => selectDetail(i)));

    actionBtn?.addEventListener('click', () => {
      const item = detailItems[activeDetail];
      if (!photoBox || !item) return;
      clearTimeout(fxTimer);
      photoBox.classList.remove('fx-led-active', 'fx-brake-active', 'fx-fork-active');
      void photoBox.offsetWidth;
      photoBox.classList.add(item.cls);
      actionBtn.setAttribute('aria-pressed', 'true');
      if (statusEl) statusEl.textContent = item.activeStatus;
      if (meter) meter.textContent = 'ATIVO';
      fxTimer = setTimeout(() => {
        photoBox.classList.remove(item.cls);
        actionBtn.setAttribute('aria-pressed', 'false');
        if (statusEl) statusEl.textContent = item.status;
        if (meter) meter.textContent = item.meter;
      }, 2200);
    });

    if (btns.length) selectDetail(0);
  };

  if (document.readyState === 'complete') setTimeout(initShi250Effects, 60);
  else window.addEventListener('load', () => setTimeout(initShi250Effects, 60));
})();
