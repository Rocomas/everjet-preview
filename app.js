/* EverJet redesign — scroll showcase + single-aircraft charter organizer.
   Fully client-side: no network calls, no storage, user text rendered via
   textContent only (never innerHTML), honeypot on submit. "Fully safe" by design. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  /* ---------- Reference data ---------- */
  const AIRPORTS = [
    ['HKG','Hong Kong'],['MFM','Macau'],['SZX','Shenzhen'],['CAN','Guangzhou'],
    ['TPE','Taipei'],['PVG','Shanghai'],['PEK','Beijing'],['MNL','Manila'],
    ['CEB','Cebu'],['BKK','Bangkok'],['HKT','Phuket'],['SGN','Ho Chi Minh City'],
    ['HAN','Hanoi'],['DAD','Da Nang'],['REP','Siem Reap'],['PNH','Phnom Penh'],
    ['SIN','Singapore'],['KUL','Kuala Lumpur'],['DPS','Bali (Denpasar)'],['ICN','Seoul'],
    ['NRT','Tokyo Narita'],['HND','Tokyo Haneda'],['KIX','Osaka'],['SYD','Sydney'],
    ['DXB','Dubai'],['MLE','Maldives'],['LHR','London'],['LAX','Los Angeles'],
  ];
  const CITY = Object.fromEntries(AIRPORTS.map(([c, n]) => [c, n]));

  // The aircraft is Hong Kong based; every charter must return home to Hong Kong.
  const HOME = 'HKG';

  // The single charter aircraft.
  const JET = { name: 'Bombardier Global 5000', seats: '13', range: '≈ 9,600 km', low: 98000, high: 140000 };

  // one-way flying hours from/to Hong Kong (symmetric lookup)
  const HOURS = {
    'HKG-MFM':0.4,'HKG-SZX':0.5,'HKG-CAN':0.6,'HKG-TPE':1.7,'HKG-HAN':2.0,'HKG-MNL':2.2,
    'HKG-DAD':2.2,'HKG-PVG':2.4,'HKG-SGN':2.5,'HKG-REP':2.6,'HKG-PNH':2.7,'HKG-BKK':2.8,
    'HKG-CEB':3.0,'HKG-PEK':3.2,'HKG-ICN':3.4,'HKG-HKT':3.5,'HKG-KIX':3.8,'HKG-KUL':4.0,
    'HKG-SIN':4.0,'HKG-NRT':4.4,'HKG-HND':4.4,'HKG-DPS':5.2,'HKG-MLE':6.2,'HKG-DXB':8.0,
    'HKG-SYD':9.2,'HKG-LHR':12.8,'HKG-LAX':13.0,
  };
  const hoursFor = (a, b) => (!a || !b) ? null : (HOURS[a + '-' + b] ?? HOURS[b + '-' + a] ?? null);

  const money = n => 'HK$' + Math.round(n).toLocaleString('en-US');
  const round5 = n => Math.round(n / 5000) * 5000;
  const label = code => code && CITY[code] ? `${code} — ${CITY[code]}` : '';

  const resolveCode = v => {
    if (!v) return null;
    const s = v.trim();
    const m = s.match(/^([A-Za-z]{3})\b/);
    if (m && CITY[m[1].toUpperCase()]) return m[1].toUpperCase();
    const hit = AIRPORTS.find(([c, n]) => n.toLowerCase().includes(s.toLowerCase()) || c.toLowerCase() === s.toLowerCase());
    return hit ? hit[0] : null;
  };

  /* ---------- Static render: datalist, pax ---------- */
  const airportsDL = $('#airports');
  if (airportsDL) AIRPORTS.forEach(([c, n]) => { const o = document.createElement('option'); o.value = `${c} — ${n}`; airportsDL.appendChild(o); });

  const paxSel = $('#pax');
  if (paxSel) for (let i = 1; i <= 13; i++) { const o = document.createElement('option'); o.value = String(i); o.textContent = String(i); if (i === 4) o.selected = true; paxSel.appendChild(o); }

  const dateEl = $('#date'), retEl = $('#returnDate');
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const iso = today.toISOString().slice(0, 10);
  if (dateEl) dateEl.min = iso;
  if (retEl) retEl.min = iso;

  /* ---------- Header, mobile nav, reveal ---------- */
  const header = $('#header');
  const scrollProg = $('#scrollProg');
  addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', scrollY > 12);
    if (scrollProg) { const m = document.documentElement.scrollHeight - innerHeight; scrollProg.style.setProperty('--sp', m > 0 ? (scrollY / m).toFixed(4) : '0'); }
  }, { passive: true });

  const toggle = $('#navToggle');
  if (toggle) toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('#mobileNav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: 0.14 })
    : null;
  $$('.reveal:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in'));
  requestAnimationFrame(() => document.body.classList.add('loaded'));

  /* ---------- Service swipe decks: swipe (native), tap cover, or dots ---------- */
  $$('.svc').forEach(card => {
    const deck = $('.svc-deck', card);
    if (!deck) return;
    const dots = $$('.svc-dots button', card);
    const goTo = i => deck.scrollTo({ left: i * deck.clientWidth, behavior: 'smooth' });
    let t;
    deck.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(deck.scrollLeft / deck.clientWidth);
        dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
      }, 60);
    }, { passive: true });
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    const cover = $('.svc-cover', card); if (cover) cover.addEventListener('click', () => goTo(1));
    const back = $('.svc-back', card); if (back) back.addEventListener('click', e => { e.stopPropagation(); goTo(0); });
    deck.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(0); }
    });
  });

  /* ---------- Showcase: scroll-driven pinned pillars ---------- */
  const showcase = $('.showcase');
  const stageWrap = $('#stageWrap');
  const scrollcue = $('#scrollcue');

  if (showcase && stageWrap) {
    const STAGES = 4;
    let ticking = false;
    const update = () => {
      ticking = false;
      const total = showcase.offsetHeight - innerHeight;
      const p = total > 0 ? clamp(-showcase.getBoundingClientRect().top / total, 0, 1) : 0;
      stageWrap.style.setProperty('--p', p.toFixed(4));
      const stage = clamp(Math.floor(p * STAGES * 0.999), 0, STAGES - 1);
      if (stageWrap.dataset.stage !== String(stage)) stageWrap.dataset.stage = String(stage);
      if (scrollcue) scrollcue.style.opacity = String(clamp(1 - p * 4, 0, 1));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  /* ---------- Charter organizer ---------- */
  const form = $('#charterForm');
  if (!form) return;

  const state = { trip: 'round', fromCode: null, toCode: null };
  let step = 1;

  const stepEls = $$('.step', form);
  const stepperEls = $$('#stepper li');
  const bar = $('#progressBar');
  const backBtn = $('#backBtn'), nextBtn = $('#nextBtn'), orgNav = $('#orgNav');
  const estWrap = $('#estWrap'), estVal = $('#estVal'), estFine = estWrap && estWrap.querySelector('.est-fine');
  const summaryPane = $('#summaryPane');

  // Pre-fill the base to signal the HK/Japan rule.
  $('#from').value = 'HKG — Hong Kong';
  state.fromCode = 'HKG';

  // trip segmented control
  $$('#tripSeg .seg').forEach(b => b.addEventListener('click', () => {
    $$('#tripSeg .seg').forEach(x => { x.classList.remove('is-on'); x.setAttribute('aria-selected', 'false'); });
    b.classList.add('is-on'); b.setAttribute('aria-selected', 'true');
    state.trip = b.dataset.trip;
    $('#returnField').hidden = state.trip !== 'round';
    updateEstimate();
  }));

  function syncCodes() {
    state.fromCode = resolveCode($('#from').value);
    state.toCode = resolveCode($('#to').value);
  }
  $('#from').addEventListener('change', () => { syncCodes(); updateEstimate(); });
  $('#to').addEventListener('change', () => { syncCodes(); updateEstimate(); });

  function computeEstimate() {
    const h = hoursFor(state.fromCode, state.toCode);
    if (!h) return null;
    const legs = state.trip === 'round' ? 2 : 1;
    return { lo: round5(JET.low * h * legs), hi: round5(JET.high * h * legs), h, legs };
  }

  function updateEstimate() {
    if (!estWrap) return;
    if (!state.fromCode || !state.toCode) { estWrap.hidden = true; return; }
    estWrap.hidden = false;
    const e = computeEstimate();
    if (e) {
      estVal.textContent = `${money(e.lo)} – ${money(e.hi)}`;
      estFine.textContent = `≈ ${e.h} h flying · ${e.legs === 2 ? 'round trip' : 'one way'} · illustrative`;
    } else {
      estVal.textContent = 'On request';
      estFine.textContent = 'Confirmed by your advisor';
    }
  }

  /* ---------- validation ---------- */
  const setErr = (id, msg) => {
    const f = $('#' + id); if (f) f.closest('.field')?.classList.toggle('invalid', !!msg);
    const e = $(`.err[data-for="${id}"]`); if (e) e.textContent = msg || '';
    return !msg;
  };
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function validate(n) {
    let ok = true, firstBad = null;
    const fail = (id, msg) => { setErr(id, msg); ok = false; firstBad = firstBad || $('#' + id); };
    if (n === 1) {
      setErr('from', ''); setErr('to', ''); setErr('date', '');
      syncCodes();
      if (!$('#from').value.trim()) fail('from', 'Where are you departing from?');
      if (!$('#to').value.trim()) fail('to', 'Where are you heading?');
      // HK-home rule: round trips depart from HK (and so return); one-ways must end in HK.
      if (state.trip === 'round') {
        if (state.fromCode !== HOME) fail('from', 'Round-trip charters depart from and return to Hong Kong — set Hong Kong as your start.');
      } else if (state.toCode !== HOME) {
        fail('to', 'One-way charters must return to Hong Kong — set Hong Kong as your destination.');
      }
      const d = $('#date').value;
      if (!d) fail('date', 'Pick a departure date');
      else if (d < iso) fail('date', 'Choose a future date');
      if (state.trip === 'round' && retEl.value && retEl.value < d) fail('date', 'Return is before departure');
    }
    if (n === 2) {
      ['name','email','phone'].forEach(id => setErr(id, '')); setErr('consent', '');
      if (!$('#name').value.trim()) fail('name', 'Your name, please');
      if (!emailOk($('#email').value.trim())) fail('email', 'A valid email so we can reply');
      if ($('#phone').value.replace(/\D/g, '').length < 6) fail('phone', 'A contact number');
      if (!$('#consent').checked) { setErr('consent', 'Please tick to let us reply'); ok = false; firstBad = firstBad || $('#consent'); }
    }
    if (firstBad) firstBad.focus();
    return ok;
  }

  let toastT;
  function alertToast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast';
      Object.assign(t.style, { position:'fixed', left:'50%', bottom:'28px', transform:'translateX(-50%)',
        background:'#12233A', color:'#F7F3EA', padding:'.8rem 1.3rem', borderRadius:'999px',
        font:'600 .9rem Inter,sans-serif', zIndex:'200', boxShadow:'0 12px 30px -12px rgba(0,0,0,.5)',
        transition:'opacity .3s', opacity:'0' });
      document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(toastT); toastT = setTimeout(() => { t.style.opacity = '0'; }, 2600);
  }

  /* ---------- step navigation ---------- */
  function render() {
    stepEls.forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === step));
    stepperEls.forEach(li => {
      const i = Number(li.dataset.ind);
      li.classList.toggle('is-active', i === step);
      li.classList.toggle('is-done', i < step);
    });
    bar.style.width = (step === 1 ? 50 : 100) + '%';
    backBtn.hidden = step === 1;
    nextBtn.textContent = step === 2 ? 'Prepare request' : 'Continue';
    updateEstimate();
  }

  nextBtn.addEventListener('click', () => {
    if (!validate(step)) return;
    if (step < 2) { step++; render(); $('#organizer').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else finalize();
  });
  backBtn.addEventListener('click', () => { if (step > 1) { step--; render(); } });
  form.addEventListener('submit', e => e.preventDefault());

  /* ---------- finalize ---------- */
  function buildRequest() {
    const from = state.fromCode ? label(state.fromCode) : $('#from').value.trim();
    const to = state.toCode ? label(state.toCode) : $('#to').value.trim();
    const trip = state.trip === 'round' ? 'Round trip' : 'One way';
    const e = computeEstimate();
    const est = e ? `${money(e.lo)} – ${money(e.hi)} (indicative)` : 'On request';
    return {
      Aircraft: JET.name,
      Trip: trip,
      Route: `${from}  →  ${to}`,
      Departure: `${$('#date').value}${$('#time').value ? ' · ' + $('#time').value : ''}${state.trip === 'round' && retEl.value ? '  ·  returning ' + retEl.value : ''}`,
      Passengers: $('#pax').value,
      'Indicative estimate': est,
      Contact: `${$('#name').value.trim()} · ${$('#email').value.trim()} · ${$('#phone').value.trim()} (prefers ${$('#pref').value})`,
      Notes: $('#notes').value.trim() || '—',
    };
  }

  function finalize() {
    if ($('#hp_company').value) return; // honeypot: silently ignore bots
    const ref = 'EJ-' + (Date.now().toString(36).slice(-4) + Math.floor(Math.random() * 46656).toString(36)).toUpperCase().slice(0, 6);
    const data = buildRequest();

    $('#refNo').textContent = ref;
    const grid = $('#summaryGrid'); grid.textContent = '';
    Object.entries(data).forEach(([k, v]) => {
      const row = document.createElement('div'); row.className = 'row';
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      row.append(dt, dd); grid.appendChild(row);
    });

    // safe mailto (opens the user's own client; nothing auto-sent)
    const body = `Charter request ${ref}\n\n` + Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n') +
      `\n\n— Prepared via everjet.net`;
    $('#mailBtn').href = `mailto:cs@everjet.net?subject=${encodeURIComponent('Charter request ' + ref)}&body=${encodeURIComponent(body)}`;
    $('#copyBtn').onclick = () => { navigator.clipboard?.writeText(body).then(() => alertToast('Request copied')); };

    stepEls.forEach(s => s.classList.remove('is-active'));
    orgNav.hidden = true;
    stepperEls.forEach(li => li.classList.add('is-done'));
    bar.style.width = '100%';
    summaryPane.hidden = false;
    summaryPane.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  $('#newBtn').addEventListener('click', () => {
    form.reset();
    state.fromCode = 'HKG'; state.toCode = null; state.trip = 'round'; step = 1;
    $('#from').value = 'HKG — Hong Kong';
    $$('#tripSeg .seg').forEach((x, i) => { x.classList.toggle('is-on', i === 0); x.setAttribute('aria-selected', String(i === 0)); });
    $('#returnField').hidden = false;
    summaryPane.hidden = true; orgNav.hidden = false;
    if (paxSel) paxSel.value = '4';
    render();
    $('#organizer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  render();
})();
