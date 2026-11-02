import { setClickSound, click, cheer, fanfare, giggle, sparkle, oops, setMuted, isMuted } from './audio.js?v=3';
import { confettiFrom, shake } from './effects.js?v=3';
import { initCursor } from './cursor.js?v=3';

const $ = (s, r = document) => r.querySelector(s);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const shuffle = a => [...a].sort(() => Math.random() - .5);
const U = encodeURI;
const inits = {};
const sections = [...document.querySelectorAll('main section')];
let cur = 0, mapObj = null;

function reveal(el) {
  const open = () => { if (el.classList.contains('unblur')) return; el.classList.add('unblur'); confettiFrom(el, 40); sparkle(); };
  el.addEventListener('click', open);
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
}

function mkTF(id, items, labels) {
  const box = $(id); box.innerHTML = '';
  items.forEach((q, i) => {
    const row = h('div', 'card tf tone' + (i % 5), `<div><b>${q.s}</b><p class="rev"></p></div><div><button data-v="1">${labels[0]}</button> <button data-v="0" class="ghost">${labels[1]}</button></div>`);
    const p = $('p', row);
    row.querySelectorAll('button').forEach(b => b.onclick = () => {
      const ok = (b.dataset.v === '1') === q.a;
      row.classList.remove('ok', 'no'); row.classList.add(ok ? 'ok' : 'no'); p.classList.add('on');
      if (ok) { p.textContent = '✅ ' + q.e; confettiFrom(b, 60); cheer(); }
      else { p.textContent = '❌ ¡Casi! Inténtalo otra vez.'; shake(row); oops(); }
    });
    box.append(row);
  });
}

