/**
 * scripts/migrateTours.js
 *
 * Migración multilingüe: lee BdTours_es.json, BdTours_en.json y BdTours_ja.json,
 * añade las columnas _en / _ja a la tabla "tours" si no existen, y hace un UPSERT
 * completo con todos los textos de cada idioma.
 *
 * Campos no traducibles (compartidos): id, imagen, galeria, fechas_disponibles.
 * Campos traducibles: ciudad, tematica, titulo, descripcion, duracion, precio,
 *                     punto_encuentro, incluye, no_incluye.
 *
 * Los tours que no tienen traducción EN quedan con NULL → el endpoint hace COALESCE.
 *
 * Uso: node scripts/migrateTours.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import pool from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const JSON_DIR = path.join(__dirname, '..', '..', 'JSON');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(filename) {
  const fullPath = path.join(JSON_DIR, filename);
  console.log(`📂 Leyendo ${fullPath}`);
  return JSON.parse(readFileSync(fullPath, 'utf-8'));
}

/** Indexa un array de tours por su campo "id". */
function indexById(tours) {
  return Object.fromEntries(tours.map((t) => [t.id, t]));
}

// ---------------------------------------------------------------------------
// Paso 1: Añadir columnas _en y _ja si no existen
// ---------------------------------------------------------------------------

const TRANSLATABLE_COLUMNS = [
  'ciudad',
  'tematica',
  'titulo',
  'descripcion',
  'duracion',
  'precio',
  'punto_encuentro',
];
const JSONB_COLUMNS = ['incluye', 'no_incluye'];

async function addMissingColumns(client) {
  console.log('\n🔧 Verificando/añadiendo columnas de idioma…');
  for (const lang of ['en', 'ja']) {
    for (const col of TRANSLATABLE_COLUMNS) {
      await client.query(`
        ALTER TABLE tours
        ADD COLUMN IF NOT EXISTS ${col}_${lang} TEXT
      `);
    }
    for (const col of JSONB_COLUMNS) {
      await client.query(`
        ALTER TABLE tours
        ADD COLUMN IF NOT EXISTS ${col}_${lang} JSONB
      `);
    }
  }
  console.log('✅ Columnas listas.\n');
}

// ---------------------------------------------------------------------------
// Paso 2: UPSERT con los tres idiomas
// ---------------------------------------------------------------------------

