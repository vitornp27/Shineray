(() => {
  const SPIN_COUNT = 24;

  const initShi250Effects = () => {
    /* ======================================================
       1) ANATOMIA DO MOVIMENTO (#camadas) — 100% funcional
       ====================================================== */
    const section = document.getElementById('camadas');
    const parts = Array.from(document.querySelectorAll('#anatomyParts .anatomy-part'));
    const shadow = document.querySelector('#anatomyScene .anatomy-shadow');
    const stateEl = document.getElementById('anatomyState');
    const pctEl = document.getElementById('anatomyPercent');
    const slider = document.getElementById('separation');
    const btnAssemble = document.getElementById('assembleBike');
    const btnExplode = document.getElementById('explodeBike');
    const btnScroll = document.getElementById('scrollBike');
    const partBtns = Array.from(document.querySelectorAll('#camadas [data-focus-part]'));

    if (section && parts.length) {
      let progress = 0;
      let target = 0;
      let followScroll = true;
      let focused = 'all';
      let rafId = null;

      const applyAnatomy = (p) => {
        const clamped = Math.max(0, Math.min(1, p));
        const pct = Math.round(clamped * 100);

        parts.forEach((el) => {
          const x = Number(el.dataset.x || 0) * clamped;
          const y = Number(el.dataset.y || 0) * clamped;
          const z = Number(el.dataset.z || 0) * clamped;
          const r = Number(el.dataset.r || 0) * clamped;
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotate(${r.toFixed(2)}deg)`;

          const isMatch = focused === 'all' || el.dataset.part === focused;
          el.style.opacity = isMatch ? '1' : '0.18';
          el.style.filter = isMatch && focused !== 'all'
            ? 'drop-shadow(0 14px 26px rgba(215, 25, 32, 0.5))'
            : isMatch ? 'none' : 'grayscale(0.8)';
          el.style.zIndex = isMatch && focused !== 'all' ? '8' : '2';

          const marker = el.querySelector('.part-marker');
          if (marker) marker.style.opacity = clamped > 0.12 || focused !== 'all' ? '1' : '0';
        });

        if (shadow) {
          shadow.style.transform = `scale(${(1 + clamped * 0.22).toFixed(3)})`;
          shadow.style.opacity = String((0.75 - clamped * 0.35).toFixed(2));
        }
        if (pctEl) pctEl.textContent = String(pct).padStart(3, '0');
        if (stateEl) {
          stateEl.textContent = pct < 8
            ? 'TUDO SE CONECTA'
            : pct < 85
              ? 'SEPARANDO CONJUNTOS'
              : 'ANATOMIA EXPLODIDA';
        }
        if (slider && document.activeElement !== slider) {
          slider.value = String(pct);
          slider.setAttribute('aria-valuetext', pct === 0 ? 'Moto montada' : `${pct}% separada`);
        }
      };

      const animateToTarget = () => {
        progress += (target - progress) * 0.14;
        if (Math.abs(target - progress) < 0.002) {
          progress = target;
          applyAnatomy(progress);
          rafId = null;
          return;
        }
        applyAnatomy(progress);
        rafId = requestAnimationFrame(animateToTarget);
      };

      const setTarget = (val) => {
        target = Math.max(0, Math.min(1, val));
        if (!rafId) rafId = requestAnimationFrame(animateToTarget);
      };

      const setScrollMode = (on) => {
        followScroll = on;
        btnScroll?.setAttribute('aria-pressed', String(on));
      };

      const onScroll = () => {
        if (!followScroll) return;
        const rect = section.getBoundingClientRect();
        const span = Math.max(1, section.offsetHeight - window.innerHeight);
        const raw = -rect.top / span;
        const p = Math.max(0, Math.min(1, raw * 1.15));
        setTarget(p);
      };

      window.addEventListener('scroll', onScroll, { passive: true });

      slider?.addEventListener('input', () => {
        setScrollMode(false);
        const p = Number(slider.value) / 100;
        progress = p;
        target = p;
        applyAnatomy(p);
      });

      btnAssemble?.addEventListener('click', () => {
        setScrollMode(false);
        setTarget(0);
      });

      btnExplode?.addEventListener('click', () => {
        setScrollMode(false);
        setTarget(1);
      });

      btnScroll?.addEventListener('click', () => {
        setScrollMode(!followScroll);
        if (followScroll) onScroll();
      });

      partBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          focused = btn.dataset.focusPart || 'all';
          partBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
          if (focused !== 'all' && target < 0.45) {
            setScrollMode(false);
            setTarget(0.65);
          } else {
            applyAnatomy(progress);
          }
        });
      });

      applyAnatomy(0);
    }

    /* ======================================================
       2) ESTÚDIO INTERATIVO — Imagens SHI 250 + Modo Noite
       ====================================================== */
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

    /* ======================================================
       3) ABA EXPLORAR EM 3D — Giro por arraste suave
       ====================================================== */
    const spinFrames = Array.from({ length: SPIN_COUNT }, (_, i) => ({
      src: `assets/shi250/spin/spin-${String(i + 1).padStart(2, '0')}.webp`,
      label: `SHI 250 3D · ÂNGULO ${String(i + 1).padStart(2, '0')}/${SPIN_COUNT}`
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

    /* ======================================================
       4) DE PERTO, FAZ A DIFERENÇA (#detalhes) — Overlays SVG
       ====================================================== */
    const detailItems = [
      {
        src: 'assets/shi250/detalhes/led.webp',
        alt: 'Iluminação Full LED com DRL da SHI 250',
        meter: 'DRL ATIVO',
        status: 'DRL aceso · toque para acionar farol alto',
        action: 'Acionar farol Full LED',
        activeMeter: 'FAROL ALTO',
        activeStatus: 'Conjunto óptico Full LED + DRL no máximo',
        cls: 'fx-led-active'
      },
      {
        src: 'assets/shi250/detalhes/roda.webp',
        alt: 'Roda raiada e freio a disco da SHI 250',
        meter: 'RODANDO',
        status: 'Roda em movimento · teste a frenagem',
        action: 'Acionar freio a disco',
        activeMeter: 'FREANDO',
        activeStatus: 'Pinça acionada no disco · parada firme',
        cls: 'fx-brake-active'
      },
      {
        src: 'assets/shi250/detalhes/suspensao.webp',
        alt: 'Suspensão dianteira e conjunto trail da SHI 250',
        meter: 'EM REPOUSO',
        status: 'Suspensão trail pronta para impacto',
        action: 'Comprimir suspensão',
        activeMeter: 'AMORTECENDO',
        activeStatus: 'Curso telescópico absorvendo impacto',
        cls: 'fx-fork-active'
      }
    ];

    const photoBox = document.querySelector('#detalhes .detail-photo');
    const detailImg = document.getElementById('detailImage');
    const counter = document.getElementById('detailCounter');
    const meter = document.getElementById('detailEffectMeter');
    const statusEl = document.getElementById('detailEffectStatus');
    const oldActionBtn = document.getElementById('detailAction');
    const oldBtns = Array.from(document.querySelectorAll('#detalhes .detail'));

    if (photoBox && oldBtns.length) {
      // Clona botões para evitar conflito com app.js
      const btns = oldBtns.map((b) => { const c = b.cloneNode(true); b.replaceWith(c); return c; });
      const actionBtn = oldActionBtn ? (() => { const c = oldActionBtn.cloneNode(true); oldActionBtn.replaceWith(c); return c; })() : null;

      let activeDetail = 0, fxTimer;

      const selectDetail = (idx) => {
        activeDetail = idx;
        clearTimeout(fxTimer);
        const item = detailItems[idx];
        photoBox.dataset.effect = String(idx);
        photoBox.classList.remove('fx-led-active', 'fx-brake-active', 'fx-fork-active');
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
        clearTimeout(fxTimer);
        photoBox.classList.remove('fx-led-active', 'fx-brake-active', 'fx-fork-active');
        void photoBox.offsetWidth;
        photoBox.classList.add(item.cls);
        actionBtn.setAttribute('aria-pressed', 'true');
        if (statusEl) statusEl.textContent = item.activeStatus;
        if (meter) meter.textContent = item.activeMeter;
        fxTimer = setTimeout(() => {
          photoBox.classList.remove(item.cls);
          actionBtn.setAttribute('aria-pressed', 'false');
          if (statusEl) statusEl.textContent = item.status;
          if (meter) meter.textContent = item.meter;
        }, 2600);
      });

      selectDetail(0);
    }
  };

  if (document.readyState === 'complete') setTimeout(initShi250Effects, 60);
  else window.addEventListener('load', () => setTimeout(initShi250Effects, 60));
})();
