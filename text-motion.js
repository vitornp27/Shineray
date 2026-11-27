(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = document.querySelectorAll(
    'main h1,main h2,.hero-bottom>p,.intro-copy>p,.quiz-intro>p:not(.section-label),.contact-copy>p:not(.section-label),.about-bottom>p'
  );

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('fm-visible'));
    return;
  }

  document.documentElement.classList.add('fm-ready');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('fm-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  targets.forEach(el => {
    el.classList.add('fm-item');
    observer.observe(el);
  });

  setTimeout(() => {
    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.15) el.classList.add('fm-visible');
    });
  }, 600);
})();
