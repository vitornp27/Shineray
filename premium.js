(() => {
  const hero = document.querySelector('.hero');
  const panel = document.getElementById('startupPanel');
  const button = document.getElementById('startupSound');
  const title = document.getElementById('startupTitle');
  const status = document.getElementById('startupStatus');
  const sound = document.getElementById('startupAudio');
  let attempt = 0;
  sound.volume = .48;
  const preference = () => { try { return localStorage.getItem('shineray-intro-muted') === '1'; } catch { return false; } };
  const remember = muted => { try { localStorage.setItem('shineray-intro-muted', muted ? '1' : '0'); } catch {} };
  function show(playing, label, detail) {
    panel.classList.toggle('is-playing', playing);
    hero.classList.toggle('is-starting', playing);
    button.setAttribute('aria-label', playing ? 'Silenciar som de partida' : 'Ouvir som de partida');
    button.setAttribute('aria-pressed', String(playing));
    title.textContent = label;
    status.textContent = detail;
  }
  function stop(muted = false) {
    attempt++;
    sound.pause();
    sound.currentTime = 0;
    if (muted) remember(true);
    show(false, 'Ouvir partida', muted ? 'Som silenciado · toque para ouvir' : 'Áudio ilustrativo · 6 segundos');
  }
  async function start(manual = false) {
    const current = ++attempt;
    if (manual) remember(false);
    sound.currentTime = 0;
    try {
      await sound.play();
      if (current !== attempt) return;
      document.dispatchEvent(new CustomEvent('shineray:audio-start', { detail: { source: 'intro' } }));
      show(true, 'Silenciar partida', 'Sinta o primeiro instante.');
    } catch (error) {
      if (current !== attempt) return;
      show(false, 'Ouvir partida', error.name === 'NotAllowedError' ? 'Toque para ativar o som' : 'Toque para tentar novamente');
    }
  }
  button.addEventListener('click', () => sound.paused ? start(true) : stop(true));
  sound.addEventListener('ended', () => show(false, 'Ouvir novamente', 'Áudio ilustrativo · 6 segundos'));
  sound.addEventListener('error', () => show(false, 'Som indisponível', 'A experiência visual continua ativa'));
  document.addEventListener('visibilitychange', () => { if (document.hidden && !sound.paused) stop(); });
  document.addEventListener('shineray:audio-start', e => { if (e.detail?.source !== 'intro') stop(); });
  new IntersectionObserver(entries => { if (!entries[0].isIntersecting && !sound.paused) stop(); }).observe(hero);
  show(false, 'Ouvir partida', 'Toque para ouvir o ronco do motor');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', e => {
      if (reduced.matches) return;
      const target = e.target.closest('.button:not(:disabled),.header-cta');
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty('--magnet-x', ((e.clientX - r.left - r.width / 2) * .035) + 'px');
      target.style.setProperty('--magnet-y', ((e.clientY - r.top - r.height / 2) * .07) + 'px');
    }, { passive: true });
    document.addEventListener('pointerout', e => {
      const target = e.target.closest('.button,.header-cta');
      if (target && !target.contains(e.relatedTarget)) { target.style.removeProperty('--magnet-x'); target.style.removeProperty('--magnet-y'); }
    }, { passive: true });
    hero.addEventListener('pointermove', e => {
      if (reduced.matches) return;
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--light-x', 65 + (e.clientX / r.width - .5) * 6 + '%');
      hero.style.setProperty('--light-y', 35 + ((e.clientY - r.top) / r.height - .5) * 6 + '%');
    }, { passive: true });
  }
})();

(() => {
  /* === 1. Barra de progresso RPM no topo === */
  const bar = document.createElement('div');
  bar.id = 'rpmProgressBar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  const brandEntry = document.getElementById('brandEntry');
  const syncSplashVisibility = () => {
    const isSplashOpen = Boolean(brandEntry && brandEntry.hasAttribute('open'));
    bar.classList.toggle('is-hidden', isSplashOpen);
  };

  if (brandEntry) {
    new MutationObserver(syncSplashVisibility).observe(brandEntry, {
      attributes: true,
      attributeFilter: ['open']
    });
  }
  syncSplashVisibility();

  let ticking = false;
  const updateRpmBar = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    bar.style.transform = `scaleX(${progress})`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateRpmBar);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateRpmBar, { passive: true });
  updateRpmBar();

  /* === 2. Toggle Modo Dia / Noite no Estúdio Interativo === */
  const stage = document.getElementById('machineStage');
  const dash = document.getElementById('dash');
  if (!stage) return;

  const moonIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
  const sunIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"/></svg>';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.id = 'studioNightToggle';
  toggle.className = 'studio-night-toggle';
  toggle.setAttribute('aria-pressed', 'false');
  toggle.setAttribute('aria-label', 'Ativar modo noite no estúdio');
  toggle.innerHTML = `${moonIcon}<span>Modo Noite</span>`;

  let isNight = false;
  toggle.addEventListener('click', () => {
    isNight = !isNight;
    stage.classList.toggle('night-mode', isNight);
    if (dash) dash.classList.toggle('night-mode', isNight);
    toggle.setAttribute('aria-pressed', String(isNight));
    toggle.setAttribute('aria-label', isNight ? 'Voltar para o modo dia no estúdio' : 'Ativar modo noite no estúdio');
    toggle.innerHTML = isNight ? `${sunIcon}<span>Modo Dia</span>` : `${moonIcon}<span>Modo Noite</span>`;
  });

  stage.appendChild(toggle);
})();

