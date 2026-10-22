(function () {
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const rub = n => n.toLocaleString('ru-RU') + ' ₽';
  const num = n => n.toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  // 1 отзыв, 74 отзыва, 126 отзывов
  const plural = (n, one, few, many) => {
    const a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- иконки ----------
  const ICONS = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 10.5h7"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>',
    wallet: '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l12-4v4M16 13.5h2"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    steam: '<path d="M8 20c-2-3 2-4 0-7s2-4 0-7M12 20c-2-3 2-4 0-7s2-4 0-7M16 20c-2-3 2-4 0-7s2-4 0-7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
    send: '<path d="M21 3 3 10.5l7 2.5 2.5 7z"/><path d="M10 13l11-10"/>',
    ruble: '<path d="M8 20V4h5.5a4 4 0 0 1 0 8H6M6 16h9"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="3"/>',
    plan: '<rect x="3.5" y="4" width="17" height="16" rx="1"/><path d="M3.5 12h8V4M11.5 12v8M15 12h5.5"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.6c2.3.2 4 1.9 4.5 5.4"/>',
    sofa: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 4 0v3h10v-3a2 2 0 0 1 4 0v6H3z"/><path d="M5 18v2M19 18v2"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
  const ic = name => `<i data-icon="${name}">${icon(name)}</i>`;
  // знак компании: баня-бочка сбоку, труба и дымок (тот же рисунок — в img/favicon.svg)
  const LOGO = '<svg viewBox="0 -2.5 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 18h26a5.5 11 0 0 1 0 22H11"/><ellipse cx="11" cy="29" rx="5.5" ry="11"/><path d="M21 18v22M30 18v22"/>' +
    '<path d="M33 18v-6h4v6"/><path d="M35 8c-2-1.6 2-3.2 0-5"/></svg>';
  $$('.logo-mark').forEach(el => { el.innerHTML = LOGO; });

  // ---------- тексты и ссылки из настроек ----------
  const get = path => path.split('.').reduce((o, k) => (o == null ? o : o[k]), S);
  $$('[data-site]').forEach(el => { const v = get(el.dataset.site); if (v != null) el.textContent = v; });
  // текст с короткой версией для телефона: на узком экране видна вторая (styles.css, .t-full / .t-short)
  const tx = (full, short) => short ? `<span class="t-full">${full}</span><span class="t-short">${short}</span>` : full;
  if (S.hero.textShort) $('.hero .lead').innerHTML = tx(esc(S.hero.text), esc(S.hero.textShort));
  document.title = `${S.company} — ${S.tagline.toLowerCase()} в ${S.region}`;

  // ---------- мессенджеры ----------
  // Фирменные значки: Telegram и WhatsApp — Simple Icons (CC0), MAX — знак с max.ru.
  const P = {
    tg: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
    wa: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
    max: 'M50.76 0c27.53 0 49.12 22.34 49.12 49.89S77.61 99.23 51.02 99.23c-9.43 0-14.01-1.33-21.37-6.54-.5-.36-1.2-.26-1.63.19-5.66 6.04-20.17 10.28-20.83 2.03C7.19 80.53 0 71.18 0 49.61 0 21.3 23.22 0 50.76 0m.77 24.55c-13.07-.68-23.26 8.39-25.51 22.58-1.86 11.75 1.44 26.07 4.26 26.8 1.2.3 4.08-1.9 6.18-3.88.4-.37.99-.44 1.45-.15 3.27 2 6.97 3.5 11.05 3.71 13.42.7 25.3-9.8 26-23.21.71-13.42-10.01-25.14-23.43-25.85',
  };
  // цветные — как в фирменном стиле; mono — одним цветом (currentColor), прорези показывают фон
  const BRAND = {
    tg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11.5" fill="#fff"/><path fill="#26A5E4" d="${P.tg}"/></svg>`,
    wa: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#25D366"/><path fill="#fff" transform="translate(5.3 5.3) scale(.56)" d="${P.wa}"/></svg>`,
    max: `<svg viewBox="0 0 100 100"><path fill="url(#max-grad)" fill-rule="evenodd" d="${P.max}"/></svg>`,
  };
  const MONO = {
    tg: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${P.tg}"/></svg>`,
    wa: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${P.wa}"/></svg>`,
    max: `<svg viewBox="0 0 100 100"><path fill="currentColor" fill-rule="evenodd" d="${P.max}"/></svg>`,
  };
  // градиент MAX — один на страницу, в видимом (нулевого размера) svg: из скрытого меню ссылка на него не работает
  document.body.insertAdjacentHTML('afterbegin', '<svg aria-hidden="true" style="position:absolute;width:0;height:0"><defs>' +
    '<linearGradient id="max-grad" x1="0" y1=".85" x2="1" y2=".25"><stop offset="0" stop-color="#1BC2FF"/><stop offset=".5" stop-color="#3C3AFE"/><stop offset="1" stop-color="#8A16FF"/></linearGradient></defs></svg>');
  const brand = (id, mono) => `<i class="brand${mono ? ' mono' : ''}" aria-hidden="true">${(mono ? MONO : BRAND)[id] || ''}</i>`;
  const MSG = S.messengers || [];
  $$('[data-brand]').forEach(el => { el.innerHTML = BRAND[el.dataset.brand] || ''; });
  // меню кнопки «Написать», значки на кнопке, контакты и подвал
  $$('.msg-menu').forEach(menu => { menu.innerHTML = MSG.map(m => `<a data-msg="${m.id}">${brand(m.id)}<span>${m.label}</span></a>`).join(''); });
  $$('[data-stack]').forEach(el => { el.innerHTML = MSG.map(m => brand(m.id, true)).join(''); });
  $('#contact-msgr').innerHTML = MSG.map(m => `<a class="chip-dark" data-msg="${m.id}">${brand(m.id)}${m.label}</a>`).join('');
  $('#foot-msgr').innerHTML = MSG.map(m => `<a data-msg="${m.id}" aria-label="${m.label}">${brand(m.id)}</a>`).join('') +
    `<a data-tel aria-label="Позвонить">${ic('phone')}</a>`;
  $$('[data-msg]').forEach(a => {
    const m = MSG.find(x => x.id === a.dataset.msg);
    a.href = S.demo || !m ? '#contact' : m.url;
    if (!S.demo && m) { a.target = '_blank'; a.rel = 'noopener'; }
  });
  // меню открывается по кнопке, закрывается по выбору, клику мимо и Esc
  const closeMenus = keep => $$('.msg-pick').forEach(p => {
    if (p === keep) return;
    p.classList.remove('open');
    $('button', p).setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', e => {
    const btn = e.target.closest('.msg-pick > button');
    if (btn) {
      const pick = btn.parentElement, open = !pick.classList.contains('open');
      closeMenus(pick);
      pick.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
      return;
    }
    closeMenus(e.target.closest('[data-msg]') ? null : e.target.closest('.msg-pick'));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenus(); });
  $$('[data-tel]').forEach(a => { a.href = S.demo ? '#contact' : 'tel:+' + S.phone.replace(/\D/g, ''); });

  // ---------- первый экран ----------
  const pine = (x, b, h, c) => {
    const t = (top, bot, half) => `<polygon points="${x},${top} ${x - half},${bot} ${x + half},${bot}" fill="${c}"/>`;
    return `<rect x="${x - h * .025}" y="${b - h * .12}" width="${h * .05}" height="${h * .12}" fill="${c}"/>` +
      t(b - h, b - h * .5, h * .17) + t(b - h * .76, b - h * .26, h * .25) + t(b - h * .52, b - h * .08, h * .33);
  };
  function heroArt() {
    let logs = '', ends = '';
    for (let y = 314; y <= 430; y += 16) logs += `<line x1="170" x2="430" y1="${y}" y2="${y}"/>`;
    for (let y = 306; y <= 434; y += 16) ends += `<circle cx="166" cy="${y}" r="8"/><circle cx="434" cy="${y}" r="8"/>`;
    const stars = [[60, 50], [140, 92], [250, 38], [330, 84], [520, 66], [410, 30], [570, 150], [30, 160], [200, 130]]
      .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1.2 : 1.7}" fill="#F6EEE4" opacity=".55"/>`).join('');
    return `<svg viewBox="0 0 600 552" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Баня вечером: тёплый свет в окне и дым из трубы">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121826"/><stop offset=".5" stop-color="#2B2433"/><stop offset=".78" stop-color="#6A3F2E"/><stop offset="1" stop-color="#B9703C"/></linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A06C3F"/><stop offset="1" stop-color="#6E4526"/></linearGradient>
        <linearGradient id="woodDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7E5432"/><stop offset="1" stop-color="#5A3A20"/></linearGradient>
        <radialGradient id="win"><stop offset="0" stop-color="#FFC56E" stop-opacity=".5"/><stop offset="1" stop-color="#FFC56E" stop-opacity="0"/></radialGradient>
        <radialGradient id="gl"><stop offset="0" stop-color="#E39B4C" stop-opacity=".35"/><stop offset="1" stop-color="#E39B4C" stop-opacity="0"/></radialGradient>
        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
        <mask id="moon"><circle cx="470" cy="104" r="22" fill="#fff"/><circle cx="481" cy="96" r="20" fill="#000"/></mask>
      </defs>
      <rect width="600" height="552" fill="url(#sky)"/>
      ${stars}
      <circle cx="470" cy="104" r="22" fill="#F4E6C8" mask="url(#moon)" opacity=".9"/>
      <path d="M0 410 C120 372 220 392 320 378 S520 360 600 384 V552 H0Z" fill="#1C1820"/>
      ${pine(60, 440, 170, '#121613')}${pine(118, 446, 120, '#121613')}${pine(500, 446, 180, '#121613')}${pine(552, 450, 130, '#121613')}${pine(455, 452, 100, '#121613')}
      <path d="M0 446 C150 432 450 432 600 446 V552 H0Z" fill="#120D0A"/>
      <ellipse cx="300" cy="452" rx="250" ry="34" fill="url(#gl)"/>
      <rect x="160" y="436" width="280" height="10" fill="#2A1F18"/>
      <rect x="170" y="300" width="260" height="138" fill="url(#wood)"/>
      <g stroke="#5B3A20" stroke-width="2" opacity=".75">${logs}</g>
      <g fill="#A87547" stroke="#5B3A20" stroke-width="1.5">${ends}</g>
      <polygon points="186,300 300,226 414,300" fill="url(#woodDark)"/>
      <circle cx="300" cy="272" r="13" fill="#FFC56E" stroke="#4A2E1A" stroke-width="4"/>
      <rect x="382" y="214" width="22" height="54" fill="#3A2C24"/>
      <rect x="377" y="207" width="32" height="9" rx="2" fill="#2A201A"/>
      <path d="M140 308 L300 198 L460 308 L446 318 L300 216 L154 318 Z" fill="#2B1F18"/>
      <ellipse cx="243" cy="363" rx="130" ry="95" fill="url(#win)"/>
      <rect x="206" y="338" width="74" height="50" rx="3" fill="#FFC56E" stroke="#4A2E1A" stroke-width="5"/>
      <path d="M243 338V388M206 363H280" stroke="#4A2E1A" stroke-width="4"/>
      <rect x="320" y="344" width="50" height="92" rx="3" fill="#3E2716" stroke="#2E1C10" stroke-width="3"/>
      <path d="M337 348V432M353 348V432" stroke="#2E1C10" stroke-width="2" opacity=".6"/>
      <circle cx="362" cy="392" r="3" fill="#E3B26E"/>
      <rect x="312" y="436" width="66" height="8" fill="#3A2A20"/>
      <ellipse cx="243" cy="450" rx="80" ry="10" fill="#FFC56E" opacity=".12"/>
      <g filter="url(#blur)" stroke="#EDE3D6" fill="none" stroke-linecap="round">
        <path d="M393 204 C372 180 412 160 390 132 C370 106 408 86 392 58" stroke-width="16" opacity=".18"/>
        <path d="M396 200 C380 178 414 156 396 126 C380 100 412 80 400 46" stroke-width="7" opacity=".22"/>
      </g>
      <path d="M0 472 C200 462 400 466 600 476 V552 H0Z" fill="#0D0907"/>
      ${pine(26, 484, 250, '#0A0D0B')}${pine(588, 486, 220, '#0A0D0B')}
    </svg>`;
  }
  // Фото первого экрана и угол крыши поверх слова (heroCorner — в процентах от фото; без него баня просто на фоне).
  // Ширина фото на экране — та же, что в styles.css (.hero-photo), поэтому фото и угол выбирают одинаковую плотность.
  const photoSizes = [['(min-width: 1100px) or ((min-width: 900px) and (orientation: landscape))', 'min(max(1523px, 176.22vw), 2792px)'], ['', '305vw']];
  const sizes = k => photoSizes.map(([m, w]) => `${m} calc(${w} * ${k})`.trim()).join(', ');
  const srcset = imgs => Object.entries(imgs).map(([w, src]) => `${esc(src)} ${w}w`).join(', ');
  const largest = imgs => imgs[Math.max(...Object.keys(imgs).map(Number))];
  const HI = S.heroImages, HC = S.heroCorner;
  const corner = HI && HC
    ? `<img class="hero-corner" src="${esc(largest(HC.images))}" srcset="${srcset(HC.images)}" sizes="${sizes(HC.width / 100)}" alt="" style="left:${HC.left}%;top:${HC.top}%;width:${HC.width}%">`
    : '';
  // Пар над крышей: рассеянная дымка и клубы, растрёпанные шумом. Два слоя с разным рисунком по очереди
  // поднимаются и тают (анимация в styles.css), поэтому пар как будто всё время идёт. Координаты — в единицах 1000×440.
  function smokeLayer(id, seed, dx) {
    const fill = `url(#puff-${id})`;
    const haze = (cx, cy, rx, ry, a) => `<ellipse cx="${cx + dx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" fill-opacity="${a}"/>`;
    // клуб: круги снизу вверх — растут, сносятся ветром и тают
    const plume = (x0, y0, h, drift, r0, r1, n, a0) => Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const x = x0 + dx + drift * Math.pow(t, 1.6) + Math.sin(t * 9 + x0) * 10;
      const a = a0 * Math.min(1, t / .18) * Math.pow(1 - t, 1.3);
      return `<circle cx="${x.toFixed(1)}" cy="${(y0 - h * t).toFixed(1)}" r="${(r0 + (r1 - r0) * t).toFixed(1)}" fill="${fill}" fill-opacity="${a.toFixed(3)}"/>`;
    }).join('');
    return `<svg class="smk smk-${id}" viewBox="0 0 1000 440" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="puff-${id}"><stop offset="0" stop-color="#F1ECE5"/><stop offset=".5" stop-color="#F1ECE5" stop-opacity=".5"/><stop offset="1" stop-color="#F1ECE5" stop-opacity="0"/></radialGradient>
        <filter id="smk-${id}" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0055 0.011" numOctaves="4" seed="${seed}" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="150" xChannelSelector="R" yChannelSelector="G"/>
          <feGaussianBlur stdDeviation="9"/>
        </filter>
      </defs>
      <g filter="url(#smk-${id})">
        ${haze(330, 150, 260, 95, .32)}${haze(600, 115, 300, 105, .3)}${haze(860, 150, 230, 90, .22)}
        ${haze(470, 210, 230, 70, .26)}${haze(730, 205, 220, 65, .2)}${haze(250, 80, 200, 70, .18)}
        ${plume(300, 262, 250, -90, 34, 190, 26, .5)}${plume(480, 268, 270, -30, 38, 210, 28, .55)}
        ${plume(660, 262, 250, 40, 34, 200, 26, .45)}${plume(820, 258, 220, 100, 30, 170, 22, .35)}
      </g>
    </svg>`;
  }
  const SM = S.heroSmoke;
  const smoke = HI && SM
    ? `<div class="hero-smoke" aria-hidden="true" style="--sl:${SM.left}%;--st:${SM.top}%;--sw:${SM.width}%;--sh:${SM.height}%">${smokeLayer('a', 23, 0)}${smokeLayer('b', 61, -60)}</div>`
    : '';
  $('#hero-photo').innerHTML = HI
    ? `<img class="hero-bg" src="${esc(largest(HI))}" srcset="${srcset(HI)}" sizes="${sizes(1)}" fetchpriority="high" alt="${esc(S.heroAlt || 'Баня компании ' + S.company)}">${smoke}${corner}`
    : heroArt().replace('<svg ', '<svg class="hero-bg" ');
  // размытая копия фона для краёв очень широких экранов — берётся самая лёгкая версия фото
  if (HI) $('.hero').style.setProperty('--hero-fill', `url("${HI[Math.min(...Object.keys(HI).map(Number))]}")`);
  const model = S.projects[0];
  $('#hero-card').innerHTML = `<small>Модель «${esc(model.name)}»<span class="card-size"> · ${model.size} м</span></small><b>от ${rub(model.price)}${ic('arrow')}</b>`;

  // шапка прозрачная, пока страница не прокручена
  const top = $('.top');
  const onScroll = () => top.classList.toggle('over', window.scrollY < 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  $('#stats').innerHTML = S.stats.map(([n, t]) => `<li><b>${n}</b><span>${t}</span></li>`).join('');
  $('#trust').innerHTML = S.trust.map(([i, b, t]) => `<li>${ic(i)}<div><b>${b}</b><span>${t}</span></div></li>`).join('');

  // ---------- проекты: планировка рисуется из размеров комнат ----------
  // Текст и линии задаются в пикселях экрана (через масштаб), поэтому одинаковы на узких и широких планах.
  function planSvg(p) {
    const pad = .55;
    const vbW = p.w + pad * 2, vbH = p.d + pad * 2;
    const s = Math.min(232 / vbW, 160 / vbH);   // примерный размер области плана в карточке, px
    const px = v => +(v / s).toFixed(3);
    const fs = px(10.5), dfs = px(9.5), lh = px(13);
    const solid = p.rooms.filter(r => r[5] !== 'terrace');
    const x0 = Math.min(...solid.map(r => r[0])), y0 = Math.min(...solid.map(r => r[1]));
    const x1 = Math.max(...solid.map(r => r[0] + r[2])), y1 = Math.max(...solid.map(r => r[1] + r[3]));
    const rooms = p.rooms.map(([x, y, w, h, label, type]) => {
      const lines = label.split('\n');
      const cx = x + w / 2, top = y + h / 2 - (lines.length - 1) * lh / 2;
      const text = lines.map((l, i) => `<text x="${cx}" y="${top + i * lh}" style="font-size:${fs}px">${l}</text>`).join('');
      const dash = type === 'terrace' ? `;stroke-dasharray:${px(4)} ${px(3)}` : '';
      return `<rect class="${type || 'room'}" x="${x}" y="${y}" width="${w}" height="${h}" style="stroke-width:${px(1.2)}px${dash}"/>${text}`;
    }).join('');
    return `<svg viewBox="${-pad} ${-pad} ${vbW} ${vbH}" aria-hidden="true">${rooms}` +
      `<rect class="walls" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" style="stroke-width:${px(3.2)}px"/>` +
      `<text class="dim" x="${(x0 + x1) / 2}" y="${y1 + px(11)}" style="font-size:${dfs}px">${num(x1 - x0)} м</text>` +
      `<text class="dim" transform="translate(${x0 - px(10)} ${(y0 + y1) / 2}) rotate(-90)" style="font-size:${dfs}px">${num(y1 - y0)} м</text></svg>`;
  }
  // платёж в месяц при рассрочке, округлён вверх до сотни
  const INST = S.installment;
  const monthly = price => Math.ceil(price / INST.months / 100) * 100;
  // две группы карточек: модульные бани и бани-бочки, между ними переключатель
  const groups = [S.projects, S.barrels || []].filter(g => g.length);
  const allProjects = groups.flat();
  const renderProjects = list => {
    $('#projects-grid').innerHTML = list.map(p => `
    <article class="proj">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      <div class="proj-plan">${planSvg(p.plan)}</div>
      <div class="proj-body">
        <h3>${p.name}</h3>
        <span class="proj-size">${p.sizeText || `${p.size} м · ${num(p.area)} м²`}</span>
        ${p.people ? `<ul class="cap">${p.people.map(([b, t], i) => `<li>${ic(i ? 'sofa' : 'users')}<span><b>${b}</b> ${t}</span></li>`).join('')}</ul>` : ''}
        <ul class="tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>
        <div class="proj-foot">
          <div class="price"><small>под ключ от</small><b>${rub(p.price)}</b>${INST ? `<span class="inst">или от ${rub(monthly(p.price))} в месяц<span>в рассрочку на ${INST.months} месяцев</span></span>` : ''}</div>
          <a class="btn btn-sm btn-dark" href="#contact" data-pick="${esc(p.name)}">Хочу такую</a>
        </div>
      </div>
    </article>`).join('');
  };
  const sw = $('#proj-switch');
  if (groups.length > 1) {
    sw.innerHTML = groups.map((g, i) =>
      `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${S.projectTabs[i]}<small>от ${rub(Math.min(...g.map(p => p.price)))}</small></button>`).join('');
    sw.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', sw).forEach(x => x.setAttribute('aria-selected', x === b));
      renderProjects(groups[+b.dataset.i]);
    });
  } else sw.remove();
  renderProjects(groups[0]);

  // рассрочка под карточками и этапы оплаты под калькулятором
  const stagesText = S.payStages.map(([p]) => p + '%').join(' · ');
  if (INST) {
    $('#inst-title').textContent = 'Рассрочка и оплата частями';
    const n = S.payStages.length;
    $('#inst-text').textContent = `Через банк-партнёр или напрямую нам в ${['', 'один', 'два', 'три', 'четыре'][n] || n} ${plural(n, 'этап', 'этапа', 'этапов')}: ${stagesText}.`;
  } else $('#inst-banner').remove();
  // ширина этапа на полосе — по его проценту
  $('.stages').style.setProperty('--stage-cols', S.payStages.map(([p]) => p + 'fr').join(' '));
  $('#stage-bar').innerHTML = S.payStages.map(() => '<span></span>').join('');
  // на телефоне этапы — карточки, листаются вбок: номер этапа и сколько оплачено к этому моменту (на компьютере скрыты)
  let paid = 0;
  $('#stage-list').innerHTML = S.payStages.map(([p, t, short], i) => {
    paid += p;
    return `<li><small class="stage-n">Этап ${i + 1} из ${S.payStages.length}</small><b>${p}%</b><span class="stage-t">${tx(t, short)}</span>` +
      `<i class="stage-prog" style="--paid:${paid}%"></i><small class="stage-sum">оплачено ${paid}%</small></li>`;
  }).join('');

  // индивидуальный проект: подпись к схеме — модель с бейджем
  const featured = S.projects.find(p => p.badge) || S.projects[0];
  $('#custom-steps').innerHTML = S.custom.map(([b, t, short]) => `<li><div><b>${b}</b><span>${tx(t, short)}</span></div></li>`).join('');
  $('#custom-tag').textContent = `Пример: модель «${featured.name}» на участке 12 соток`;

  // договор: список и образец с ценой и сроком модели с бейджем
  $('#deal-list').innerHTML = S.deal.map(([i, b, t, short]) => `<li><span class="ic">${ic(i)}</span><div><b>${b}</b><p>${tx(t, short)}</p></div></li>`).join('');
  const featuredDays = (S.calc.types[0].sizes.find(s => s.project === featured.name) || { days: 30 }).days;
  const dueDate = new Date(Date.now() + (featuredDays + 7) * 864e5).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/\s*г\.$/, '');
  const D = S.dealDoc, ln = w => `<div class="ln" style="width:${w}%"></div>`;
  $('#deal-doc').innerHTML = `<p class="doc-h">Договор № ${D.number}</p><p class="doc-sub">${D.subject}</p>` +
    ln(92) + ln(78) + ln(85) +
    `<div class="clause"><span>4.1. Стоимость (фиксированная)</span><b>${rub(featured.price)}</b></div>` + ln(88) + ln(64) +
    `<div class="clause"><span>5.2. Изготовление и монтаж</span><b>до ${dueDate}</b></div>` + ln(80) + ln(90) + ln(58) +
    `<div class="clause"><span>8.1. Гарантия на конструкцию</span><b>${D.guarantee}</b></div>` + ln(86) + ln(72) +
    `<div class="sign"><div>Исполнитель</div><div>Заказчик</div></div>` +
    `<div class="stamp">${esc(S.company.toUpperCase()).split(' ').join('<br>')}<br>${esc(S.address.split(',')[0].toUpperCase())}</div>`;

  $('#included-list').innerHTML = S.included.map(t => `<li>${ic('check')}<span>${Array.isArray(t) ? tx(...t) : t}</span></li>`).join('');
  $('#steps-list').innerHTML = S.steps.map(([t, d, short], i) =>
    `<li><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${tx(d, short)}</p></li>`).join('');

  // ---------- своё производство: фото цеха и цифры ----------
  const PROD = S.production;
  if (PROD) {
    $('#prod-grid').innerHTML = PROD.photos.map(([t, sub, img, pos]) => `
    <figure class="prod-ph">
      <img src="${esc(img)}" alt="${esc(t)}" loading="lazy" decoding="async"${pos ? ` style="object-position:${esc(pos)}"` : ''}>
      <figcaption>${t}<small>${sub}</small></figcaption>
    </figure>`).join('');
    $('#prod-facts').innerHTML = PROD.facts.map(([b, t]) => `<div><b>${b}</b><span>${t}</span></div>`).join('');
  } else $('#production').remove();

  // ---------- объекты, отзывы, вопросы ----------
  // четвёртое поле (необязательно) — какую часть фото показывать при обрезке до 4:3, например '50% 60%'
  $('#gallery-grid').innerHTML = S.gallery.map(([t, place, img, pos]) => `
    <figure class="ph">
      ${img ? `<img src="${esc(img)}" alt="${esc(t)}, ${esc(place)}" loading="lazy" decoding="async"${pos ? ` style="object-position:${esc(pos)}"` : ''}>` : `<span class="cam">${ic('camera')}Фото объекта</span>`}
      <figcaption>${t}<small>${place}</small></figcaption>
    </figure>`).join('');
  // рейтинг с карт
  $('#ratings').innerHTML = (S.ratings || []).map(r => {
    const count = `${r.count} ${plural(r.count, 'отзыв', 'отзыва', 'отзывов')}`;
    return `<div class="rating"><span class="pin pin-${r.kind}">${ic('pin')}</span><span class="src">${r.source}</span>
      <div class="val"><b>${num(r.value)}</b><span class="stars" aria-label="${num(r.value)} из 5">★★★★★</span>${r.url && !S.demo ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${count}</a>` : `<span class="cnt">${count}</span>`}</div></div>`;
  }).join('');
  if (!S.demo) $('#reviews-demo').remove();
  $('#reviews-list').innerHTML = S.reviews.map(([name, where, text, src]) => `
    <article class="rev">
      <div class="rev-top"><span class="stars" aria-label="5 из 5">★★★★★</span>${src ? `<span class="rev-src">${ic('pin')}${src}</span>` : ''}</div>
      <p>${text}</p>
      <div class="rev-who"><span class="ava">${name[0]}</span><div><b>${name}</b><small>${where}</small></div></div>
    </article>`).join('');
  $('#faq-list').innerHTML = S.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');

  // ---------- калькулятор ----------
  const T = S.calc.types;
  const state = { type: 0, size: 1, mat: 0, extras: new Set(), pay: 'now' };
  const cur = () => T[state.type];
  const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
  $('#calc-type').innerHTML = T.map((t, i) =>
    `<button type="button" class="pill" data-i="${i}" aria-pressed="false">${t.label}<small>от ${rub(Math.min(...t.sizes.map(s => s.price)))}</small></button>`).join('');

  // размеры, материалы и опции перестраиваются при смене типа бани
  function buildType() {
    const t = cur();
    $('#calc-note').innerHTML = tx(t.note, t.noteShort);
    $('#calc-size-label').textContent = t.sizesLabel;
    $('#calc-mat-label').textContent = t.materialsLabel;
    $('#calc-size').innerHTML = t.sizes.map((s, i) =>
      `<button type="button" class="pill" data-i="${i}" aria-pressed="false">${s.label}<small>${s.sub}</small></button>`).join('');
    $('#calc-mat').innerHTML = t.materials.map(([label, k, hint], i) =>
      `<label class="opt"><input type="radio" id="calc-mat-${i}" name="mat" value="${i}"><span class="mark"></span>` +
      `<span class="opt-t">${label}${hint ? `<small>${hint}</small>` : ''}</span>` +
      `<span class="opt-p">${k === 1 ? 'базовая цена' : '+' + Math.round((k - 1) * 100) + '%'}</span></label>`).join('');
    $('#calc-extras').innerHTML = t.extras.map((e, i) =>
      `<label class="opt check"><input type="checkbox" id="calc-extra-${i}" value="${i}"><span class="mark"></span><span class="opt-t">${e.label}</span>` +
      `<span class="opt-p" data-price="+${rub(e.price)}">+${rub(e.price)}</span></label>`).join('');
  }

  function calcSummary() {
    const t = cur(), s = t.sizes[state.size], [mat, k] = t.materials[state.mat];
    const inc = s.includes || [];
    const extras = [...state.extras].sort().map(i => t.extras[i]).filter(e => !inc.includes(e.id));
    const total = Math.round((s.price * k + extras.reduce((a, e) => a + e.price, 0)) / 10000) * 10000;
    const title = `${t.name}${s.model ? ` «${s.model}»` : ''} ${s.full || s.label + ' м'}`;
    const text = `${title}, ${t.matPrefix} ${lower(mat)}` + (extras.length ? ', ' + extras.map(e => lower(e.label)).join(', ') : '');
    return { total, days: s.days, install: t.install, text, project: s.project };
  }
  function renderCalc() {
    const t = cur(), inc = t.sizes[state.size].includes || [];
    $$('#calc-type .pill').forEach((b, i) => { b.classList.toggle('on', i === state.type); b.setAttribute('aria-pressed', i === state.type); });
    $$('#calc-size .pill').forEach((b, i) => { b.classList.toggle('on', i === state.size); b.setAttribute('aria-pressed', i === state.size); });
    $$('#calc-mat .opt').forEach((o, i) => { o.classList.toggle('on', i === state.mat); $('input', o).checked = i === state.mat; });
    $$('#calc-extras .opt').forEach((o, i) => {
      const included = inc.includes(t.extras[i].id), input = $('input', o), price = $('.opt-p', o);
      o.classList.toggle('incl', included); input.disabled = included;
      o.classList.toggle('on', included || state.extras.has(i)); input.checked = included || state.extras.has(i);
      price.textContent = included ? 'входит в модель' : price.dataset.price;
    });
    const r = calcSummary(), inst = INST && state.pay === 'inst';
    $$('#pay-toggle button').forEach(b => b.setAttribute('aria-pressed', b.dataset.pay === state.pay));
    $('#calc-sum').classList.toggle('per-month', !!inst);
    $('#calc-sum').innerHTML = inst ? `<span>≈ ${rub(monthly(r.total))}</span> <span class="per">/ мес</span>` : '≈ ' + rub(r.total);
    // «около 21 дня», «около 14 дней»: после «около» — родительный падеж
    const daysWord = r.days % 10 === 1 && r.days % 100 !== 11 ? 'дня' : 'дней';
    $('#calc-days').textContent = inst
      ? `При рассрочке на ${INST.months} месяцев, точный платёж посчитает банк`
      : `Изготовление — около ${r.days} ${daysWord}, ${r.install}`;
    $('#calc-sel').textContent = r.text;
    $('#calc-cta-text').textContent = inst ? 'Оформить рассрочку' : 'Зафиксировать цену';
    $('#calc-fine').innerHTML = inst ? INST.note : tx('Расчёт ни к чему не обязывает. Свяжемся и ответим на вопросы.', 'Расчёт ни к чему не обязывает.');
  }
  // «Сразу / В рассрочку» в калькуляторе; кнопка «Узнать условия» под карточками тоже включает рассрочку
  if (!INST) $('#pay-toggle').remove();
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pay]');
    if (b && INST) { state.pay = b.dataset.pay; renderCalc(); }
  });
  $('#calc-type').addEventListener('click', e => {
    const b = e.target.closest('.pill'); if (!b || +b.dataset.i === state.type) return;
    state.type = +b.dataset.i; state.size = Math.min(1, cur().sizes.length - 1); state.mat = 0; state.extras.clear();
    buildType(); renderCalc();
  });
  $('#calc-size').addEventListener('click', e => { const b = e.target.closest('.pill'); if (b) { state.size = +b.dataset.i; renderCalc(); } });
  $('#calc-mat').addEventListener('change', e => { state.mat = +e.target.value; renderCalc(); });
  $('#calc-extras').addEventListener('change', e => {
    const i = +e.target.value;
    e.target.checked ? state.extras.add(i) : state.extras.delete(i);
    renderCalc();
  });
  buildType(); renderCalc();

  // ---------- заявка ----------
  const form = $('#lead');
  const project = $('#lead-project');
  const optionText = p => `${p.name}, ${p.size}${p.sizeText ? '' : ' м'}`;
  project.innerHTML = '<option value="">Ещё не выбрал</option>' + allProjects.map(p => `<option>${optionText(p)}</option>`).join('');
  const pickProject = name => { const p = allProjects.find(x => x.name === name); project.value = p ? optionText(p) : ''; };
  document.addEventListener('click', e => {
    const pick = e.target.closest('[data-pick]');
    if (pick) pickProject(pick.dataset.pick);
  });
  $('#calc-cta').addEventListener('click', () => {
    const r = calcSummary();
    pickProject(r.project);
    $('#lead-comment').value = `Расчёт в калькуляторе: ${lower(r.text)} — около ${rub(r.total)}` +
      (INST && state.pay === 'inst' ? `, в рассрочку на ${INST.months} месяцев — около ${rub(monthly(r.total))} в месяц` : '');
  });
  $('#custom-cta').addEventListener('click', () => {
    project.value = '';
    $('#lead-comment').value = 'Индивидуальный проект под мой участок';
  });

  // способ связи: от выбора зависят подсказка под телефоном, текст кнопки и ответ после отправки
  const ways = S.contactWays || [];
  const wayBox = $('#contact-way');
  if (ways.length) {
    wayBox.innerHTML = ways.map((w, i) =>
      `<label class="way"><input type="radio" name="way" value="${w.id}"${i ? '' : ' checked'}>${BRAND[w.id] ? brand(w.id) : ic(w.icon)}${w.label}</label>`).join('');
    const setWay = () => {
      const w = ways.find(x => x.id === form.elements.way.value) || ways[0];
      $$('.way', wayBox).forEach(l => l.classList.toggle('on', $('input', l).checked));
      $('#way-hint').textContent = w.hint;
      $('#lead-submit').textContent = w.button;
      $('#done-text').textContent = w.done;
    };
    wayBox.addEventListener('change', setWay);
    setWay();
    // в демо ссылки мессенджеров ведут к заявке — там сразу выбран этот мессенджер
    if (S.demo) document.addEventListener('click', e => {
      const radio = e.target.closest('[data-msg]') && $(`input[value="${e.target.closest('[data-msg]').dataset.msg}"]`, wayBox);
      if (radio) { radio.checked = true; setWay(); }
    });
  } else { $('.ways').remove(); $('#way-hint').remove(); }

  const phone = form.elements.phone;
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (d && !d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    let out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length > 4) out += ') ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    phone.value = d ? out : '';
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name, consent = form.elements.consent;
    const okName = name.value.trim().length > 0;
    const okPhone = phone.value.replace(/\D/g, '').length === 11;
    name.setAttribute('aria-invalid', !okName);
    phone.setAttribute('aria-invalid', !okPhone);
    const err = !okName ? 'Укажите, как к вам обращаться' : !okPhone ? 'Проверьте номер телефона' : !consent.checked ? 'Нужно согласие на обработку данных' : '';
    $('#lead-error').textContent = err;
    if (err) return;
    // В рабочей версии здесь отправка заявки (например, в Telegram-бот или на почту через сервер).
    $('#done-title').textContent = `Спасибо, ${name.value.trim()}!`;
    form.classList.add('sent');
  });

  // ---------- подвал и иконки ----------
  const L = S.legal;
  $('#legal-req').innerHTML = [`© ${new Date().getFullYear()} ${L.name}`, `ИНН ${L.inn}`, `ОГРН ${L.ogrn}`, `КПП ${L.kpp}`]
    .map(t => `<span>${esc(t)}</span>`).join('');
  if (!S.demo) { $('#demo-note').remove(); $('#done-demo').remove(); }
  else if (S.photoCredit) $('#demo-note').textContent += `  Фото: ${S.photoCredit}.`;
  $$('i[data-icon]').forEach(el => { if (!el.innerHTML) el.innerHTML = icon(el.dataset.icon); });
})();
