import {screenTours} from './screens.mjs';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let toastTimer;
function toast(text) { $('#toast').textContent=text; $('#toast').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').hidden=true,5000); }
function choose(container, attribute, value) { $$(container+' ['+attribute+']').forEach(button => button.setAttribute('aria-pressed',String(button.getAttribute(attribute)===String(value)))); }
function applyFrame(image, screen) {
 const crop=screen.crop;
 image.src='assets/screens/'+screen.file+'.jpg';image.alt=screen.alt;
 image.width=screen.sourceWidth;image.height=screen.sourceHeight;
 image.parentElement.style.aspectRatio=crop.width+'/'+crop.height;
 Object.assign(image.style,{width:(screen.sourceWidth/crop.width*100)+'%',height:'auto',left:(-crop.x/crop.width*100)+'%',top:(-crop.y/crop.height*100)+'%'});
}
applyFrame($('.hero-image img'),screenTours.group[0]);
const dialog=$('#screen-dialog');
function openScreen(screen) {
 $('#zoom-title').textContent=screen.title;
 $('#zoom-note').textContent=screen.caption;
 applyFrame($('#zoom-image'),screen);
 dialog.showModal(); document.body.classList.add('zoom-open');
}
$('#zoom-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>document.body.classList.remove('zoom-open'));
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
const selectedScreens={};
function renderTour(key,index=0) {
 const container=$('#tour-'+key), screens=screenTours[key], screen=screens[index];
 selectedScreens[key]=index;
 const get=s=>container.querySelector(s);
 const tabs=get('.screen-tabs');
 tabs.innerHTML=screens.map((item,i)=>`<button type="button" data-screen="${i}" aria-pressed="${i===index}">${item.tab}</button>`).join('');
 tabs.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{renderTour(key,Number(button.dataset.screen));get(`[data-screen="${button.dataset.screen}"]`).focus({preventScroll:true});}));
 const img=get('.screen-image img');applyFrame(img,screen);
 get('.screen-caption').textContent=screen.caption;
 get('.screen-context').textContent=screen.context;
 get('.screen-title-text').textContent=screen.title;
 get('.screen-description').textContent=screen.description;
 get('.screen-pins').innerHTML=screen.points.map((p,i)=>`<button type="button" class="screen-pin" data-point="${i}" style="left:${p.x}%;top:${p.y}%" aria-label="Пояснение ${i+1}: ${p.title}" aria-pressed="${i===0}">${i+1}</button>`).join('');
 get('.screen-points').innerHTML=screen.points.map((p,i)=>`<button type="button" data-point="${i}" aria-pressed="${i===0}"><span>${i+1}</span>${p.title}</button>`).join('');
 function showPoint(i){container.querySelectorAll('[data-point]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.point)===i)));get('.point-detail').textContent=screen.points[i].text;}
 container.querySelectorAll('[data-point]').forEach(button=>button.addEventListener('click',()=>showPoint(Number(button.dataset.point))));
 showPoint(0);
 get('.zoom-button').onclick=()=>openScreen(screen);
}
Object.keys(screenTours).forEach(key=>renderTour(key));
const flows={
 program:{steps:[['Заявка на группу','Слушатель регистрируется или использует свой прежний аккаунт.'],['Проверка администратором','Сотрудник проверяет, что слушатель относится к выбранной группе.'],['Открытие доступа','После одобрения появляется учебная страница группы.'],['Обучение','Расписание, записи, материалы и срок доступа своей группы.']],note:'Выбор группы при регистрации не заменяет проверку. На повторное обучение не нужно создавать новый аккаунт. Общий срок и личное продление учитываются отдельно.'},
 free:{steps:[['Запись на курс','Заявка с лендинга относится к конкретному бесплатному курсу.'],['Назначение курса','Подключённая интеграция или сотрудник открывает персональный доступ.'],['Вход в кабинет','Новый слушатель получает аккаунт; для знакомого используется прежний.'],['Уроки и прогресс','Бесплатный курс появляется в своём разделе, с личным сроком.']],note:'Бесплатный курс тоже имеет персональный доступ и срок. Заявка не открывает другие курсы. Автоматическая выдача работает только там, где цепочка приёма заявок подключена и проверена.'},
 paid:{steps:[['Заказ на курс','Человек выбирает курс в записи на лендинге.'],['Проверка оплаты','Основание для оплаченного доступа — подтверждённый платёж.'],['Персональный доступ','Курс назначается нужному человеку, со своим сроком.'],['Курс в записи','В кабинете слушателя используется именно эта подпись.']],note:'Созданный заказ сам по себе не означает оплату. В админке такие курсы называются «Платные курсы», у слушателя — «Курсы в записи». Интеграцию заказа, оплаты и доступа проверяют перед запуском.'}
};
function renderAccess(value){choose('#access-choices','data-access',value);$('#access-flow').innerHTML=flows[value].steps.map(([title,text],i)=>`<div class="flow-step"><span>0${i+1}</span><h3>${title}</h3><p>${text}</p></div>`).join('');$('#access-note').textContent=flows[value].note;}
const teamCopy={
 sales:[['Объяснить, куда человек попадёт','Показывайте «Моё обучение»: программы, бесплатные курсы и курсы в записи находятся в одном аккаунте.'],['Различать заявку, оплату и доступ','Уточняйте конкретный курс и состояние. Зарегистрироваться, оплатить и получить доступ — разные события.'],['В перспективе видеть продолжение пути','Какие бесплатные курсы связаны с последующими покупками и повторным обучением. Для этого нужен отдельный отчёт.']],
 admin:[['Проверить и открыть доступ','Разобрать заявки на группы, найти слушателя и его обучение, проверить общий срок и персональные продления.'],['Поддерживать страницу группы','Обновить расписание, записи и материалы. Общие блоки позволяют поддерживать одинаковое содержание в нескольких группах.'],['Обратиться к слушателю и услышать ответ','Личные уведомления в ЛК, объявления группы и обратная связь самостоятельных курсов помогают сопровождать обучение.']]
};
function renderTeam(value){choose('#team-choices','data-team',value);$('#team-copy').innerHTML='<ol class="team-list">'+teamCopy[value].map(([title,text],i)=>`<li><span>0${i+1}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join('')+'</ol>';}
const scenarioCopy={account:'Уточните email, с которым выдан доступ. Если человек вошёл под другим аккаунтом, нужного обучения там может не быть. Помогите войти в прежний профиль.',access:'Проверьте именно нужную группу или курс. Для закрытой группы заявка может ещё ожидать проверки; для платного курса отдельно проверяются оплата и открытие доступа.',date:'Сверьте срок конкретного обучения. Истёкший доступ не означает удаление аккаунта. Вопрос продления решается по правилам курса; другие доступы сохраняют свои сроки.'};
$('#access-choices').addEventListener('click',e=>{const b=e.target.closest('[data-access]');if(b)renderAccess(b.dataset.access);});
$('#team-choices').addEventListener('click',e=>{const b=e.target.closest('[data-team]');if(b)renderTeam(b.dataset.team);});
$('#scenario-choices').addEventListener('click',e=>{const b=e.target.closest('[data-scenario]');if(!b)return;choose('#scenario-choices','data-scenario',b.dataset.scenario);$('#scenario-result').textContent=scenarioCopy[b.dataset.scenario];});
function reset(){Object.keys(screenTours).forEach(key=>renderTour(key));renderAccess('program');renderTeam('sales');choose('#scenario-choices','data-scenario','');$('#scenario-result').textContent='Проверка начинается с аккаунта, конкретного курса и статуса доступа. Повторная регистрация не должна быть первым решением.';}
$('#reset-demo').addEventListener('click',()=>{reset();$('#first').scrollIntoView({behavior:'smooth'});toast('Просмотр начат заново. Выберите экран или пояснение.');});
renderAccess('program');renderTeam('sales');
const scenes=$$('.scene');let current=0;let scheduled=false;
function updateDeck(){
 const point=Math.min(innerHeight*.38,300);let best=0;
 scenes.forEach((scene,i)=>{if(scene.getBoundingClientRect().top<=point)best=i;});current=best;
 $('#scene-count').textContent=String(current+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');$('#deck-label').textContent=scenes[current].dataset.title;$('#deck-progress').style.width=(current+1)/scenes.length*100+'%';$('#prev-scene').disabled=current===0;$('#next-scene').disabled=current===scenes.length-1;
}
function go(delta){const next=Math.min(scenes.length-1,Math.max(0,current+delta));scenes[next].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
$('#prev-scene').addEventListener('click',()=>go(-1));$('#next-scene').addEventListener('click',()=>go(1));
addEventListener('scroll',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{updateDeck();scheduled=false;});},{passive:true});addEventListener('resize',updateDeck);
function presentation(on){document.body.classList.toggle('presentation',on);$('#present').setAttribute('aria-pressed',String(on));$('#present').innerHTML=(on?'Завершить показ':'Режим показа')+' <span aria-hidden="true">⤢</span>';if(on)toast('Режим показа: главы переключаются стрелками ← →. Выйти — Escape.');}
$('#present').addEventListener('click',()=>presentation(!document.body.classList.contains('presentation')));
addEventListener('keydown',e=>{if(dialog.open)return;if(!document.body.classList.contains('presentation'))return;if(e.key==='Escape'){presentation(false);return;}if(e.target.closest('input,textarea,select,a,summary,[contenteditable]'))return;if(e.target.closest('button')&&!e.target.closest('#present,#prev-scene,#next-scene'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(e.key==='ArrowRight'?1:-1);}});
updateDeck();
