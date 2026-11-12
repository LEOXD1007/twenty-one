/**
 * One-time non-consumable Pro unlock.
 *
 * Leave productIds empty until the products exist in App Store Connect and
 * Play Console. While they are empty the store SDK is not started, nothing
 * is charged, and every feature stays free.
 *
 * `features` is the list of feature ids that require Pro. Empty means nothing
 * is gated — including after you fill in product ids. Move an id from
 * `planned` into `features` when you actually want to lock it.
 *
 * Do not put a price in this file. The stores are the only source of price.
 */
window.A21ProConfig = {
  productIds: {
    ios: '',
    android: ''
  },
  features: [],
  planned: [
    { id: 'themes', en: 'Extra night-sky themes', zh: '更多夜空主题' },
    { id: 'widget', en: 'Home-screen streak widget', zh: '主屏幕连续打卡小组件' },
    { id: 'customWindow', en: 'A check-in window other than 3 hours', zh: '自定义打卡窗口时长' },
    { id: 'extraReminders', en: 'Additional reminder times', zh: '更多提醒时刻' }
  ]
};
