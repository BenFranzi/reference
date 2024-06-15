const PUBLIC_KEY = 'BBcQdQu5hs6KWSSw56z_zeHFMskUAQwx1rjx7fB8Xk0XmBYV2i7CSiAIk2NYPY578AZrB8o4vfoemeJPT763irY';
const SERVER_URL = 'http://localhost:3001';
const eventsList = document.getElementById('events');

function addEvent(color, ...messages) {
  const listItem = document.createElement('li');
  listItem.innerText = messages.join(' ');
  listItem.style.color = color;
  eventsList.appendChild(listItem);
}


// https://github.com/GoogleChromeLabs/web-push-codelab/blob/master/app/scripts/main.js
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function registerServiceWorker() {
  if (navigator.serviceWorker.controller) {
    addEvent('green', '[SW] already registered.');
    return;
  }
  const registration = await navigator.serviceWorker.register('service-worker.js');
  console.log(registration);
  addEvent('green', '[SW] registered.')
}

function getNotificationPermission() {
  return Notification.requestPermission();
}

async function registerPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    addEvent('green','[PM] already subscribed to web push.');
    // return
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(PUBLIC_KEY),
  });

  await fetch(`${SERVER_URL}/pushes`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription),
  });
}
