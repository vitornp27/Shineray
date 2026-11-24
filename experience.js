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

      if ($('speed')) {
        $('speed').textContent = String(Math.round(state.throttle * 0.6)).padStart(2, '0');
      }
      if ($('gearDisplay')) {
        $('gearDisplay').textContent = state.on ? (state.throttle > 0 ? 'D' : 'N') : '—';
      }
      if ($('rpmText')) {
        $('rpmText').textContent = state.on
          ? `${Math.round(1200 + state.throttle * 48).toLocaleString('pt-BR')} RPM VIRTUAIS`
          : 'IGNIÇÃO DESLIGADA';
      }
      if ($('lightDisplay')) {
        $('lightDisplay').textContent = state.high
          ? 'LUZ ALTA'
          : state.light
            ? 'LUZ ON'
            : 'LUZ OFF';
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
      if ($('ignitionText')) {
        $('ignitionText').textContent = state.on ? 'Desligar a moto' : 'Dar partida';
      }
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
      if (state.on && typeof window.trackEvent === 'function') {
        window.trackEvent('simulator_start', {
          modelo: 'SHI 175',
          origem: 'estudio_interativo'
        });
      }
      clearBrake();
      state.throttle = 0;
      if ($('throttle')) $('throttle').value = 0;
      state.light = state.on;
      state.high = false;
      state.left = false;
      state.right = false;
      state.hazard = false;
      status(
        state.on
          ? 'Motor ligado. Farol aceso. Experimente os comandos.'
          : 'Moto desligada. Todos os comandos foram reiniciados.'
      );
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
        status(
          state[side]
            ? `Seta ${side === 'left' ? 'esquerda' : 'direita'} ligada.`
            : 'Setas desligadas.'
        );
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
        if (window.innerWidth <= 650) {
          machineStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        status('Freio liberado. Vista frontal.');
      }
      update();
    });

    $('sound')?.addEventListener('click', () => {
      try {
        state.sound = !state.sound;
        if (state.sound) {
          document.dispatchEvent(
            new CustomEvent('shineray:audio-start', { detail: { source: 'simulator' } })
          );
          audio();
        }
        status(
          state.sound
            ? 'Som ilustrativo ativado. Use a partida ou a buzina.'
            : 'Som desativado.'
        );
        update();
      } catch (e) {
        state.sound = false;
        status('Este navegador não disponibilizou o áudio. Os efeitos visuais continuam ativos.');
        update();
      }
    });

    $('horn')?.addEventListener('click', () => {
      if (!state.sound) {
        status('Ative o som para ouvir a buzina ilustrativa.');
        return;
      }
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

    if ($('viewLive') && 'IntersectionObserver' in window) {
      new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) {
            state.sound = false;
            state.throttle = 0;
            if ($('throttle')) $('throttle').value = 0;
            update();
          }
        },
        { threshold: 0 }
      ).observe($('viewLive'));
    }

    const frame = $('machineFrame');
    function perspective(x, y = 0) {
      if (!frame) return;
      frame.style.setProperty('--ry', x + 'deg');
      frame.style.setProperty('--rx', y + 'deg');
    }

    $('depth')?.addEventListener('input', () => {
      perspective(Number($('depth').value) * 0.1);
    });

    $('resetDepth')?.addEventListener('click', () => {
      if ($('depth')) $('depth').value = 0;
      perspective(0);
    });

    if (matchMedia('(pointer:fine)').matches) {
      let tiltFrame;
      machineStage.addEventListener('pointermove', (e) => {
        const r = machineStage.getBoundingClientRect();
        cancelAnimationFrame(tiltFrame);
        tiltFrame = requestAnimationFrame(() => {
          perspective(
            ((e.clientX - r.left - r.width / 2) / r.width) * 10,
            -((e.clientY - r.top - r.height / 2) / r.height) * 6
          );
        });
      });
      machineStage.addEventListener('pointerleave', () => {
        perspective(Number($('depth')?.value || 0) * 0.1);
      });
    }

    document.addEventListener('shineray:audio-start', (e) => {
      if (e.detail?.source !== 'simulator') {
        state.sound = false;
        update();
      }
    });

    update();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExperience);
  } else {
    initExperience();
  }
})();

