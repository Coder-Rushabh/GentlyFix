// Pulls India local-service businesses from Overture Maps (free, open) into a local DuckDB file.
// Usage: node extract-overture.mjs [release] [minConfidence]
import { DuckDBInstance } from '@duckdb/node-api';
import fs from 'node:fs';

const RELEASE = process.argv[2] ?? '2026-09-23.1';
const MIN_CONF = Number(process.argv[3] ?? 0.4);
const OUT = 'out';
fs.mkdirSync(OUT, { recursive: true });

// [overture taxonomy.primary, GentlyFix category (see screens/HomeScreen.jsx), optional name regex]
const MAP = [
  ['plumbing', 'Plumber'], ['water_heater_installation_repair', 'Plumber'], ['bathtub_and_sink_repair', 'Plumber'],
  ['electrician', 'Electrician'], ['generator_installation_repair', 'Electrician'],
  ['welder', 'Welder'],
  ['painting', 'Painter'],
  ['building_contractor', 'Builder'], ['contractor', 'Builder'], ['masonry_contractor', 'Builder'], ['paving_contractor', 'Builder'],
  ['security_service', 'Guard'],
  ['gardener', 'Gardener'], ['nursery_and_gardening_store', 'Gardener'],
  ['pest_control_service', 'Pest Control'],
  ['key_and_locksmith', 'Locksmith'],
  ['roofing', 'Roofer'], ['waterproofing', 'Roofer'],
  ['it_service_and_computer_repair', 'IT technician'],
  ['carpenter', 'Carpenter'], ['furniture_repair', 'Carpenter'],
  ['hardware_store', 'Hardware'], ['hardware_home_and_garden_store', 'Hardware'],
  ['electrical_supply_store', 'Hardware'], ['paint_store', 'Hardware'], ['welding_supply_store', 'Hardware'],
  ['home_cleaning', 'Cleaner'], ['cleaning_service', 'Cleaner'], ['carpet_cleaning', 'Cleaner'], ['office_cleaning', 'Cleaner'],
  ['automotive_repair', 'Car Repairer'], ['auto_electrical_repair', 'Car Repairer'], ['brake_service_and_repair', 'Car Repairer'],
  ['engine_repair_service', 'Car Repairer'], ['transmission_repair', 'Car Repairer'], ['tire_dealer_and_repair', 'Car Repairer'],
  ['wheel_and_rim_repair', 'Car Repairer'],
  ['motorcycle_repair', 'Bike Repairer'], ['bike_repair_maintenance', 'Bike Repairer'],
  ['truck_repair', 'Big Vehicle Repairer'],
  ['electronics_repair_shop', 'Gadgets Repairer'],
  ['electronics_repair_shop', 'TV Repairer', '\b(tv|television|led|lcd)\b'],
  ['home_security', 'CCTV installation'], ['security_systems', 'CCTV installation'],
  ['mobile_phone_repair', 'Mobile Repairer'],
  ['solar_installation', 'Solar'],
  ['pool_cleaning', 'Pool Maintenance'], ['pool_and_hot_tub_service', 'Pool Maintenance'],
  ['altering_and_remodeling_contractor', 'Home renovation'], ['flooring_contractor', 'Home renovation'],
  ['washer_and_dryer_repair_service', 'Washing machine Repairer'],
  // generic appliance repairers: classified by name; unmatched ones are listed under all three
  ['appliance_repair_service', 'AC Repairer', '\b(ac|a\.c|air.?condition\w*|cooling|split)\b'],
  ['appliance_repair_service', 'Fridge Repairer', 'fridge|refrigerat\w*|freezer'],
  ['appliance_repair_service', 'Washing machine Repairer', 'washing|washer|laundry'],
];

const q = (s) => `'${s.replace(/'/g, "''")}'`;
const db = await (await DuckDBInstance.create(`${OUT}/gentlyfix.duckdb`)).connect();
await db.run("INSTALL spatial; LOAD spatial; INSTALL httpfs; LOAD httpfs; SET s3_region='us-west-2';");

