self.addEventListener('push', (event) => {
  const data  = JSON.parse(event.data.text());
  if (data?.type === 'notification') {
    const promise = self.registration.showNotification('Oh hey!', { body: data.message });
    event.waitUntil(promise);
    return;
  }

  if (data?.type === 'color') {
    const channel = new BroadcastChannel('colors');
    channel.postMessage(data.message);
  }
});