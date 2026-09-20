// AfriCare — notifications système (iOS / Android)
window.AfriCareNotif = {
  async ensurePermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const p = await Notification.requestPermission();
    return p === 'granted';
  },
  async show(title, body, level) {
    const ok = await this.ensurePermission();
    if (!ok) {
      alert('Autorisez les notifications dans Réglages → AfriCare');
      return;
    }
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIF',
        payload: { title: title || 'AfriCare', body: body || '', level: level || 'calm' }
      });
      return;
    }
    try {
      new Notification(title || 'AfriCare', {
        body: body || '',
        icon: './icons/icon.svg',
        tag: 'africare-queue'
      });
    } catch (e) {
      alert('Notification: ' + e.message);
    }
  }
};
