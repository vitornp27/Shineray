const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced){document.documentElement.classList.add('js-motion');const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveal.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));}
const menu=document.getElementById('mobileMenu'),toggle=document.getElementById('menuToggle');
function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu');toggle.innerHTML='Menu <span>+</span>'}
toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');toggle.innerHTML=open?'Fechar <span>−</span>':'Menu <span>+</span>'});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
const number='5535998174929';window.SHINERAY_WHATSAPP_NUMBER=number;document.querySelectorAll('[data-wa]').forEach(a=>a.href=`https://wa.me/${number}?text=${encodeURIComponent(a.dataset.wa)}`);
/* nota10-wa-start */
(() => {
  const waBtn = document.querySelector('.whatsapp');
  if (!waBtn || !('IntersectionObserver' in window) || !matchMedia('(max-width: 760px)').matches) return;
  const zones = document.querySelectorAll('#explorar,#catalogSearch,.button.red,.quiz-next,a[href*="wa.me/"]:not(.whatsapp)');
  if (!zones.length) return;
  const active = new Set();
  const sync = () => {
    const hide = active.size > 0;
    waBtn.classList.toggle('is-hidden', hide);
    document.body.classList.toggle('wa-hidden', hide);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) active.add(en.target); else active.delete(en.target); });
    sync();
  }, { threshold: 0.15 });
  zones.forEach((el) => io.observe(el));
  /* nota10-cmp-obs */
  const cmp = document.getElementById('compareResults');
  const watchCmp = () => { if (cmp) cmp.querySelectorAll('.compare-table-actions,.compare-wa').forEach((el) => io.observe(el)); };
  watchCmp();
  if (cmp) new MutationObserver(watchCmp).observe(cmp, { childList: true, subtree: true });
})();
/* nota10-wa-end */

document.getElementById('contactForm').addEventListener('submit',e=>{e.preventDefault();const model=document.getElementById('model').value,interest=document.querySelector('input[name="interest"]:checked').value;const message=`Olá, Shineray Poços de Caldas! Vim pelo site. Meu interesse: ${model}. Gostaria de ${interest.toLowerCase()}.`;if(typeof window.trackEvent==='function'){window.trackEvent('whatsapp_lead',{origem:'contact_form',modelo:model});}window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');});
const detailData=[['assets/panel.webp','Painel digital da SHI 175'],['assets/brakes.webp','Rodas raiadas e freios a disco da SHI 175'],['assets/suspension.webp','Suspensão da SHI 175']];document.querySelectorAll('[data-detail]').forEach(btn=>btn.addEventListener('click',()=>{const n=Number(btn.dataset.detail);document.querySelectorAll('[data-detail]').forEach((b,i)=>{b.classList.toggle('active',i===n);b.setAttribute('aria-expanded',String(i===n));b.querySelector('.detail-text').hidden=i!==n;b.querySelector('.detail-plus').textContent=i===n?'−':'+'});const img=document.getElementById('detailImage');img.src=detailData[n][0];img.alt=detailData[n][1];document.getElementById('detailCounter').textContent=`0${n+1} / 03`;}));
const range=document.getElementById('angle'),spin=document.getElementById('spinImage'),stage=document.getElementById('spinStage');let frame=5,loaded=false;const cache=[];
function loadFrames(){if(loaded)return;loaded=true;for(let n=1;n<=29;n++){const img=new Image();img.src=`assets/spin-${n}.webp`;cache.push(img)}}
function setFrame(n){frame=(((Number(n)-1)%29+29)%29)+1;spin.src=`assets/spin-${frame}.webp`;range.value=frame;stage.dispatchEvent(new CustomEvent('spinframe',{detail:frame}));range.setAttribute('aria-valuetext',`Ângulo ${frame} de 29`)}
range.addEventListener('input',()=>{loadFrames();setFrame(range.value)});document.getElementById('spinPrev').addEventListener('click',()=>{loadFrames();setFrame(frame-1)});document.getElementById('spinNext').addEventListener('click',()=>{loadFrames();setFrame(frame+1)});
let drag=false,startX=0,startFrame=5;stage.addEventListener('pointerdown',e=>{loadFrames();drag=true;startX=e.clientX;startFrame=frame;stage.setPointerCapture(e.pointerId)});stage.addEventListener('pointermove',e=>{if(drag)setFrame(startFrame+Math.round((e.clientX-startX)/12))});['pointerup','pointercancel'].forEach(evt=>stage.addEventListener(evt,()=>drag=false));
new IntersectionObserver((entries,ob)=>{if(entries.some(e=>e.isIntersecting)){loadFrames();ob.disconnect()}},{rootMargin:'150px'}).observe(stage);
if(!reduced&&matchMedia('(pointer:fine)').matches){const hero=document.querySelector('.hero'),bike=document.getElementById('heroBike');let raf;hero.addEventListener('pointermove',e=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const x=(e.clientX/innerWidth-.5)*12,y=(e.clientY/hero.clientHeight-.5)*8;bike.style.transform=`translate(${x}px,${y}px)`})});hero.addEventListener('pointerleave',()=>bike.style.transform='');}
