/* Portal de consulta estático. Sin cuentas, API de IA ni datos de pacientes. */
'use strict';
const D = window.PLAN_DATA;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const DOC_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H6V3h1zM14 3v5h4M9 12h6M9 16h6"/></svg>';
const allDiagrams = D.steps.flatMap(s => s.diagrams.map(d => ({...d,step:s.id})));
let currentStep = 1, stepTab = 'documents', libraryKind = 'documents', resultPage = 0, diagramIndex = 0;
let modalReturnHash = '#ruta', previousFocus = null, currentDoc = null;
const pageSize = 8;

function stepNav() {
  $('#step-list').innerHTML = ['Comprender','Analizar','Diseñar'].map(group => `<div class="step-group"><span>${group}</span><span>${group==='Comprender'?'01–03':group==='Analizar'?'04–07':'08–12'}</span></div>${D.steps.filter(s=>s.group===group).map(s=>`<button class="step-button ${s.id>8?'pending':''}" data-step="${s.id}" aria-current="${s.id===currentStep?'step':'false'}"><span class="step-n">${String(s.id).padStart(2,'0')}</span><span>${esc(s.title)}</span><span class="step-state" aria-label="${s.status}">${s.id<=8?'✓':'○'}</span></button>`).join('')}`).join('');
  $('#mobile-step').innerHTML = D.steps.map(s=>`<option value="${s.id}">${String(s.id).padStart(2,'0')} · ${esc(s.title)}${s.id>8?' — Pendiente':''}</option>`).join('');
}
function docRow(doc, inLibrary=false) {
  return `<button class="document-row" data-doc="${doc.id}"><span class="doc-icon">${DOC_ICON}</span><span>${inLibrary?`<span class="doc-step">${doc.step?`Paso ${String(doc.step).padStart(2,'0')}`:'Proyecto'}</span>`:''}<strong>${esc(doc.title)}</strong><small>${esc(doc.description)}</small></span><span class="row-arrow" aria-hidden="true">↗</span></button>`;
}
function diagramTile(d, inLibrary=false) {
  return `<button class="diagram-tile" data-diagram="${d.id}" aria-label="Ampliar ${esc(d.title)}${inLibrary?`, paso ${d.step}`:''}"><img src="${d.path}" loading="lazy" alt="Vista de ${esc(d.title)}" width="320" height="190"><span>${inLibrary?`<small class="doc-step">Paso ${String(d.step).padStart(2,'0')}</small>`:''}${esc(d.title)}</span></button>`;
}
function renderStep(id) {
  const s = D.steps.find(s=>s.id===Number(id)); if(!s) return;
  currentStep=s.id; stepTab='documents';
  $$('.step-button').forEach(b=>b.setAttribute('aria-current',Number(b.dataset.step)===s.id?'step':'false'));
  $('#mobile-step').value=s.id;
  $('#step-panel').innerHTML=`<div class="step-top"><span class="step-number">Paso ${String(s.id).padStart(2,'0')} de 12 · ${s.group}</span><span class="badge ${s.id>8?'pending':''}">${s.status}</span></div><h3>${esc(s.formal)}</h3><p class="step-question">${esc(s.question)}</p><p class="step-description">${esc(s.description)}</p><p class="deliverables-title">${s.id<=8?'Qué se ha preparado':'Qué se preparará'}</p><ul class="step-points">${s.items.map(v=>`<li>${esc(v)}</li>`).join('')}</ul><p class="step-note">${esc(s.note)}</p>${s.documents.length?`<div class="step-tabs" role="tablist" aria-label="Entregables del paso ${s.id}"><button role="tab" aria-selected="true" id="step-doc-tab" aria-controls="step-deliverables" data-step-tab="documents">Lectura <span>(${s.documents.length})</span></button>${s.diagrams.length?`<button role="tab" tabindex="-1" aria-selected="false" id="step-diagram-tab" aria-controls="step-deliverables" data-step-tab="diagrams">Diagramas <span>(${s.diagrams.length})</span></button>`:''}</div><div id="step-deliverables" role="tabpanel" aria-labelledby="step-doc-tab"></div>`:`<div class="pending-placeholder"><span aria-hidden="true">○</span><p>Este paso aún no tiene entregables.<br>Su contenido se incorporará al completar la planificación correspondiente.</p></div>`}`;
  renderStepContent();
}
function renderStepContent() {
  const el=$('#step-deliverables'); if(!el)return;
  const s=D.steps[currentStep-1];
  el.innerHTML=stepTab==='documents'?s.documents.map(id=>docRow(D.documents.find(d=>d.id===id))).join(''):`<div class="step-diagrams">${s.diagrams.map(d=>diagramTile(d)).join('')}</div>`;
  el.setAttribute('aria-labelledby',stepTab==='documents'?'step-doc-tab':'step-diagram-tab');
  $$('[data-step-tab]').forEach(b=>{b.setAttribute('aria-selected',b.dataset.stepTab===stepTab);b.tabIndex=b.dataset.stepTab===stepTab?0:-1;});
}
function changeLibrary(kind) {
  libraryKind=kind; resultPage=0;
  $$('[data-kind]').forEach(b=>{b.setAttribute('aria-selected',b.dataset.kind===kind);b.tabIndex=b.dataset.kind===kind?0:-1;});
  $('#library-results').setAttribute('aria-labelledby',`tab-${kind}`);
  const req=kind==='requirements';
  $('label[for="filter"]').textContent=req?'Filtrar por módulo':'Filtrar por paso';
  const opts=req?[...new Set(D.requirements.map(r=>r.modulo))].map(m=>({value:m,label:m})):D.steps.filter(s=>kind!=='diagrams'||s.diagrams.length).filter(s=>s.id<=8).map(s=>({value:s.id,label:`Paso ${String(s.id).padStart(2,'0')} · ${s.title}`}));
  $('#filter').innerHTML=`<option value="">${req?'Todos los módulos':'Todos los pasos'}</option>`+opts.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('');
  $('#req-state').hidden=!req;$('#req-state-label').hidden=!req;
  renderLibrary();
}
function requirementRow(r) {
  return `<details class="req-item"><summary><span class="req-code">${esc(r.codigo)}</span><span class="req-title">${esc(r.titulo)}</span><span class="badge ${r.estado!=='Propuesto'?'pending':''}">${r.estado==='Propuesto'?'Propuesto':'Pendiente'}</span></summary><div class="req-content"><p>${esc(r.descripcion)}</p><div class="req-meta">${esc(r.modulo)} · Prioridad ${esc(r.prioridad.toLowerCase())} · ${esc(r.tipo==='RF'?'Funcional':'No funcional')}</div><h4>Criterios de aceptación</h4><ul>${r.aceptacion.map(c=>`<li><strong>${esc(c.codigo)}</strong><br>${esc(c.texto)}</li>`).join('')}</ul>${r.pendiente?`<p><strong>Por aclarar:</strong> ${esc(r.pendiente)}</p>`:''}<p class="req-meta">Verificación ${esc(r.verificacion)}: ${esc(r.resultado_prueba)}.</p><button class="text-button" data-doc="p05-especificacion-de-requisitos-ers">Leer en la especificación completa</button></div></details>`;
}
function renderLibrary() {
  const query=norm($('#search').value.trim());const filter=$('#filter').value, state=$('#req-state').value;
  let items=libraryKind==='documents'?D.documents:libraryKind==='diagrams'?allDiagrams:D.requirements;
  items=items.filter(x=>(!filter||(libraryKind==='requirements'?x.modulo===filter:String(x.step)===filter))&&(libraryKind!=='requirements'||!state||x.estado===state)&&(!query||norm(libraryKind==='documents'?`${x.title} ${x.description} ${x.markdown}`:libraryKind==='diagrams'?`${x.title} ${D.steps[x.step-1].formal}`:`${x.codigo} ${x.titulo} ${x.descripcion} ${x.aceptacion.map(a=>a.texto).join(' ')}`).includes(query)));
  const pages=Math.max(1,Math.ceil(items.length/pageSize));resultPage=Math.min(resultPage,pages-1);
  const visible=items.slice(resultPage*pageSize,(resultPage+1)*pageSize);
  $('#result-count').textContent=`${items.length} ${items.length===1?'resultado':'resultados'}`;
  $('#page-count').textContent=`Página ${resultPage+1} de ${pages}`;
  $('#prev-results').disabled=resultPage===0;$('#next-results').disabled=resultPage>=pages-1;
  $('#library-results').innerHTML=items.length?`<div class="library-${libraryKind==='documents'?'docs':libraryKind}">${visible.map(x=>libraryKind==='documents'?docRow(x,true):libraryKind==='diagrams'?diagramTile(x,true):requirementRow(x)).join('')}</div>`:`<div class="empty"><strong>No encontramos coincidencias.</strong><p>Prueba otra palabra o cambia el filtro. Puedes buscar “citas”, “IA” o “RF-001”.</p></div>`;
}
function pathKey(href, source) {
  try {const sourceUrl='https://portal.local/'+source;return decodeURIComponent(new URL(href,sourceUrl).pathname.slice(1));}catch{return '';}
}
function safeHtml(doc) {
  const html=marked.parse(doc.markdown,{gfm:true,breaks:false});
  const template=document.createElement('template');template.innerHTML=html;
  const allowed=new Set(['P','H1','H2','H3','H4','H5','H6','STRONG','EM','DEL','S','UL','OL','LI','BLOCKQUOTE','PRE','CODE','HR','BR','TABLE','THEAD','TBODY','TR','TH','TD','A','IMG','SPAN','DIV','SUP','SUB']);
  for(const el of [...template.content.querySelectorAll('*')]) {
    if(!allowed.has(el.tagName)){el.replaceWith(document.createTextNode(el.textContent));continue;}
    const href=el.getAttribute('href'),src=el.getAttribute('src'),alt=el.getAttribute('alt');
    for(const a of [...el.attributes])el.removeAttribute(a.name);
    if(el.tagName==='A'){
      const key=pathKey(href||'',doc.source), mapped=D.sourceMap[key];
      if(mapped&&D.documents.some(d=>d.id===mapped)){el.href=`#documento/${mapped}`;el.dataset.doc=mapped;}
      else if(mapped&&mapped.startsWith('diagramas/')){const d=allDiagrams.find(d=>d.path===mapped);if(d){el.href=`#diagrama/${d.id}`;el.dataset.diagram=d.id;}}
      else if(/^https?:\/\//i.test(href||'')&&!/\.(docx?|pdf|drawio|zip|png|svg)(\?|#|$)/i.test(href)){el.href=href;el.target='_blank';el.rel='noopener noreferrer';}
      else {const span=document.createElement('span');span.className='source-text';span.textContent=el.textContent;el.replaceWith(span);}
    }
    if(el.tagName==='IMG'){
      const mapped=D.sourceMap[pathKey(src||'',doc.source)];
      if(mapped&&mapped.startsWith('diagramas/')){el.src=mapped;el.alt=alt||'Figura del documento';el.loading='lazy';}
      else{const label=document.createElement('span');label.textContent=alt||'Figura disponible en los diagramas del paso';el.replaceWith(label);}
    }
  }
  return template.content;
}
function openReader(id) {
  const doc=D.documents.find(d=>d.id===id);if(!doc)return false;
  if($('#reader').open&&currentDoc===id)return true;
  currentDoc=id;
  if($('#diagram-viewer').open)$('#diagram-viewer').close();
  $('#reader-title').textContent=doc.title;
  $('#reader-context').textContent=doc.step?`Paso ${String(doc.step).padStart(2,'0')} · Lectura del documento`:'Planificación · Documento general';
  const content=$('#reader-content');content.replaceChildren(safeHtml(doc));
  const note=document.createElement('div');note.className='reading-note';note.textContent='Contenido académico para revisión. Los supuestos y decisiones pendientes conservan el estado indicado en cada documento.';content.prepend(note);
  $$('table',content).forEach(t=>{const box=document.createElement('div');box.className='table-scroll';box.tabIndex=0;box.setAttribute('aria-label','Tabla desplazable');t.replaceWith(box);box.append(t);});
  const headings=$$('h2,h3',content);headings.forEach((h,i)=>h.id=`reading-${i}`);
  $('#toc').innerHTML=headings.map((h,i)=>`<a href="#reading-${i}" class="${h.tagName==='H3'?'subheading':''}" data-heading="reading-${i}">${esc(h.textContent)}</a>`).join('')||'<p>Lectura continua</p>';
  if(!$('#reader').open)$('#reader').showModal();
  document.body.classList.add('modal-open');content.scrollTop=0;$('.close-reader').focus();return true;
}
function openDiagram(id) {
  const index=allDiagrams.findIndex(d=>d.id===id);if(index<0)return false;diagramIndex=index;
  if($('#reader').open)$('#reader').close();
  const d=allDiagrams[index];
  $('#diagram-title').textContent=d.title;$('#diagram-context').textContent=`Paso ${String(d.step).padStart(2,'0')} · ${D.steps[d.step-1].formal}`;
  const group=allDiagrams.filter(x=>x.step===d.step);$('#diagram-position').textContent=`${group.findIndex(x=>x.id===id)+1} / ${group.length}`;
  const image=$('#diagram-image');image.src=d.path;image.alt=`${d.title}, paso ${d.step}`;
  $('#zoom').value=100;setZoom();
  $('#diagram-prev').disabled=group[0].id===id;$('#diagram-next').disabled=group.at(-1).id===id;
  if(!$('#diagram-viewer').open)$('#diagram-viewer').showModal();
  document.body.classList.add('modal-open');$('.diagram-stage').scrollTo(0,0);$('.close-diagram').focus();return true;
}
function setZoom(){const value=Number($('#zoom').value);$('#diagram-image').style.width=`${value}%`;$('#zoom-output').textContent=`${value}%`;}
function navigateModal(type,id){
  if(!$('#reader').open&&!$('#diagram-viewer').open){modalReturnHash=location.hash&&!/^#(documento|diagrama)\//.test(location.hash)?location.hash:'#ruta';previousFocus=document.activeElement;}
  const next=`#${type}/${encodeURIComponent(id)}`;if(location.hash===next)syncRoute();else location.hash=next;
}
function closeViewer(){location.hash=modalReturnHash;}
function syncRoute(){
  let hash;try{hash=decodeURIComponent(location.hash);}catch{hash='';}
  if(hash.startsWith('#documento/')){if(openReader(hash.slice(11)))return;}
  if(hash.startsWith('#diagrama/')){if(openDiagram(hash.slice(10)))return;}
  if($('#reader').open)$('#reader').close();if($('#diagram-viewer').open)$('#diagram-viewer').close();
  document.body.classList.remove('modal-open');currentDoc=null;
  if(previousFocus?.isConnected){previousFocus.focus({preventScroll:true});previousFocus=null;}
  const match=hash.match(/^#paso-(\d+)$/);if(match){renderStep(match[1]);$('#ruta').scrollIntoView({behavior:'auto'});}
  else if(['#inicio','#ruta','#explorar','#enfoque','#equipo'].includes(hash)){document.getElementById(hash.slice(1)).scrollIntoView({behavior:'instant'});}
}
document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-step],[data-doc],[data-diagram],[data-step-tab],[data-kind],[data-heading]');if(!btn)return;
  if(btn.dataset.step){e.preventDefault();const id=Number(btn.dataset.step);renderStep(id);history.replaceState(null,'',`#paso-${id}`);$('#ruta').scrollIntoView({behavior:'auto'});}
  else if(btn.dataset.doc){e.preventDefault();navigateModal('documento',btn.dataset.doc);}
  else if(btn.dataset.diagram){e.preventDefault();navigateModal('diagrama',btn.dataset.diagram);}
  else if(btn.dataset.stepTab){stepTab=btn.dataset.stepTab;renderStepContent();}
  else if(btn.dataset.kind){changeLibrary(btn.dataset.kind);}
  else if(btn.dataset.heading){e.preventDefault();const target=document.getElementById(btn.dataset.heading);const scroller=$('#reader-content');scroller.scrollTo({top:target.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop-20,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
});
document.addEventListener('keydown',e=>{const tab=e.target.closest('[role="tab"]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const group=$$('[role="tab"]',tab.parentElement);let i=group.indexOf(tab);i=e.key==='Home'?0:e.key==='End'?group.length-1:(i+(e.key==='ArrowRight'?1:-1)+group.length)%group.length;e.preventDefault();group[i].click();group[i].focus();});
$('#mobile-step').addEventListener('change',e=>{renderStep(e.target.value);history.replaceState(null,'',`#paso-${e.target.value}`);});
$('#search').addEventListener('input',()=>{resultPage=0;renderLibrary();});
$('#filter').addEventListener('change',()=>{resultPage=0;renderLibrary();});
$('#req-state').addEventListener('change',()=>{resultPage=0;renderLibrary();});
for(const [id,delta] of [['prev-results',-1],['next-results',1]])$('#'+id).addEventListener('click',()=>{resultPage+=delta;renderLibrary();$('#library-results').focus({preventScroll:true});});
$('.close-reader').addEventListener('click',closeViewer);$('.close-diagram').addEventListener('click',closeViewer);
for(const dialog of [$('#reader'),$('#diagram-viewer')]){dialog.addEventListener('cancel',e=>{e.preventDefault();closeViewer();});dialog.addEventListener('click',e=>{if(e.target===dialog)closeViewer();});}
$('#zoom').addEventListener('input',setZoom);$('#fit-diagram').addEventListener('click',()=>{$('#zoom').value=100;setZoom();$('.diagram-stage').scrollTo(0,0);});
$('#diagram-prev').addEventListener('click',()=>navigateModal('diagrama',allDiagrams[diagramIndex-1].id));
$('#diagram-next').addEventListener('click',()=>navigateModal('diagrama',allDiagrams[diagramIndex+1].id));
$('#diagram-image').addEventListener('error',()=>{$('#diagram-title').textContent='No se pudo mostrar esta vista. Prueba otra vista o recarga la página.';});
window.addEventListener('hashchange',syncRoute);
stepNav();renderStep(1);changeLibrary('documents');syncRoute();

// Un único fondo animado, pausado si la pestaña no está visible o se pide menos movimiento.
const canvas=$('#ambient'),ctx=canvas.getContext('2d'),motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let paused=motionPreference.matches, raf=0, time=0, width=0,height=0,last=0;
const points=Array.from({length:34},(_,i)=>({x:((i*317+83)%1000)/1000,y:((i*191+43)%1000)/1000,phase:i*.8}));
function resizeAmbient(){const scale=Math.min(devicePixelRatio||1,2);width=innerWidth;height=innerHeight;canvas.width=width*scale;canvas.height=height*scale;ctx.setTransform(scale,0,0,scale,0,0);drawAmbient();}
function drawAmbient(){ctx.clearRect(0,0,width,height);const nodes=points.map(p=>({x:p.x*width+Math.sin(time*.14+p.phase)*18,y:p.y*height+Math.cos(time*.11+p.phase)*15}));ctx.lineWidth=.7;nodes.forEach((p,i)=>{for(let j=i+1;j<nodes.length;j++){const q=nodes[j],dist=Math.hypot(p.x-q.x,p.y-q.y);if(dist<175){ctx.strokeStyle=`rgba(10,125,134,${.14*(1-dist/175)})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}ctx.fillStyle='rgba(11,125,133,.17)';ctx.beginPath();ctx.arc(p.x,p.y,1.8,0,Math.PI*2);ctx.fill();});}
function animate(timestamp){if(paused||document.hidden){raf=0;return;}if(!last||timestamp-last>=32){time+=.033;drawAmbient();last=timestamp;}raf=requestAnimationFrame(animate);}
function updateMotion(){cancelAnimationFrame(raf);raf=0;$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').title=paused?'Activar el movimiento del fondo':'Pausar el movimiento del fondo';$('#motion').setAttribute('aria-label',$('#motion').title);$('#motion').innerHTML=`<span aria-hidden="true">${paused?'▷':'Ⅱ'}</span><span class="motion-label">${paused?'Activar fondo':'Pausar fondo'}</span>`;drawAmbient();if(!paused&&!document.hidden)raf=requestAnimationFrame(animate);}
$('#motion').addEventListener('click',()=>{paused=!paused;updateMotion();});
motionPreference.addEventListener('change',e=>{paused=e.matches;updateMotion();});
document.addEventListener('visibilitychange',updateMotion);window.addEventListener('resize',resizeAmbient);resizeAmbient();updateMotion();
