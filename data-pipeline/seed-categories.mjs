// Creates the public "category-icons" bucket, uploads the icons, and upserts the categories table.
// Needs schema-phase1.sql to have been run (for the table). Safe to re-run.
import fs from 'node:fs';

const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split(/\r?\n/)
  .filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));
const URL = env.SUPABASE_URL, KEY = env.SUPABASE_SECRET_KEY, BUCKET = 'category-icons';
const auth = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const rows = JSON.parse(fs.readFileSync('categories.seed.json', 'utf8'));

// 1. bucket (public read)
let r = await fetch(`${URL}/storage/v1/bucket`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 1048576, allowed_mime_types: ['image/png', 'image/webp', 'image/jpeg'] }) });
console.log('bucket:', r.ok ? 'created' : (await r.text()).slice(0, 120));

// 2. icons
for (const c of rows) {
  const file = fs.readFileSync(`../assets/category/${c.icon}`);
  r = await fetch(`${URL}/storage/v1/object/${BUCKET}/${c.icon}`, { method: 'POST', headers: { ...auth, 'Content-Type': 'image/png', 'x-upsert': 'true', 'cache-control': 'max-age=31536000' }, body: file });
  if (!r.ok) throw new Error(`upload ${c.icon}: ${r.status} ${await r.text()}`);
}
console.log(`uploaded ${rows.length} icons`);

// 3. table rows
r = await fetch(`${URL}/rest/v1/categories?on_conflict=name`, { method: 'POST',
  headers: { ...auth, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
if (!r.ok) {
  const t = await r.text();
  console.log(t.includes('PGRST205') || t.includes('does not exist') ? 'categories table is missing: run data-pipeline/schema-phase1.sql in the SQL Editor, then re-run this script.' : `categories insert failed: ${r.status} ${t}`);
  process.exit(1);
}
console.log(`upserted ${rows.length} categories`);
