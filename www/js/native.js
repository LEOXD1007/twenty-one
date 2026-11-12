/**
 * Native bridge. In a browser this is a no-op and the page keeps using
 * localStorage, the Web Notification API, and navigator.vibrate.
 * Inside Capacitor it calls the injected native runtime directly so the
 * web build does not need a second copy of every plugin.
 */
(function () {
  var cap = window.Capacitor;
  var isNative = !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());

  function call(plugin, method, options) {
    if (!isNative || !window.Capacitor || typeof window.Capacitor.nativePromise !== 'function') {
      return Promise.reject(new Error('not-native'));
    }
    return window.Capacitor.nativePromise(plugin, method, options || {});
  }

  function haptic(kind) {
    if (!isNative) return false;
    if (kind === 'hold') { call('Haptics', 'selectionStart', {}).catch(function () {}); return true; }
    if (kind === 'tick') { call('Haptics', 'selectionChanged', {}).catch(function () {}); return true; }
    if (kind === 'hold-end') { call('Haptics', 'selectionEnd', {}).catch(function () {}); return true; }
    if (kind === 'reject') { call('Haptics', 'notification', { type: 'WARNING' }).catch(function () {}); return true; }
    if (kind === 'tap') { call('Haptics', 'impact', { style: 'LIGHT' }).catch(function () {}); return true; }
    if (kind === 'break') { call('Haptics', 'notification', { type: 'ERROR' }).catch(function () {}); return true; }
    if (kind === 'remind') { call('Haptics', 'impact', { style: 'MEDIUM' }).catch(function () {}); return true; }
    return false;
  }

  function impact(style) {
    call('Haptics', 'impact', { style: style }).catch(function () {});
  }
  function note(type) {
    call('Haptics', 'notification', { type: type }).catch(function () {});
  }

  /* Five tiers, light to the day-21 finale. iOS Safari cannot vibrate; these can. */
  function hapticTier(tier) {
    if (!isNative) return false;
    if (tier === 1) impact('LIGHT');
    else if (tier === 2) { impact('MEDIUM'); setTimeout(function () { impact('LIGHT'); }, 90); }
    else if (tier === 3) {
      impact('HEAVY');
      setTimeout(function () { impact('MEDIUM'); }, 90);
      setTimeout(function () { impact('HEAVY'); }, 190);
    } else if (tier === 4) {
      note('SUCCESS');
      setTimeout(function () { impact('HEAVY'); }, 110);
      setTimeout(function () { impact('MEDIUM'); }, 230);
      setTimeout(function () { impact('HEAVY'); }, 360);
    } else if (tier === 5) {
      note('SUCCESS');
      [140, 280, 430, 600, 780].forEach(function (ms) { setTimeout(function () { impact('HEAVY'); }, ms); });
      setTimeout(function () { note('SUCCESS'); }, 980);
    } else return false;
    return true;
  }

  var channelReady = false;
  function ensureChannel(name) {
    if (channelReady) return Promise.resolve();
    if (!isNative || window.Capacitor.getPlatform() !== 'android') { channelReady = true; return Promise.resolve(); }
    return call('LocalNotifications', 'createChannel', {
      id: 'checkin',
      name: name || 'Check-in',
      description: 'Daily check-in window',
      importance: 4,
      visibility: 1,
      vibration: true
    }).catch(function () {}).then(function () { channelReady = true; });
  }

  function wantsExact() {
    if (!isNative || window.Capacitor.getPlatform() !== 'android') return Promise.resolve(false);
    return call('LocalNotifications', 'checkExactNotificationSetting').then(function (res) {
      return !!(res && res.exact_alarm === 'granted');
    }).catch(function () { return false; });
  }

  /**
   * Replace the pending check-in notifications.
   * items: [{ id, at, title, body }]
   * isExactNotification stays false unless Android has already granted exact
   * alarms, so scheduling never opens the system Alarms screen by itself.
   */
  function syncReminders(items) {
    if (!isNative) return Promise.resolve();
    var ids = [];
    for (var i = 0; i < 21; i++) { ids.push({ id: 2100 + i }); ids.push({ id: 2200 + i }); }
    var channelName = (items && items.channelName) || 'Check-in';
    return ensureChannel(channelName).then(wantsExact).then(function (exact) {
      return call('LocalNotifications', 'cancel', { notifications: ids }).catch(function () {}).then(function () {
        if (!items || !items.length) return;
        return call('LocalNotifications', 'schedule', {
          notifications: items.map(function (item) {
            return {
              id: item.id,
              title: item.title,
              body: item.body,
              channelId: 'checkin',
              schedule: { at: new Date(item.at).toISOString(), allowWhileIdle: true },
              isExactNotification: !!exact,
              extra: { kind: item.kind, day: item.day }
            };
          })
        });
      });
    }).catch(function () {});
  }

  function requestNotifyPermission() {
    if (!isNative) return Promise.resolve(false);
    return call('LocalNotifications', 'requestPermissions').then(function (res) {
      return !!(res && res.display === 'granted');
    }).catch(function () { return false; });
  }

  function shareImage(opts) {
    return call('Filesystem', 'writeFile', {
      path: opts.filename || 'twenty-one.png',
      data: opts.base64,
      directory: 'CACHE'
    }).then(function (res) {
      return call('Share', 'share', {
        title: opts.title,
        text: opts.text,
        dialogTitle: opts.title,
        files: [res.uri]
      });
    });
  }

  function polish() {
    if (!isNative) return;
    call('StatusBar', 'setOverlaysWebView', { overlay: true }).catch(function () {});
    call('StatusBar', 'setStyle', { style: 'DARK' }).catch(function () {});
    call('StatusBar', 'setBackgroundColor', { color: '#06070b' }).catch(function () {});
    call('SplashScreen', 'hide', {}).catch(function () {});
  }

  window.A21Native = {
    isNative: isNative,
    platform: isNative ? cap.getPlatform() : 'web',
    call: call,
    haptic: haptic,
    hapticTier: hapticTier,
    syncReminders: syncReminders,
    requestNotifyPermission: requestNotifyPermission,
    shareImage: shareImage,
    preferencesGet: function (key) { return call('Preferences', 'get', { key: key }); },
    preferencesSet: function (key, value) { return call('Preferences', 'set', { key: key, value: value }); },
    preferencesRemove: function (key) { return call('Preferences', 'remove', { key: key }); },
    polish: polish
  };

  polish();
})();
