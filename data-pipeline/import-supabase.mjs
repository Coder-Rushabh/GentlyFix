// Loads out/gentlyfix.duckdb into Supabase via REST (service/secret key; bypasses RLS). Idempotent (upsert).
// Usage: node import-supabase.mjs
import { DuckDBInstance } from '@duckdb/node-api';
import fs from 'node:fs';

const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split(/\r?\n/)
  .filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));
const URL = env.SUPABASE_URL, KEY = env.SUPABASE_SECRET_KEY;
if (!URL || !KEY) throw new Error('SUPABASE_URL / SUPABASE_SECRET_KEY missing in data-pipeline/.env');

const db = await (await DuckDBInstance.create('out/gentlyfix.duckdb', { access_mode: 'READ_ONLY' })).connect();
const BATCH = 2000;

async function upload(table, rows, conflict) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const res = await fetch(`${URL}/rest/v1/${table}?on_conflict=${conflict}`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(rows.slice(i, i + BATCH)),
    });
    if (!res.ok) throw new Error(`${table} batch ${i}: ${res.status} ${await res.text()}`);
    process.stdout.write(`\r${table}: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  console.log();
}

const businesses = (await db.runAndReadAll(
  `SELECT id, name, taxonomy, confidence, nullif(phone,'') phone, website, email, social, address, city, state, postcode, lat, lng, source FROM businesses`
)).getRowObjectsJson();
await upload('businesses', businesses, 'id');

const cats = (await db.runAndReadAll(`SELECT id AS business_id, category FROM business_categories`)).getRowObjectsJson();
await upload('business_categories', cats, 'business_id,category');
console.log('Done.');
