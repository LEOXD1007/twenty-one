/* English is the base. zh-Hans (and any zh*) uses the original copy. */
(function () {
  var STR = {
    en: {
      appTitle: 'Twenty-One',
      historyTitle: 'Star map',
      ariaHistory: 'Star map',
      ariaClose: 'Close',
      ariaHold: 'Press and hold to check in',
      ariaNotify: 'Window reminder',
      setupTagFirst: 'Twenty-one days. Twenty-one stars.',
      setupTagNext: 'The next sky',
      setupRulesFirst: 'Come back at the same time each day and light one star.<br>Miss once, and the sky goes dark. You start again.',
      setupRulesNext: 'You can change the check-in time between cycles.<br>Once a cycle starts, the time is fixed.',
      timeLabel: 'Daily check-in time',
      windowNote: 'Daily window {range} · 3 hours',
      windowNow: 'You can light the first star now',
      start: 'Begin',
      startN: 'Begin attempt {n}',
      attemptNight: 'Attempt {n} · nights at {time}',
      attemptDay: 'Attempt {n} · daily at {time}',
      lit: 'Lit <b>{n}</b> / 21',
      hold: 'Hold to light',
      litWord: 'Lit',
      untilOpen: 'until open',
      completeWord: 'Complete',
      statusOpen: 'Day {n} · window open',
      statusLeft: '{time} left',
      statusLit: 'Day {n} · lit',
      tomorrow: 'Come back tomorrow at {time} to light star {n}',
      statusFirst: 'Day 1 · opens {when} at {time}',
      today: 'today',
      waiting: 'Waiting for day {n}',
      litToday: 'Lit today',
      statusNext: 'Day {n} opens at {time}',
      windowFixed: 'Window {range} · not early',
      tooEarly: 'Not time yet. You can’t check in early.',
      breakBtn: 'I broke my streak',
      skyDark: 'The sky went dark',
      brokenMissed: 'The day {day} window ({date} {range}) was missed.<br>You kept going for <b>{days} days</b>. That still counts.<br>Light the sky again from day 1.',
      brokenManual: 'You chose to start over, honestly.<br>This time you kept going for <b>{days} days</b>.<br>Light the sky again from day 1.',
      restart: 'Start again',
      retime: 'Change check-in time',
      statDone: 'Cycles finished',
      statLong: 'Longest streak',
      statTotal: 'Days kept',
      doneTitle: 'Finished constellations',
      emptyCards: 'No finished constellation yet<br>The first one is on its way',
      breakTitle: 'Interrupted cycles',
      none: 'None',
      breakLine: 'Attempt {n} · from {date}',
      breakDaysManual: '{days} days · ended early',
      breakDaysMissed: '{days} days · missed window',
      settings: 'Settings',
      notifyTitle: 'Window reminder',
      notifyNoteNative: 'When the window opens, and again 30 minutes before it closes. Scheduled on this device, even if the app is closed.',
      notifyNoteWeb: 'When the window opens. Only while this page is open (iOS needs 16.4+ and the home-screen app).',
      timeTitle: 'Check-in time',
      timeNoteCycle: 'This cycle is fixed at {time} (window {range}). You can change it between cycles.',
      timeNoteFree: 'Change it on the home screen before the next cycle. Currently {time}.',
      backupTitle: 'Backup',
      backupNote: 'Records stay on this device.',
      export: 'Export',
      import: 'Import',
      privacyTitle: 'Privacy',
      privacyNote: 'Check-ins stay on this device. No account, no analytics, no tracking.',
      proTitle: 'Twenty-One Pro',
      proFree: 'A one-time unlock, not for sale yet. Every feature in this version is free.',
      proOwned: 'Pro is unlocked on this device.',
      proWeb: 'Pro is purchased in the iOS and Android apps. Nothing is locked in this version.',
      proReady: 'One-time unlock. The store shows the price.',
      proPrice: 'One-time unlock · {price}',
      proUnlock: 'Unlock Pro',
      proRestore: 'Restore',
      proThanks: 'Pro is unlocked',
      proFail: 'The store didn’t complete that purchase',
      proRestored: 'Purchases restored',
      proNone: 'No Pro purchase found for this store account',
      foot: 'Twenty-One · twenty-one days, twenty-one stars<br>Your check-in time places every star, so each constellation is only yours.',
      confirmTitle: 'End this streak?',
      confirmBody: 'Honesty is a kind of strength.<br>These {n} days are saved as an interruption,<br>then you start again from day 1.',
      confirmYes: 'Yes, start over',
      confirmNo: 'Not yet',
      importTitle: 'Import backup',
      importBody: 'This backup has {done} finished cycles and {broken} interruptions{extra}.<br>It will replace the records on this device.',
      importExtra: ', plus a cycle in progress',
      importYes: 'Replace and import',
      importNo: 'Cancel',
      cardK: 'Constellation {num} · complete',
      cardMeta: 'Attempt {n} · check-in at {time}',
      cardPoem: 'Twenty-one nights, and you came back for every one.<br>This sky is only yours.',
      cardPoemPlain: 'Twenty-one nights, and you came back for every one.\nThis sky is only yours.',
      cardKeep: 'Keep this sky',
      cardClose: 'Close',
      cardShare: 'Share this sky',
      cardFoot: 'Twenty-One',
      shareTitle: 'Twenty-One',
      shareText: 'Twenty-one nights. This sky is mine.',
      shareFail: 'Couldn’t share the card',
      shareSaved: 'Card saved',
      exported: 'Backup exported',
      imported: 'Import finished',
      badBackup: 'This file isn’t a backup I recognize',
      saveFail: 'Couldn’t save. Storage isn’t available.',
      notifyOnNative: 'On. You’ll be reminded when the window opens and before it closes.',
      notifyOnWeb: 'On. You’ll be reminded when the window opens, while this page is open.',
      notifyDenied: 'Notification permission wasn’t granted',
      notifyUnsupported: 'This browser doesn’t support notifications',
      notifTitle: 'Twenty-One',
      notifOpen: 'Day {day} is open. Come back and light it.',
      notifClose: 'About 30 minutes left in today’s window. Day {day} is still unlit.',
      channelName: 'Check-in',
      nextDay: 'next day '
    },
    zh: {
      appTitle: '廿一',
      historyTitle: '星图',
      ariaHistory: '星图记录',
      ariaClose: '关闭',
      ariaHold: '长按打卡',
      ariaNotify: '开窗提醒',
      setupTagFirst: '二十一天 · 二十一颗星',
      setupTagNext: '下一片星空',
      setupRulesFirst: '每天在同一时刻回来，点亮一颗星。<br>错过一次，星空归零，从头再来。',
      setupRulesNext: '可以在周期之间调整打卡时刻。<br>周期开始后，时刻就固定了。',
      timeLabel: '每日打卡时刻',
      windowNote: '每日窗口 {range} · 共 3 小时',
      windowNow: '现在就能点亮第一颗',
      start: '开始',
      startN: '开始第 {n} 次',
      attemptNight: '第 {n} 次 · 每晚 {time}',
      attemptDay: '第 {n} 次 · 每天 {time}',
      lit: '已点亮 <b>{n}</b> / 21',
      hold: '长按点亮',
      litWord: '已点亮',
      untilOpen: '后开启',
      completeWord: '圆满',
      statusOpen: '第 {n} 天 · 窗口开启中',
      statusLeft: '还剩 {time} 关闭',
      statusLit: '第 {n} 天 · 已点亮',
      tomorrow: '明天 {time} 再来点亮第 {n} 颗',
      statusFirst: '第 1 天 · {when} {time} 开启',
      today: '今天',
      waiting: '等待第 {n} 天',
      litToday: '今日已点亮',
      statusNext: '第 {n} 天 {time} 开启',
      windowFixed: '窗口 {range} · 不能提前',
      tooEarly: '还没到时间，不能提前打卡',
      breakBtn: '我破戒了',
      skyDark: '星空熄灭',
      brokenMissed: '第 {day} 天的窗口（{date} {range}）错过了。<br>你坚持了 <b>{days} 天</b>，这段路不会白走。<br>从第 1 天，重新点亮。',
      brokenManual: '你诚实地按下了重来。<br>这一次坚持了 <b>{days} 天</b>。<br>从第 1 天，重新点亮。',
      restart: '重新开始',
      retime: '调整打卡时刻',
      statDone: '完成周期',
      statLong: '最长连续',
      statTotal: '累计天数',
      doneTitle: '已完成的星座',
      emptyCards: '还没有完成的星座<br>第一片，正在路上',
      breakTitle: '中断记录',
      none: '暂无',
      breakLine: '第 {n} 次 · {date}起',
      breakDaysManual: '{days} 天 · 主动重来',
      breakDaysMissed: '{days} 天 · 错过窗口',
      settings: '设置',
      notifyTitle: '开窗提醒',
      notifyNoteNative: '窗口开启时提醒，关闭前 30 分钟再提醒一次。由系统在本机安排，应用关掉也会响。',
      notifyNoteWeb: '打卡窗口开启时提醒。仅在本页开着时有效（iOS 需 16.4+ 并从主屏幕打开）。',
      timeTitle: '打卡时刻',
      timeNoteCycle: '当前周期固定为 {time}（窗口 {range}）。周期之间才能修改。',
      timeNoteFree: '下一个周期开始前可在首页修改，当前 {time}。',
      backupTitle: '备份',
      backupNote: '记录只保存在这台设备上。',
      export: '导出',
      import: '导入',
      privacyTitle: '隐私',
      privacyNote: '打卡记录只在这台设备上。没有账号，没有统计，没有追踪。',
      proTitle: '廿一 Pro',
      proFree: '一次性解锁，尚未发售。这个版本的全部功能都是免费的。',
      proOwned: '这台设备已解锁 Pro。',
      proWeb: 'Pro 在 iOS 和 Android 应用内购买。这个版本没有锁定任何功能。',
      proReady: '一次性解锁。价格由商店显示。',
      proPrice: '一次性解锁 · {price}',
      proUnlock: '解锁 Pro',
      proRestore: '恢复购买',
      proThanks: '已解锁 Pro',
      proFail: '商店没有完成这次购买',
      proRestored: '已恢复购买',
      proNone: '这个商店账号下没有 Pro 购买记录',
      foot: '廿一 · 二十一天，二十一颗星<br>你的打卡时刻决定每颗星的位置，所以每一片星座都独一无二。',
      confirmTitle: '确定破戒了吗？',
      confirmBody: '诚实也是一种力量。<br>这次坚持的 {n} 天会记录为中断，<br>然后从第 1 天重新开始。',
      confirmYes: '是的，重新开始',
      confirmNo: '再想想',
      importTitle: '导入备份',
      importBody: '备份里有 {done} 个完成周期、{broken} 条中断记录{extra}。<br>会覆盖这台设备上的现有记录。',
      importExtra: '，以及一个进行中的周期',
      importYes: '覆盖并导入',
      importNo: '取消',
      cardK: '第 {num} 片星座 · 完成',
      cardMeta: '第 {n} 次尝试 · 每日 {time} 打卡',
      cardPoem: '二十一个夜晚，你都回来了。<br>这片星空，只属于你。',
      cardPoemPlain: '二十一个夜晚，你都回来了。\n这片星空，只属于你。',
      cardKeep: '收下这片星空',
      cardClose: '关闭',
      cardShare: '分享这片星空',
      cardFoot: '廿一',
      shareTitle: '廿一',
      shareText: '二十一个夜晚。这片星空是我的。',
      shareFail: '没能分享这张卡片',
      shareSaved: '已保存卡片',
      exported: '已导出备份',
      imported: '导入完成',
      badBackup: '无法识别这个备份文件',
      saveFail: '保存失败：存储空间不可用',
      notifyOnNative: '已开启：窗口开启时提醒，关闭前也会再提醒一次',
      notifyOnWeb: '已开启：窗口开启时提醒（需页面开着）',
      notifyDenied: '没有获得通知权限',
      notifyUnsupported: '这个浏览器不支持通知',
      notifTitle: '廿一',
      notifOpen: '第 {day} 天的窗口已开启，回来点亮它。',
      notifClose: '今天的窗口大约还剩 30 分钟。第 {day} 天还没点亮。',
      channelName: '打卡提醒',
      nextDay: '次日 '
    }
  };

  function detect() {
    var lang = '';
    try { lang = (navigator.language || navigator.userLanguage || '').toLowerCase(); } catch (e) {}
    if (lang.indexOf('zh') === 0) return 'zh';
    return 'en';
  }

  var lang = detect();

  function t(key, vars) {
    var table = STR[lang] || STR.en;
    var s = table[key];
    if (s == null) s = STR.en[key] != null ? STR.en[key] : key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(String(vars[k]));
      });
    }
    return s;
  }

  function htmlLang() { return lang === 'zh' ? 'zh-Hans' : 'en'; }

  function apply(root) {
    root = root || document;
    document.documentElement.lang = htmlLang();
    document.title = t('appTitle');
    var meta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (meta) meta.setAttribute('content', t('appTitle'));
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    var htmls = root.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmls.length; j++) htmls[j].innerHTML = t(htmls[j].getAttribute('data-i18n-html'));
    var arias = root.querySelectorAll('[data-i18n-aria]');
    for (var k = 0; k < arias.length; k++) arias[k].setAttribute('aria-label', t(arias[k].getAttribute('data-i18n-aria')));
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtD(ms) {
    var d = new Date(ms);
    return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate());
  }
  function fmtMD(ms) {
    var d = new Date(ms);
    if (lang === 'zh') return (d.getMonth() + 1) + '月' + d.getDate() + '日';
    return MONTHS[d.getMonth()] + ' ' + d.getDate();
  }
  function fmtHM(ms) {
    var d = new Date(ms);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  window.I18n = {
    lang: lang,
    t: t,
    apply: apply,
    htmlLang: htmlLang,
    fmtD: fmtD,
    fmtMD: fmtMD,
    fmtHM: fmtHM,
    pad: pad
  };
})();
