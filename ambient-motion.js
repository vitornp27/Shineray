(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  let inView = true;
  const sync = () => hero.classList.toggle('motion-resting', !inView || document.hidden);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }, {threshold:0}).observe(hero);
  }
  document.addEventListener('visibilitychange', sync);
  sync();
})();
