(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll('main h1,main h2,.hero-bottom>p,.intro-copy>p,.quiz-intro>p:not(.section-label),.contact-copy>p:not(.section-label),.about-bottom>p');
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('pt-BR', { granularity: 'grapheme' }) : null;
  const running = new Set();
  const states = [];
  let frame = 0;

  function finish(state) {
    state.chars.forEach(char => {
      char.classList.add('tw-shown');
      char.classList.remove('tw-cursor');
    });
    state.target.classList.add('tw-complete');
    state.done = true;
    running.delete(state);
  }

  function tick(now) {
    frame = 0;
    if (document.hidden) return;
    running.forEach(state => {
      if (state.started === null) state.started = now;
      const count = Math.min(state.chars.length, Math.floor((now - state.started) / state.interval) + 1);
      if (state.count > 0) state.chars[state.count - 1].classList.remove('tw-cursor');
      for (let i = state.count; i < count; i++) state.chars[i].classList.add('tw-shown');
      state.count = count;
      if (count >= state.chars.length) finish(state);
      else if (count > 0) state.chars[count - 1].classList.add('tw-cursor');
    });
    if (running.size) frame = requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = states.find(s => s.target === entry.target);
      if (!state || state.done) return;
      if (entry.isIntersecting) {
        running.add(state);
        observer.unobserve(entry.target);
        if (!frame) frame = requestAnimationFrame(tick);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 80px 0px' });

  targets.forEach(target => {
    if (target.dataset.twInit) return;
    const label = target.innerText.replace(/\s+/g, ' ').trim();
    if (!label) return;

    target.dataset.twInit = '1';
    target.setAttribute('aria-label', label);

    const visual = document.createElement('span');
    visual.className = 'tw-visual';
    visual.setAttribute('aria-hidden', 'true');
    while (target.firstChild) visual.append(target.firstChild);

    const chars = [];
    const walker = document.createTreeWalker(visual, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word => {
        if (!word.trim()) {
          fragment.append(document.createTextNode(word));
          return;
        }
        const wordSpan = document.createElement('span');
        wordSpan.className = 'tw-word';
        const letters = segmenter ? [...segmenter.segment(word)].map(s => s.segment) : Array.from(word);
        letters.forEach(letter => {
          const char = document.createElement('span');
          char.className = 'tw-char';
          char.textContent = letter;
          chars.push(char);
          wordSpan.append(char);
        });
        fragment.append(wordSpan);
      });
      node.replaceWith(fragment);
    });

    target.append(visual);
    target.classList.add('typewriter');

    const state = {
      target,
      chars,
      started: null,
      count: 0,
      done: false,
      interval: Math.min(22, Math.max(8, 750 / chars.length))
    };
    states.push(state);
    observer.observe(target);
  });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      observer.disconnect();
      states.forEach(finish);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (running.size) {
      running.forEach(state => {
        state.started = performance.now() - state.count * state.interval;
      });
      frame = requestAnimationFrame(tick);
    }
  });
})();

