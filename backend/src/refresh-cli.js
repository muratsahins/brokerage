import 'dotenv/config';
import { initDb } from './db.js';
import { refresh } from './service.js';

// Tek seferlik yenileme (cron/manuel çalıştırma için)
await initDb();
const items = await refresh();
console.log(`Bitti: ${items.length} hisse yenilendi.`);
process.exit(0);
