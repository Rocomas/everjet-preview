/* EverJet redesign — scroll showcase + single-aircraft charter organizer.
   Fully client-side: no network calls, no storage, user text rendered via
   textContent only (never innerHTML), honeypot on submit. "Fully safe" by design. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  /* ---------- Reference data ---------- */
  // The aircraft is Hong Kong based; every charter is priced there-and-back to Hong Kong.
  const HOME = 'HKG';
  const JET = { name: 'Bombardier Global 5000', seats: '13', range: '≈ 9,600 km', low: 98000, high: 140000 };

  // Dates the aircraft is committed to the owner — zero charter availability.
  // Inclusive ISO ranges (single day = from === to). Update as the schedule firms up.
  const BLOCKED = [
    { from: '2026-07-14', to: '2026-07-18' },
    { from: '2026-07-28', to: '2026-07-30' },
    { from: '2026-08-11', to: '2026-08-15' },
  ];
  // A charter holds the aircraft for its whole span; blocked if that span hits any committed range.
  const spanBlocked = (a, b) => { if (!a) return false; const end = (b && b >= a) ? b : a; return BLOCKED.some(r => a <= r.to && end >= r.from); };

  // [code, city, one-way flying hours from Hong Kong]. Any airport can be typed; known
  // destinations quote instantly, anything else falls back to "on request".
  const DEST = [
    ['HKG','Hong Kong',0],
    ['MFM','Macau',0.4],['ZUH','Zhuhai',0.5],['SZX','Shenzhen',0.5],['CAN','Guangzhou',0.6],
    ['NNG','Nanning',1.2],['HAK','Haikou',1.3],['FOC','Fuzhou',1.4],['XMN','Xiamen',1.4],
    ['SYX','Sanya',1.5],['KWL','Guilin',1.5],['KHH','Kaohsiung',1.5],['CSX','Changsha',1.6],
    ['RMQ','Taichung',1.6],['TPE','Taipei',1.7],['TSA','Taipei Songshan',1.7],['HAN','Hanoi',2.0],
    ['WUH','Wuhan',2.0],['MNL','Manila',2.2],['DAD','Da Nang',2.2],['HGH','Hangzhou',2.2],
    ['KMG','Kunming',2.2],['NKG','Nanjing',2.2],['PVG','Shanghai',2.4],['CKG','Chongqing',2.4],
    ['SGN','Ho Chi Minh City',2.5],['OKA','Okinawa',2.5],['REP','Siem Reap',2.6],['CTU','Chengdu',2.6],
    ['VTE','Vientiane',2.6],['LPQ','Luang Prabang',2.6],['PNH','Phnom Penh',2.7],['TNA','Jinan',2.7],
    ['BKK','Bangkok',2.8],['DMK','Bangkok Don Mueang',2.8],['RGN','Yangon',2.8],['TAO','Qingdao',2.8],
    ['BKI','Kota Kinabalu',2.8],['BWN','Bandar Seri Begawan',2.8],['CEB','Cebu',3.0],['CNX','Chiang Mai',3.0],
    ['USM','Koh Samui',3.0],['DLC','Dalian',3.0],['XIY',"Xi'an",3.0],['PEK','Beijing',3.2],
    ['PKX','Beijing Daxing',3.2],['PUS','Busan',3.2],['CJU','Jeju',3.3],['KBV','Krabi',3.3],
    ['SHE','Shenyang',3.3],['ICN','Seoul Incheon',3.4],['GMP','Seoul Gimpo',3.4],['FUK','Fukuoka',3.4],
    ['HKT','Phuket',3.5],['PEN','Penang',3.5],['LGK','Langkawi',3.7],['HRB','Harbin',3.8],
    ['KIX','Osaka',3.8],['KUL','Kuala Lumpur',4.0],['SIN','Singapore',4.0],['DAC','Dhaka',4.0],
    ['NGO','Nagoya',4.0],['NRT','Tokyo Narita',4.4],['HND','Tokyo Haneda',4.4],['GUM','Guam',4.5],
    ['CGK','Jakarta',4.5],['KTM','Kathmandu',4.5],['SUB','Surabaya',4.7],['URC','Urumqi',4.8],
    ['CTS','Sapporo',5.0],['DPS','Bali (Denpasar)',5.2],['BLR','Bengaluru',5.5],['HYD','Hyderabad',5.5],
    ['CMB','Colombo',5.5],['DEL','Delhi',6.0],['BOM','Mumbai',6.0],['MLE','Maldives',6.2],
    ['PER','Perth',7.5],['DXB','Dubai',8.0],['AUH','Abu Dhabi',8.2],['DOH','Doha',8.3],
    ['BNE','Brisbane',8.8],['RUH','Riyadh',9.0],['SYD','Sydney',9.2],['MEL','Melbourne',9.5],
    ['HNL','Honolulu',10.5],['NAN','Nadi',10.5],['IST','Istanbul',11.0],['AKL','Auckland',11.5],
    ['MUC','Munich',12.3],['FRA','Frankfurt',12.5],['YVR','Vancouver',12.5],['SEA','Seattle',12.5],
    ['LHR','London',12.8],['AMS','Amsterdam',12.8],['CDG','Paris',13.0],['ZRH','Zurich',13.0],
    ['FCO','Rome',13.0],['MXP','Milan',13.0],['LAX','Los Angeles',13.0],['SFO','San Francisco',13.0],
    ['GVA','Geneva',13.2],['BCN','Barcelona',13.8],['MAD','Madrid',14.0],['ORD','Chicago',15.0],
    ['JFK','New York',15.5],
  ];
  const AIRPORTS = DEST.map(([c, n]) => [c, n]);
  const CITY = Object.fromEntries(AIRPORTS);
  const HOURS = Object.fromEntries(DEST.filter(([c]) => c !== 'HKG').map(([c, n, h]) => ['HKG-' + c, h]));
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

  const state = { fromCode: 'HKG', toCode: null };
  let step = 1;

  const stepEls = $$('.step', form);
  const stepperEls = $$('#stepper li');
  const bar = $('#progressBar');
  const backBtn = $('#backBtn'), nextBtn = $('#nextBtn'), orgNav = $('#orgNav');
  const estWrap = $('#estWrap'), estVal = $('#estVal'), estFine = estWrap && estWrap.querySelector('.est-fine');
  const summaryPane = $('#summaryPane');

  // Pre-fill Hong Kong as the default From — editable to any airport.
  $('#from').value = 'HKG — Hong Kong';
  state.fromCode = 'HKG';

  function syncCodes() {
    state.fromCode = resolveCode($('#from').value);
    state.toCode = resolveCode($('#to').value);
  }
  $('#from').addEventListener('change', () => { syncCodes(); updateEstimate(); });
  $('#to').addEventListener('change', () => { syncCodes(); updateEstimate(); });

  const availNote = $('#availNote');
  function updateAvailability() {
    if (availNote) {
      const d = $('#date').value;
      if (!d) { availNote.textContent = ''; availNote.className = 'avail'; }
      else if (spanBlocked(d, retEl.value)) { availNote.textContent = '✕  Aircraft committed on these dates — please choose another'; availNote.className = 'avail is-blocked'; }
      else { availNote.textContent = '✓  Aircraft available for your dates'; availNote.className = 'avail is-ok'; }
    }
    updateEstimate();
  }
  $('#date').addEventListener('change', updateAvailability);
  retEl.addEventListener('change', updateAvailability);

  // Priced there-and-back to Hong Kong; needs a known destination, any origin allowed.
  function computeEstimate() {
    const to = state.toCode;
    if (!to || to === HOME) return null;
    const back = hoursFor(to, HOME);              // destination -> Hong Kong
    if (back == null) return null;
    const outLeg = hoursFor(state.fromCode, to);  // From -> destination, if priceable
    const total = Math.round(((outLeg != null ? outLeg : back) + back) * 10) / 10;
    return { lo: round5(JET.low * total), hi: round5(JET.high * total), h: total };
  }

  function updateEstimate() {
    if (!estWrap) return;
    if (!$('#from').value.trim() || !$('#to').value.trim()) { estWrap.hidden = true; return; }
    estWrap.hidden = false;
    if (spanBlocked($('#date').value, retEl.value)) {
      estVal.textContent = 'Unavailable';
      estFine.textContent = 'Aircraft committed on these dates';
      return;
    }
    const e = computeEstimate();
    if (e) {
      estVal.textContent = `${money(e.lo)} – ${money(e.hi)}`;
      estFine.textContent = `≈ ${e.h} h flying · incl. return to Hong Kong · illustrative`;
    } else {
      estVal.textContent = 'On request';
      estFine.textContent = 'Your advisor will confirm this route';
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
      if (!$('#to').value.trim()) fail('to', 'Where would you like to go?');
      const d = $('#date').value;
      if (!d) fail('date', 'Pick a departure date');
      else if (d < iso) fail('date', 'Choose a future date');
      else if (retEl.value && retEl.value < d) fail('date', 'Return is before departure');
      else if (spanBlocked(d, retEl.value)) fail('date', 'Our aircraft is committed on these dates — please choose others.');
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
    const e = computeEstimate();
    const est = e ? `${money(e.lo)} – ${money(e.hi)} (indicative)` : 'On request';
    return {
      Aircraft: JET.name,
      Route: `${from}  →  ${to}  →  Hong Kong (HKG)`,
      Departure: `${$('#date').value}${$('#time').value ? ' · ' + $('#time').value : ''}${retEl.value ? '  ·  returning ' + retEl.value : ''}`,
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
    state.fromCode = 'HKG'; state.toCode = null; step = 1;
    $('#from').value = 'HKG — Hong Kong';
    if (availNote) { availNote.textContent = ''; availNote.className = 'avail'; }
    summaryPane.hidden = true; orgNav.hidden = false;
    if (paxSel) paxSel.value = '4';
    render();
    $('#organizer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  render();
})();
