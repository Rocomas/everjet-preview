/* EverJet i18n — English / 繁體中文 (HK) / 简体中文.
   Static copy swaps via data-i18n attributes; dynamic planner strings in app.js
   pull t(). Values are our own constants (never user input), so data-i18n-html
   entries may safely use innerHTML. No storage — language resets each visit,
   consistent with the site's "nothing stored" promise. */
window.EJI18N = (() => {
  'use strict';
  const LANGS = ['en', 'zh-Hant', 'zh-Hans'];

  // key: [English, Traditional (HK conventions), Simplified (mainland conventions)]
  const K = {
    'meta.title': ['Ever Jet Aviation — Aircraft Management, Hong Kong', 'Ever Jet Aviation — 飛機管理 · 香港', 'Ever Jet Aviation — 飞机管理 · 香港'],
    'meta.desc': ['Ever Jet Aviation — a Hong Kong aircraft-management company. A trouble-free, 24/7 flight department around your aircraft, with private charter on our own Bombardier Global 5000.', 'Ever Jet Aviation——香港飛機管理公司。以您的飛機為核心的全天候飛行部門，讓擁有無憂；並以自有龐巴迪環球5000提供私人包機。', 'Ever Jet Aviation——香港飞机管理公司。以您的飞机为核心的全天候飞行部门，让拥有无忧；并以自有庞巴迪环球5000提供私人包机。'],
    'skip': ['Skip to content', '跳至內容', '跳至内容'],
    'brand.aria': ['Ever Jet Aviation — home', 'Ever Jet Aviation——主頁', 'Ever Jet Aviation——主页'],
    'lang.aria': ['Language', '語言', '语言'],

    'nav.mgmt': ['Management', '飛機管理', '飞机管理'],
    'nav.charter': ['Charter', '私人包機', '私人包机'],
    'nav.safety': ['Safety', '安全', '安全'],
    'nav.about': ['About', '關於', '关于'],
    'nav.contact': ['Contact', '聯絡', '联系'],
    'nav.talk': ['Talk to us', '與我們聯絡', '联系我们'],
    'nav.open': ['Open menu', '開啟選單', '打开菜单'],
    'nav.close': ['Close menu', '關閉選單', '关闭菜单'],

    'hero.eyebrow': ['Aircraft management · Hong Kong', '飛機管理 · 香港', '飞机管理 · 香港'],
    'hero.h1': ['<span class="hl"><span class="hl-in">Your private</span></span><span class="hl"><span class="hl-in"><em>flight department.</em></span></span>', '<span class="hl"><span class="hl-in">您的專屬</span></span><span class="hl"><span class="hl-in"><em>飛行部門。</em></span></span>', '<span class="hl"><span class="hl-in">您的专属</span></span><span class="hl"><span class="hl-in"><em>飞行部门。</em></span></span>'],
    'hero.lead': ['Ever Jet manages, operates and safeguards your aircraft, giving you a trouble-free ownership experience and a 24/7 flight department at your fingertips. We also fly private charter on our own Bombardier Global 5000.', 'Ever Jet 為您管理、營運並守護您的飛機，讓您安享無憂的擁有體驗，隨時享有全天候待命的專屬飛行部門。我們亦以自有的龐巴迪環球5000提供私人包機服務。', 'Ever Jet 为您管理、运营并守护您的飞机，让您安享无忧的拥有体验，随时享有全天候待命的专属飞行部门。我们也以自有的庞巴迪环球5000提供私人包机服务。'],
    'hero.cta1': ['Manage my aircraft', '託管我的飛機', '托管我的飞机'],
    'hero.cta2': ['Charter the jet', '包機出行', '包机出行'],
    'trust1.b': ['San Marino AOC', '聖馬利諾AOC', '圣马力诺AOC'],
    'trust1.s': ['Commercial & private', '商用及私人', '商用及私人'],
    'trust2.s': ['Certified operator', '認證營運商', '认证运营商'],
    'trust3.s': ['Member', '會員', '会员'],
    'trust4.b': ['Since 2023', '2023年成立', '2023年成立'],
    'trust4.s': ['Greater China & SE Asia', '大中華及東南亞', '大中华及东南亚'],

    'show.eyebrow': ['One team · four responsibilities', '一個團隊 · 四大職責', '一个团队 · 四大职责'],
    'show.board': ['Our responsibilities — tap to explore', '我們的職責——點按探索', '我们的职责——点按探索'],
    'show.c1': ['Manage', '管理', '管理'],
    'show.c2': ['Operate', '營運', '运营'],
    'show.c3': ['Maintain', '維護', '维护'],
    'show.c4': ['Charter', '包機', '包机'],
    'resp1.k': ['Aircraft Management', '飛機管理', '飞机管理'],
    'resp1.d': ['A customised flight department built around your aircraft — crewing, budgets and oversight, so ownership stays trouble-free.', '以您的飛機為核心，度身建立專屬飛行部門——機組、預算與監督一手包辦，讓擁有飛機全程無憂。', '以您的飞机为核心，量身建立专属飞行部门——机组、预算与监督一手包办，让拥有飞机全程无忧。'],
    'resp1.chip': ['A 24/7 flight department', '全天候飛行部門', '全天候飞行部门'],
    'resp2.k': ['Flight Support', '航務支援', '航务支持'],
    'resp2.d': ['Permits, ground handling, slots and crew — every flight operated under our San Marino AOC, commercial or private.', '飛行許可、地面代理、時刻與機組——每班航班均在我們的聖馬利諾AOC下營運，商用或私人皆可。', '飞行许可、地面代理、时刻与机组——每班航班均在我们的圣马力诺AOC下运营，商用或私人皆可。'],
    'resp2.chip': ['San Marino AOC', '聖馬利諾AOC', '圣马力诺AOC'],
    'resp3.k': ['Safety & Oversight', '安全與監督', '安全与监督'],
    'resp3.d': ['Your aircraft is operated to the IS-BAO safety standard by an AsBAA member — the highest level of safety, made routine.', '您的飛機由AsBAA會員按IS-BAO安全標準營運——讓最高水準的安全成為日常。', '您的飞机由AsBAA会员按IS-BAO安全标准运营——让最高水准的安全成为日常。'],
    'resp3.chip': ['IS-BAO standard', 'IS-BAO標準', 'IS-BAO标准'],
    'resp4.k': ['Private Charter', '私人包機', '私人包机'],
    'resp4.d': ["Our own Bombardier Global 5000, based in Hong Kong — available for private charter whenever the owner isn't flying.", '我們自有的龐巴迪環球5000常駐香港——機主不用機時，即可供私人包機。', '我们自有的庞巴迪环球5000常驻香港——机主不用机时，即可供私人包机。'],
    'resp4.chip': ['Global 5000 · Hong Kong', '環球5000 · 香港', '环球5000 · 香港'],

    'svc.eyebrow': ['What we do', '我們的服務', '我们的服务'],
    'svc.h2': ['Management first — with one point of contact.', '管理為先——單一聯絡窗口。', '管理为先——单一联系窗口。'],
    'svc.cue': ['Tap or swipe a card for more <span aria-hidden="true">→</span>', '點按或滑動卡片查看詳情 <span aria-hidden="true">→</span>', '点按或滑动卡片查看详情 <span aria-hidden="true">→</span>'],
    'svc.more': ['More&nbsp;<i>→</i>', '詳情&nbsp;<i>→</i>', '详情&nbsp;<i>→</i>'],
    'svc.back': ['‹ Back', '‹ 返回', '‹ 返回'],
    'svc.backAria': ['Back to summary', '返回摘要', '返回摘要'],
    'svc.dot1': ['Show summary', '顯示摘要', '显示摘要'],
    'svc.dot2': ['Show detail', '顯示詳情', '显示详情'],
    'svc.plan': ['Plan a flight', '規劃行程', '规划行程'],
    'svc1.h': ['Aircraft Management', '飛機管理', '飞机管理'],
    'svc1.aria': ['Aircraft Management — swipe or use the dots for detail', '飛機管理——滑動或用圓點查看詳情', '飞机管理——滑动或用圆点查看详情'],
    'svc1.alt': ['Managed private jet over the sea at dusk', '黃昏海上飛行的託管公務機', '黄昏海上飞行的托管公务机'],
    'svc1.hook': ['A 24/7 flight department around your aircraft.', '以您的飛機為核心的全天候飛行部門。', '以您的飞机为核心的全天候飞行部门。'],
    'svc1.d': ['Trouble-free, customised management under our San Marino AOC — commercial or private — or the Cayman Islands (CAACI) registry. Crewing, budgets and oversight, so ownership stays effortless.', '在我們的聖馬利諾AOC（商用或私人）或開曼群島（CAACI）註冊下，提供無憂的度身管理——機組、預算與監督，讓擁有飛機輕鬆自在。', '在我们的圣马力诺AOC（商用或私人）或开曼群岛（CAACI）注册下，提供无忧的量身管理——机组、预算与监督，让拥有飞机轻松自在。'],
    'svc2.h': ['Flight Support', '航務支援', '航务支持'],
    'svc2.aria': ['Flight Support — swipe or use the dots for detail', '航務支援——滑動或用圓點查看詳情', '航务支持——滑动或用圆点查看详情'],
    'svc2.alt': ['Private jet on the tarmac at night, prepared for departure', '夜間停機坪上準備出發的私人飛機', '夜间停机坪上准备出发的私人飞机'],
    'svc2.hook': ['The groundwork behind every departure.', '每次起飛背後的堅實準備。', '每次起飞背后的坚实准备。'],
    'svc2.d': ['Permits, ground handling, slots and crewing — coordinated worldwide so every flight leaves on time, without friction.', '飛行許可、地面代理、時刻與機組——全球協調，讓每班航班準時、順暢出發。', '飞行许可、地面代理、时刻与机组——全球协调，让每班航班准时、顺畅出发。'],
    'svc3.h': ['Aircraft Acquisition', '飛機購置', '飞机购置'],
    'svc3.aria': ['Aircraft Acquisition — swipe or use the dots for detail', '飛機購置——滑動或用圓點查看詳情', '飞机购置——滑动或用圆点查看详情'],
    'svc3.alt': ['Private jet cabin interior', '私人飛機客艙內部', '私人飞机客舱内部'],
    'svc3.hook': ['Buying an aircraft? We sit on your side of the table.', '購買飛機？我們只站在您這一邊。', '购买飞机？我们只站在您这一边。'],
    'svc3.d': ['Independent, owner-side advisory across the full purchase — aircraft selection, technical inspection and negotiation to close. Our only interest is yours.', '獨立的買方顧問服務，貫穿整個購機流程——機型甄選、技術檢驗、談判直至交割。我們唯一的利益，就是您的利益。', '独立的买方顾问服务，贯穿整个购机流程——机型甄选、技术检验、谈判直至交割。我们唯一的利益，就是您的利益。'],
    'svc4.h': ['Private Charter', '私人包機', '私人包机'],
    'svc4.aria': ['Private Charter — swipe or use the dots for detail', '私人包機——滑動或用圓點查看詳情', '私人包机——滑动或用圆点查看详情'],
    'svc4.alt': ['Bombardier Global 5000 in flight', '飛行中的龐巴迪環球5000', '飞行中的庞巴迪环球5000'],
    'svc4.hook': ['Fly private on our own Global 5000.', '乘坐我們自有的環球5000私人出行。', '乘坐我们自有的环球5000私人出行。'],
    'svc4.d': ['On-demand private flights on our own Bombardier Global 5000 — Hong Kong based, arranged seamlessly and flown to the IS-BAO safety standard.', '以自有的龐巴迪環球5000提供隨需私人包機——常駐香港，安排順暢無縫，並按IS-BAO安全標準飛行。', '以自有的庞巴迪环球5000提供随需私人包机——常驻香港，安排顺畅无缝，并按IS-BAO安全标准飞行。'],

    'ch.eyebrow': ['One aircraft, based in Hong Kong', '一架專機，常駐香港', '一架专机，常驻香港'],
    'ch.h2': ['Charter our Global 5000.', '包租我們的環球5000。', '包租我们的环球5000。'],
    'ch.lead': ["We operate one aircraft for private charter — our own Bombardier Global 5000, based in Hong Kong. Tell us where you'd like to go, and an advisor will personally confirm every detail.", '我們僅以一架飛機提供私人包機——自有的龐巴迪環球5000，常駐香港。告訴我們您想去的地方，專屬顧問將親自為您確認每個細節。', '我们仅以一架飞机提供私人包机——自有的庞巴迪环球5000，常驻香港。告诉我们您想去的地方，专属顾问将亲自为您确认每个细节。'],
    'jet.alt': ['Bombardier Global 5000 cabin interior', '龐巴迪環球5000客艙內部', '庞巴迪环球5000客舱内部'],
    'jet.sub': ['Heavy jet · our own aircraft', '重型公務機 · 自有飛機', '重型公务机 · 自有飞机'],
    'jet.dt1': ['Seats', '座位', '座位'],
    'jet.dd1': ['Up to 13', '最多13位', '最多13位'],
    'jet.dt2': ['Range', '航程', '航程'],
    'jet.dd2': ['≈ 9,600 km', '約9,600公里', '约9,600公里'],
    'jet.dt3': ['Home base', '基地', '基地'],
    'jet.dd3': ['Hong Kong', '香港', '香港'],
    'jet.dt4': ['Charters', '包機航線', '包机航线'],
    'jet.dd4': ['To & from HK', '香港往返', '香港往返'],
    'jet.note': ['<b>Why Hong Kong?</b> The aircraft lives in Hong Kong, so every charter begins or ends there. Your advisor will plan the routing around that.', '<b>為何是香港？</b>飛機常駐香港，因此每次包機都從香港出發或返回香港。您的顧問會據此為您規劃航線。', '<b>为何是香港？</b>飞机常驻香港，因此每次包机都从香港出发或返回香港。您的顾问会据此为您规划航线。'],

    'form.from': ['From', '出發地', '出发地'],
    'form.to': ['To', '目的地', '目的地'],
    'form.ph': ['Any city or airport', '任何城市或機場', '任何城市或机场'],
    'form.pill': ['↩ Returns to Hong Kong', '↩ 返回香港', '↩ 返回香港'],
    'form.routeNote': ['Fly between any two airports — the aircraft always returns to Hong Kong at the end of the trip.', '可在任何兩個機場之間飛行——行程結束時，飛機必定返回香港。', '可在任何两个机场之间飞行——行程结束时，飞机必定返回香港。'],
    'form.swap': ['⇄ Swap', '⇄ 對調', '⇄ 对调'],
    'form.swapAria': ['Swap departure and destination', '對調出發地與目的地', '对调出发地与目的地'],
    'form.dep': ['Departure', '出發日期', '出发日期'],
    'form.ret': ['Return <span class="muted">(optional)</span>', '回程 <span class="muted">（可選）</span>', '回程 <span class="muted">（可选）</span>'],
    'form.time': ['Time', '時間', '时间'],
    'form.pax': ['Passengers', '乘客人數', '乘客人数'],
    'form.notes': ['Anything else? <span class="muted">(catering, pets, ground transfer, onward legs…)</span>', '其他需求？<span class="muted">（餐飲、寵物、地面接送、後續航段……）</span>', '其他需求？<span class="muted">（餐饮、宠物、地面接送、后续航段……）</span>'],
    'sum.badge': ['Request prepared', '需求已備妥', '需求已备妥'],
    'sum.ref': ['Reference', '參考編號', '参考编号'],
    'sum.note': ['Send this to our charter desk from your own email, or simply call — a dedicated advisor will confirm availability and prepare a firm, all-in quote, typically within two hours. <strong>This website never collects your contact details, takes no payment online, and stores nothing about your trip.</strong>', '請以您自己的電郵將此需求傳送至我們的包機服務台，或直接致電——專屬顧問將確認航班並準備確定的全包報價，通常於兩小時內回覆。<strong>本網站絕不收集您的聯絡資料、不在網上收取款項，亦不儲存您的任何行程資料。</strong>', '请用您自己的邮箱将此需求发送至我们的包机服务台，或直接致电——专属顾问将确认航班并准备确定的全包报价，通常于两小时内回复。<strong>本网站绝不收集您的联系信息、不在线收取款项，也不存储您的任何行程信息。</strong>'],
    'sum.send': ['Open in your email app', '在您的電郵中開啟', '在您的邮箱中打开'],
    'sum.call': ['Call an advisor', '致電顧問', '致电顾问'],
    'sum.copy': ['Copy request', '複製需求', '复制请求'],
    'sum.new': ['Start over', '重新開始', '重新开始'],
    'org.estLabel': ['Indicative estimate', '參考估價', '参考估价'],
    'org.estFine': ['Illustrative only · confirmed by your advisor', '僅供參考 · 以顧問確認為準', '仅供参考 · 以顾问确认为准'],
    'org.cur': ['Quote currency', '報價貨幣', '报价货币'],
    'org.prepare': ['Prepare request', '準備需求', '准备请求'],
    'org.head': ['Plan your trip', '規劃您的行程', '规划您的行程'],
    'org.sub': ['No sign-up and no contact details — prepare your request here, then send it from your own email or simply call us.', '無需註冊、不留聯絡資料——在此準備您的需求，然後以您自己的電郵傳送，或直接致電我們。', '无需注册、不留联系信息——在此准备您的需求，然后用您自己的邮箱发送，或直接致电我们。'],

    'avail.ok': ['✓  The aircraft is available on your dates', '✓  您選擇的日期，飛機可供包機', '✓  您选择的日期，飞机可供包机'],
    'avail.blocked': ['✕  The aircraft is committed on these dates — please choose different dates', '✕  該日期飛機已有安排——請選擇其他日期', '✕  该日期飞机已有安排——请选择其他日期'],
    'err.from': ['Where are you departing from?', '請輸入出發地', '请输入出发地'],
    'err.to': ['Where would you like to go?', '請輸入目的地', '请输入目的地'],
    'err.date': ['Pick a departure date', '請選擇出發日期', '请选择出发日期'],
    'err.dateFuture': ['Choose a future date', '請選擇未來的日期', '请选择未来的日期'],
    'err.retBefore': ['The return date is before departure', '回程日期早於出發日期', '回程日期早于出发日期'],
    'err.dateBlocked': ['The aircraft is committed on these dates — please choose different dates.', '該日期飛機已有安排——請選擇其他日期。', '该日期飞机已有安排——请选择其他日期。'],
    'est.unavail': ['Unavailable', '暫不可用', '暂不可用'],
    'est.committed': ['The aircraft is committed on these dates', '該日期飛機已有安排', '该日期飞机已有安排'],
    'est.onrequest': ['On request', '另行報價', '另行报价'],
    'est.confirm': ['Your advisor will confirm this route', '顧問將為您確認此航線', '顾问将为您确认此航线'],
    'est.fine': ['≈ {h} h flying · return trip from Hong Kong · illustrative', '約{h}小時飛行 · 香港往返 · 僅供參考', '约{h}小时飞行 · 香港往返 · 仅供参考'],
    'toast.copied': ['Request copied', '已複製需求', '已复制请求'],
    'req.aircraft': ['Aircraft', '機型', '机型'],
    'req.route': ['Route', '航線', '航线'],
    'req.departure': ['Departure', '出發', '出发'],
    'req.returning': ['returning', '回程', '回程'],
    'req.passengers': ['Passengers', '乘客', '乘客'],
    'req.estimate': ['Indicative estimate', '參考估價', '参考估价'],
    'req.indicative': ['indicative', '僅供參考', '仅供参考'],
    'req.notes': ['Notes', '備註', '备注'],
    'req.subject': ['Charter request', '包機需求', '包机需求'],
    'req.via': ['— Prepared via everjet.net', '——透過 everjet.net 準備', '——通过 everjet.net 准备'],

    'city.hk': ['Hong Kong', '香港', '香港'],
    'city.tokyo': ['Tokyo', '東京', '东京'],
    'city.osaka': ['Osaka', '大阪', '大阪'],
    'city.seoul': ['Seoul', '首爾', '首尔'],
    'city.jeju': ['Jeju', '濟州', '济州'],
    'city.taipei': ['Taipei', '台北', '台北'],
    'city.shanghai': ['Shanghai', '上海', '上海'],
    'city.beijing': ['Beijing', '北京', '北京'],
    'city.bangkok': ['Bangkok', '曼谷', '曼谷'],
    'city.singapore': ['Singapore', '新加坡', '新加坡'],
    'city.manila': ['Manila', '馬尼拉', '马尼拉'],
    'city.phuket': ['Phuket', '布吉', '普吉'],
    'city.bali': ['Bali', '峇里', '巴厘岛'],
    'city.maldives': ['Maldives', '馬爾代夫', '马尔代夫'],
    'city.dubai': ['Dubai', '迪拜', '迪拜'],
    'city.sydney': ['Sydney', '悉尼', '悉尼'],
    'city.london': ['London', '倫敦', '伦敦'],
    'city.paris': ['Paris', '巴黎', '巴黎'],
    'city.nyc': ['New York', '紐約', '纽约'],

    'safety.eyebrow': ['Safety, made visible', '看得見的安全', '看得见的安全'],
    'safety.h2': ["Safety isn't a promise — it's a certification.", '安全不只是承諾——而是認證。', '安全不只是承诺——而是认证。'],
    'safety.lead': ['Every Ever Jet flight operates under our Air Operator Certificate from the Republic of San Marino Civil Aviation Authority, to the globally recognised IS-BAO safety standard. Ever Jet is a proud member of the Asian Business Aviation Association.', 'Ever Jet 每班航班均根據聖馬利諾共和國民航局頒發的航空營運人證書（AOC）營運，並符合全球公認的IS-BAO安全標準。Ever Jet 亦為亞洲公務航空協會（AsBAA）成員。', 'Ever Jet 每班航班均根据圣马力诺共和国民航局颁发的航空运营人证书（AOC）运营，并符合全球公认的IS-BAO安全标准。Ever Jet 也是亚洲公务航空协会（AsBAA）成员。'],
    'safety.alt1': ['IS-BAO registered', 'IS-BAO註冊', 'IS-BAO注册'],
    'safety.alt2': ['AsBAA member', 'AsBAA會員', 'AsBAA会员'],
    'sp1.h': ['Certified operations', '認證營運', '认证运营'],
    'sp1.p': ['San Marino AOC for commercial and private air operations — audited, accountable, current.', '聖馬利諾AOC涵蓋商用及私人航空營運——受審計、可問責、持續有效。', '圣马力诺AOC涵盖商用及私人航空运营——受审计、可问责、持续有效。'],
    'sp2.h': ['Discreet by default', '私密為本', '私密为本'],
    'sp2.p': ['Your itinerary, manifest and details are handled privately and never sold, listed or shared with third parties.', '您的行程、乘客名單與個人資料一律私密處理，絕不出售、公開或與第三方分享。', '您的行程、乘客名单与个人信息一律私密处理，绝不出售、公开或与第三方分享。'],
    'sp3.h': ['No online payment risk', '無網上付款風險', '无在线付款风险'],
    'sp3.p': ['We never ask for card details online. A named advisor confirms your trip and invoices you directly, on your terms.', '我們絕不會在網上向您索取銀行卡資料。專屬顧問確認行程後，按您方便的方式直接開具發票。', '我们绝不会在线向您索取银行卡信息。专属顾问确认行程后，按您方便的方式直接开具发票。'],

    'about.eyebrow': ['About Ever Jet', '關於 Ever Jet', '关于 Ever Jet'],
    'about.h2': ['Built around the aircraft owner.', '一切以機主為中心。', '一切以机主为中心。'],
    'about.p1': ['Ever Jet Aviation is a Hong Kong–based aviation service company, with supporting operations in the Republic of San Marino, Singapore and Malaysia.', 'Ever Jet Aviation 是一家總部設於香港的航空服務公司，並於聖馬利諾共和國、新加坡及馬來西亞設有支援據點。', 'Ever Jet Aviation 是一家总部设于香港的航空服务公司，并于圣马力诺共和国、新加坡及马来西亚设有支持据点。'],
    'about.p2': ['We commenced commercial air-transport and on-demand charter operations in July 2023. Our team pairs localised expertise with international exposure, determined to close the service gap in aviation across Greater China and Southeast Asia.', '我們於2023年7月開展商業航空運輸及隨需包機業務。團隊融合本地專業與國際視野，致力填補大中華及東南亞地區的航空服務缺口。', '我们于2023年7月开展商业航空运输及随需包机业务。团队融合本地专业与国际视野，致力填补大中华及东南亚地区的航空服务缺口。'],
    'about.p3': ['We focus on managing your valuable asset so you can simply enjoy a 24/7 flight department at your fingertips — built on meaningful relationships, with your best interests always first.', '我們專注管理您的寶貴資產，讓您安享全天候飛行部門帶來的自在便利——以真誠的客戶關係為基石，永遠以您的利益為先。', '我们专注管理您的宝贵资产，让您安享全天候飞行部门带来的自在便利——以真诚的客户关系为基石，永远以您的利益为先。'],
    'stat1.s': ['Locations worldwide', '全球據點', '全球据点'],
    'stat2.s': ['Flight department', '飛行部門', '飞行部门'],
    'stat3.s': ['Named point of contact', '專屬聯絡人', '专属联系人'],
    'about.alt': ['Business jet on the tarmac at an Asian airport', '停泊於亞洲機場停機坪的公務機', '停泊于亚洲机场停机坪的公务机'],
    'about.plate': ['<b>Delivering exceptional service.</b><br><span>Cultivating meaningful client connection.</span>', '<b>提供卓越服務。</b><br><span>用心經營每段客戶關係。</span>', '<b>提供卓越服务。</b><br><span>用心经营每段客户关系。</span>'],

    'cta.eyebrow': ['Ready when you are', '隨時候命', '随时待命'],
    'cta.h2': ["Let's look after your aircraft.", '讓我們照料您的飛機。', '让我们照料您的飞机。'],
    'cta.lead': ['Talk to us about managing your aircraft, or arrange a charter on our Global 5000. Either way, a real person sees it through.', '無論是託管您的飛機，還是包租我們的環球5000，歡迎與我們聯絡——每個需求都有專人跟進到底。', '无论是托管您的飞机，还是包租我们的环球5000，欢迎与我们联系——每个需求都有专人跟进到底。'],
    'cta.call': ['Speak to an advisor', '致電顧問', '致电顾问'],
    'cta.mail': ['Email cs@everjet.net', '電郵 cs@everjet.net', '邮件 cs@everjet.net'],

    'ft.brand': ['A Hong Kong aviation company — aircraft management, flight support, acquisition and private charter on our own Global 5000, serving Greater China and Southeast Asia.', '香港航空服務公司——提供飛機管理、航務支援、飛機購置，以及自有環球5000私人包機，服務大中華及東南亞。', '香港航空服务公司——提供飞机管理、航务支持、飞机购置，以及自有环球5000私人包机，服务大中华及东南亚。'],
    'ft.contact': ['Contact', '聯絡', '联系'],
    'ft.addr': ["Unit 1502, 15/F, Grand Millennium Plaza,<br>181 Queen's Road Central, Sheung Wan, Hong Kong", '香港上環皇后大道中181號<br>新紀元廣場15樓1502室', '香港上环皇后大道中181号<br>新纪元广场15楼1502室'],
    'ft.explore': ['Explore', '探索', '探索'],
    'ft.l1': ['Aircraft management', '飛機管理', '飞机管理'],
    'ft.l2': ['Charter the Global 5000', '包租環球5000', '包租环球5000'],
    'ft.l3': ['Safety & certification', '安全與認證', '安全与认证'],
    'ft.l4': ['About Ever Jet', '關於 Ever Jet', '关于 Ever Jet'],
    'ft.offices': ['Offices', '辦事處', '办事处'],
    'ft.sm': ['San Marino', '聖馬利諾', '圣马力诺'],
    'ft.my': ['Malaysia', '馬來西亞', '马来西亚'],
    'ft.copy': ['© Ever Jet Aviation Limited. Operated under a Republic of San Marino AOC.', '© Ever Jet Aviation Limited. 根據聖馬利諾共和國AOC營運。', '© Ever Jet Aviation Limited. 根据圣马力诺共和国AOC运营。'],
    'ft.concept': ['Concept redesign · all figures indicative', '概念重設計 · 所有數字僅供參考', '概念重设计 · 所有数字仅供参考'],
    'fab': ['Call an advisor', '致電顧問', '致电顾问'],
  };

  let idx = 0;
  const subs = [];
  const t = k => { const e = K[k]; return e ? (e[idx] ?? e[0]) : k; };

  function apply() {
    document.documentElement.lang = LANGS[idx];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if ('i18nHtml' in el.dataset) el.innerHTML = v; else el.textContent = v;
    });
    [['data-i18n-ph', 'placeholder'], ['data-i18n-aria', 'aria-label'], ['data-i18n-alt', 'alt']]
      .forEach(([d, a]) => document.querySelectorAll('[' + d + ']').forEach(el => el.setAttribute(a, t(el.getAttribute(d)))));
    document.title = t('meta.title');
    const md = document.querySelector('meta[name="description"]');
    if (md) md.content = t('meta.desc');
    document.querySelectorAll('[data-setlang]').forEach(b => {
      if (Number(b.dataset.setlang) === idx) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    subs.forEach(f => { try { f(); } catch (e) { /* one bad listener must not break the switch */ } });
  }

  document.querySelectorAll('[data-setlang]').forEach(b => b.addEventListener('click', () => {
    const n = Number(b.dataset.setlang);
    if (n !== idx && n >= 0 && n < LANGS.length) { idx = n; apply(); }
  }));

  return { t, lang: () => idx, onChange: f => subs.push(f) };
})();
