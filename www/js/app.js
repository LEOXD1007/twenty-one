(function () {
'use strict';
var t = I18n.t;
var fmtD = I18n.fmtD, fmtMD = I18n.fmtMD, fmtHM = I18n.fmtHM, pad = I18n.pad;
var KEY = 'abstain21.v1', DAYS = 21, WIN = 3 * 3600 * 1000, HOLD_MS = 900;
var params = new URLSearchParams(location.search);
/* Production builds and the native shell never show the debug panel. */
var DEBUG = params.get('debug') === '1' && !window.__A21_PROD && !A21Native.isNative;
var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var offset = DEBUG ? (+sessionStorage.getItem('a21.off') || 0) : 0;
function now() { return Date.now() + offset; }

function def() { return { v: 1, time: '22:00', notify: false, cycle: null, history: [], attempts: 0, broken: null, lastDone: null }; }
function readLocal() {
  try {
    var raw = localStorage.getItem(KEY);
    if (!raw) return { state: def(), had: false };
    var s = JSON.parse(raw);
    if (s && s.v === 1) return { state: Object.assign(def(), s), had: true };
  } catch (e) {}
  return { state: def(), had: false };
}
var loaded = readLocal();
var S = loaded.state;

var $ = function (id) { return document.getElementById(id); };
function parseT(time) { var p = time.split(':'); return [+p[0], +p[1]]; }
function atTime(ms, time) { var d = new Date(ms), p = parseT(time); d.setHours(p[0], p[1], 0, 0); return d.getTime(); }
function addDays(ms, k) { var d = new Date(ms); d.setDate(d.getDate() + k); return d.getTime(); }
function endT(time) { var p = parseT(time), m = (p[0] * 60 + p[1] + WIN / 60000) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
function crosses(time) { var p = parseT(time); return p[0] * 60 + p[1] + WIN / 60000 >= 1440; }
function winText(time) { return time + ' – ' + (crosses(time) ? t('nextDay') : '') + endT(time); }
function dur(ms) { ms = Math.max(0, ms); var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return pad(h) + ':' + pad(m) + ':' + pad(s % 60); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function firstWindow(timeMs, time) {
  var today = atTime(timeMs, time), y = addDays(today, -1);
  if (timeMs >= y && timeMs < y + WIN) return y;
  if (timeMs < today + WIN) return today;
  return addDays(today, 1);
}
function status() {
  var c = S.cycle; if (!c) return null;
  var n = c.checkins.length, ws = addDays(c.start, n), we = ws + WIN, timeMs = now();
  return { n: n, ws: ws, we: we, kind: timeMs < ws ? 'wait' : timeMs < we ? 'open' : 'missed' };
}

/* Next check-in only. Later days are not scheduled: a missed window breaks the cycle. */
function computeReminders(force) {
  if ((!S.notify && !force) || !S.cycle) return [];
  var c = S.cycle, timeMs = now(), i = c.checkins.length, out = [];
  if (i >= DAYS) return [];
  var ws = addDays(c.start, i), we = ws + WIN;
  if (ws > timeMs + 15000) out.push({ id: 2100 + i, at: ws, kind: 'open', day: i + 1 });
  var closeAt = we - 30 * 60 * 1000;
  if (closeAt > timeMs + 15000) out.push({ id: 2200 + i, at: closeAt, kind: 'close', day: i + 1 });
  return out;
}
function buildReminderPayloads() {
  var items = computeReminders(false);
  items.channelName = t('channelName');
  return items.map(function (item) {
    item.title = t('notifTitle');
    item.body = item.kind === 'open' ? t('notifOpen', { day: item.day }) : t('notifClose', { day: item.day });
    return item;
  });
}
function persistNative() {
  if (!A21Native.isNative) return;
  A21Native.preferencesSet(KEY, JSON.stringify(S)).catch(function () {});
  var items = buildReminderPayloads();
  items.channelName = t('channelName');
  A21Native.syncReminders(items);
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast(t('saveFail')); }
  persistNative();
}

function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
function stars(c) {
  var r = rng(c.seed || 1), out = [];
  for (var i = 0; i < DAYS; i++) {
    var ra = r(), rb = r(), rc = r(), rd = r(), lit = i < c.checkins.length;
    var a = (-90 + i * 360 / DAYS + (ra - .5) * 9) * Math.PI / 180, rad = 0.93 + (rb - .5) * .06;
    if (lit) { var f = (c.checkins[i] - addDays(c.start, i)) / WIN; f = Math.min(1, Math.max(0, f)); rad = 0.8 + f * 0.3 + (rc - .5) * .04; }
    var R = 150 * rad; out.push({ x: 180 + Math.cos(a) * R, y: 180 + Math.sin(a) * R, lit: lit, sz: lit ? 2.4 + rd * 1.6 : 1.6 });
  }
  return out;
}
function consSVG(c, opt) {
  opt = opt || {}; var st = stars(c), lit = st.filter(function (s) { return s.lit; }), h = '';
  h += '<defs><filter id="glow' + (opt.id || '') + '" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  if (lit.length > 1) {
    var d = 'M' + lit.map(function (s) { return s.x.toFixed(1) + ' ' + s.y.toFixed(1); }).join('L');
    if (opt.close && lit.length === DAYS) d += 'Z';
    var len = opt.draw ? Math.ceil(pathLen(lit, opt.close)) : 0;
    h += '<path class="cline' + (opt.draw ? ' drawline' : '') + '" ' + (opt.draw && !opt.lineOp ? 'style="--len:' + len + '" ' : '') + 'd="' + d + '"' + (opt.lineOp ? ' style="' + (opt.draw ? '--len:' + len + ';' : '') + 'stroke-opacity:' + opt.lineOp + ';stroke-width:' + (opt.lineW || 1.3) + '"' : '') + '/>';
  }
  st.forEach(function (s, i) {
    var cls = s.lit ? 'on' : 'off';
    if (opt.dead && s.lit) cls = 'off';
    h += '<circle class="star ' + cls + (opt.ignite === i ? ' ignite' : '') + '" data-i="' + i + '" cx="' + s.x.toFixed(1) + '" cy="' + s.y.toFixed(1) + '" r="' + (opt.dead && s.lit ? 2.4 : s.sz) + '"' + (s.lit && !opt.dead ? ' filter="url(#glow' + (opt.id || '') + ')"' : '') + (opt.dead && s.lit ? ' style="opacity:.85;fill:#9a978b"' : '') + '/>';
    if (opt.next === i) h += '<circle class="star next" cx="' + s.x.toFixed(1) + '" cy="' + s.y.toFixed(1) + '" r="6"/>';
    if (opt.missed === i) h += '<circle cx="' + s.x.toFixed(1) + '" cy="' + s.y.toFixed(1) + '" r="7" fill="none" stroke="#b5654f" stroke-width="1" stroke-dasharray="2 3"/>';
  });
  return h;
}
function pathLen(p, close) { var L = 0; for (var i = 1; i < p.length; i++) L += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); if (close) L += Math.hypot(p[0].x - p[p.length - 1].x, p[0].y - p[p.length - 1].y); return L; }

var view = '';
function show(v) {
  if (view === v) return; view = v;
  ['vSetup', 'vHome', 'vBroken'].forEach(function (id) { $(id).classList.toggle('on', id === v); });
}
function render() {
  if (S.cycle) {
    var st = status();
    if (st.kind === 'missed') { breakCycle('missed', st); return; }
    show('vHome'); renderHome(st);
  } else if (S.broken) { show('vBroken'); renderBroken(); }
  else { show('vSetup'); renderSetup(); }
}
function renderSetup() {
  var first = !S.history.length && !S.attempts;
  $('timeIn').value = S.time;
  $('setupTag').textContent = first ? t('setupTagFirst') : t('setupTagNext');
  $('setupRules').innerHTML = first ? t('setupRulesFirst') : t('setupRulesNext');
  $('startBtn').textContent = first ? t('start') : t('startN', { n: S.attempts + 1 });
  updWnote();
}
function updWnote() {
  var time = $('timeIn').value || '22:00', fw = firstWindow(now(), time), open = now() >= fw;
  $('wnote').textContent = t('windowNote', { range: winText(time) }) + (open ? '\n' + t('windowNow') : '');
  $('wnote').style.whiteSpace = 'pre-line';
}
var lastKind = '', lastN = -1;
function renderHome(st) {
  var c = S.cycle;
  var night = parseT(c.time)[0] >= 17;
  $('attemptK').textContent = night ? t('attemptNight', { n: c.attempt, time: c.time }) : t('attemptDay', { n: c.attempt, time: c.time });
  $('litV').innerHTML = t('lit', { n: st.n });
  if (lastN !== st.n || lastKind !== st.kind) {
    $('cons').innerHTML = consSVG(c, { next: st.kind === 'open' ? st.n : -1, ignite: igniteIdx });
    igniteIdx = -1;
  }
  var orbEl = $('orb');
  orbEl.classList.toggle('open', st.kind === 'open');
  if (st.kind === 'open') {
    if (!counting) $('orbD').textContent = st.n + 1;
    $('orbD').className = 'd num'; $('orbH').textContent = t('hold');
    $('stA').textContent = t('statusOpen', { n: st.n + 1 });
    $('stB').textContent = t('statusLeft', { time: dur(st.we - now()) });
  } else if (performance.now() < afterglow && st.n > 0) {
    if (!counting) { $('orbD').className = 'd num'; $('orbD').textContent = st.n; }
    $('orbH').textContent = t('litWord');
    $('stA').textContent = t('statusLit', { n: st.n });
    $('stB').textContent = st.n < DAYS ? t('tomorrow', { time: c.time, n: st.n + 1 }) : '';
  } else {
    $('orbD').className = 'cd num'; $('orbD').textContent = dur(st.ws - now());
    $('orbH').textContent = t('untilOpen');
    var doneToday = st.n > 0 && now() - c.checkins[st.n - 1] < 20 * 3600 * 1000;
    $('stA').textContent = st.n === 0
      ? t('statusFirst', { when: sameDay(st.ws, now()) ? t('today') : fmtMD(st.ws), time: c.time })
      : (doneToday ? t('litToday') : t('waiting', { n: st.n + 1 })) + ' · ' + t('statusNext', { n: st.n + 1, time: fmtHM(st.ws) });
    $('stB').textContent = t('windowFixed', { range: winText(c.time) });
  }
  if (lastKind === 'wait' && st.kind === 'open' && lastN === st.n) remind(st);
  lastKind = st.kind; lastN = st.n;
}
function sameDay(a, b) { return new Date(a).toDateString() === new Date(b).toDateString(); }
function renderBroken() {
  var b = S.history.find(function (h) { return h.id === S.broken; }); if (!b) { S.broken = null; save(); render(); return; }
  $('brokenSvg').innerHTML = consSVG(b, { dead: true, missed: b.reason === 'missed' ? b.days : -1, id: 'b', lineOp: .18, lineW: 1 });
  $('brokenP').innerHTML = b.reason === 'missed'
    ? t('brokenMissed', { day: b.days + 1, date: fmtMD(addDays(b.start, b.days)), range: winText(b.time), days: b.days })
    : t('brokenManual', { days: b.days });
}

function startCycle(time) {
  S.time = time || S.time; S.attempts = (S.attempts || 0) + 1; S.broken = null;
  S.cycle = { id: uid(), attempt: S.attempts, start: firstWindow(now(), S.time), time: S.time, checkins: [], seed: (Math.random() * 4294967295) >>> 0 };
  save(); lastKind = ''; lastN = -1; render();
  if (S.notify && !A21Native.isNative) ensurePerm();
}
function breakCycle(reason, st) {
  var c = S.cycle; if (!c) return;
  var rec = { id: c.id, type: 'broken', attempt: c.attempt, start: c.start, time: c.time, checkins: c.checkins.slice(), seed: c.seed, days: c.checkins.length, reason: reason, at: reason === 'missed' ? st.we : now() };
  S.history.push(rec); S.cycle = null; S.broken = rec.id; save();
  buzz([40, 80, 40], 'break'); render();
}
var igniteIdx = -1, afterglow = 0, hold = false;
function checkIn() {
  var st = status(); if (!st || st.kind !== 'open') return;
  var c = S.cycle, day = st.n + 1;
  c.checkins.push(now());
  igniteIdx = st.n; lastN = -1; afterglow = performance.now() + 4500;
  if (day === DAYS) {
    var rec = { id: c.id, type: 'complete', attempt: c.attempt, num: S.history.filter(function (h) { return h.type === 'complete'; }).length + 1, start: c.start, end: now(), time: c.time, checkins: c.checkins.slice(), seed: c.seed, days: DAYS };
    S.history.push(rec); S.lastDone = rec.id;
    save();
    hold = true;
    renderHome(status());
    $('orbH').textContent = t('completeWord');
    $('stA').textContent = I18n.lang === 'zh' ? '第 21 天 · 圆满' : 'Day 21 · complete';
    $('stB').textContent = '';
    S.cycle = null; save();
    play(5, rec);
  } else { save(); render(); play(tierOf(day), null, day); }
}
function tierOf(d) { return d >= 21 ? 5 : d >= 16 ? 4 : d >= 11 ? 3 : d >= 6 ? 2 : 1; }

var holdT = 0, holdRAF = 0, holding = false;
var orb = $('orb'), ring = $('holdRing');
function holdStart(e) {
  var st = status(); if (!st) return;
  if (st.kind !== 'open') { orb.classList.remove('p1'); void orb.offsetWidth; toast(t('tooEarly')); buzz(8, 'reject'); return; }
  if (e && e.preventDefault) e.preventDefault();
  holding = true; holdT = performance.now(); orb.classList.add('holding'); ring.setAttribute('opacity', '1'); buzz(6, 'hold');
  var ticks = 0;
  (function step() {
    if (!holding) return;
    var p = Math.min(1, (performance.now() - holdT) / HOLD_MS);
    ring.setAttribute('stroke-dashoffset', (301.6 * (1 - p)).toFixed(1));
    var tk = Math.floor(p * 4); if (tk > ticks) { ticks = tk; buzz(4, 'tick'); }
    if (p >= 1) { holdEnd(true); return; }
    holdRAF = requestAnimationFrame(step);
  })();
}
function holdEnd(done) {
  if (!holding) return; holding = false; cancelAnimationFrame(holdRAF);
  orb.classList.remove('holding'); ring.setAttribute('opacity', '0'); ring.setAttribute('stroke-dashoffset', '301.6');
  if (A21Native.isNative) A21Native.haptic('hold-end');
  if (done === true) checkIn();
}
orb.addEventListener('pointerdown', holdStart);
['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { orb.addEventListener(ev, function () { holdEnd(false); }); });
orb.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !holding && !e.repeat) holdStart(e); });
orb.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') holdEnd(false); });
orb.addEventListener('contextmenu', function (e) { e.preventDefault(); });

