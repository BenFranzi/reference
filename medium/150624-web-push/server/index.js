import http from 'node:http';
import webpush from 'web-push';

const PORT = 3001;

const vapidKeys = {
  mail: 'mailto:test@test.test',
  publicKey: 'BBcQdQu5hs6KWSSw56z_zeHFMskUAQwx1rjx7fB8Xk0XmBYV2i7CSiAIk2NYPY578AZrB8o4vfoemeJPT763irY',
  privateKey: 'L41pdOyGgGYrJBjExmj8VA8GS5Et7wCuFMY4vz2rjb8',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': 2592000, // 30 days
}

const subscriptions = {
  entries: [],
  get() {
    return this.entries;
  },
  set(subscription) {
    this.entries.push(subscription);
  }
}

async function sendWebPush(subscription, payload) {
  webpush.setVapidDetails(
    vapidKeys.mail,
    vapidKeys.publicKey,
    vapidKeys.privateKey,
  );

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log('Subscription has expired or is no longer valid.');
    } else {
      throw error;
    }
  }
}

async function registerSubscription(req, res) {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }

      const body = Buffer.concat(buffers).toString();
      const subscription = JSON.parse(body);
      console.log(subscription);
      subscriptions.set(subscription);
      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'successfully registered.' }));
    } catch (error) {
      res.writeHead(500, {...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
}

const sendEvent = (type) => async (req, res) => {
  try {
    const message = new URL(req.url, `http://${req.headers.host}`).searchParams.get('message');
    const promises = subscriptions.get().map((subscription) =>
      sendWebPush(subscription, { type, message })
    )

    await Promise.all(promises);
    res.writeHead(200, {...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'sent!' }));
  } catch (error) {
    res.writeHead(500, {...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
}

const routes = {
  POST: {
    '/pushes': registerSubscription,
  },
  PUT: {
    '/notifications': sendEvent('notification'),
    '/colors': sendEvent('color'),
  }
}


const server = http.createServer(async (req, res) => {
  console.log(req.method, req.url);

  if (req.method === 'OPTIONS') {
      res.writeHead(200, corsHeaders);
      res.end();
      return;
    }

    const path = new URL(req.url, `http://${req.headers.host}`).pathname

    if (routes[req.method][path]) {
      await routes[req.method][path](req, res);
      return;
    }

  res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'no bueno.' }));
});

server.listen(PORT, () => console.log(`:${PORT}`));