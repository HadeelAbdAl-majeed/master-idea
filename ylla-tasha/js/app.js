/* Ylla Tasha shared services + page renderers (frontend demo only; data in LocalStorage). */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cache = {};
const load = f => cache[f] ||= fetch(`data/${f}.json`).then(r => { if (!r.ok) throw new Error(f); return r.json(); });
const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem('ylla-' + k)) ?? d; } catch { return d; } }, set: (k, v) => localStorage.setItem('ylla-' + k, JSON.stringify(v)) };
const toast = m => { let t = $('.toast'); if (!t) { t = document.createElement('button'); t.className = 'toast'; t.type = 'button'; t.onclick = () => t.remove(); document.body.appendChild(t); } t.textContent = m + ' · Close'; };
const q = new URLSearchParams(location.search);
const jod = n => `${Number(n).toFixed(2)} JOD`;

/* Favorites: stored as "type:id" so every page agrees. */
const favs = { all: () => store.get('favs', []), has: k => favs.all().includes(k), toggle(k) { const a = favs.all(), on = !a.includes(k); store.set('favs', on ? [...a, k] : a.filter(x => x !== k)); return on; } };
const paintHeart = b => { const on = favs.has(b.dataset.fav); b.textContent = on ? '♥' : '♡'; b.classList.toggle('selected', on); b.setAttribute('aria-pressed', on); };

/* Bookings (simulated) */
const bookings = { all: () => store.get('bookings', []), add(b) { store.set('bookings', [b, ...bookings.all()]); }, cancel(ref) { store.set('bookings', bookings.all().map(b => b.ref === ref ? { ...b, status: 'Cancelled' } : b)); } };
const newRef = () => 'YT-' + Math.random().toString(36).slice(2, 8).toUpperCase();

/* Reviews (demo, per item; own reviews can be removed) */
const reviews = { get: k => store.get('reviews:' + k, []), set: (k, v) => store.set('reviews:' + k, v) };

/* Lookup: card title -> detail URL (works for static cards that were buttons) */
let idx;
const index = async () => idx ||= Promise.all([load('governorates'), load('places')]).then(([g, p]) => ({ g, p }));
const urlFor = (name, { g, p }) => { const n = name.trim().toLowerCase(); const pl = p.find(x => x.name.toLowerCase() === n); if (pl) return [`place-details.html?id=${pl.id}`, 'place:' + pl.id]; const gv = g.find(x => x.name.toLowerCase() === n); return gv ? [`governorate.html?id=${gv.id}`, 'gov:' + gv.id] : null; };

