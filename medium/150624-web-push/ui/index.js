const registerNotificationsButton = document.getElementById('registerNotifications');
const registerPushEventsButton = document.getElementById('registerPushEvents');
const bodyElement = document.body;

registerNotificationsButton.addEventListener('click', async () => {
  const result = await getNotificationPermission();
  addEvent(result === 'granted' ? 'green' : 'red', `[NT] notifications permissions ${result}`);
  registerNotificationsButton.setAttribute('disabled', '');
  registerNotificationsButton.innerText = result;
});

registerPushEventsButton.addEventListener('click', async () => {
  await registerPushSubscription();
  registerNotificationsButton.setAttribute('disabled', '');
  registerNotificationsButton.innerText = 'done!';
});

const colorsChannel = new BroadcastChannel('colors');
colorsChannel.addEventListener('message', (event) => {
  bodyElement.style.background = event.data;
});

(function run() {
  registerServiceWorker();
})();