var fx = $('fx'), g = fx.getContext('2d'), DPR = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0, P = [], rockets = [], fxOn = false, sprites = {};
function size() { W = innerWidth; H = innerHeight; [fx, $('dust')].forEach(function (c) { c.width = W * DPR; c.height = H * DPR; }); g.setTransform(DPR, 0, 0, DPR, 0, 0); drawDust(); }
addEventListener('resize', size);
function sprite(col) {
  if (sprites[col]) return sprites[col];
  var c = document.createElement('canvas'), s = 64; c.width = c.height = s; var x = c.getContext('2d'), gr = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.18, col); gr.addColorStop(.45, col.replace(/[\d.]+\)$/, '0.25)')); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 0, s, s); return sprites[col] = c;
}
var COLS = ['rgba(246,220,166,1)', 'rgba(233,194,123,1)', 'rgba(255,244,222,1)', 'rgba(214,160,86,1)'];
function burst(x, y, n, o) {
  o = o || {};
  for (var i = 0; i < n; i++) {
    var a = Math.random() * Math.PI * 2, sp = (o.speed || 4) * (0.25 + Math.random() * 0.9);
    P.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.lift || 0), life: 0, max: (o.life || 60) * (0.6 + Math.random() * 0.7),
      s: (o.size || 6) * (0.5 + Math.random()), col: COLS[(Math.random() * COLS.length) | 0], drag: o.drag || 0.965, gr: o.gravity || 0.03, tw: Math.random() < (o.twinkle || 0) });
  }
  run();
}
function rocket() {
  var x = W * (0.15 + Math.random() * 0.7);
  rockets.push({ x: x, y: H + 10, vx: (Math.random() - .5) * 1.2, vy: -(9 + Math.random() * 4), ty: H * (0.15 + Math.random() * 0.35) }); run();
}
function run() { if (!fxOn) { fxOn = true; requestAnimationFrame(loop); } }
function loop() {
  g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
  for (var r = rockets.length - 1; r >= 0; r--) {
    var k = rockets[r]; k.x += k.vx; k.y += k.vy; k.vy += 0.12;
    g.globalAlpha = 1; g.drawImage(sprite(COLS[2]), k.x - 6, k.y - 6, 12, 12);
    if (Math.random() < .7) P.push({ x: k.x, y: k.y, vx: (Math.random() - .5) * .6, vy: 1, life: 0, max: 22, s: 4, col: COLS[1], drag: .95, gr: 0 });
    if (k.vy >= -1.5 || k.y <= k.ty) { rockets.splice(r, 1); burst(k.x, k.y, 90 + (Math.random() * 60 | 0), { speed: 5.5, life: 80, size: 7, gravity: .05, drag: .97, twinkle: .3 }); }
  }
  for (var i = P.length - 1; i >= 0; i--) {
    var p = P[i]; p.life++; if (p.life >= p.max) { P[i] = P[P.length - 1]; P.pop(); continue; }
    p.vx *= p.drag; p.vy = p.vy * p.drag + p.gr; p.x += p.vx; p.y += p.vy;
    var u = 1 - p.life / p.max, a = u * u; if (p.tw) a *= 0.5 + 0.5 * Math.sin(p.life * 0.9);
    g.globalAlpha = a; var s = p.s * (0.6 + u * 0.6); g.drawImage(sprite(p.col), p.x - s, p.y - s, s * 2, s * 2);
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  if (P.length || rockets.length) requestAnimationFrame(loop); else { fxOn = false; g.clearRect(0, 0, W, H); }
}
function drawDust() {
  var c = $('dust'), x = c.getContext('2d'), r = rng(7); x.setTransform(DPR, 0, 0, DPR, 0, 0); x.clearRect(0, 0, W, H);
  for (var i = 0; i < 70; i++) { x.fillStyle = 'rgba(236,231,220,' + (0.08 + r() * 0.25) + ')'; x.beginPath(); x.arc(r() * W, r() * H, r() * 0.9 + 0.2, 0, 7); x.fill(); }
}

function orbCenter() { var b = orb.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width }; }
function buzz(p, hint) {
  if (hint && A21Native.haptic(hint)) return;
  try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {}
}
function shake(amp, durMs) {
  if (REDUCED) return; var a = $('app'); a.style.setProperty('--amp', amp + 'px'); a.style.setProperty('--sd', durMs + 's');
  a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); setTimeout(function () { a.classList.remove('shake'); }, durMs * 1000 + 50);
}
function ripple(n, scale, gap) {
  if (REDUCED) return;
  for (var i = 0; i < n; i++) (function (i) { setTimeout(function () { var d = document.createElement('div'); d.className = 'ripple'; d.style.setProperty('--s', scale + i * 0.5); $('sky').appendChild(d); setTimeout(function () { d.remove(); }, 1700); }, i * gap); })(i);
}
function flood(peak, ms) {
  if (REDUCED) return; var f = $('flood'), c = orbCenter(); f.style.setProperty('--fx', c.x + 'px'); f.style.setProperty('--fy', c.y + 'px');
  f.animate([{ opacity: 0 }, { opacity: peak, offset: .18 }, { opacity: 0 }], { duration: ms, easing: 'ease-out' });
}
var counting = false;
function countUp(to, ms) {
  var el = $('orbD'); el.className = 'd num'; counting = true; var t0 = performance.now();
  (function s() { var p = Math.min(1, (performance.now() - t0) / ms), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e); el.style.transform = 'scale(' + (1 + 0.25 * Math.sin(p * Math.PI)) + ')';
    if (p < 1) requestAnimationFrame(s); else { el.style.transform = ''; counting = false; } })();
}
function pulseOrb() { orb.classList.remove('p1'); void orb.offsetWidth; orb.classList.add('p1'); setTimeout(function () { orb.classList.remove('p1'); }, 950); }
function flashStars() {
  if (REDUCED) return;
  var lit = [].slice.call($('cons').querySelectorAll('.star.on'));
  lit.forEach(function (s, i) { setTimeout(function () { s.animate([{ transform: 'scale(1)' }, { transform: 'scale(2.4)' }, { transform: 'scale(1)' }], { duration: 500, easing: 'ease-out' }); s.style.transformBox = 'fill-box'; s.style.transformOrigin = 'center'; }, i * 45); });
}

