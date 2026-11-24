// Preference matching, not an assessment of riding ability or guaranteed fit.
export function recommend(products,answers){
 const [use,terrain,power,gear,experience]=answers;
 return products.filter(p=>{
  if(power!=='any'&&p.power!==power)return false;
  if(gear==='automatic'&&p.gear!=='automatic')return false;
  if(gear==='gears'&&p.gear==='automatic')return false;
  if(terrain==='mixed'&&p.terrain!=='mixed')return false;
  if(use==='road'&&(p.power==='electric'||p.category==='Ciclomotores'))return false;
  return true;
 }).map(p=>{
  let score=0;const reasons=[];const cc=Number.parseFloat((p.cc||'0').replace(',','.'));
  if(terrain==='mixed'&&p.terrain==='mixed'){score+=8;reasons.push('Perfil trail para o uso misto que você escolheu.');}
  if(terrain==='city'&&p.terrain==='city'){score+=4;reasons.push('Uma opção para conhecer pensando na sua rotina urbana.');}
  if(power==='electric'){score+=5;reasons.push('Motorização elétrica, como você prefere.');}
  if(gear==='automatic'){score+=4;reasons.push('Condução sem trocas manuais de marcha.');}
  if(use==='commute'&&['Urbanas','Scooters','Motos elétricas'].includes(p.category))score+=4;
  if(use==='work'&&p.category==='Urbanas'){score+=5;reasons.push('Estilo urbano para comparar no uso frequente.');}
  if(use==='road'&&cc>=200){score+=7;reasons.push('Uma alternativa para conhecer pensando nos seus passeios.');}
  if(experience==='first'&&((cc>=100&&cc<=175)||p.category==='Scooters')){score+=3;reasons.push('Vale conhecer pessoalmente e avaliar ergonomia e facilidade de uso.');}
  if(experience==='experienced'&&cc>=175)score+=2;
  if(p.category==='Mobilidade elétrica'&&use!=='short')score-=5;
  if(p.category==='Ciclomotores'&&use!=='short')score-=4;
  if(use==='short'&&['Mobilidade elétrica','Ciclomotores'].includes(p.category))score+=4;
  if(!reasons.length)reasons.push('Combina com as preferências de motorização e câmbio selecionadas.');
  return {...p,score,reasons:reasons.slice(0,2)};
 }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'pt-BR')).slice(0,3);
}
