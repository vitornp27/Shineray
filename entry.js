(()=>{
const entry=document.getElementById('brandEntry'),start=document.getElementById('entryStart'),silent=document.getElementById('entrySilent');
if(location.hash)return;
let leaving=false;
function finish(){entry.close();document.body.classList.remove('entry-open');const title=document.getElementById('heroTitle');title.setAttribute('tabindex','-1');title.focus({preventScroll:true});}
function enter(withSound){if(leaving)return;leaving=true;/* som sob demanda no botao Ouvir partida */entry.classList.add('entry-leaving');if(matchMedia('(prefers-reduced-motion:reduce)').matches)finish();else setTimeout(finish,650);}
start.addEventListener('click',()=>enter(false));silent.addEventListener('click',()=>enter(false));entry.addEventListener('cancel',e=>{e.preventDefault();enter(false)});
try{entry.showModal();document.body.classList.add('entry-open');}catch{entry.remove();}
})();