function play(tier, rec, day) {
  var c = orbCenter(), k = day ? 1 + ((day - 1) % 5) * 0.12 : 1;
  var nativeTier = A21Native.hapticTier(tier);
  pulseOrb();
  if (REDUCED) { if (!nativeTier) buzz(20); if (tier === 5) setTimeout(function () { finale(rec); }, 400); return; }
  if (tier === 1) { burst(c.x, c.y, Math.round(14 * k), { speed: 1.6, life: 70, size: 5, gravity: -0.01, drag: .98 }); if (!nativeTier) buzz(15); }
  if (tier === 2) { ripple(2, 2.2, 220); burst(c.x, c.y, Math.round(50 * k), { speed: 3.2, life: 80, size: 6, gravity: 0, drag: .97, twinkle: .3 }); if (!nativeTier) buzz([15, 40, 15]); }
  if (tier === 3) { ripple(3, 2.8, 140); shake(6 * k, .45); burst(c.x, c.y, Math.round(140 * k), { speed: 7, life: 70, size: 6, gravity: .02, drag: .95 }); if (!nativeTier) buzz([25, 30, 25, 30, 60]); }
  if (tier >= 4) {
    ripple(4, 3.4, 110); shake(tier === 5 ? 16 : 11 * k, .65); flood(tier === 5 ? .95 : .7 * k, tier === 5 ? 2200 : 1500); countUp(day || 21, 900); flashStars();
    burst(c.x, c.y, Math.round(220 * k), { speed: 10, life: 80, size: 7, gravity: .04, drag: .955 });
    setTimeout(function () { burst(c.x, c.y, Math.round(140 * k), { speed: 5, life: 110, size: 5, gravity: .01, drag: .975, twinkle: .5 }); }, 180);
    if (!nativeTier && tier < 5) buzz([30, 40, 30, 40, 30, 40, 120]);
  }
  if (tier === 5) {
    var n = 0, iv = setInterval(function () { rocket(); if (Math.random() < .5) rocket(); if (++n >= 14) clearInterval(iv); }, 320);
    if (!nativeTier) buzz([60, 60, 60, 60, 200, 100, 400]);
    setTimeout(function () { finale(rec); }, 2800);
  }
}

