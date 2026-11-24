(()=>{
 'use strict';
 const $=id=>document.getElementById(id),section=$('camadas'),scene=$('anatomyScene'),parts=[...document.querySelectorAll('.anatomy-part')],range=$('separation');
 if(!section||!scene||!range)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)');
 let automatic=!reduce.matches,current=0,target=0,frame=0,active=false,lastTime=0,selected='all',unit=1,tiltX=0,tiltY=0;
 const clamp=n=>Math.min(1,Math.max(0,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
 function measure(){const r=scene.getBoundingClientRect();unit=Math.min(r.width/900,r.height/600);}
 function render(value){current=clamp(value);scene.style.setProperty('--spread',current.toFixed(4));scene.style.setProperty('--scene-scale',String(1-current*.23));scene.style.setProperty('--scene-y',(tiltY+current*-7)+'deg');scene.style.setProperty('--scene-x',(tiltX+current*3)+'deg');
  parts.forEach((part,i)=>{const p=smooth((current-i*.025)/(.85));const {x,y,z,r}=part.dataset;part.style.transform=`translate3d(${Number(x)*p*unit}px,${Number(y)*p*unit}px,${Number(z)*p*unit}px) rotateZ(${Number(r)*p}deg)`;});
  const percentage=Math.round(current*100);range.value=percentage;range.setAttribute('aria-valuetext',percentage===0?'Moto montada':percentage===100?'Camadas separadas':`${percentage}% de separação`);$('anatomyPercent').textContent=String(percentage).padStart(3,'0');$('anatomyState').textContent=selected!=='all'?document.querySelector(`[data-focus-part="${selected}"]`).textContent.slice(2).toUpperCase():percentage<10?'TUDO SE CONECTA':percentage>90?'CADA DETALHE IMPORTA':'EXPLORE CADA CAMADA';
 }
 function tick(time){frame=0;const dt=Math.min(50,time-(lastTime||time-16));lastTime=time;const delta=target-current;if(reduce.matches||Math.abs(delta)<.001){render(target);lastTime=0;return}render(current+delta*(1-Math.exp(-dt/130)));frame=requestAnimationFrame(tick);}
 function to(value){target=clamp(value);if(!frame)frame=requestAnimationFrame(tick);}
 function mode(value){automatic=value&&!reduce.matches;$('scrollBike').setAttribute('aria-pressed',String(automatic));}
 function focusPart(id){selected=id;document.querySelectorAll('[data-focus-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.focusPart===id)));parts.forEach(p=>{p.classList.toggle('dimmed',id!=='all'&&p.dataset.part!==id);p.classList.toggle('focused',id!=='all'&&p.dataset.part===id)});}
 function scrollTarget(){if(!automatic||!active)return;const rect=section.getBoundingClientRect();if(mobile.matches){to(smooth((innerHeight*.7-rect.top)/(rect.height*.6)));return;}const p=clamp(-rect.top/Math.max(1,section.offsetHeight-innerHeight));to(p<.12?0:p<.48?smooth((p-.12)/.36):p<.72?1:1-smooth((p-.72)/.28));}
 let scrollFrame=0;function scheduleScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;scrollTarget();});}
 new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active){measure();scheduleScroll();}},{rootMargin:'100px'}).observe(section);
 addEventListener('scroll',scheduleScroll,{passive:true});addEventListener('resize',()=>{measure();render(current);scheduleScroll();},{passive:true});
 range.addEventListener('input',()=>{mode(false);focusPart('all');target=Number(range.value)/100;if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;render(target);});
 $('explodeBike').addEventListener('click',()=>{mode(false);focusPart('all');to(1);});$('assembleBike').addEventListener('click',()=>{mode(false);focusPart('all');to(0);});$('scrollBike').addEventListener('click',()=>{mode(!automatic);focusPart('all');scheduleScroll();});
 document.querySelectorAll('[data-focus-part]').forEach(b=>b.addEventListener('click',()=>{mode(false);focusPart(b.dataset.focusPart);if(selected!=='all')to(1);else render(current);}));
 function reducedChange(){mode(false);$('scrollBike').disabled=reduce.matches;if(reduce.matches){tiltX=tiltY=0;to(target);}else mode(true);scheduleScroll();}reduce.addEventListener('change',reducedChange);$('scrollBike').disabled=reduce.matches;
 if(matchMedia('(pointer:fine)').matches){scene.addEventListener('pointermove',e=>{if(reduce.matches)return;const r=scene.getBoundingClientRect();tiltY=(e.clientX-r.left-r.width/2)/r.width*9;tiltX=-(e.clientY-r.top-r.height/2)/r.height*5;if(!frame)frame=requestAnimationFrame(tick);});scene.addEventListener('pointerleave',()=>{tiltX=tiltY=0;if(!frame)frame=requestAnimationFrame(tick);});}
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else if(!document.hidden){measure();scheduleScroll();}});
 measure();render(0);
 /* Heading entrances are handled by text-motion.js. */
})();