async function upsertTour(client, es, en, ja) {
  const {
    id,
    ciudad,
    tematica,
    titulo,
    imagen,
    galeria = [],
    duracion,
    precio,
    puntoEncuentro,
    descripcion,
    incluye = [],
    noIncluye = [],
    fechasDisponibles = [],
  } = es;

  if (!id || !ciudad || !titulo || !imagen || !duracion || !precio || !descripcion) {
    console.warn(`  ⚠️  Tour omitido (campos ES faltantes): ${id ?? 'sin-id'}`);
    return null;
  }

  // Textos EN (null si no hay traducción)
  const ciudadEn          = en?.ciudad            ?? null;
  const tematicaEn        = en?.tematica           ?? null;
  const tituloEn          = en?.titulo             ?? null;
  const descripcionEn     = en?.descripcion        ?? null;
  const duracionEn        = en?.duracion           ?? null;
  const precioEn          = en?.precio             ?? null;
  const puntoEncuentroEn  = en?.puntoEncuentro     ?? null;
  const incluyeEn         = en?.incluye            ?? null;
  const noIncluyeEn       = en?.noIncluye          ?? null;

  // Textos JA (null si no hay traducción)
  const ciudadJa          = ja?.ciudad            ?? null;
  const tematicaJa        = ja?.tematica           ?? null;
  const tituloJa          = ja?.titulo             ?? null;
  const descripcionJa     = ja?.descripcion        ?? null;
  const duracionJa        = ja?.duracion           ?? null;
  const precioJa          = ja?.precio             ?? null;
  const puntoEncuentroJa  = ja?.puntoEncuentro     ?? null;
  const incluyeJa         = ja?.incluye            ?? null;
  const noIncluyeJa       = ja?.noIncluye          ?? null;

  const result = await client.query(
    `INSERT INTO tours (
        id, ciudad, tematica, titulo, imagen, galeria, duracion, precio,
        punto_encuentro, descripcion, incluye, no_incluye, fechas_disponibles,
        ciudad_en,         tematica_en,       titulo_en,          descripcion_en,
        duracion_en,       precio_en,         punto_encuentro_en, incluye_en,    no_incluye_en,
        ciudad_ja,         tematica_ja,       titulo_ja,          descripcion_ja,
        duracion_ja,       precio_ja,         punto_encuentro_ja, incluye_ja,    no_incluye_ja
     ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
        $14,$15,$16,$17,$18,$19,$20,$21,$22,
        $23,$24,$25,$26,$27,$28,$29,$30,$31
     )
     ON CONFLICT (id) DO UPDATE SET
        ciudad              = EXCLUDED.ciudad,
        tematica            = EXCLUDED.tematica,
        titulo              = EXCLUDED.titulo,
        imagen              = EXCLUDED.imagen,
        galeria             = EXCLUDED.galeria,
        duracion            = EXCLUDED.duracion,
        precio              = EXCLUDED.precio,
        punto_encuentro     = EXCLUDED.punto_encuentro,
        descripcion         = EXCLUDED.descripcion,
        incluye             = EXCLUDED.incluye,
        no_incluye          = EXCLUDED.no_incluye,
        fechas_disponibles  = EXCLUDED.fechas_disponibles,
        ciudad_en           = EXCLUDED.ciudad_en,
        tematica_en         = EXCLUDED.tematica_en,
        titulo_en           = EXCLUDED.titulo_en,
        descripcion_en      = EXCLUDED.descripcion_en,
        duracion_en         = EXCLUDED.duracion_en,
        precio_en           = EXCLUDED.precio_en,
        punto_encuentro_en  = EXCLUDED.punto_encuentro_en,
        incluye_en          = EXCLUDED.incluye_en,
        no_incluye_en       = EXCLUDED.no_incluye_en,
        ciudad_ja           = EXCLUDED.ciudad_ja,
        tematica_ja         = EXCLUDED.tematica_ja,
        titulo_ja           = EXCLUDED.titulo_ja,
        descripcion_ja      = EXCLUDED.descripcion_ja,
        duracion_ja         = EXCLUDED.duracion_ja,
        precio_ja           = EXCLUDED.precio_ja,
        punto_encuentro_ja  = EXCLUDED.punto_encuentro_ja,
        incluye_ja          = EXCLUDED.incluye_ja,
        no_incluye_ja       = EXCLUDED.no_incluye_ja,
        updated_at          = NOW()
     RETURNING (xmax = 0) AS was_inserted`,
    [
      // ES (base)
      id,
      ciudad,
      tematica ?? '',
      titulo,
      imagen,
      JSON.stringify(galeria),
      duracion,
      precio,
      puntoEncuentro ?? '',
      descripcion,
      JSON.stringify(incluye),
      JSON.stringify(noIncluye),
      JSON.stringify(fechasDisponibles),
      // EN
      ciudadEn, tematicaEn, tituloEn, descripcionEn,
      duracionEn, precioEn, puntoEncuentroEn,
      incluyeEn  !== null ? JSON.stringify(incluyeEn)  : null,
      noIncluyeEn !== null ? JSON.stringify(noIncluyeEn) : null,
      // JA
      ciudadJa, tematicaJa, tituloJa, descripcionJa,
      duracionJa, precioJa, puntoEncuentroJa,
      incluyeJa  !== null ? JSON.stringify(incluyeJa)  : null,
      noIncluyeJa !== null ? JSON.stringify(noIncluyeJa) : null,
    ]
  );

  return result.rows[0]?.was_inserted;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function migrate() {
  const toursEs = readJson('BdTours_es.json');
  const toursEn = readJson('BdTours_en.json');
  const toursJa = readJson('BdTours_ja.json');

  const indexEn = indexById(toursEn);
  const indexJa = indexById(toursJa);

  console.log(`\n📊 Tours en ES: ${toursEs.length} | EN: ${toursEn.length} | JA: ${toursJa.length}`);
  console.log('🚀 Iniciando migración multilingüe…\n');

  const client = await pool.connect();
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  try {
    await client.query('BEGIN');

    await addMissingColumns(client);

    for (const es of toursEs) {
      const en = indexEn[es.id] ?? null;
      const ja = indexJa[es.id] ?? null;

      if (!en) console.log(`  ℹ️  Sin traducción EN: ${es.id}`);
      if (!ja) console.log(`  ℹ️  Sin traducción JA: ${es.id}`);

      const wasInserted = await upsertTour(client, es, en, ja);

      if (wasInserted === null) {
        errors++;
      } else if (wasInserted) {
        inserted++;
        console.log(`  ✅ Insertado:    ${es.id}`);
      } else {
        updated++;
        console.log(`  🔄 Actualizado:  ${es.id}`);
      }
    }

    await client.query('COMMIT');

    console.log('\n========================================');
    console.log('✅ Migración multilingüe completada:');
    console.log(`   Insertados : ${inserted}`);
    console.log(`   Actualizados: ${updated}`);
    console.log(`   Omitidos   : ${errors}`);
    console.log('========================================\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante la migración, se hizo ROLLBACK:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