const placeCard = (p, gName) => `<article class="place-card"><div class="card-image"><img src="${p.image}" alt="${esc(p.name)}, Jordan" loading="lazy"><button class="heart" data-fav="place:${p.id}" aria-label="Save ${esc(p.name)}">♡</button><span class="rating">★ ${p.rating}</span></div><a class="card-body" href="place-details.html?id=${p.id}"><p class="card-type">${esc(p.category)}</p><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="card-meta"><span>${esc(gName)}, Jordan</span><strong>From ${p.priceJOD} JOD</strong></div></a></article>`;
const govCard = g => `<article class="place-card"><div class="card-image"><img src="${g.image}" alt="${esc(g.name)} governorate" loading="lazy"><button class="heart" data-fav="gov:${g.id}" aria-label="Save ${esc(g.name)}">♡</button></div><a class="card-body" href="governorate.html?id=${g.id}"><h3>${esc(g.name)}</h3><p>${esc(g.intro)}</p></a></article>`;
const mapLink = (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
const demoNote = '<p class="demo-note">Prices, availability and schedules on this page are sample demonstration data.</p>';
const notFound = (what, back) => `<div class="empty large"><h2>${what} not found</h2><p>The link may be out of date.</p><a class="primary" href="${back}">Back to Discover Jordan</a></div>`;
const crumbs = (...a) => `<nav class="breadcrumb" aria-label="Breadcrumb">${a.map(([t, h]) => h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`).join(' / ')}</nav>`;
const gallery = (imgs, name) => `<div class="thumbs gallery-thumbs">${imgs.map((s, i) => `<img src="${s}" alt="${esc(name)} photo ${i + 1}" tabindex="0" loading="lazy">`).join('')}</div>`;

/* ---------- Governorate page ---------- */
async function renderGovernorate(root) {
  const { g, p } = await index(); const gv = g.find(x => x.id === q.get('id'));
  if (!gv) { root.innerHTML = notFound('Governorate', 'discover.html'); return; }
  document.title = `${gv.name} | Ylla Tasha — يلا طشة`;
  const places = p.filter(x => x.governorateId === gv.id), near = gv.nearby.map(i => g.find(x => x.id === i)).filter(Boolean);
  const gal = [...new Set([gv.image, ...places.flatMap(x => x.gallery)])].slice(0, 6);
  root.innerHTML = `<section class="subhero gov-hero" style="--hero:url('${gv.image}')"><div class="gov-hero-inner section">${crumbs(['Home', 'index.html'], ['Discover Jordan', 'discover.html'], [gv.name])}<h1>${esc(gv.name)} <span dir="rtl" lang="ar">${esc(gv.nameAr)}</span></h1><p>${esc(gv.intro)}</p><button class="secondary" data-fav="gov:${gv.id}">♡</button></div></section>
  <div class="section gov-body"><section><h2>History and culture</h2><p>${esc(gv.history)}</p><p><a class="text-link" target="_blank" rel="noopener" href="${mapLink(gv.lat, gv.lng)}">Open ${esc(gv.name)} on Google Maps ↗</a></p></section>
  <section><div class="section-heading"><h2>Featured attractions</h2></div>${places.length ? `<div class="card-grid three">${places.map(x => placeCard(x, gv.name)).join('')}</div>` : '<p>No attractions listed yet.</p>'}</section>
  <section><h2>Popular activities</h2><div class="facts">${gv.activities.map(a => `<div><b>${esc(a.name)}</b><span>${esc(a.duration)} · about ${a.priceJOD} JOD per person</span></div>`).join('')}</div>${demoNote}</section>
  <section><h2>Suggested one-day itinerary</h2><ol>${gv.itinerary.map(i => `<li>${esc(i)}</li>`).join('')}</ol></section>
  <section><h2>Photo gallery</h2>${gallery(gal, gv.name)}</section>
  <section><h2>Nearby destinations</h2><div class="card-grid three">${near.map(govCard).join('')}</div></section></div>`;
}

/* ---------- Place detail page ---------- */
async function renderPlace(root) {
  const { g, p } = await index(); const pl = p.find(x => x.id === q.get('id'));
  if (!pl) { root.innerHTML = notFound('Attraction', 'discover.html'); return; }
  const gv = g.find(x => x.id === pl.governorateId); document.title = `${pl.name} | Ylla Tasha — يلا طشة`;
  const key = 'place:' + pl.id, near = p.filter(x => x.governorateId === pl.governorateId && x.id !== pl.id).slice(0, 3);
  root.innerHTML = `<main class="detail-page section">${crumbs(['Home', 'index.html'], ['Discover Jordan', 'discover.html'], [gv.name, 'governorate.html?id=' + gv.id], [pl.name])}
  <div class="detail-top"><div><p class="eyebrow">${esc(pl.category)}</p><h1>${esc(pl.name)}</h1><p><a href="governorate.html?id=${gv.id}">${esc(gv.name)}</a>, Jordan · ★ ${pl.rating} · <span id="rv-count">${pl.reviewCount}</span> sample reviews</p></div><button class="secondary" data-fav="${key}">♡</button></div>
  <div class="detail-layout"><div><img class="detail-hero" id="hero-img" src="${pl.image}" alt="${esc(pl.name)}, Jordan">${gallery([pl.image, ...pl.gallery], pl.name)}
  <section class="detail-copy"><h2>About ${esc(pl.name)}</h2><p>${esc(pl.description)}</p><h2>Historical significance</h2><p>${esc(pl.history)}</p>
  <div class="facts"><div><b>Visit duration</b><span>${esc(pl.duration)}</span></div><div><b>Opening hours</b><span>${esc(pl.hours)}</span></div><div><b>Entry fee</b><span>Sample price from ${pl.priceJOD} JOD</span></div><div><b>Accessibility</b><span>${esc(pl.accessibility)}</span></div></div>
  <h2>Facilities</h2><ul>${pl.facilities.map(f => `<li>${esc(f)}</li>`).join('')}</ul><h2>Visitor tips</h2><ul>${pl.tips.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
  <h2>Directions</h2><p><a class="text-link" target="_blank" rel="noopener" href="${mapLink(gv.lat, gv.lng)}">Open the ${esc(gv.name)} area on Google Maps ↗</a></p></section></div>
  <aside class="booking-card"><p>From</p><h2>${pl.priceJOD}.00 JOD</h2><p>per person · sample price</p>${pl.bookable ? `<a class="primary full" href="booking.html?type=place&id=${pl.id}">Book this experience</a>` : ''}<small>Demonstration booking: nothing is sent to a real provider.</small></aside></div>
  <section><div class="section-heading"><div><h2>Reviews</h2></div></div><div class="review-grid" id="reviews"></div><form id="review-form" class="review-form"><h3>Add your review (demo)</h3><label>Name<input name="name" required maxlength="40"></label><label>Rating<select name="rating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label><label>Comment<textarea name="text" required maxlength="300"></textarea></label><button class="primary">Post review</button></form></section>
  ${near.length ? `<section><h2>Nearby in ${esc(gv.name)}</h2><div class="card-grid three">${near.map(x => placeCard(x, gv.name)).join('')}</div></section>` : ''}</main>`;
  const seed = [['Maya', 5, 'Beautifully paced and full of local details.'], ['Daniel', 5, 'Worth the early start.']];
  const draw = () => { const own = reviews.get(key); $('#reviews').innerHTML = [...own.map((r, i) => `<blockquote>“${esc(r.text)}”<span>${'★'.repeat(r.rating)} · ${esc(r.name)} · ${esc(r.date)} <button class="text-link" data-del="${i}">Delete</button></span></blockquote>`), ...seed.map(r => `<blockquote>“${esc(r[2])}”<span>${'★'.repeat(r[1])} · ${r[0]} (sample)</span></blockquote>`)].join(''); };
  draw();
  $('#reviews').onclick = e => { const i = e.target.dataset.del; if (i == null || !confirm('Delete your review?')) return; const a = reviews.get(key); a.splice(+i, 1); reviews.set(key, a); draw(); toast('Review deleted'); };
  $('#review-form').onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); reviews.set(key, [{ name: f.get('name').trim(), rating: +f.get('rating'), text: f.get('text').trim(), date: new Date().toLocaleDateString('en-GB') }, ...reviews.get(key)]); e.target.reset(); draw(); toast('Review posted'); };
}

/* ---------- Booking page: form, summary, confirmation ---------- */
async function renderBooking(root) {
  const { g, p } = await index(); const pl = p.find(x => x.id === q.get('id'));
  if (!pl) { root.innerHTML = notFound('Experience', 'discover.html'); return; }
  const gv = g.find(x => x.id === pl.governorateId), today = new Date().toISOString().slice(0, 10);
  root.innerHTML = `<main class="section booking-page"><div class="demo-banner" role="note">Frontend demonstration: bookings are saved only in this browser. Nothing is sent to a provider and no payment is taken.</div>${crumbs(['Home', 'index.html'], [pl.name, 'place-details.html?id=' + pl.id], ['Booking'])}<h1>Book ${esc(pl.name)}</h1>
  <div class="detail-layout"><form id="bf" novalidate class="profile-form"><label>Date (sample availability)<input type="date" name="date" min="${today}" required><small class="err" data-for="date"></small></label>
  <label>Time<select name="time"><option>09:00</option><option>13:00</option><option>16:00</option></select></label>
  <label>Participants<input type="number" name="guests" min="1" max="12" value="2" required><small class="err" data-for="guests"></small></label>
  <label>Package<select name="pkg">${pl.packages.map((k, i) => `<option value="${i}">${esc(k.name)} (+${k.addJOD} JOD per person)</option>`).join('')}</select></label>
  <label>Full name<input name="name" autocomplete="name" required><small class="err" data-for="name"></small></label><label>Email<input type="email" name="email" autocomplete="email" required><small class="err" data-for="email"></small></label><label>Phone<input name="phone" autocomplete="tel" required><small class="err" data-for="phone"></small></label>
  <button class="primary">Confirm demo booking</button></form>
  <aside class="booking-card" aria-live="polite"><h2>Summary</h2><p><b>${esc(pl.name)}</b><br>${esc(gv.name)}</p><p id="sm"></p>${demoNote}</aside></div></main>`;
  const f = $('#bf'), calc = () => { const d = Object.fromEntries(new FormData(f)), n = Math.max(1, +d.guests || 1), pp = pl.priceJOD + pl.packages[+d.pkg].addJOD; $('#sm').innerHTML = `${n} × ${jod(pp)}<br><strong>Total: ${jod(n * pp)}</strong>`; return { d, n, pp }; };
  f.oninput = calc; calc();
  f.onsubmit = e => {
    e.preventDefault(); const { d, n, pp } = calc(), err = {};
    if (!d.date || d.date < today) err.date = 'Choose today or a future date.';
    if (!(n >= 1 && n <= 12)) err.guests = 'Enter 1 to 12 participants.';
    if (d.name.trim().length < 2) err.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(d.email)) err.email = 'Enter a valid email address.';
    if (!/^[+\d][\d\s-]{6,}$/.test(d.phone)) err.phone = 'Enter a valid phone number.';
    f.querySelectorAll('.err').forEach(s => s.textContent = err[s.dataset.for] || '');
    if (Object.keys(err).length) { toast('Please fix the highlighted fields'); return; }
    const b = { ref: newRef(), itemType: 'place', itemId: pl.id, itemName: pl.name, date: d.date, time: d.time, guests: n, package: pl.packages[+d.pkg].name, total: n * pp, contact: { name: d.name.trim() }, status: 'Confirmed (demo)', created: new Date().toISOString() };
    bookings.add(b);
    root.innerHTML = `<main class="section booking-page"><div class="empty large"><p class="card-type">Demo booking confirmed</p><h1>${esc(b.ref)}</h1><p>${esc(b.itemName)} · ${esc(b.date)} at ${esc(b.time)} · ${b.guests} participants<br>Estimated total ${jod(b.total)}</p><p class="demo-note">This is a simulated confirmation saved in your browser only. No provider received it.</p><a class="primary" href="my-bookings.html">View My Bookings</a></div></main>`;
    scrollTo(0, 0);
  };
}

/* ---------- My Bookings ---------- */
function renderBookings(root) {
  const draw = () => { const a = bookings.all(); root.innerHTML = `<main class="section booking-page"><div class="demo-banner" role="note">Demo bookings are stored only in this browser.</div><h1>My Bookings</h1>${a.length ? a.map(b => `<article class="table-row"><div><h3>${esc(b.itemName)}</h3><p>${esc(b.ref)} · ${esc(b.date)} ${esc(b.time)} · ${b.guests} guests · ${jod(b.total)}</p></div><span class="status">${esc(b.status)}</span>${b.status === 'Cancelled' ? '' : `<button class="secondary" data-cancel="${b.ref}">Cancel</button>`}</article>`).join('') : '<div class="empty large"><h2>No bookings yet</h2><p>Book an experience to see it here.</p><a class="primary" href="discover.html">Discover Jordan</a></div>'}</main>`; };
  draw();
  root.onclick = e => { const r = e.target.dataset.cancel; if (r && confirm('Cancel this demo booking?')) { bookings.cancel(r); draw(); toast('Booking cancelled'); } };
}

/* ---------- Global wiring: hearts + cards on every page ---------- */
async function wire() {
  const ix = await index();
  document.querySelectorAll('.heart:not([data-fav])').forEach(b => { const n = b.closest('.place-card, .card')?.querySelector('h3')?.textContent; const u = n && urlFor(n, ix); if (u) b.dataset.fav = u[1]; });
  const paintAll = () => document.querySelectorAll('[data-fav]').forEach(b => { paintHeart(b); if (b.classList.contains('secondary')) b.textContent = favs.has(b.dataset.fav) ? '♥ Saved' : '♡ Save'; });
  paintAll();
  document.addEventListener('click', e => {
    const h = e.target.closest('[data-fav]');
    if (h) { const on = favs.toggle(h.dataset.fav); paintAll(); toast(on ? 'Added to favorites' : 'Removed from favorites'); return; }
    const t = e.target.closest('.thumbs img'); if (t) { const hero = $('.detail-hero'); if (hero) { hero.src = t.src; hero.alt = t.alt; } return; }
    const card = e.target.closest('button.card-body, .mini-card, .explorer-stories button'); const n = card?.querySelector('h3')?.textContent; const u = n && urlFor(n, ix);
    if (u) location.assign(u[0]);
  });
}

const page = document.body.dataset.page, root = $('#app');
const pages = { governorate: renderGovernorate, place: renderPlace, booking: renderBooking, bookings: renderBookings };
(async () => { try { if (root && pages[page]) await pages[page](root); await wire(); } catch (e) { console.error(e); if (root) root.innerHTML = '<div class="empty large"><h2>Could not load data</h2><p>Open this project through a local server such as VS Code Live Server.</p></div>'; } })();
})();