async function boot() {
  let D;
  try { D = await (await fetch('content.json')).json(); }
  catch (e) { $('#stage').innerHTML = '<p class="card">No se pudo cargar content.json. Abre la página desde GitHub Pages o un servidor local (no con doble clic).</p>'; return; }
  window.__app = 3;
  const M = D.meta;
  setClickSound(U(M.clickSound));
  document.addEventListener('click', click);
  initCursor();
  $('#logoEnd').onerror = e => { e.target.hidden = true; }; $('#logoEnd').src = U(M.logo);
  $('#coverImg').src = U(M.cover); $('#agrImg').src = U(M.agradar); $('#cisternaImg').src = U(M.cisterna);
  initNav(); initTimer(); initControls();
  $('#goBtn').onclick = e => { confettiFrom(e.currentTarget, 120); fanfare(); setTimeout(() => show(1), 600); };
  reveal($('#agrBox'));

  // Tarjetas de lectura
  inits['s-cards'] = () => {
    const box = $('#cards'), det = $('#cardDetail'); box.innerHTML = ''; det.className = 'card rev';
    D.cards.forEach((k, i) => {
      const b = h('button', 'opt tone' + (i % 5), `<h3 class="c${i % 4 + 1}">${k.ref}</h3>${k.title}`);
      b.onclick = () => {
        box.querySelectorAll('.opt').forEach(x => x.classList.remove('sel')); b.classList.add('sel', 'seen'); sparkle();
        det.className = 'card rev on tone' + (i % 5);
        det.innerHTML = `<h3>${k.ref} · ${k.title}</h3><p>${k.desc}</p><p><b>Pregunta:</b> ${k.q}</p><button class="ghost" data-more>Ver conexión y aplicación</button><div class="rev"><p class="note">${k.link}</p><p><b>Aplicación:</b> ${k.app}</p></div>` +
          (k.heart ? '<div class="heart"><textarea rows="2" maxlength="120" placeholder="Escribe una promesa o una meta…"></textarea><button>💗 Guardarla en mi corazón</button><p class="bigheart"></p></div>' : '');
        $('[data-more]', det).onclick = e => { $('.rev', det).classList.toggle('on'); confettiFrom(e.currentTarget, 20); };
        if (k.heart) { const hb = $('.heart button', det); hb.onclick = () => { const t = $('.heart textarea', det).value.trim(); if (!t) return; $('.bigheart', det).textContent = '💗 ' + t; confettiFrom(hb, 80); fanfare(); }; }
      };
      box.append(b);
    });
  };

  inits['s-dura'] = () => mkTF('#dura', D.dura, ['Dura mucho', 'Se acaba pronto']);

  // José vs Jeremías
  inits['s-compare'] = () => {
    const C = D.compare, chips = $('#chips'), box = $('#cmp'); chips.innerHTML = box.innerHTML = '';
    $('#cmpClose').textContent = C.close;
    C.rows.forEach(r => {
      const row = h('div', 'cmpRow', `<div class="cmpHead card tone2"><span class="big-ico">${r.icon}</span><b>${r.topic}</b></div>`);
      [['José', 'tone0', r.j], ['Jeremías', 'tone1', r.e]].forEach(([n, t, x]) => {
        const c = h('div', 'cell card rv ' + t, `<b>${n}</b><div class="blurtxt">${x}</div>`); c.tabIndex = 0; c.setAttribute('role', 'button'); reveal(c); row.append(c);
      });
      row.dataset.tag = r.tag; box.append(row);
    });
    C.filters.forEach((f, i) => {
      const b = h('button', 'chip' + (i === 0 ? ' on' : ''), f);
      b.onclick = () => { chips.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); box.querySelectorAll('.cmpRow').forEach(r => { r.hidden = i !== 0 && r.dataset.tag !== f; }); sparkle(); };
      chips.append(b);
    });
  };
  $('#showAll').onclick = e => { document.querySelectorAll('#cmp .rv').forEach(x => x.classList.add('unblur')); confettiFrom(e.currentTarget, 50); cheer(); };

  // Mapa interactivo (Leaflet)
  const PAIS = { Egypt: ['Egipto', '#ffe3a3'], Israel: ['Israel', '#cfe8ff'], Palestine: ['Palestina', '#bfeacb'], Jordan: ['Jordania', '#f5d0e8'], Lebanon: ['Líbano', '#d9f0a8'], Syria: ['Siria', '#ffd2c4'], Iraq: ['Irak', '#e0d4ff'], Turkey: ['Turquía', '#c9eef2'], 'Saudi Arabia': ['Arabia Saudita', '#fff0b8'], Kuwait: ['Kuwait', '#f9c9d6'], Iran: ['Irán', '#d4e6c8'], Cyprus: ['Chipre', '#ffe0f0'], 'Northern Cyprus': ['Chipre', '#ffe0f0'],
    Libya: ['Libia'], Sudan: ['Sudán'], Greece: ['Grecia'], Armenia: ['Armenia'], Georgia: ['Georgia'], Azerbaijan: ['Azerbaiyán'], Turkmenistan: ['Turkmenistán'], Yemen: ['Yemen'], Oman: ['Omán'], 'United Arab Emirates': ['Emiratos Árabes Unidos'], Qatar: ['Catar'], Afghanistan: ['Afganistán'], Pakistan: ['Pakistán'], Eritrea: ['Eritrea'], Bulgaria: ['Bulgaria'], Russia: ['Rusia'], Kazakhstan: ['Kazajistán'] };
  const COLORS = ['#e6194b','#3cb44b','#f58231','#4363d8','#911eb4','#0e9aa7','#c9a400','#f032e6','#808000','#008080','#9a6324','#e07b91','#800000','#5b8c00','#000075','#2d9cdb','#7d3cff','#d2691e'];
  inits['s-map'] = () => {
    const P = D.map, list = $('#rlist'), det = $('#rdet'), chips = $('#mchips'), box = $('#map');
    list.innerHTML = chips.innerHTML = ''; det.className = 'card rev';
    $('#mapIntro').textContent = P.intro; $('#mapDisc').textContent = P.disc;
    if (mapObj) { mapObj.remove(); mapObj = null; }
    box.innerHTML = '';
    const col = k => P.conf.find(c => c.k === k), layers = {}, items = {};
    const hl = (n, on) => { layers[n]?.setStyle({ fillOpacity: on ? .7 : .28, weight: on ? 4 : 1.5 }); if (on) layers[n]?.bringToFront(); items[n]?.classList.toggle('hl', on); };
    const select = n => {
      const r = P.regions.find(x => x.n === n), c = col(r.k);
      Object.values(items).forEach(x => x.classList.remove('sel')); items[n].classList.add('sel'); sparkle();
      det.className = 'card rev on tone' + (n % 5);
      det.innerHTML = `<h3>${r.n}. ${r.name}</h3><p><b>Referencia:</b> ${r.v}</p><p><b>Ubicación actual aproximada:</b> ${r.m}</p><p><span class="dot" style="background:${c.c}"></span><b>${c.l}</b></p><p>${r.t}</p>` + (r.p ? '' : '<p class="note">📍 No se marca en el mapa porque su ubicación no es segura.</p>');
      if (layers[n] && mapObj) mapObj.flyToBounds(layers[n].getBounds().pad(.6), { maxZoom: 8 });
    };
    P.regions.forEach(r => {
      const it = h('button', 'ritem' + (r.p ? '' : ' noloc'), `<span class="dot" style="background:${COLORS[r.n - 1]}"></span><b>${r.n}. ${r.name}</b><br><small>${r.v}${r.p ? '' : ' · sin ubicación'}</small>`);
      it.onmouseenter = () => hl(r.n, true); it.onmouseleave = () => hl(r.n, false); it.onfocus = () => hl(r.n, true); it.onblur = () => hl(r.n, false);
      it.onclick = () => select(r.n); items[r.n] = it; list.append(it);
    });
    if (!window.L) { box.innerHTML = '<p class="card">⚠ No se pudo cargar el mapa (Leaflet). Revisa la conexión a internet.</p>'; return; }
    const map = mapObj = L.map(box, { minZoom: 4, maxZoom: 11, scrollWheelZoom: false }).setView(P.view, 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 11, attribution: '&copy; Colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' }).addTo(map);
    const gReg = L.layerGroup().addTo(map), gCtry = L.layerGroup().addTo(map), gCity = L.layerGroup().addTo(map);
    [...P.regions].filter(r => r.p).sort((a, b) => b.r - a.r).forEach(r => {
      const c = COLORS[r.n - 1];
      const circ = L.circle(r.p, { radius: r.r * 1000, color: c, fillColor: c, fillOpacity: .28, weight: 1.5 }).addTo(gReg);
      circ.bindTooltip(`<b>${r.n}. ${r.name}</b><br>${r.v}`, { sticky: true });
      const num = L.marker(r.p, { icon: L.divIcon({ className: 'rnum', html: String(r.n), iconSize: [24, 24] }) }).addTo(gReg);
      num.bindTooltip(`<b>${r.n}. ${r.name}</b><br>${r.v}`);
      layers[r.n] = circ;
      [circ, num].forEach(x => { x.on('mouseover', () => hl(r.n, true)); x.on('mouseout', () => hl(r.n, false)); x.on('click', () => select(r.n)); });
    });
    P.ctry.forEach(c => L.marker(c.p, { icon: L.divIcon({ className: 'ctry', html: c.n, iconSize: [120, 16], iconAnchor: [60, 8] }), interactive: false }).addTo(gCtry));
    P.cities.forEach(c => L.circleMarker(c.p, { radius: 4, color: '#1c2347', weight: 1, fillColor: '#fff', fillOpacity: 1 }).bindTooltip(c.n).addTo(gCity));
    if (P.geo) fetch(P.geo).then(r => r.json()).then(g => {
      const geo = L.geoJSON(g, {
        filter: f => PAIS[f.properties.ADMIN],
        style: f => ({ color: '#5a6a8a', weight: 1.3, fillColor: PAIS[f.properties.ADMIN][1] || '#eceff5', fillOpacity: PAIS[f.properties.ADMIN][1] ? .75 : .55 }),
        onEachFeature: (f, ly) => {
          ly.bindTooltip('<b>' + PAIS[f.properties.ADMIN][0] + '</b> (frontera actual)', { sticky: true });
          ly.on('mouseover', () => ly.setStyle({ weight: 3, fillOpacity: .95 })); ly.on('mouseout', () => geo.resetStyle(ly));
        }
      }).addTo(gCtry); geo.bringToBack();
    }).catch(() => console.warn('No se pudieron cargar las fronteras de los países'));
    [['Regiones bíblicas', gReg], ['Países actuales', gCtry], ['Ciudades', gCity]].forEach(([l, g]) => {
      const b = h('button', 'chip on', l);
      b.onclick = () => { const on = !b.classList.contains('on'); b.classList.toggle('on', on); on ? map.addLayer(g) : map.removeLayer(g); sparkle(); };
      chips.append(b);
    });
    const all = h('button', 'chip', '🔄 Ver todo el mapa'); all.onclick = () => { map.setView(P.view, 5); sparkle(); }; chips.append(all);
  };

  inits['s-tf'] = () => mkTF('#tf', D.tf, ['Verdadero', 'Falso']);

  inits['s-match'] = () => {
    const L = $('#mL'), R = $('#mR'); L.innerHTML = R.innerHTML = ''; L.className = R.className = 'pair';
    let sel = null, done = 0; const total = D.match.length; $('#matchCount').textContent = `0/${total}`;
    D.match.forEach((m, i) => { const b = h('button', '', m[0]); b.dataset.k = i; b.onclick = () => { L.querySelectorAll('button').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; }; L.append(b); });
    shuffle(D.match.map((m, i) => [m[1], i])).forEach(([t, i]) => {
      const b = h('button', '', t); b.dataset.k = i;
      b.onclick = () => {
        if (!sel) return;
        if (sel.dataset.k === b.dataset.k) { const ico = D.match[i][0].split(' ')[0]; sel.classList.remove('sel'); sel.classList.add('done'); b.classList.add('done'); b.innerHTML = '<span class="ic">' + ico + '</span> ' + b.textContent; confettiFrom(b, 50); cheer(); sel = null; done++; $('#matchCount').textContent = `${done}/${total}` + (done === total ? ' 🎉' : ''); if (done === total) fanfare(); }
        else { b.classList.add('bad'); shake(b); oops(); setTimeout(() => b.classList.remove('bad'), 600); }
      };
      R.append(b);
    });
  };

  inits['s-apply'] = () => {
    const box = $('#apply'); box.innerHTML = '';
    D.apply.forEach((a, k) => {
      const d = h('div', 'card tone' + [0, 4, 1][k % 3], `<b>${a.s}</b><div class="grid"></div><div class="reflect card rev"></div>`);
      const g = $('.grid', d), r = $('.reflect', d);
      a.o.forEach((o, i) => {
        const b = h('button', 'opt o' + i, o.t);
        b.onclick = () => { g.querySelectorAll('.opt').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); r.className = 'reflect card rev on tone' + i; r.innerHTML = `<span class="note">💭 ${o.r}</span>`; sparkle(); };
        g.append(b);
      });
      box.append(d);
    });
  };

  inits['s-week'] = () => {
    const box = $('#week'); box.innerHTML = ''; let saved = [];
    try { saved = JSON.parse(localStorage.getItem('valientes-31-38-week') || '[]'); } catch (e) { /* sin almacenamiento */ }
    const upd = () => { const n = box.querySelectorAll('.lit').length; $('#weekCount').textContent = `Misiones iluminadas: ${n}/${D.week.length}` + (n === D.week.length ? ' 🏆' : ''); try { localStorage.setItem('valientes-31-38-week', JSON.stringify([...box.children].map(x => x.classList.contains('lit')))); } catch (e) { /* ok */ } };
    D.week.forEach((w, i) => {
      const [day, ...rest] = w.split(': ');
      const b = h('button', 'card week tone' + (i % 5), `<span class="spark">✨</span><span><b>${day}</b><br>${rest.join(': ')}</span>`);
      b.classList.toggle('lit', !!saved[i]);
      b.onclick = () => { const on = b.classList.toggle('lit'); if (on) { confettiFrom(b, 50); cheer(); } upd(); if (box.querySelectorAll('.lit').length === D.week.length) fanfare(); };
      box.append(b);
    });
    upd();
  };

  Object.values(inits).forEach(f => f());
  document.querySelectorAll('.rs').forEach(b => b.onclick = () => {
    const s = b.closest('section');
    s.querySelectorAll('.rev.on').forEach(x => x.classList.remove('on')); s.querySelectorAll('.sel,.seen').forEach(x => x.classList.remove('sel', 'seen')); s.querySelectorAll('.unblur').forEach(x => x.classList.remove('unblur'));
    if (s.id === 's-week') { try { localStorage.removeItem('valientes-31-38-week'); } catch (e) { /* ok */ } }
    inits[s.id]?.(); sparkle();
  });
  show(0);
}

