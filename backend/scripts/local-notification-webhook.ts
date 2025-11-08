import http from 'node:http';
import { AddressInfo } from 'node:net';

const DEFAULT_PORT = 4001;
const DEFAULT_PATH = '/webhooks/notifications';

const port = Number.parseInt(process.env.LOCAL_WEBHOOK_PORT ?? '', 10) || DEFAULT_PORT;
const webhookPath = process.env.LOCAL_WEBHOOK_PATH ?? DEFAULT_PATH;

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host ?? `localhost:${port}`}`);

  if (req.method.toUpperCase() !== 'POST' || pathname !== webhookPath) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const chunks: Buffer[] = [];

  req.on('data', (chunk) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });

  req.on('end', () => {
    try {
      const rawBody = Buffer.concat(chunks).toString('utf8');
      const payload = rawBody.length > 0 ? JSON.parse(rawBody) : null;

      // eslint-disable-next-line no-console
      console.log('[local-webhook] Received notification payload:', {
        headers: req.headers,
        body: payload,
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[local-webhook] Failed to process payload:', error);
      res.writeHead(400);
      res.end('Invalid JSON payload');
    }
  });

  req.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error('[local-webhook] Request stream error:', error);
  });
});

server.listen(port, () => {
  const address = server.address() as AddressInfo | null;
  const url =
    address && typeof address.port === 'number'
      ? `http://localhost:${address.port}${webhookPath}`
      : `http://localhost:${port}${webhookPath}`;

  // eslint-disable-next-line no-console
  console.log('[local-webhook] Listening for notifications at', url);
  // eslint-disable-next-line no-console
  console.log(
    '[local-webhook] Set NOTIFICATION_WEBHOOK_URL to this URL so the backend can deliver events.',
  );
});

server.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error('[local-webhook] Server error:', error);
  process.exit(1);
});

