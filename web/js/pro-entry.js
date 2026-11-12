/**
 * Store bridge. Bundled to web/js/pro.bundle.js.
 * Does not call the stores, and does not set a receipt validator, until
 * product ids exist. No purchase data leaves the device in this build.
 */
import { store, ProductType, Platform, LogLevel, ErrorCode } from 'capacitor-plugin-cdv-purchase';

var cfg = window.A21ProConfig || { productIds: {}, features: [] };
var PRO_KEY = 'abstain21.pro';
var state = { configured: false, ready: false, owned: false, price: '', error: '' };

function ids() {
  var out = [];
  if (cfg.productIds && cfg.productIds.ios) out.push(cfg.productIds.ios);
  if (cfg.productIds && cfg.productIds.android && out.indexOf(cfg.productIds.android) === -1) out.push(cfg.productIds.android);
  return out;
}

function nativeCap() {
  var cap = window.Capacitor;
  return cap && cap.isNativePlatform && cap.isNativePlatform() ? cap : null;
}

function readOwnedCache() {
  try { return localStorage.getItem(PRO_KEY) === '1'; } catch (e) { return false; }
}

function writeOwnedCache(owned) {
  try { localStorage.setItem(PRO_KEY, owned ? '1' : '0'); } catch (e) {}
  var cap = nativeCap();
  if (cap && cap.nativePromise) {
    cap.nativePromise('Preferences', 'set', { key: PRO_KEY, value: owned ? '1' : '0' }).catch(function () {});
  }
}

function featureUnlocked(id) {
  var features = Array.isArray(cfg.features) ? cfg.features : [];
  if (!features.length || features.indexOf(id) === -1) return true;
  if (!state.configured) return true;
  return !!state.owned;
}

function publish() {
  window.A21Pro = {
    configured: state.configured,
    ready: state.ready,
    owned: state.owned,
    price: state.price,
    error: state.error,
    featureUnlocked: featureUnlocked,
    purchase: purchase,
    restore: restore
  };
  try { window.dispatchEvent(new Event('a21-pro')); } catch (e) {}
}

function markOwned() {
  if (state.owned) return;
  state.owned = true;
  writeOwnedCache(true);
  publish();
}

function registrations() {
  var list = [];
  if (cfg.productIds && cfg.productIds.ios) {
    list.push({ id: cfg.productIds.ios, type: ProductType.NON_CONSUMABLE, platform: Platform.APPLE_APPSTORE });
  }
  if (cfg.productIds && cfg.productIds.android) {
    list.push({ id: cfg.productIds.android, type: ProductType.NON_CONSUMABLE, platform: Platform.GOOGLE_PLAY });
  }
  return list;
}

function productIdForThisDevice() {
  var cap = nativeCap();
  var plat = cap ? cap.getPlatform() : 'web';
  if (plat === 'ios') return cfg.productIds.ios || '';
  if (plat === 'android') return cfg.productIds.android || '';
  return '';
}

function priceOf(product) {
  var pricing = product && product.pricing;
  return pricing && pricing.price ? String(pricing.price) : '';
}

function init() {
  var products = registrations();
  state.configured = products.length > 0;
  state.owned = state.configured && readOwnedCache();
  if (!state.configured || !nativeCap()) {
    state.ready = true;
    publish();
    return;
  }
  store.verbosity = LogLevel.ERROR;
  // No store.validator: receipts stay on device. verify() then accepts locally.
  store.register(products);
  store.when()
    .productUpdated(function (product) {
      if (ids().indexOf(product.id) === -1) return;
      var price = priceOf(product);
      if (price) state.price = price;
      if (product.owned) markOwned();
      else publish();
    })
    .approved(function (transaction) {
      markOwned();
      if (transaction.isAcknowledged) {
        transaction.finish();
        return;
      }
      transaction.verify();
    })
    .verified(function (receipt) {
      receipt.finish();
    });
  store.error(function (err) {
    if (err && err.code === ErrorCode.PAYMENT_CANCELLED) return;
    state.error = (err && (err.message || err.code)) ? String(err.message || err.code) : 'purchase-error';
    publish();
  });
  store.initialize([Platform.APPLE_APPSTORE, Platform.GOOGLE_PLAY]).then(function () {
    var id = productIdForThisDevice();
    if (id && store.owned(id)) markOwned();
    var product = id && store.get(id);
    var price = priceOf(product);
    if (price) state.price = price;
    state.ready = true;
    publish();
  }).catch(function (e) {
    state.error = String(e && e.message || e);
    state.ready = true;
    publish();
  });
}

function purchase() {
  if (!state.configured) return Promise.resolve({ ok: false, reason: 'unconfigured' });
  var id = productIdForThisDevice();
  var product = id && store.get(id);
  var offer = product && product.getOffer && product.getOffer();
  if (!offer) return Promise.resolve({ ok: false, reason: 'unavailable' });
  return Promise.resolve(offer.order()).then(function (ret) {
    if (ret && ret.isError) {
      if (ret.code === ErrorCode.PAYMENT_CANCELLED) return { ok: false, reason: 'cancelled' };
      return { ok: false, reason: ret.message || 'failed' };
    }
    return { ok: true };
  }).catch(function (e) {
    return { ok: false, reason: String(e && e.message || e) };
  });
}

function restore() {
  if (!state.configured) return Promise.resolve({ ok: false, reason: 'unconfigured', owned: false });
  return Promise.resolve(store.restorePurchases()).then(function () {
    var id = productIdForThisDevice();
    if (id && store.owned(id)) markOwned();
    return { ok: true, owned: state.owned };
  }).catch(function (e) {
    return { ok: false, reason: String(e && e.message || e), owned: state.owned };
  });
}

publish();
init();