function show(n) {
  cur = Math.max(0, Math.min(sections.length - 1, n));
  sections.forEach((s, i) => s.classList.toggle('on', i === cur));
  document.querySelectorAll('#dots i').forEach((d, i) => d.classList.toggle('on', i === cur));
  $('#bar').style.width = ((cur + 1) / sections.length * 100) + '%';
  const s = sections[cur]; $('#label').textContent = `${cur + 1}/${sections.length} · ${s.dataset.title} · ${s.dataset.time}`;
  $('#stage').scrollTop = 0;
  if (s.id === 's-map' && mapObj) setTimeout(() => mapObj.invalidateSize(), 80);
}
function initNav() {
  sections.forEach((s, i) => { const d = h('i'); d.title = s.dataset.title; d.onclick = () => show(i); $('#dots').append(d); });
  $('#prev').onclick = () => show(cur - 1);
  $('#next').onclick = e => { show(cur + 1); confettiFrom(e.currentTarget, 14); };
  addEventListener('keydown', e => { if (e.target.tagName === 'TEXTAREA') return; if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
}
function initTimer() {
  let sec = 0, run = false; const t = $('#timer'), go = $('#tStart');
  const fmt = () => { t.textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); t.classList.toggle('late', sec > 1800); };
  setInterval(() => { if (run) { sec++; fmt(); } }, 1000);
  go.onclick = () => { run = !run; go.textContent = run ? '⏸' : '▶'; };
  $('#tReset').onclick = () => { if (confirm('¿Reiniciar el cronómetro?')) { sec = 0; run = false; go.textContent = '▶'; fmt(); } };
}
function initControls() {
  $('#btnSound').onclick = e => { setMuted(!isMuted()); e.currentTarget.textContent = isMuted() ? '🔇' : '🔊'; };
  $('#btnMotion').onclick = () => document.body.classList.toggle('calm');
}
boot();
