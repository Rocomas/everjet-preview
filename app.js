/* EverJet redesign — scroll showcase + single-aircraft charter organizer.
   Fully client-side: no network calls, no storage, user text rendered via
   textContent only (never innerHTML), honeypot on submit. "Fully safe" by design. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  // i18n bridge — dictionary + language state live in i18n.js (loaded first)
  const t = k => (window.EJI18N ? window.EJI18N.t(k) : k);
  const langIdx = () => (window.EJI18N ? window.EJI18N.lang() : 0);

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

  // [code, city (EN), one-way flying hours from Hong Kong, 繁體, 简体 (omitted when same as 繁)].
  // Any airport can be typed in any language; known destinations quote instantly,
  // anything else falls back to "on request".
  const DEST = [
    ['HKG','Hong Kong',0,'香港'],
    ['MFM','Macau',0.4,'澳門','澳门'],['ZUH','Zhuhai',0.5,'珠海'],['SZX','Shenzhen',0.5,'深圳'],['CAN','Guangzhou',0.6,'廣州','广州'],
    ['NNG','Nanning',1.2,'南寧','南宁'],['HAK','Haikou',1.3,'海口'],['FOC','Fuzhou',1.4,'福州'],['XMN','Xiamen',1.4,'廈門','厦门'],
    ['SYX','Sanya',1.5,'三亞','三亚'],['KWL','Guilin',1.5,'桂林'],['KHH','Kaohsiung',1.5,'高雄'],['CSX','Changsha',1.6,'長沙','长沙'],
    ['RMQ','Taichung',1.6,'台中'],['TPE','Taipei',1.7,'台北'],['TSA','Taipei Songshan',1.7,'台北松山'],['HAN','Hanoi',2.0,'河內','河内'],
    ['WUH','Wuhan',2.0,'武漢','武汉'],['MNL','Manila',2.2,'馬尼拉','马尼拉'],['DAD','Da Nang',2.2,'峴港','岘港'],['HGH','Hangzhou',2.2,'杭州'],
    ['KMG','Kunming',2.2,'昆明'],['NKG','Nanjing',2.2,'南京'],['PVG','Shanghai',2.4,'上海'],['CKG','Chongqing',2.4,'重慶','重庆'],
    ['SGN','Ho Chi Minh City',2.5,'胡志明市'],['OKA','Okinawa',2.5,'沖繩','冲绳'],['REP','Siem Reap',2.6,'暹粒'],['CTU','Chengdu',2.6,'成都'],
    ['VTE','Vientiane',2.6,'永珍','万象'],['LPQ','Luang Prabang',2.6,'龍坡邦','琅勃拉邦'],['PNH','Phnom Penh',2.7,'金邊','金边'],['TNA','Jinan',2.7,'濟南','济南'],
    ['BKK','Bangkok',2.8,'曼谷'],['DMK','Bangkok Don Mueang',2.8,'曼谷廊曼'],['RGN','Yangon',2.8,'仰光'],['TAO','Qingdao',2.8,'青島','青岛'],
    ['BKI','Kota Kinabalu',2.8,'亞庇','哥打基纳巴卢'],['BWN','Bandar Seri Begawan',2.8,'斯里巴加灣市','斯里巴加湾市'],['CEB','Cebu',3.0,'宿霧','宿务'],['CNX','Chiang Mai',3.0,'清邁','清迈'],
    ['USM','Koh Samui',3.0,'蘇梅島','苏梅岛'],['DLC','Dalian',3.0,'大連','大连'],['XIY',"Xi'an",3.0,'西安'],['PEK','Beijing',3.2,'北京'],
    ['PKX','Beijing Daxing',3.2,'北京大興','北京大兴'],['PUS','Busan',3.2,'釜山'],['CJU','Jeju',3.3,'濟州','济州'],['KBV','Krabi',3.3,'甲米'],
    ['SHE','Shenyang',3.3,'瀋陽','沈阳'],['ICN','Seoul Incheon',3.4,'首爾仁川','首尔仁川'],['GMP','Seoul Gimpo',3.4,'首爾金浦','首尔金浦'],['FUK','Fukuoka',3.4,'福岡','福冈'],
    ['HKT','Phuket',3.5,'布吉','普吉'],['PEN','Penang',3.5,'檳城','槟城'],['LGK','Langkawi',3.7,'蘭卡威','兰卡威'],['HRB','Harbin',3.8,'哈爾濱','哈尔滨'],
    ['KIX','Osaka',3.8,'大阪'],['KUL','Kuala Lumpur',4.0,'吉隆坡'],['SIN','Singapore',4.0,'新加坡'],['DAC','Dhaka',4.0,'達卡','达卡'],
    ['NGO','Nagoya',4.0,'名古屋'],['NRT','Tokyo Narita',4.4,'東京成田','东京成田'],['HND','Tokyo Haneda',4.4,'東京羽田','东京羽田'],['GUM','Guam',4.5,'關島','关岛'],
    ['CGK','Jakarta',4.5,'雅加達','雅加达'],['KTM','Kathmandu',4.5,'加德滿都','加德满都'],['SUB','Surabaya',4.7,'泗水'],['URC','Urumqi',4.8,'烏魯木齊','乌鲁木齐'],
    ['CTS','Sapporo',5.0,'札幌'],['DPS','Bali (Denpasar)',5.2,'峇里（登巴薩）','巴厘岛（登巴萨）'],['BLR','Bengaluru',5.5,'班加羅爾','班加罗尔'],['HYD','Hyderabad',5.5,'海德拉巴'],
    ['CMB','Colombo',5.5,'科倫坡','科伦坡'],['DEL','Delhi',6.0,'德里'],['BOM','Mumbai',6.0,'孟買','孟买'],['MLE','Maldives',6.2,'馬爾代夫','马尔代夫'],
    ['PER','Perth',7.5,'珀斯'],['DXB','Dubai',8.0,'迪拜'],['AUH','Abu Dhabi',8.2,'阿布扎比'],['DOH','Doha',8.3,'多哈'],
    ['BNE','Brisbane',8.8,'布里斯本','布里斯班'],['RUH','Riyadh',9.0,'利雅得'],['SYD','Sydney',9.2,'悉尼'],['MEL','Melbourne',9.5,'墨爾本','墨尔本'],
    ['HNL','Honolulu',10.5,'檀香山'],['NAN','Nadi',10.5,'楠迪'],['IST','Istanbul',11.0,'伊斯坦布爾','伊斯坦布尔'],['AKL','Auckland',11.5,'奧克蘭','奥克兰'],
    ['MUC','Munich',12.3,'慕尼黑'],['FRA','Frankfurt',12.5,'法蘭克福','法兰克福'],['YVR','Vancouver',12.5,'溫哥華','温哥华'],['SEA','Seattle',12.5,'西雅圖','西雅图'],
    ['LHR','London',12.8,'倫敦','伦敦'],['AMS','Amsterdam',12.8,'阿姆斯特丹'],['CDG','Paris',13.0,'巴黎'],['ZRH','Zurich',13.0,'蘇黎世','苏黎世'],
    ['FCO','Rome',13.0,'羅馬','罗马'],['MXP','Milan',13.0,'米蘭','米兰'],['LAX','Los Angeles',13.0,'洛杉磯','洛杉矶'],['SFO','San Francisco',13.0,'三藩市','旧金山'],
    ['GVA','Geneva',13.2,'日內瓦','日内瓦'],['BCN','Barcelona',13.8,'巴塞隆拿','巴塞罗那'],['MAD','Madrid',14.0,'馬德里','马德里'],['ORD','Chicago',15.0,'芝加哥'],
    ['JFK','New York',15.5,'紐約','纽约'],
  ];
  const BY_CODE = Object.fromEntries(DEST.map(d => [d[0], d]));
  const cityName = code => {
    const d = BY_CODE[code]; if (!d) return code;
    const L = langIdx();
    return L === 1 ? (d[3] || d[1]) : L === 2 ? (d[4] || d[3] || d[1]) : d[1];
  };
  const HOURS = Object.fromEntries(DEST.filter(([c]) => c !== 'HKG').map(([c, n, h]) => ['HKG-' + c, h]));
  const hoursFor = (a, b) => (!a || !b) ? null : (HOURS[a + '-' + b] ?? HOURS[b + '-' + a] ?? null);

  // Quote currencies — indicative FX vs HKD (HKD pegged ~7.8 to USD). Selectable on the estimate.
  const CURRENCIES = [
    ['HKD','HK$',1], ['USD','US$',0.128], ['EUR','€',0.118], ['GBP','£',0.101],
    ['CNY','CN¥',0.92], ['JPY','JP¥',19.5], ['SGD','S$',0.172], ['AUD','A$',0.196],
    ['AED','AED ',0.470], ['CHF','CHF ',0.114], ['CAD','C$',0.175], ['THB','฿',4.55],
  ];
  const CUR = Object.fromEntries(CURRENCIES.map(([c, s, r]) => [c, { sym: s, rate: r }]));
  let currency = 'HKD';
  const niceRound = n => { const s = n >= 1e7 ? 5e5 : n >= 1e6 ? 5e4 : n >= 1e5 ? 5e3 : n >= 1e4 ? 1e3 : 500; return Math.round(n / s) * s; };
  const money = hkd => { const c = CUR[currency]; return c.sym + niceRound(hkd * c.rate).toLocaleString('en-US'); };
  const round5 = n => Math.round(n / 5000) * 5000;
  const label = code => code && BY_CODE[code] ? `${code} — ${cityName(code)}` : '';

  // Matches an IATA code, or a city name typed in English, Traditional or Simplified.
  const resolveCode = v => {
    if (!v) return null;
    const s = v.trim();
    const m = s.match(/^([A-Za-z]{3})\b/);
    if (m && BY_CODE[m[1].toUpperCase()]) return m[1].toUpperCase();
    const q = s.toLowerCase();
    const hit = DEST.find(d => d[0].toLowerCase() === q ||
      [d[1], d[3], d[4]].filter(Boolean).some(n => n.toLowerCase().includes(q)));
    return hit ? hit[0] : null;
  };

  /* ---------- Static render: datalist, pax ---------- */
  const airportsDL = $('#airports');
  function fillAirports() {
    if (!airportsDL) return;
    airportsDL.textContent = '';
    DEST.forEach(([c]) => { const o = document.createElement('option'); o.value = label(c); airportsDL.appendChild(o); });
  }
  fillAirports();

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
    toggle.setAttribute('aria-label', open ? t('nav.close') : t('nav.open'));
  });
  $$('#mobileNav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: 0.14 })
    : null;
  $$('.reveal:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in'));
  requestAnimationFrame(() => document.body.classList.add('loaded'));

  /* scrollspy: highlight the nav link for the section in view */
  const spyLinks = $$('.nav-links a');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      spyLinks.forEach(a => {
        if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }), { rootMargin: '-40% 0px -55% 0px' });
    ['services', 'charter', 'safety', 'about', 'contact'].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* mobile "Call an advisor" button hides over the planner and contact sections */
  const fabTargets = ['#organizer', '#contact'].map(s => $(s)).filter(Boolean);
  if (fabTargets.length && 'IntersectionObserver' in window) {
    const inView = new Set();
    const fio = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting ? inView.add(e.target) : inView.delete(e.target));
      document.body.classList.toggle('fab-hidden', inView.size > 0);
    }, { threshold: 0.08 });
    fabTargets.forEach(t => fio.observe(t));
  }

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
  const respBlocks = $$('.showcase .resp');
  const boardCells = $$('#fidBoard .fid-cell');
  if (showcase && respBlocks.length) {
    const setLive = idx => { if (idx >= 0) boardCells.forEach((c, i) => c.classList.toggle('is-live', i === idx)); };
    if ('IntersectionObserver' in window) {
      // reveal each block as it enters (low threshold = robust), then stop watching it
      const revealIO = new IntersectionObserver((es, o) => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
      }), { threshold: 0.12 });
      // light up the board cell of whichever block is crossing the viewport centre
      const activeIO = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) setLive(respBlocks.indexOf(e.target));
      }), { rootMargin: '-45% 0px -45% 0px' });
      respBlocks.forEach(b => { revealIO.observe(b); activeIO.observe(b); });
    } else {
      respBlocks.forEach(b => b.classList.add('in'));
    }
    // tap a board cell to glide to that responsibility (no scroll hijack)
    boardCells.forEach((c, i) => c.addEventListener('click', () => respBlocks[i].scrollIntoView({ behavior: 'smooth', block: 'center' })));
    setLive(0);
  }

  /* ---------- Charter organizer ---------- */
  const form = $('#charterForm');
  if (!form) return;

  const state = { fromCode: 'HKG', toCode: null };

  const stepEls = $$('.step', form);
  const nextBtn = $('#nextBtn'), orgNav = $('#orgNav');
  const estWrap = $('#estWrap'), estVal = $('#estVal'), estFine = estWrap && estWrap.querySelector('.est-fine');
  const summaryPane = $('#summaryPane');

  // Pre-fill Hong Kong as the default From — editable to any airport.
  $('#from').value = label('HKG');
  state.fromCode = 'HKG';

  function syncCodes() {
    state.fromCode = resolveCode($('#from').value);
    state.toCode = resolveCode($('#to').value);
  }
  $('#from').addEventListener('change', () => { syncCodes(); updateEstimate(); });
  $('#to').addEventListener('change', () => { syncCodes(); updateEstimate(); });

  const curSel = $('#currency');
  if (curSel) {
    CURRENCIES.forEach(([code]) => { const o = document.createElement('option'); o.value = code; o.textContent = code; curSel.appendChild(o); });
    curSel.value = currency;
    curSel.addEventListener('change', () => { currency = curSel.value; updateEstimate(); });
  }

  const swapBtn = $('#swapBtn');
  if (swapBtn) swapBtn.addEventListener('click', () => {
    const f = $('#from'), t = $('#to'), v = f.value;
    f.value = t.value; t.value = v;
    syncCodes(); updateEstimate();
  });

  // keep the return picker from offering days before departure
  dateEl.addEventListener('change', () => {
    retEl.min = dateEl.value || iso;
    if (retEl.value && retEl.value < retEl.min) { retEl.value = ''; updateEstimate(); }
  });

  const availNote = $('#availNote');
  function updateAvailability() {
    if (availNote) {
      const d = $('#date').value;
      if (!d) { availNote.textContent = ''; availNote.className = 'avail'; }
      else if (spanBlocked(d, retEl.value)) { availNote.textContent = t('avail.blocked'); availNote.className = 'avail is-blocked'; }
      else { availNote.textContent = t('avail.ok'); availNote.className = 'avail is-ok'; }
    }
    updateEstimate();
  }
  $('#date').addEventListener('change', updateAvailability);
  retEl.addEventListener('change', updateAvailability);

  // Illustrative price tuned to Ever Jet's own quote calculator: a fixed base (repositioning,
  // handling, permits, crew) plus an hourly rate — its client quotes fit ≈ US$66k + US$4k/hr,
  // here converted to HKD (≈7.8). The Hong Kong based jet flies out to the farthest point and back.
  const PRICE = { baseLo: 450000, rateLo: 27000, baseHi: 600000, rateHi: 40000 };
  function computeEstimate() {
    const from = state.fromCode, to = state.toCode;
    if (!from || !to || from === to) return null;
    const far = (to !== HOME) ? to : from;        // the non-Hong-Kong endpoint
    const oneWay = hoursFor(HOME, far);
    if (oneWay == null) return null;
    const h = Math.round(oneWay * 2 * 10) / 10;   // round-trip flying hours from Hong Kong
    return { lo: round5(PRICE.baseLo + PRICE.rateLo * h), hi: round5(PRICE.baseHi + PRICE.rateHi * h), h };
  }

  function updateEstimate() {
    if (!estWrap) return;
    if (!$('#from').value.trim() || !$('#to').value.trim()) { estWrap.hidden = true; return; }
    estWrap.hidden = false;
    if (spanBlocked($('#date').value, retEl.value)) {
      estVal.textContent = t('est.unavail');
      estFine.textContent = t('est.committed');
      return;
    }
    const e = computeEstimate();
    if (e) {
      estVal.textContent = `${money(e.lo)} – ${money(e.hi)}`;
      estFine.textContent = t('est.fine').replace('{h}', e.h);
    } else {
      estVal.textContent = t('est.onrequest');
      estFine.textContent = t('est.confirm');
    }
  }

  /* ---------- validation ---------- */
  const setErr = (id, msg) => {
    const f = $('#' + id); if (f) f.closest('.field')?.classList.toggle('invalid', !!msg);
    const e = $(`.err[data-for="${id}"]`); if (e) e.textContent = msg || '';
    return !msg;
  };
  // Trip is the only thing collected — no name/email/phone on the site by design.
  function validate() {
    let ok = true, firstBad = null;
    const fail = (id, msg) => { setErr(id, msg); ok = false; firstBad = firstBad || $('#' + id); };
    setErr('from', ''); setErr('to', ''); setErr('date', '');
    syncCodes();
    if (!$('#from').value.trim()) fail('from', t('err.from'));
    if (!$('#to').value.trim()) fail('to', t('err.to'));
    const d = $('#date').value;
    if (!d) fail('date', t('err.date'));
    else if (d < iso) fail('date', t('err.dateFuture'));
    else if (retEl.value && retEl.value < d) fail('date', t('err.retBefore'));
    else if (spanBlocked(d, retEl.value)) fail('date', t('err.dateBlocked'));
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

  function render() {
    nextBtn.textContent = t('org.prepare');
    updateEstimate();
  }

  nextBtn.addEventListener('click', () => { if (validate()) finalize(); });
  form.addEventListener('submit', e => e.preventDefault());

  /* ---------- finalize ---------- */
  function buildRequest() {
    const from = state.fromCode ? label(state.fromCode) : $('#from').value.trim();
    const to = state.toCode ? label(state.toCode) : $('#to').value.trim();
    const e = computeEstimate();
    const est = e ? `${money(e.lo)} – ${money(e.hi)} (${currency}, ${t('req.indicative')})` : t('est.onrequest');
    return {
      [t('req.aircraft')]: JET.name,
      [t('req.route')]: `${from}  →  ${to}  →  ${cityName('HKG')} (HKG)`,
      [t('req.departure')]: `${$('#date').value}${$('#time').value ? ' · ' + $('#time').value : ''}${retEl.value ? '  ·  ' + t('req.returning') + ' ' + retEl.value : ''}`,
      [t('req.passengers')]: $('#pax').value,
      [t('req.estimate')]: est,
      [t('req.notes')]: $('#notes').value.trim() || '—',
    };
  }

  // The prepared request is the ONLY output; it never leaves the browser until the
  // user sends it from their own email. Reference is stamped once, then reused so a
  // language switch can re-render the same request in the new language.
  let currentRef = null;
  function renderSummary() {
    const data = buildRequest();
    $('#refNo').textContent = currentRef;
    const grid = $('#summaryGrid'); grid.textContent = '';
    Object.entries(data).forEach(([k, v]) => {
      const row = document.createElement('div'); row.className = 'row';
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      row.append(dt, dd); grid.appendChild(row);
    });
    // safe mailto (opens the user's own client; nothing auto-sent)
    const subject = `${t('req.subject')} ${currentRef}`;
    const body = `${subject}\n\n` + Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n') +
      `\n\n${t('req.via')}`;
    $('#mailBtn').href = `mailto:cs@everjet.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    $('#copyBtn').onclick = () => { navigator.clipboard?.writeText(body).then(() => alertToast(t('toast.copied'))); };
  }

  function finalize() {
    if ($('#hp_company').value) return; // honeypot: silently ignore bots
    currentRef = 'EJ-' + (Date.now().toString(36).slice(-4) + Math.floor(Math.random() * 46656).toString(36)).toUpperCase().slice(0, 6);
    renderSummary();
    stepEls.forEach(s => s.classList.remove('is-active'));
    orgNav.hidden = true;
    summaryPane.hidden = false;
    summaryPane.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  $('#newBtn').addEventListener('click', () => {
    form.reset();
    state.fromCode = 'HKG'; state.toCode = null;
    $('#from').value = label('HKG');
    stepEls.forEach(s => s.classList.add('is-active'));
    if (availNote) { availNote.textContent = ''; availNote.className = 'avail'; }
    summaryPane.hidden = true; orgNav.hidden = false;
    if (paxSel) paxSel.value = '4';
    render();
    $('#organizer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Language switch: refresh everything the planner renders dynamically.
  if (window.EJI18N) window.EJI18N.onChange(() => {
    fillAirports();
    // re-label recognised airports into the new language; free-typed text is left alone
    [$('#from'), $('#to')].forEach(inp => { const c = resolveCode(inp.value); if (c) inp.value = label(c); });
    syncCodes();
    updateAvailability(); // also refreshes the estimate
    render();             // refreshes the Prepare request button
    if (!summaryPane.hidden) renderSummary(); // relocalise an already-prepared request
  });

  render();
})();
