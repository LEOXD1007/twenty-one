import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import puppeteer from 'puppeteer-core';

const chrome = process.env.CHROME || '/usr/bin/google-chrome';
const devPort = 47221;
const prodPort = 47223;

function serve(dir, port) {
  const child = spawn(process.execPath, ['scripts/serve.mjs', dir, String(port)], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  child.log = () => log;
  return child;
}

async function waitFor(port) {
  const url = 'http://127.0.0.1:' + port + '/';
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return url;
    } catch (e) {}
    await sleep(100);
  }
  throw new Error('server did not start on ' + port);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function hold(page) {
  await page.evaluate(async () => {
    const orb = document.getElementById('orb');
    const fire = (type) => orb.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 1, pointerType: 'touch', isPrimary: true,
      button: 0, buttons: type === 'pointerdown' ? 1 : 0
    }));
    fire('pointerdown');
    await new Promise((r) => setTimeout(r, 1100));
    fire('pointerup');
  });
}

async function fresh(browser, url, lang) {
  const page = await browser.newPage();
  page.setDefaultTimeout(8000);
  if (lang) {
    await page.evaluateOnNewDocument((l) => {
      Object.defineProperty(Navigator.prototype, 'language', { get() { return l; } });
      Object.defineProperty(Navigator.prototype, 'languages', { get() { return [l]; } });
    }, lang);
  }
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#vSetup.on');
  return page;
}

const dev = serve('web', devPort);
const prod = serve('www', prodPort);
let browser;
try {
  const devURL = await waitFor(devPort);
  const prodURL = await waitFor(prodPort);
  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--headless=new']
  });

  const en = await fresh(browser, devURL + 'index.html?debug=1', 'en-US');
  assert(await en.$('#dbgBtn'), 'debug button missing on the dev build');
  assert((await en.$eval('#startBtn', (el) => el.textContent)).trim() === 'Begin', 'English start label');
  assert((await en.$eval('#setupTag', (el) => el.textContent)).includes('Twenty-one days'), 'English setup tag');
  const pro = await en.evaluate(() => ({
    configured: window.A21Pro.configured,
    themes: window.A21Pro.featureUnlocked('themes'),
    features: window.A21ProConfig.features.slice()
  }));
  assert(pro.configured === false, 'Pro should be unconfigured');
  assert(pro.themes === true, 'empty feature list must leave themes free');
  assert(pro.features.length === 0, 'features config must start empty');

  await en.click('#startBtn');
  await en.waitForSelector('#vHome.on');

  const duringOpen = await en.evaluate(() => {
    window.__a21.jumpToDay(3);
    return window.__a21.previewReminders(true);
  });
  assert(duringOpen.length === 1 && duringOpen[0].kind === 'close' && duringOpen[0].day === 3, 'open window schedules only the closing nudge, got ' + JSON.stringify(duringOpen));
  const before = await en.evaluate(() => {
    window.__a21.beforeWindow();
    return window.__a21.previewReminders(true);
  });
  assert(before.some((n) => n.kind === 'open' && n.day === 3), 'upcoming window schedules the open reminder');
  assert(before.some((n) => n.kind === 'close' && n.day === 3), 'upcoming window schedules the closing nudge');
  assert(before.length === 2, 'only the next day is scheduled, got ' + JSON.stringify(before));

  await en.evaluate(() => window.__a21.openWindow());
  await en.waitForSelector('#orb.open');
  await hold(en);
  const afterHold = await en.evaluate(() => window.__a21.state().cycle.checkins.length);
  assert(afterHold === 3, 'hold-to-check-in should light day 3, got ' + afterHold);

  await en.evaluate(() => window.__a21.missWindow());
  await en.waitForSelector('#vBroken.on');
  assert((await en.$eval('#vBroken h2', (el) => el.textContent)).includes('sky went dark'), 'break copy');

  await en.click('#restartBtn');
  await en.waitForSelector('#vHome.on');
  await en.evaluate(() => window.__a21.jumpToDay(21));
  await en.waitForSelector('#orb.open');
  await hold(en);
  await en.waitForSelector('#finale.on', { timeout: 8000 });
  const card = await en.$eval('#finale', (el) => el.innerText);
  assert(card.includes('21 / 21'), 'finale card missing 21 / 21');
  assert(/complete/i.test(card), 'finale card missing completion line: ' + card);
  assert(await en.$('#shareBtn'), 'share button missing on the commemorative card');
  await en.click('#keepBtn');
  await en.waitForSelector('#vSetup.on');
  await en.click('#toHistory');
  await en.waitForSelector('#vHistory.on');
  const cards = await en.$$('#cards .ccard');
  assert(cards.length === 1, 'history should keep the finished constellation');
  const proNote = await en.$eval('#proNote', (el) => el.textContent);
  assert(/free/i.test(proNote), 'Pro row should say the current version is free: ' + proNote);
  await en.close();
  console.log('en: setup, check-in, break, day 21, history — ok');

  const zh = await fresh(browser, devURL + 'index.html?debug=1', 'zh-CN');
  assert((await zh.$eval('#startBtn', (el) => el.textContent)).trim() === '开始', 'Chinese start label');
  assert((await zh.$eval('html', (el) => el.lang)) === 'zh-Hans', 'html lang');
  await zh.click('#startBtn');
  await zh.evaluate(() => window.__a21.jumpToDay(21));
  await zh.waitForSelector('#orb.open');
  await zh.evaluate(() => window.__a21.checkIn());
  await zh.waitForSelector('#finale.on', { timeout: 8000 });
  const zhCard = await zh.$eval('#finale', (el) => el.innerText);
  assert(zhCard.includes('这片星空'), 'Chinese finale poem missing');
  assert((await zh.$eval('#shareBtn', (el) => el.textContent)).includes('分享'), 'Chinese share label');
  await zh.close();
  console.log('zh: day 21 finale — ok');

  const shipped = await fresh(browser, prodURL + 'index.html?debug=1', 'en-US');
  assert(await shipped.evaluate(() => window.__A21_PROD === true), 'production flag');
  assert(!(await shipped.$('#dbgBtn')), 'debug panel must be hidden in the production bundle');
  assert(await shipped.evaluate(() => window.__a21 === undefined), 'debug API must be absent in production');
  await shipped.click('#startBtn');
  await shipped.waitForSelector('#vHome.on');
  await shipped.close();
  console.log('production: debug hidden, setup still works — ok');

  console.log('smoke ok');
} catch (err) {
  console.error(err);
  console.error('dev log:', dev.log());
  console.error('prod log:', prod.log());
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  dev.kill();
  prod.kill();
  await sleep(200);
}
