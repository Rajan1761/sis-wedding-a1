(function () {
  'use strict';

  /* ================= CONFIG (edit here) ================= */
  var CONFIG = {
    bride: 'G. Saraswathi',
    groom: 'P. Mageshwaran',
    startISO: '2026-11-20T09:00:00+05:30',   // 9:00 AM IST (absolute time, correct in every time zone)
    endISO: '2026-11-20T10:30:00+05:30',
    venue: 'Veerabahu Mahal',
    address: 'North Authoor, Tamil Nadu – 628151',
    dateLabel: 'Friday, 20 November 2026',
    time: '9:00 AM – 10:30 AM',
    mapsUrl: 'https://maps.app.goo.gl/4vEB8Qayk87V58Q89',
    shareMessage: 'You are warmly invited to the wedding of G. Saraswathi & P. Mageshwaran on Friday, 20 November 2026, from 9:00 AM to 10:30 AM at Veerabahu Mahal, North Authoor, Tamil Nadu. We would be delighted to celebrate this special day with you!',
    // RSVP delivery (optional). Use ONE of these; if both are empty the form says nothing was sent.
    rsvpEndpoint: '',   // e.g. 'https://formspree.io/f/xxxxxxx'
    rsvpWhatsapp: '',   // digits only with country code, e.g. '919876543210'
    musicUrl: '/a1.mp3',       // optional licensed mp3, e.g. 'audio/music.mp3'. Empty = built-in soft synth music
    // Footer "Design by" credit  
    designerName: 'Rajan G',
    designerInsta: '@real_king_buddy'   // Instagram ID without the @ (leave '' to hide the button)
  };

  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= AUDIO (Web Audio, no files) ================= */
  var ctx = null, master, bus, timer = null, enabled = false, idx = 2, tick = 0, el = null;
  var SCALE = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
  function ensure() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      master = ctx.createGain(); master.gain.value = 0.7;
      var d = ctx.createDelay(1); d.delayTime.value = 0.38;
      var fb = ctx.createGain(); fb.gain.value = 0.38;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
      master.connect(ctx.destination); master.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(ctx.destination);
      bus = ctx.createGain(); bus.gain.value = 0; bus.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, t, dur, type, vol, dest, attack) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + (attack || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  function step() {
    if (!ctx) return;
    var t = ctx.currentTime;
    if (tick++ % 6 === 0) { tone(130.81, t, 7, 'sine', 0.06, bus, 1.5); tone(196, t, 7, 'sine', 0.04, bus, 1.5); }
    idx = Math.max(0, Math.min(SCALE.length - 1, idx + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2))));
    tone(SCALE[idx], t, 3.2, 'triangle', 0.08, bus);
    if (Math.random() < 0.3) tone(SCALE[idx] / 2, t + 0.05, 3.6, 'sine', 0.05, bus);
  }
  function enableAudio() { enabled = true; ensure(); }
  function setMusic(on) {
    if (CONFIG.musicUrl) {
      if (!el) { el = new Audio(CONFIG.musicUrl); el.loop = true; el.volume = 0.5; }
      if (on) { enabled = true; el.play().catch(function () {}); ensure(); } else el.pause();
      return;
    }
    if (on) {
      var c = ensure(); if (!c) return;
      enabled = true;
      bus.gain.cancelScheduledValues(c.currentTime); bus.gain.setTargetAtTime(1, c.currentTime, 0.6);
      if (timer === null) { step(); timer = setInterval(step, 1300); }
    } else if (ctx) {
      bus.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      clearInterval(timer); timer = null;
    }
  }
  var sfx = {
    chime: function () {
      if (!enabled || !ctx) return; var t = ctx.currentTime;
      [[880, 0.12], [1318.5, 0.07], [2217, 0.04]].forEach(function (p, i) { tone(p[0], t + i * 0.01, 3, 'sine', p[1], master); });
    },
    paper: function () {
      if (!enabled || !ctx) return;
      var len = Math.floor(ctx.sampleRate * 0.6), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var s = ctx.createBufferSource(); s.buffer = buf;
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200;
      var g = ctx.createGain(); g.gain.value = 0.12;
      s.connect(f); f.connect(g); g.connect(master); s.start();
    }
  };
  var musicOn = false, musicBtn = $('#music');
  function toggleMusic(force) {
    musicOn = typeof force === 'boolean' ? force : !musicOn;
    setMusic(musicOn);
    musicBtn.setAttribute('aria-pressed', String(musicOn));
    musicBtn.setAttribute('aria-label', musicOn ? 'Mute background music' : 'Play background music');
  }
  musicBtn.addEventListener('click', function () { toggleMusic(); });

  /* ================= SVG ORNAMENTS ================= */
  var HEART = 'M50 90C22 68 6 48 6 30 6 15 18 6 31 6 40 6 47 11 50 18 53 11 60 6 69 6 82 6 94 15 94 30 94 48 78 68 50 90Z';
  $$('[data-hearts]').forEach(function (svg) {
    svg.innerHTML = '<g transform="translate(8 14) rotate(-12 50 50) scale(.9)"><path d="' + HEART + '" pathLength="1"/></g>' +
      '<g transform="translate(62 14) rotate(12 50 50) scale(.9)"><path d="' + HEART + '" pathLength="1"/></g>';
    if (svg.getAttribute('data-hearts') === 'static') svg.classList.add('hearts');
  });
  var CORNER = '<path d="M4 96C4 52 28 24 96 4" pathLength="1"/><path d="M4 70C12 62 20 64 24 72 16 76 8 76 4 70Z" pathLength="1"/><path d="M30 44C38 36 46 38 50 46 42 50 34 50 30 44Z" pathLength="1"/><path d="M62 24C70 16 78 18 82 26 74 30 66 30 62 24Z" pathLength="1"/><path d="M12 50C18 44 24 46 26 52" pathLength="1"/><circle cx="7" cy="93" r="3" fill="#c9a24a" stroke="none"/>';
  $$('.paper').forEach(function (p) {
    ['c1', 'c2', 'c3', 'c4'].forEach(function (c) {
      var s = document.createElementNS(NS, 'svg');
      s.setAttribute('viewBox', '0 0 100 100'); s.setAttribute('class', 'corner ' + c); s.setAttribute('aria-hidden', 'true');
      s.innerHTML = CORNER; p.appendChild(s);
    });
  });
  // Pseudo-3D rotating golden hearts: stacked layers rotating in CSS 3D
  ['hearts3d', 'hearts3d-b'].forEach(function (id) {
    var root = document.getElementById(id); if (!root) return;
    var pair = document.createElement('div'); pair.className = 'pair';
    [-1, 1].forEach(function (side) {
      var h = document.createElement('div'); h.className = 'h3'; h.style.setProperty('--side', side);
      for (var i = 0; i < 13; i++) {
        var s = document.createElementNS(NS, 'svg');
        s.setAttribute('viewBox', '0 0 100 100'); s.setAttribute('class', 'layer');
        s.style.transform = 'translateZ(' + ((i - 6) * 2.6) + 'px)';
        s.style.fill = 'hsl(' + (side < 0 ? (document.body.classList.contains('lux') ? 14 : 340) : 41) + ' ' + (i === 0 || i === 12 ? 72 : 62) + '% ' + (i === 0 || i === 12 ? 62 : 40 + (i % 3) * 2) + '%)';
        s.innerHTML = '<use href="#heart"/>'; h.appendChild(s);
      }
      pair.appendChild(h);
    });
    root.appendChild(pair);
  });

  /* ================= LETTERS + SCROLL REVEAL ================= */
  $$('[data-letters]').forEach(function (n) {
    var text = n.textContent, delay = parseFloat(n.getAttribute('data-delay') || 0);
    n.setAttribute('aria-label', text); n.textContent = '';
    Array.prototype.forEach.call(text, function (ch, i) {
      var s = document.createElement('span');
      s.className = 'ltr'; s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true'); s.textContent = ch;
      s.style.transitionDelay = (delay + i * 0.05) + 's'; n.appendChild(s);
    });
  });
  var targets = $$('[data-reveal],[data-letters],.paper');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); $$('.ltr', e.target).forEach(function (l) { l.classList.add('in'); }); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (t) { io.observe(t); });
  } else targets.forEach(function (t) { t.classList.add('in'); $$('.ltr', t).forEach(function (l) { l.classList.add('in'); }); });

  /* ================= PARTICLES (gold dust, petals, pointer trail) ================= */
  (function () {
    var cv = $('#fx'), c2 = cv.getContext && cv.getContext('2d'); if (!c2) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, ps = [], trail = [], LUX = document.body.classList.contains('lux'),
      PAL = LUX ? ['244,220,149', '233,196,106', '255,236,190', '217,180,90', '255,214,170'] : ['255,214,120', '255,120,170', '120,230,210', '190,150,255', '255,170,90'];
    function resize() { w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; c2.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function mk(init) {
      var petal = Math.random() < 0.25;
      return { c: PAL[Math.floor(Math.random() * PAL.length)], x: Math.random() * w, y: init ? Math.random() * h : (petal ? -20 : h + 10), r: petal ? 3 + Math.random() * 4 : 0.8 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.25, vy: petal ? 0.25 + Math.random() * 0.4 : -(0.1 + Math.random() * 0.3), a: 0.3 + Math.random() * 0.6,
        ph: Math.random() * 6.28, petal: petal, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02 };
    }
    resize(); addEventListener('resize', resize);
    var n = innerWidth < 640 ? 28 : 60; for (var i = 0; i < n; i++) ps.push(mk(true));
    if (!reduced) addEventListener('pointermove', function (e) {
      if (trail.length > 40) trail.shift();
      trail.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 0.4, vy: 0.2, life: 1 });
    }, { passive: true });
    function draw(t) {
      c2.clearRect(0, 0, w, h);
      if (!document.hidden) {
        for (var i = 0; i < ps.length; i++) {
          var p = ps[i];
          p.x += p.vx + (p.petal ? Math.sin(t / 1400 + p.ph) * 0.4 : 0); p.y += p.vy; p.rot += p.vr;
          if (p.y > h + 24 || p.y < -24) { ps[i] = mk(false); continue; }
          if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
          if (p.petal) {
            c2.save(); c2.translate(p.x, p.y); c2.rotate(p.rot); c2.fillStyle = 'rgba(' + p.c + ',' + (p.a * 0.7) + ')';
            c2.beginPath(); c2.ellipse(0, 0, p.r * 1.7, p.r * 0.8, 0, 0, 6.283); c2.fill(); c2.restore();
          } else {
            c2.fillStyle = 'rgba(' + p.c + ',' + (p.a * (0.55 + 0.45 * Math.sin(t / 700 + p.ph))) + ')';
            c2.beginPath(); c2.arc(p.x, p.y, p.r, 0, 6.283); c2.fill();
          }
        }
        for (var j = trail.length - 1; j >= 0; j--) {
          var q = trail[j]; q.life -= 0.025; q.x += q.vx; q.y += q.vy;
          if (q.life <= 0) { trail.splice(j, 1); continue; }
          c2.fillStyle = 'rgba(244,220,149,' + (q.life * 0.8) + ')';
          c2.beginPath(); c2.arc(q.x, q.y, 1.6 * q.life, 0, 6.283); c2.fill();
        }
      }
      if (!reduced) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ================= LOADER -> INTRO ================= */
  var intro = $('#intro'), scene = $('#scene'), site = $('#site');
  function fitCard() {
    var w = scene.offsetWidth || 340;
    var s = Math.min(1.6, innerWidth * 0.9 / (w * 0.82), innerHeight * 0.6 / w);
    scene.style.setProperty('--s', s.toFixed(3));
  }
  addEventListener('resize', fitCard);
  var timers = [];
  function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function runIntro() {
    intro.hidden = false; musicBtn.hidden = false; fitCard();
    if (reduced) return finishIntro(true);
    later(300, function () { intro.classList.add('spot'); });
    later(1500, function () { scene.classList.add('zoom'); });
    later(3400, function () { scene.classList.add('s-open'); sfx.paper(); });
    later(4600, function () { scene.classList.add('s-out'); });
    later(6000, function () { scene.classList.add('s-unfold'); sfx.paper(); });
    later(7400, function () { scene.classList.add('s-final'); });
    later(9000, function () { finishIntro(false); });
  }
  function finishIntro(instant) {
    timers.forEach(clearTimeout); timers = [];
    if (instant) intro.classList.add('instant');
    intro.classList.add('spot');
    ['s-open', 's-out', 's-unfold', 's-final'].forEach(function (c) { scene.classList.add(c); });
    intro.classList.add('ready');
    if (!instant) { sfx.chime(); }
    scene.classList.add('sweep');
  }
  $('#skip').addEventListener('click', function () { finishIntro(true); });
  $('#open-btn').addEventListener('click', function () {
    enableAudio(); sfx.chime(); if (!musicOn) toggleMusic(true);
    intro.classList.add('leave');
    setTimeout(function () {
      intro.remove(); site.hidden = false; $('#footer').hidden = false; $('#progress').hidden = false; $('#share').hidden = false; window.scrollTo(0, 0);
    }, 1100);
  });
  var fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 3000); })]) : Promise.resolve();
  Promise.all([fontsReady, new Promise(function (r) { setTimeout(r, 1400); })]).then(function () {
    $('#loader').classList.add('gone'); setTimeout(function () { $('#loader').remove(); }, 900);
    runIntro();
  });

  /* ================= COUNTDOWN + CALENDAR ================= */
  var start = new Date(CONFIG.startISO).getTime(), end = new Date(CONFIG.endISO).getTime();
  var place = CONFIG.venue + ', ' + CONFIG.address;
  var title = 'Wedding of ' + CONFIG.bride + ' & ' + CONFIG.groom;
  var details = 'Wedding ceremony, ' + CONFIG.time + ' IST. Directions: ' + CONFIG.mapsUrl;
  function utc(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function tickCd() {
    var ms = start - Date.now();
    if (ms <= 0) {
      $('#cd').hidden = true; var d = $('#cd-done'); d.hidden = false;
      d.textContent = Date.now() < end ? 'Today is our wedding day. Join us at ' + CONFIG.venue + '!' : 'Thank you for celebrating our wedding day with us.';
      return;
    }
    var s = Math.floor(ms / 1000);
    $('#cd-d').textContent = pad(Math.floor(s / 86400)); $('#cd-h').textContent = pad(Math.floor(s % 86400 / 3600));
    $('#cd-m').textContent = pad(Math.floor(s % 3600 / 60)); $('#cd-s').textContent = pad(s % 60);
  }
  tickCd(); setInterval(tickCd, 1000);
  $('#gcal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + utc(start) + '/' + utc(end) + '&location=' + encodeURIComponent(place) + '&details=' + encodeURIComponent(details);
  $('#ics').addEventListener('click', function () {
    var esc = function (s) { return s.replace(/,/g, '\\,').replace(/;/g, '\\;'); };
    var body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invitation//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:wedding-20261120@saraswathi-mageshwaran', 'DTSTAMP:' + utc(Date.now()), 'DTSTART:' + utc(start), 'DTEND:' + utc(end),
      'SUMMARY:' + esc(title), 'LOCATION:' + esc(place), 'DESCRIPTION:' + esc(details), 'URL:' + CONFIG.mapsUrl, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a'); a.href = url; a.download = 'saraswathi-mageshwaran-wedding.ics';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });

  /* ================= CLIPBOARD ================= */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallback(); });
    return Promise.resolve(fallback());
    function fallback() {
      try { var t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); var ok = document.execCommand('copy'); t.remove(); return ok; } catch (e) { return false; }
    }
  }
  function flash(btn, label) { var o = btn.textContent; btn.textContent = label; setTimeout(function () { btn.textContent = o; }, 2200); }
  $('#copy-venue').addEventListener('click', function () {
    var b = this;
    copyText(CONFIG.venue + '\n' + CONFIG.address + '\n' + CONFIG.dateLabel + ', ' + CONFIG.time + '\n' + CONFIG.mapsUrl).then(function (ok) { if (ok) flash(b, 'Copied'); });
  });

  /* ================= VENUE TILT ================= */
  var tilt = $('#tilt');
  if (!reduced) {
    tilt.addEventListener('pointermove', function (e) {
      var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = 'rotateX(' + (-y * 20) + 'deg) rotateY(' + (x * 24) + 'deg)';
    });
    tilt.addEventListener('pointerleave', function () { tilt.style.transform = ''; });
  }

  /* ================= RSVP ================= */
  var sel = $('#f-guests'); for (var g = 1; g <= 10; g++) { var o = document.createElement('option'); o.value = g; o.textContent = g; sel.appendChild(o); }
  var form = $('#rsvp-form'), opened = Date.now();
  $$('input[name=attend]').forEach(function (r) { r.addEventListener('change', function () { $('#guests-wrap').hidden = r.value === 'decline' && r.checked; }); });
  function setErr(errs) { $$('[data-err]').forEach(function (p) { p.textContent = errs[p.getAttribute('data-err')] || ''; }); }
  function submit(mode) {
    var name = $('#f-name').value.trim(), wishes = $('#f-wishes').value.trim(), guests = parseInt(sel.value, 10);
    var chosen = $('input[name=attend]:checked'), attend = mode === 'accept' ? 'accept' : (chosen ? chosen.value : '');
    var e = {};
    if (name.length < 2 || name.length > 60) e.name = 'Please enter your name (2–60 characters).';
    if (mode === 'accept' && !chosen) e.attend = 'Please confirm attendance.';
    else if (mode === 'accept' && chosen.value === 'decline') attend = 'decline';
    if (attend === 'accept' && !(guests >= 1 && guests <= 10)) e.guests = 'Guests must be between 1 and 10.';
    if (mode === 'wishes' && !wishes) e.wishes = 'Please write a few words for the couple.';
    if (wishes.length > 500) e.wishes = 'Wishes are limited to 500 characters.';
    setErr(e); if (Object.keys(e).length) return;
    if ($('#f-trap').value || Date.now() - opened < 3000) return showResult('Thank you!'); // spam traps
    var text = ['RSVP: ' + name, attend ? 'Attendance: ' + (attend === 'accept' ? 'Joyfully accepts' : 'Regretfully declines') : '', attend === 'accept' ? 'Guests: ' + guests : '', wishes ? 'Wishes: ' + wishes : ''].filter(Boolean).join('\n');
    var btns = [$('#b-accept'), $('#b-wish')]; btns.forEach(function (b) { b.disabled = true; });
    var done = function () { btns.forEach(function (b) { b.disabled = false; }); };
    if (CONFIG.rsvpEndpoint) {
      fetch(CONFIG.rsvpEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: name, attendance: attend || 'wishes only', guests: attend === 'accept' ? guests : 0, wishes: wishes }) })
        .then(function (r) { if (!r.ok) throw new Error('bad'); showResult('Thank you! Your response has been delivered to the families.'); })
        .catch(function () { setErr({ form: 'Sorry, we could not deliver your response. Please try again in a moment.' }); })
        .then(done);
    } else if (CONFIG.rsvpWhatsapp) {
      window.open('https://wa.me/' + CONFIG.rsvpWhatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      showResult('Almost done! Please press Send in the WhatsApp message that just opened to complete your RSVP.'); done();
    } else { showResult(null, text); done(); }
  }
  function showResult(msg, text) {
    form.hidden = true; var r = $('#rsvp-result'); r.hidden = false; r.textContent = '';
    if (msg) { var p = document.createElement('p'); p.className = 'script'; p.textContent = msg; r.appendChild(p); return; }
    var p1 = document.createElement('p'); p1.innerHTML = 'RSVP delivery is not set up on this website yet, so <strong>nothing has been sent</strong>. Please copy your message and share it with the family directly.';
    var pre = document.createElement('pre'); pre.textContent = text;
    var b = document.createElement('button'); b.className = 'btn ghost'; b.textContent = 'Copy my message'; b.style.marginTop = '1rem';
    b.addEventListener('click', function () { copyText(text).then(function (ok) { if (ok) flash(b, 'Copied'); }); });
    r.appendChild(p1); r.appendChild(pre); r.appendChild(b);
  }
  form.addEventListener('submit', function (ev) { ev.preventDefault(); submit('accept'); });
  $('#b-wish').addEventListener('click', function () { submit('wishes'); });

  /* ================= SHARE ================= */
  (function () {
    var menu = $('#share-menu'), btn = $('#share-btn');
    var url = location.href.split('#')[0];
    var text = CONFIG.shareMessage + '\n\nWedding Location: ' + CONFIG.mapsUrl, full = text + '\n\nInvitation: ' + url, enc = encodeURIComponent;
    var ttl = 'Wedding Invitation: ' + CONFIG.bride + ' & ' + CONFIG.groom;
    function link(label, href) { var a = document.createElement('a'); a.textContent = label; a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; menu.appendChild(a); }
    if (navigator.share) { var n = document.createElement('button'); n.textContent = 'Share…'; n.onclick = function () { navigator.share({ title: ttl, text: text, url: url }).catch(function () {}); }; menu.appendChild(n); }
    link('WhatsApp', 'https://wa.me/?text=' + enc(full));
    link('Telegram', 'https://t.me/share/url?url=' + enc(url) + '&text=' + enc(text));
    link('Email', 'mailto:?subject=' + enc(ttl) + '&body=' + enc(full));
    link('SMS', 'sms:?&body=' + enc(full));
    var cp = document.createElement('button'); cp.textContent = 'Copy link';
    cp.onclick = function () { copyText(url).then(function (ok) { if (ok) flash(cp, 'Link copied'); }); }; menu.appendChild(cp);
    btn.addEventListener('click', function () { menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); });
  })();

  /* ================= FOOTER + SCROLL PROGRESS ================= */
  (function () {
    var handle = String(CONFIG.designerInsta || '').replace(/^@/, '').trim();
    var ig = $('#dsn-ig');
    $('#dsn-name').textContent = CONFIG.designerName;
    if (handle) { ig.href = 'https://instagram.com/' + encodeURIComponent(handle); $('#dsn-handle').textContent = '@' + handle; }
    else { ig.hidden = true; }
    $('#yr').textContent = new Date().getFullYear();

    var url = location.href.split('#')[0];
    $('#f-dir').href = CONFIG.mapsUrl;
    $('#f-wa').href = 'https://wa.me/?text=' + encodeURIComponent(CONFIG.shareMessage + '\n\nWedding Location: ' + CONFIG.mapsUrl + '\n\nInvitation: ' + url);
    $('#f-ics').addEventListener('click', function () { $('#ics').click(); });
    $('#f-copy').addEventListener('click', function () { var b = this; copyText(url).then(function (ok) { if (ok) flash(b, 'Link copied'); }); });
    $('#totop').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

    var bar = $('#progress i'), busy = false;
    function prog() {
      var m = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (m > 0 ? Math.min(1, scrollY / m) : 0) + ')'; busy = false;
    }
    addEventListener('scroll', function () { if (!busy) { busy = true; requestAnimationFrame(prog); } }, { passive: true });
    prog();
  })();
})();
