(() => {
  const photo = document.querySelector('.detail-photo');
  const image = document.getElementById('detailImage');
  const action = document.getElementById('detailAction');
  const status = document.getElementById('detailEffectStatus');
  const meter = document.getElementById('detailEffectMeter');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const speed = document.getElementById('detailSpeed');
  const rotor = document.getElementById('detailRotor');
  const displacement = document.getElementById('detailForkDisplace');
  let selected = 0, active = false, seen = false, visible = false, pending = false, frame = 0, started = 0, last = 0, angle = 0, braking = null;
  const names = ['Repetir partida do painel', 'Girar a roda', 'Comprimir suspensão'];
  const resting = ['Painel aceso', 'Roda parada', 'Suspensão em repouso'];
  function setStatus(text) { if (status.textContent !== text) status.textContent = text; }
  function compress(p) {
    displacement.setAttribute('scale', String(p * 115));
    photo.style.setProperty('--compression', p);
  }
  function stop(reset = true) {
    cancelAnimationFrame(frame); active = false; braking = null;
    photo.classList.remove('detail-running', 'detail-braking');
    action.textContent = names[selected];
    action.setAttribute('aria-pressed','false');
    if (reset) {
      photo.style.setProperty('--screen-light', '1');
      photo.style.setProperty('--rev', '0');
      photo.style.setProperty('--rotation-light', '0');
      speed.textContent = '0'; compress(0);
      meter.textContent = selected === 0 ? 'PRONTO' : selected === 1 ? 'PARADA' : 'REPOUSO';
      setStatus(resting[selected]);
    }
  }
  function brake(time) {
    if (braking !== null) return;
    braking = time;
    photo.classList.add('detail-braking');
    action.textContent = 'Freando…';
    setStatus('Freio acionado · reduzindo o giro');
  }
  function tick(now) {
    if (!active) return;
    const elapsed = (now - started) / 1000;
    const dt = Math.min((now - last) / 1000, .06); last = now;
    if (selected === 0) {
      const lit = Math.min(1, elapsed / .65);
      const rev = elapsed < 1 ? 0 : Math.max(0, Math.sin(Math.min(1,(elapsed-1)/3.4) * Math.PI));
      photo.style.setProperty('--screen-light', lit);
      photo.style.setProperty('--rev', rev);
      speed.textContent = elapsed < .55 ? '88' : String(Math.round(rev * 48));
      meter.textContent = elapsed < 1 ? 'INICIANDO' : 'PAINEL ATIVO';
      if(elapsed > 4.7) { stop(); return; }
    } else if (selected === 1) {
      if (elapsed > 3.6 && braking === null) brake(now);
      const spin = braking === null ? Math.min(1,elapsed/.9) : Math.max(0,1-(now-braking)/1300);
      angle += dt * 630 * spin;
      rotor.setAttribute('transform',`rotate(${angle} 510 353)`);
      photo.style.setProperty('--rotation-light', Math.min(1,spin*3));
      meter.textContent = braking === null ? 'EM MOVIMENTO' : 'FRENAGEM';
      if(braking !== null && now-braking > 1450) { stop(); return; }
    } else {
      const p = Math.pow(Math.sin(Math.min(1,elapsed/3.3)*Math.PI),2);
      compress(p);
      setStatus(elapsed < 1.65 ? 'Garfo dianteiro · compressão' : 'Garfo dianteiro · retorno suave');
      meter.textContent = elapsed < 1.65 ? 'COMPRESSÃO' : 'RETORNO';
      if (elapsed > 3.3) { stop(); return; }
    }
    frame = requestAnimationFrame(tick);
  }
  function play() {
    stop(false);
    if (reduce.matches) {
      photo.style.setProperty('--screen-light','1');
      setStatus(['Painel iluminado · movimento reduzido','Freio destacado · movimento reduzido','Garfo destacado · movimento reduzido'][selected]);
      photo.classList.toggle('detail-braking', selected === 1);
      meter.textContent = 'VISUALIZAÇÃO';
      return;
    }
    active = true; started = last = performance.now();
    photo.classList.add('detail-running');
    action.textContent = selected === 1 ? 'Acionar freio' : 'Parar demonstração';
    action.setAttribute('aria-pressed','true');
    setStatus(['Ligando o painel · leitura ilustrativa','Roda girando · experimente o freio','Garfo dianteiro · compressão'][selected]);
    frame = requestAnimationFrame(tick);
  }
  action.addEventListener('click', () => {
    if (active && selected === 1) brake(performance.now());
    else if (active) stop();
    else play();
  });
  document.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => {
    stop(); selected = Number(button.dataset.detail); photo.dataset.effect = String(selected); stop();
    image.style.visibility = selected === 2 ? 'hidden' : 'visible';
    pending = !reduce.matches;
    if (matchMedia('(max-width:650px)').matches && photo.getBoundingClientRect().top < -40) photo.scrollIntoView({behavior:reduce.matches ? 'instant' : 'smooth',block:'center'});
    if (visible && !document.hidden && pending) { pending = false; play(); }
  }));
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) stop();
    else if ((!seen || pending) && !document.hidden) { seen = true; pending = false; if(!reduce.matches) play(); }
  }, {threshold: .35}).observe(photo);
  document.addEventListener('visibilitychange', () => { if(document.hidden) stop(); });
  reduce.addEventListener('change', () => stop());
  stop();
})();
