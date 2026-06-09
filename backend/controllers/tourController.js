/**
 * tourController.js  —  MODO JSON LOCAL (sin Neon)
 *
 * Lee los archivos BdTours_es.json / BdTours_en.json / BdTours_ja.json
 * una sola vez al arrancar el servidor (cache en memoria) y sirve las
 * respuestas desde ahí.  El formato de cada objeto es idéntico al que
 * devolvía el modelo con Neon, por lo que el frontend no necesita ningún
 * cambio.
 *
 * Operaciones de escritura (POST / PUT / DELETE) devuelven 503 mientras
 * la BD esté offline.
 *
 * Para volver a Neon: reemplazar este archivo por la versión con Tour.js.
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_DIR  = path.join(__dirname, '..', '..', 'JSON');

// ─── Cache en memoria ────────────────────────────────────────────────────────
// Los tres JSON se leen UNA sola vez cuando Node carga el módulo.
// Ningún request posterior toca el disco.

function loadJson(filename) {
  return JSON.parse(readFileSync(path.join(JSON_DIR, filename), 'utf-8'));
}

const TOURS = {
  es: loadJson('BdTours_es.json'),
  en: loadJson('BdTours_en.json'),
  ja: loadJson('BdTours_ja.json'),
};

// Índice id → tour para búsquedas O(1) en getById
const INDEX = {
  es: Object.fromEntries(TOURS.es.map((t) => [t.id, t])),
  en: Object.fromEntries(TOURS.en.map((t) => [t.id, t])),
  ja: Object.fromEntries(TOURS.ja.map((t) => [t.id, t])),
};

console.log(
  `[tourController] JSON cargado — ES: ${TOURS.es.length} | EN: ${TOURS.en.length} | JA: ${TOURS.ja.length} tours`
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeLang(lang) {
  const l = (lang ?? 'es').toLowerCase();
  return ['es', 'en', 'ja'].includes(l) ? l : 'es';
}

/**
 * Lista completa en el idioma pedido.
 * Itera el ES como fuente master (14 tours) y usa la versión traducida
 * cuando existe; si no, devuelve el tour en ES como fallback.
 * Esto replica el comportamiento COALESCE que teníamos en Neon.
 */
function resolveAll(lang) {
  if (lang === 'es') return TOURS.es;
  return TOURS.es.map((tour) => INDEX[lang][tour.id] ?? tour);
}

/**
 * Tour individual en el idioma pedido, con fallback a ES.
 * Devuelve null si el id no existe en ningún idioma.
 */
function resolveOne(id, lang) {
  return INDEX[lang][id] ?? INDEX.es[id] ?? null;
}

// ─── Handlers de lectura ─────────────────────────────────────────────────────

export function getAll(req, res) {
  try {
    const lang  = normalizeLang(req.query.lang);
    const tours = resolveAll(lang);
    res.json(tours);
  } catch (error) {
    console.error('Error al listar tours:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export function getById(req, res) {
  try {
    const lang = normalizeLang(req.query.lang);
    const tour = resolveOne(req.params.id, lang);

    if (!tour) {
      return res.status(404).json({ error: 'Tour no encontrado' });
    }

    res.json(tour);
  } catch (error) {
    console.error('Error al obtener tour:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// ─── Handlers de escritura (deshabilitados temporalmente) ────────────────────
// La BD está offline. Se devuelve 503 para que el panel de admin muestre
// el error en lugar de colgarse en silencio.

const DB_OFFLINE = {
  error: 'Base de datos temporalmente desconectada. Las operaciones de escritura no están disponibles.',
};

export function create(_req, res) {
  res.status(503).json(DB_OFFLINE);
}

export function update(_req, res) {
  res.status(503).json(DB_OFFLINE);
}

export function remove(_req, res) {
  res.status(503).json(DB_OFFLINE);
}