function cardHTML(rec, draw) {
  return '<div class="card"><div class="k">' + t('cardK', { num: rec.num }) + '</div>'
    + '<svg viewBox="0 0 360 360">' + consSVG(rec, { close: true, draw: draw, id: 'f' + rec.id, lineOp: .6, lineW: 1.6 }) + '</svg>'
    + '<div class="big num">21<small> / 21</small></div>'
    + '<div class="dates num">' + fmtD(rec.start) + ' — ' + fmtD(rec.end) + '</div>'
    + '<div class="tm num">' + t('cardMeta', { n: rec.attempt, time: rec.time }) + '</div>'
    + '<div class="poem">' + t('cardPoem') + '</div>'
    + '<button class="primary" id="keepBtn">' + (draw ? t('cardKeep') : t('cardClose')) + '</button>'
    + '<button class="secondary" id="shareBtn">' + t('cardShare') + '</button></div>';
}
function finale(rec, replay) {
  var f = $('finale'); f.innerHTML = cardHTML(rec, !replay); f.classList.add('on');
  $('keepBtn').onclick = function () { f.classList.remove('on'); f.innerHTML = ''; if (!replay) { hold = false; S.lastDone = null; save(); lastKind = ''; render(); } };
  $('shareBtn').onclick = function () { shareCard(rec); };
}
function cardCanvas(rec) {
  var CW = 1080, CH = 1440, c = document.createElement('canvas');
  c.width = CW; c.height = CH;
  var ctx = c.getContext('2d');
  var grd = ctx.createLinearGradient(0, 0, 0, CH);
  grd.addColorStop(0, '#1c1912'); grd.addColorStop(.55, '#0d0d12'); grd.addColorStop(1, '#0a0a0e');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, CW, CH);
  ctx.strokeStyle = 'rgba(233,194,123,.45)'; ctx.lineWidth = 3; ctx.strokeRect(36, 36, CW - 72, CH - 72);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e9c27b'; ctx.font = '500 30px "Iowan Old Style", Palatino, Georgia, serif';
  ctx.fillText(t('cardK', { num: rec.num }), CW / 2, 150);
  var st = stars(rec), cx = CW / 2, cy = 560, scale = 1.7;
  var lit = st.filter(function (s) { return s.lit; });
  ctx.beginPath(); ctx.strokeStyle = 'rgba(233,194,123,.6)'; ctx.lineWidth = 2.4;
  lit.forEach(function (s, i) {
    var x = cx + (s.x - 180) * scale, y = cy + (s.y - 180) * scale;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  if (lit.length === DAYS && lit.length) ctx.lineTo(cx + (lit[0].x - 180) * scale, cy + (lit[0].y - 180) * scale);
  ctx.stroke();
  st.forEach(function (s) {
    var x = cx + (s.x - 180) * scale, y = cy + (s.y - 180) * scale;
    ctx.beginPath(); ctx.fillStyle = s.lit ? '#f6dca6' : 'rgba(138,135,124,.45)';
    ctx.arc(x, y, s.lit ? 8 : 4.5, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = '#f6dca6'; ctx.font = '300 108px "Iowan Old Style", Palatino, Georgia, serif';
  ctx.fillText('21 / 21', CW / 2, 980);
  ctx.fillStyle = '#ece7dc'; ctx.font = '400 34px -apple-system, "PingFang SC", sans-serif';
  ctx.fillText(fmtD(rec.start) + '  —  ' + fmtD(rec.end), CW / 2, 1060);
  ctx.fillStyle = '#8a8778'; ctx.font = '400 28px -apple-system, "PingFang SC", sans-serif';
  ctx.fillText(t('cardMeta', { n: rec.attempt, time: rec.time }), CW / 2, 1120);
  ctx.fillStyle = 'rgba(236,231,220,.88)'; ctx.font = '400 32px "Songti SC", "Iowan Old Style", Palatino, Georgia, serif';
  t('cardPoemPlain').split('\n').forEach(function (line, i) { ctx.fillText(line, CW / 2, 1220 + i * 52); });
  ctx.fillStyle = '#5d5b55'; ctx.font = '400 24px -apple-system, sans-serif';
  ctx.fillText(t('cardFoot'), CW / 2, 1360);
  return c;
}
function downloadBlob(blob, name) {
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function shareCard(rec) {
  var canvas = cardCanvas(rec);
  canvas.toBlob(function (blob) {
    if (!blob) { toast(t('shareFail')); return; }
    var file = new File([blob], 'twenty-one.png', { type: 'image/png' });
    var title = t('shareTitle'), text = t('shareText');
    if (!A21Native.isNative && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: title, text: text }).catch(function () {});
      return;
    }
    if (A21Native.isNative) {
      var reader = new FileReader();
      reader.onload = function () {
        var b64 = String(reader.result).split(',')[1];
        A21Native.shareImage({ base64: b64, filename: 'twenty-one.png', title: title, text: text }).catch(function () { toast(t('shareFail')); });
      };
      reader.readAsDataURL(blob);
      return;
    }
    downloadBlob(blob, (I18n.lang === 'zh' ? '廿一' : 'twenty-one') + '.png');
    toast(t('shareSaved'));
  }, 'image/png');
}

function proApi() {
  return window.A21Pro || {
    configured: false, owned: false, price: '', ready: true,
    featureUnlocked: function () { return true; },
    purchase: function () { return Promise.resolve({ ok: false, reason: 'unconfigured' }); },
    restore: function () { return Promise.resolve({ ok: false, reason: 'unconfigured' }); }
  };
}
function renderPro() {
  var pro = proApi();
  $('proTitle').textContent = t('proTitle');
  var note = $('proNote'), actions = $('proActions');
  actions.innerHTML = '';
  if (!pro.configured) { note.textContent = t('proFree'); return; }
  if (pro.owned) { note.textContent = t('proOwned'); return; }
  if (!A21Native.isNative) { note.textContent = t('proWeb'); return; }
  note.textContent = pro.price ? t('proPrice', { price: pro.price }) : t('proReady');
  var buy = document.createElement('button'); buy.className = 'linkbtn'; buy.textContent = t('proUnlock');
  buy.onclick = function () {
    pro.purchase().then(function (r) {
      if (r && r.ok) toast(t('proThanks'));
      else if (!r || r.reason !== 'cancelled') toast(t('proFail'));
      renderPro();
    });
  };
  var restore = document.createElement('button'); restore.className = 'linkbtn'; restore.textContent = t('proRestore');
  restore.onclick = function () {
    pro.restore().then(function (r) {
      toast(r && r.owned ? t('proRestored') : t('proNone'));
      renderPro();
    });
  };
  actions.appendChild(buy);
  actions.appendChild(document.createTextNode('\u3000'));
  actions.appendChild(restore);
}
function renderHistory() {
  var done = S.history.filter(function (h) { return h.type === 'complete'; }), br = S.history.filter(function (h) { return h.type === 'broken'; });
  var cur = S.cycle ? S.cycle.checkins.length : 0;
  var longest = Math.max.apply(null, [cur].concat(S.history.map(function (h) { return h.days; })));
  var total = cur + S.history.reduce(function (sum, h) { return sum + h.days; }, 0);
  $('stats').innerHTML = '<div><b>' + done.length + '</b><span>' + t('statDone') + '</span></div><div><b>' + longest + '</b><span>' + t('statLong') + '</span></div><div><b>' + total + '</b><span>' + t('statTotal') + '</span></div>';
  $('cards').innerHTML = done.length ? '<div class="cards">' + done.slice().reverse().map(function (r) {
    return '<button class="ccard" data-id="' + r.id + '"><svg viewBox="0 0 360 360">' + consSVG(r, { close: true, id: 'c' + r.id, lineOp: .5, lineW: 2 }) + '</svg><div class="t">№ ' + r.num + '</div><div class="s num">' + fmtD(r.start).slice(5) + ' — ' + fmtD(r.end).slice(5) + ' · ' + r.time + '</div></button>';
  }).join('') + '</div>' : '<div class="empty">' + t('emptyCards') + '</div>';
  $('blist').innerHTML = br.length ? br.slice().reverse().map(function (r) {
    return '<div><span>' + t('breakLine', { n: r.attempt, date: fmtMD(r.start) }) + '</span><span>' + (r.reason === 'manual' ? t('breakDaysManual', { days: r.days }) : t('breakDaysMissed', { days: r.days })) + '</span></div>';
  }).join('') : '<div><span>' + t('none') + '</span><span></span></div>';
  [].forEach.call($('cards').querySelectorAll('.ccard'), function (b) { b.onclick = function () { var r = S.history.find(function (h) { return h.id === b.dataset.id; }); if (r) finale(r, true); }; });
  $('notifySw').classList.toggle('on', !!S.notify);
  $('notifyNote').textContent = A21Native.isNative ? t('notifyNoteNative') : t('notifyNoteWeb');
  $('timeNote').textContent = S.cycle
    ? t('timeNoteCycle', { time: S.cycle.time, range: winText(S.cycle.time) })
    : t('timeNoteFree', { time: S.time });
  renderPro();
}
$('toHistory').onclick = function () { renderHistory(); $('vHistory').classList.add('on'); $('vHistory').setAttribute('aria-hidden', 'false'); };
$('closeHistory').onclick = function () { $('vHistory').classList.remove('on'); $('vHistory').setAttribute('aria-hidden', 'true'); };
window.addEventListener('a21-pro', function () { if ($('vHistory').classList.contains('on')) renderPro(); });

$('exportBtn').onclick = function () {
  var blob = new Blob([JSON.stringify({ app: '廿一', appId: 'abstain21', exported: new Date().toISOString(), data: S }, null, 2)], { type: 'application/json' });
  var name = (I18n.lang === 'zh' ? '廿一-备份-' : 'twenty-one-backup-') + fmtD(Date.now()).replace(/\./g, '-') + '.json';
  downloadBlob(blob, name);
  toast(t('exported'));
};
var pendingImport = null;
$('importBtn').onclick = function () { $('importIn').value = ''; $('importIn').click(); };
$('importIn').onchange = function () {
  var f = this.files[0]; if (!f) return; var rd = new FileReader();
  rd.onload = function () {
    try {
      var j = JSON.parse(rd.result), d = j.data || j;
      if (d.v !== 1 || !Array.isArray(d.history)) throw 0;
      pendingImport = d;
      var done = d.history.filter(function (h) { return h.type === 'complete'; }).length;
      var broken = d.history.filter(function (h) { return h.type === 'broken'; }).length;
      $('importP').innerHTML = t('importBody', { done: done, broken: broken, extra: d.cycle ? t('importExtra') : '' });
      $('importDlg').classList.add('on');
    } catch (e) { toast(t('badBackup')); }
  };
  rd.readAsText(f);
};
$('importYes').onclick = function () { if (pendingImport) { S = Object.assign(def(), pendingImport); save(); pendingImport = null; lastKind = ''; view = ''; render(); renderHistory(); toast(t('imported')); } $('importDlg').classList.remove('on'); };
$('importNo').onclick = function () { pendingImport = null; $('importDlg').classList.remove('on'); };

function ensurePerm() {
  if (!('Notification' in window)) { toast(t('notifyUnsupported')); return Promise.resolve(false); }
  if (Notification.permission === 'granted') return Promise.resolve(true);
  return Notification.requestPermission().then(function (p) { return p === 'granted'; });
}
$('notifySw').onclick = function () {
  if (S.notify) { S.notify = false; save(); renderHistory(); return; }
  var req = A21Native.isNative ? A21Native.requestNotifyPermission() : ensurePerm();
  req.then(function (ok) {
    S.notify = !!ok; save(); renderHistory();
    toast(ok ? (A21Native.isNative ? t('notifyOnNative') : t('notifyOnWeb')) : t('notifyDenied'));
  });
};
function remind(st) {
  if (A21Native.isNative) { A21Native.haptic('remind'); return; }
  buzz([20, 60, 20]);
  if (!S.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  var body = t('notifOpen', { day: st.n + 1 });
  if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(function (r) { r.showNotification(t('notifTitle'), { body: body, tag: 'a21-' + st.ws, icon: 'icon-512.png' }); });
  else try { new Notification(t('notifTitle'), { body: body, tag: 'a21-' + st.ws, icon: 'icon-512.png' }); } catch (e) {}
}

var tt; function toast(m) { var el = $('toast'); el.textContent = m; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('on'); }, 2200); }
$('timeIn').addEventListener('input', updWnote);
$('startBtn').onclick = function () { var time = $('timeIn').value || '22:00'; buzz(10, 'tap'); startCycle(time); };
$('breakBtn').onclick = function () {
  var n = S.cycle ? S.cycle.checkins.length : 0;
  $('confirmP').innerHTML = t('confirmBody', { n: n });
  $('confirm').classList.add('on');
};
$('confirmNo').onclick = function () { $('confirm').classList.remove('on'); };
$('confirmYes').onclick = function () { $('confirm').classList.remove('on'); breakCycle('manual'); };
$('restartBtn').onclick = function () { buzz(10, 'tap'); startCycle(S.time); };
$('retimeBtn').onclick = function () { S.broken = null; save(); render(); };
document.addEventListener('visibilitychange', function () {
  if (document.hidden) return;
  tick();
  if (A21Native.isNative) {
    var items = buildReminderPayloads();
    items.channelName = t('channelName');
    A21Native.syncReminders(items);
  }
});
function tick() { if (S.cycle && !hold) render(); }
setInterval(tick, 1000);

if (DEBUG) {
  var setOff = function (o) { offset = o; sessionStorage.setItem('a21.off', o); lastKind = ''; lastN = -1; render(); dbgClock(); };
  var D = {
    jumpToDay: function (n) {
      n = Math.max(1, Math.min(21, n | 0)); var time = S.time || '22:00', today = atTime(Date.now(), time);
      offset = today + 60000 - Date.now(); var start = addDays(today, -(n - 1)), ck = [];
      for (var k = 0; k < n - 1; k++) ck.push(addDays(start, k) + Math.floor(Math.random() * WIN * 0.9));
      if (!S.cycle) S.attempts = (S.attempts || 0) + 1;
      S.cycle = { id: uid(), attempt: S.attempts || 1, start: start, time: time, checkins: ck, seed: (Math.random() * 4294967295) >>> 0 };
      S.broken = null; save(); setOff(offset);
    },
    openWindow: function () { var st = status(); if (st) setOff(st.ws + 60000 - Date.now()); },
    beforeWindow: function () { var st = status(); if (st) setOff(st.ws - 3723000 - Date.now()); },
    missWindow: function () { var st = status(); if (st) setOff(st.we + 1000 - Date.now()); },
    plusHour: function () { setOff(offset + 3600000); },
    realTime: function () { setOff(0); },
    checkIn: function () { checkIn(); },
    tier: function (n) { var d = [3, 8, 13, 18, 21][n - 1]; if (n === 5) { finaleDemo(); } else play(n, null, d); },
    wipe: function () {
      localStorage.removeItem(KEY); sessionStorage.removeItem('a21.off');
      var done = function () { location.reload(); };
      if (A21Native.isNative) A21Native.preferencesRemove(KEY).then(done, done);
      else done();
    },
    previewReminders: function (force) { return computeReminders(!!force); },
    state: function () { return JSON.parse(JSON.stringify(S)); },
    status: status, now: now
  };
  function finaleDemo() {
    var c = S.cycle || { start: addDays(atTime(now(), S.time), -20), time: S.time, seed: 12345, checkins: [] };
    var ck = []; for (var k = 0; k < 21; k++) ck.push(addDays(c.start, k) + Math.floor(Math.random() * WIN * 0.9));
    play(5, { id: 'demo', num: I18n.lang === 'zh' ? '示例' : 'demo', attempt: c.attempt || 1, start: c.start, end: ck[20], time: c.time, checkins: ck, seed: c.seed, days: 21 }, 21);
  }
  window.__a21 = D;
  var b = document.createElement('button'); b.id = 'dbgBtn'; b.textContent = 'DEBUG'; document.body.appendChild(b);
  var p = document.createElement('div'); p.id = 'dbg'; document.body.appendChild(p);
  p.innerHTML = '<div id="dbgClk"></div>'
    + '<div class="r">跳到第 <input id="dbgDay" type="number" min="1" max="21" value="21"> 天 <button data-a="jump">跳转（窗口开）</button></div>'
    + '<div class="r"><button data-a="open">打开窗口</button><button data-a="before">窗口前 1h</button><button data-a="miss">错过窗口</button><button data-a="hour">+1 小时</button><button data-a="real">真实时间</button></div>'
    + '<div class="r">动效 <button data-t="1">T1</button><button data-t="2">T2</button><button data-t="3">T3</button><button data-t="4">T4</button><button data-t="5">T5 终章</button><button data-a="ci">直接打卡</button></div>'
    + '<div class="r"><button data-a="wipe">清空数据</button></div>';
  b.onclick = function () { p.classList.toggle('on'); dbgClock(); };
  p.onclick = function (e) {
    var a = e.target.dataset.a, tier = e.target.dataset.t;
    if (tier) D.tier(+tier);
    if (a === 'jump') D.jumpToDay(+$('dbgDay').value); if (a === 'open') D.openWindow(); if (a === 'before') D.beforeWindow();
    if (a === 'miss') D.missWindow(); if (a === 'hour') D.plusHour(); if (a === 'real') D.realTime(); if (a === 'ci') D.checkIn(); if (a === 'wipe') D.wipe();
  };
  var dbgClock = function () { var e = $('dbgClk'); if (e) e.textContent = '模拟时间 ' + fmtD(now()) + ' ' + fmtHM(now()) + ':' + pad(new Date(now()).getSeconds()) + '  偏移 ' + Math.round(offset / 60000) + ' 分'; };
  setInterval(dbgClock, 1000);
}

function boot(state) {
  S = state;
  I18n.apply(document);
  $('app').classList.remove('booting');
  size(); render();
  if (A21Native.isNative) {
    var items = buildReminderPayloads();
    items.channelName = t('channelName');
    A21Native.syncReminders(items);
  }
  if (!A21Native.isNative && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    var host = location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }
  }
}

if (A21Native.isNative) {
  $('app').classList.add('booting');
  A21Native.preferencesGet(KEY).then(function (res) {
    if (res && res.value) {
      try {
        var parsed = JSON.parse(res.value);
        if (parsed && parsed.v === 1) {
          try { localStorage.setItem(KEY, res.value); } catch (e) {}
          boot(Object.assign(def(), parsed));
          return;
        }
      } catch (e) {}
    }
    if (loaded.had) A21Native.preferencesSet(KEY, JSON.stringify(S)).catch(function () {});
    boot(S);
  }, function () { boot(S); });
} else {
  I18n.apply(document);
  size(); render();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    var host = location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }
  }
}
})();
