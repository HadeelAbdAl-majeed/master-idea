/* Vanilla JS interactions for independent HTML pages. No React, TS or runtime. */
(() => {
'use strict';
const $ = (s,root=document) => root.querySelector(s);
const $$ = (s,root=document) => [...root.querySelectorAll(s)];
const notice = message => {let toast=$('.toast');if(!toast){toast=document.createElement('button');toast.className='toast';toast.type='button';toast.addEventListener('click',()=>toast.remove());document.body.appendChild(toast);}toast.textContent=message+' · Close';};
$('.menu-button')?.addEventListener('click',()=>$('.nav')?.classList.toggle('open'));
$$('a[href]').forEach(a=>a.addEventListener('click',()=>$('.nav')?.classList.remove('open')));
// Existing category tabs filter content where possible; otherwise retain visible selection.
$$('button').filter(b=>['All','History','Nature','Adventure','Food','Wellness','Family','Nightlife'].includes(b.textContent.trim())).forEach(btn=>btn.addEventListener('click',()=>{const parent=btn.parentElement;$$('button',parent).forEach(b=>b.classList.remove('active'));btn.classList.add('active');const category=btn.textContent.trim().toLowerCase();const cards=$$('.place-card');cards.forEach(card=>{const text=card.textContent.toLowerCase();card.style.display=category==='all'||text.includes(category)?'':'none';});if(category!=='all'&&!cards.some(c=>c.style.display!=='none')){cards.forEach(c=>c.style.display='');notice('Showing available destinations');}}));
$$('input[type="search"]').forEach(input=>input.addEventListener('input',()=>{const q=input.value.toLowerCase().trim();$$('.place-card, .listing-card').forEach(card=>card.style.display=card.textContent.toLowerCase().includes(q)?'':'none');}));
// Basic forms remain demo-only until the backend is connected.
$$('form').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();notice('Demo form submitted — backend connection is not configured yet.');}));
})();
// Navigation shortcuts for buttons that open other pages.
(()=>{document.querySelectorAll('button').forEach(b=>{const l=b.textContent.trim().toLowerCase();if(l.includes('start planning')||l.includes('plan my trip'))b.addEventListener('click',()=>location.assign('trip-planner.html'));else if(l.includes('sign in')||l.includes('log in'))b.addEventListener('click',()=>location.assign('my-account.html'));});})();
