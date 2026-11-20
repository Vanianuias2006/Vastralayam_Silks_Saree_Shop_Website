import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const AUTH_FILE = path.join(DATA_DIR, 'admin-auth.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');

const SESSION_COOKIE_NAME = 'vastralayam_admin_session';
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

interface AdminAuthRecord {
  salt: string;
  hash: string;
  createdAt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function isAuthConfigured(): boolean {
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
    return true;
  }
  const stored = readJsonFile<AdminAuthRecord | null>(AUTH_FILE, null);
  return Boolean(stored && stored.salt && stored.hash);
}

function verifyAdminPassword(candidate: string): boolean {
  const envPassword = process.env.ADMIN_PASSWORD?.trim();
  if (envPassword) {
    const a = Buffer.from(candidate);
    const b = Buffer.from(envPassword);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
  const stored = readJsonFile<AdminAuthRecord | null>(AUTH_FILE, null);
  if (!stored || !stored.salt || !stored.hash) return false;
  const derived = Buffer.from(hashPassword(candidate, stored.salt), 'hex');
  const expected = Buffer.from(stored.hash, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    cookies[key] = val;
  }
  return cookies;
}

function createSessionToken(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  const payload = Buffer.from(JSON.stringify({ role: 'owner', exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      role?: string;
      exp?: number;
    };
    return parsed.role === 'owner' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const cookies = parseCookies(req.headers.cookie);
  if (!verifySessionToken(cookies[SESSION_COOKIE_NAME])) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  next();
}

function setSessionCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  const attrs = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 12}`,
  ];
  if (isProd) {
    attrs.push('Secure');
  }
  res.setHeader('Set-Cookie', attrs.join('; '));
}

function clearSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/store', (_req, res) => {
    const store = readJsonFile(STORE_FILE, {
      products: [],
      gallery: [],
      settings: {
        instagramHandle: '@vastralayam_silks',
        instagramUrl: 'https://www.instagram.com/vastralayam_silks/',
        hoursWeekdays: 'Monday – Saturday: 10:30 AM – 8:30 PM',
        hoursSunday: 'Sunday: 11:00 AM – 7:00 PM',
        announcementText: '',
      },
    });
    res.json(store);
  });

  app.post('/api/inquiries', (req, res) => {
    const { name, phone, message, productName } = req.body as {
      name?: string;
      phone?: string;
      message?: string;
      productName?: string;
    };
    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Please fill in your name, phone number, and message.' });
      return;
    }
    const inquiries = readJsonFile<Array<Record<string, unknown>>>(INQUIRIES_FILE, []);
    const newInquiry = {
      id: `inq-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      message: message.trim(),
      productName: productName?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    inquiries.unshift(newInquiry);
    writeJsonFile(INQUIRIES_FILE, inquiries);
    res.status(201).json({ ok: true, inquiry: newInquiry });
  });

  app.get('/api/admin/session', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const authenticated = verifySessionToken(cookies[SESSION_COOKIE_NAME]);
    res.json({
      authenticated,
      needsInitialSetup: !isAuthConfigured(),
    });
  });

  app.post('/api/admin/setup', (req, res) => {
    if (isAuthConfigured()) {
      res.status(403).json({ error: 'Owner password is already configured.' });
      return;
    }
    const { password } = req.body as { password?: string };
    if (!password || password.trim().length < 8) {
      res.status(400).json({ error: 'Please choose a password of at least 8 characters.' });
      return;
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password.trim(), salt);
    writeJsonFile(AUTH_FILE, {
      salt,
      hash,
      createdAt: new Date().toISOString(),
    });
    setSessionCookie(res, createSessionToken());
    res.status(201).json({ authenticated: true });
  });

  app.post('/api/admin/login', (req, res) => {
    if (!isAuthConfigured()) {
      res.status(409).json({ error: 'Owner password has not been set up yet.' });
      return;
    }
    const { password } = req.body as { password?: string };
    if (!password || !verifyAdminPassword(password.trim())) {
      res.status(401).json({ error: 'Invalid owner password.' });
      return;
    }
    setSessionCookie(res, createSessionToken());
    res.json({ authenticated: true });
  });

  app.post('/api/admin/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ authenticated: false });
  });

  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    const { filename, dataUrl } = req.body as { filename?: string; dataUrl?: string };
    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'No image data received.' });
      return;
    }
    const match = dataUrl.match(/^data:(image\/(jpeg|jpg|png|webp));base64,(.+)$/i);
    if (!match) {
      res.status(400).json({ error: 'Only JPG, PNG, or WEBP images are supported.' });
      return;
    }
    const ext = match[2].toLowerCase() === 'jpeg' ? 'jpg' : match[2].toLowerCase();
    const baseName = (filename || 'saree')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 40);
    const savedName = `${baseName || 'saree'}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(match[3], 'base64');
    if (buffer.length > 6 * 1024 * 1024) {
      res.status(400).json({ error: 'Image must be smaller than 6 MB.' });
      return;
    }
    fs.writeFileSync(path.join(UPLOADS_DIR, savedName), buffer);
    res.status(201).json({ url: `/uploads/${savedName}` });
  });

  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const store = readJsonFile<{
      products: Array<Record<string, unknown>>;
      gallery: Array<Record<string, unknown>>;
      settings: Record<string, unknown>;
    }>(STORE_FILE, { products: [], gallery: [], settings: {} });

    const payload = req.body as Record<string, unknown>;
    if (!payload.name || !payload.category || typeof payload.price !== 'number') {
      res.status(400).json({ error: 'Name, category, and numeric price are required.' });
      return;
    }
    const newProduct = {
      ...payload,
      id: `saree-${Date.now()}`,
    };
    store.products.unshift(newProduct);
    writeJsonFile(STORE_FILE, store);
    res.status(201).json({ product: newProduct, store });
  });

  app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
    const store = readJsonFile<{
      products: Array<Record<string, unknown>>;
      gallery: Array<Record<string, unknown>>;
      settings: Record<string, unknown>;
    }>(STORE_FILE, { products: [], gallery: [], settings: {} });

    const idx = store.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Saree entry not found.' });
      return;
    }
    store.products[idx] = {
      ...store.products[idx],
      ...(req.body as Record<string, unknown>),
      id: req.params.id,
    };
    writeJsonFile(STORE_FILE, store);
    res.json({ product: store.products[idx], store });
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const store = readJsonFile<{
      products: Array<Record<string, unknown>>;
      gallery: Array<Record<string, unknown>>;
      settings: Record<string, unknown>;
    }>(STORE_FILE, { products: [], gallery: [], settings: {} });

    const beforeCount = store.products.length;
    store.products = store.products.filter((p) => p.id !== req.params.id);
    if (store.products.length === beforeCount) {
      res.status(404).json({ error: 'Saree entry not found.' });
      return;
    }
    writeJsonFile(STORE_FILE, store);
    res.json({ ok: true, store });
  });

  app.delete('/api/admin/samples', requireAdmin, (_req, res) => {
    const store = readJsonFile<{
      products: Array<Record<string, unknown>>;
      gallery: Array<Record<string, unknown>>;
      settings: Record<string, unknown>;
    }>(STORE_FILE, { products: [], gallery: [], settings: {} });

    store.products = store.products.filter((p) => p.isSample !== true);
    writeJsonFile(STORE_FILE, store);
    res.json({ ok: true, store });
  });

  app.post('/api/admin/gallery', requireAdmin, (req, res) => {
    const store = readJsonFile<{
      products: Array<Record<string, unknown>>;
      gallery: Array<Record<string, unknown>>;
      settings: Record<string, unknown>;
    }>(STORE_FILE, { products: [], gallery: [], settings: {} });
    const item = {
      ...(req.body as Record<string, unknown>),
      id: `gal-${Date.now()}`,
    };
    store.gallery.unshift(item);
    writeJsonFile(STORE_FILE, store);
    res.status(201).json({ item, store });
  });

  app.delete('/api/admin/gallery/:id', requireAdmin, (req, res) => {
    const store = readJsonFile<{
      products: Array<Record<string, unknown>>;
      gallery: Array<Record<string, unknown>>;
      settings: Record<string, unknown>;
    }>(STORE_FILE, { products: [], gallery: [], settings: {} });
    store.gallery = store.gallery.filter((g) => g.id !== req.params.id);
    writeJsonFile(STORE_FILE, store);
    res.json({ ok: true, store });
  });

  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const store = readJsonFile<{
      products: Array<Record<string, unknown>>;
      gallery: Array<Record<string, unknown>>;
      settings: Record<string, unknown>;
    }>(STORE_FILE, { products: [], gallery: [], settings: {} });
    store.settings = {
      ...store.settings,
      ...(req.body as Record<string, unknown>),
    };
    writeJsonFile(STORE_FILE, store);
    res.json({ settings: store.settings, store });
  });

  app.get('/api/admin/inquiries', requireAdmin, (_req, res) => {
    const inquiries = readJsonFile<Array<Record<string, unknown>>>(INQUIRIES_FILE, []);
    res.json({ inquiries });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vastralayam Silks server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