await db.run('CREATE OR REPLACE TABLE cat_map(taxonomy VARCHAR, category VARCHAR, name_re VARCHAR)');
await db.run(`INSERT INTO cat_map VALUES ${MAP.map(([t, c, r]) => `(${q(t)},${q(c)},${r ? q(r) : 'NULL'})`).join(',')}`);

const taxList = [...new Set(MAP.map((m) => m[0]))].map(q).join(',');
const src = `read_parquet('s3://overturemaps-us-west-2/release/${RELEASE}/theme=places/type=place/*', hive_partitioning=1)`;

console.log('Downloading India places from Overture', RELEASE, '(takes a few minutes)...');
await db.run(`
CREATE OR REPLACE TABLE raw AS
SELECT id,
  names.primary AS name,
  taxonomy.primary AS taxonomy,
  confidence,
  operating_status,
  phones[1] AS phone,
  websites[1] AS website,
  emails[1] AS email,
  socials[1] AS social,
  addresses[1].freeform AS address,
  addresses[1].locality AS city,
  addresses[1].region AS state,
  addresses[1].postcode AS postcode,
  ST_Y(geometry) AS lat, ST_X(geometry) AS lng,
  sources[1].dataset AS source_dataset
FROM ${src}
WHERE bbox.xmin BETWEEN 68 AND 97.5 AND bbox.ymin BETWEEN 6.5 AND 35.8
  AND addresses[1].country = 'IN'
  AND confidence >= ${MIN_CONF}
  AND names.primary IS NOT NULL
  AND coalesce(operating_status,'open') <> 'closed'
  AND taxonomy.primary IN (${taxList})`);

await db.run(`
CREATE OR REPLACE TABLE business_categories AS
SELECT DISTINCT r.id, m.category FROM raw r
JOIN cat_map m ON m.taxonomy = r.taxonomy AND (m.name_re IS NULL OR regexp_matches(lower(r.name), m.name_re))
WHERE r.taxonomy <> 'appliance_repair_service' OR m.name_re IS NOT NULL;
INSERT INTO business_categories
SELECT r.id, c.category FROM raw r,
  (VALUES ('AC Repairer'),('Fridge Repairer'),('Washing machine Repairer')) c(category)
WHERE r.taxonomy = 'appliance_repair_service'
  AND NOT EXISTS (SELECT 1 FROM business_categories b WHERE b.id = r.id);
CREATE OR REPLACE TABLE businesses AS
SELECT r.id, r.name, r.taxonomy, r.confidence,
  regexp_replace(r.phone, '[^0-9+]', '', 'g') AS phone,
  r.website, r.email, r.social, r.address, r.city, r.state, r.postcode, r.lat, r.lng,
  'overture:' || r.source_dataset AS source
FROM raw r WHERE r.id IN (SELECT id FROM business_categories);
DROP TABLE raw;`);

await db.run(`COPY businesses TO '${OUT}/businesses.parquet' (FORMAT parquet)`);
await db.run(`COPY business_categories TO '${OUT}/business_categories.parquet' (FORMAT parquet)`);
await db.run(`COPY businesses TO '${OUT}/businesses.csv' (HEADER)`);
await db.run(`COPY business_categories TO '${OUT}/business_categories.csv' (HEADER)`);

const rows = (await db.runAndReadAll(`
  SELECT category, count(*) n, count(phone) with_phone FROM business_categories c JOIN businesses b USING(id)
  GROUP BY 1 ORDER BY 2 DESC`)).getRowObjects();
console.log('\nCategory                    businesses  with phone');
for (const r of rows) console.log(r.category.padEnd(28), String(r.n).padStart(8), String(r.with_phone).padStart(10));
const t = (await db.runAndReadAll('SELECT count(*) n, count(phone) p FROM businesses')).getRowObjects()[0];
console.log(`\nTotal unique businesses: ${t.n} (${t.p} with phone). Output in data-pipeline/${OUT}/`);
