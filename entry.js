(()=>{
const entry=document.getElementById('brandEntry'),start=document.getElementById('entryStart'),silent=document.getElementById('entrySilent');
if(location.hash)return;
let leaving=false;
function finish(){entry.close();document.body.classList.remove('entry-open');const title=document.getElementById('heroTitle');title.setAttribute('tabindex','-1');title.focus({preventScroll:true});}
function enter(withSound){if(leaving)return;leaving=true;if(withSound){const audio=document.getElementById('startupAudio');if(audio.paused)document.getElementById('startupSound').click();}entry.classList.add('entry-leaving');if(matchMedia('(prefers-reduced-motion:reduce)').matches)finish();else setTimeout(finish,650);}
start.addEventListener('click',()=>enter(true));silent.addEventListener('click',()=>enter(false));entry.addEventListener('cancel',e=>{e.preventDefault();enter(false)});
try{entry.showModal();document.body.classList.add('entry-open');}catch{entry.remove();}
})();
