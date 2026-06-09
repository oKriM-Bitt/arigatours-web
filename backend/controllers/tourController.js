import * as Tour from '../models/Tour.js';
import { normalizeLang } from '../models/Tour.js';

const REQUIRED_FIELDS = [
  'id', 'ciudad', 'tematica', 'titulo', 'imagen', 'duracion',
  'precio', 'puntoEncuentro', 'descripcion',
];

/**
 * Resolve the imagen value: uploaded file takes priority over manual text path.
 * Returns a URL-safe path like "uploads/filename.jpg" or the raw text path.
 */
function resolveImagen(body, files) {
  const uploaded = files?.imagenFile?.[0];
  if (uploaded) return `uploads/${uploaded.filename}`;
  return (body.imagen ?? '').trim();
}

/**
 * Resolve galería: uploaded files take priority; otherwise split textarea lines.
 */
function resolveGaleria(body, files) {
  const uploadedGaleria = files?.galeriaFiles ?? [];
  if (uploadedGaleria.length > 0) {
    return uploadedGaleria.map((f) => `uploads/${f.filename}`);
  }
  const raw = body.galeria ?? '';
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return raw.split('\n').map((l) => l.trim()).filter(Boolean);
}

function parseLines(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value.split('\n').map((l) => l.trim()).filter(Boolean);
}

function validateTourBody(body, { requireId = true } = {}) {
  const missing = REQUIRED_FIELDS.filter((field) => {
    if (!requireId && field === 'id') return false;
    return body[field] === undefined || body[field] === null || body[field] === '';
  });

  if (missing.length > 0) {
    return `Campos obligatorios faltantes: ${missing.join(', ')}`;
  }

  return null;
}

export async function getAll(req, res) {
  try {
    const lang = normalizeLang(req.query.lang);
    const tours = await Tour.findAll(lang);
    res.json(tours);
  } catch (error) {
    console.error('Error al listar tours:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getById(req, res) {
  try {
    const lang = normalizeLang(req.query.lang);
    const tour = await Tour.findById(req.params.id, lang);

    if (!tour) {
      return res.status(404).json({ error: 'Tour no encontrado' });
    }

    res.json(tour);
  } catch (error) {
    console.error('Error al obtener tour:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function create(req, res) {
  try {
    const files = req.files ?? {};

    // Enrich body with resolved file paths before validation
    const imagen = resolveImagen(req.body, files);
    const galeria = resolveGaleria(req.body, files);

    const data = {
      ...req.body,
      imagen,
      galeria,
      incluye: parseLines(req.body.incluye),
      noIncluye: parseLines(req.body.noIncluye),
      fechasDisponibles: [],
    };

    const validationError = validateTourBody(data);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existing = await Tour.findById(data.id);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un tour con ese id' });
    }

    const tour = await Tour.create(data);
    res.status(201).json(tour);
  } catch (error) {
    console.error('Error al crear tour:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function update(req, res) {
  try {
    const files = req.files ?? {};

    const imagen = resolveImagen(req.body, files);
    const galeria = resolveGaleria(req.body, files);

    const data = {
      ...req.body,
      imagen,
      galeria,
      incluye: parseLines(req.body.incluye),
      noIncluye: parseLines(req.body.noIncluye),
    };

    const validationError = validateTourBody(data, { requireId: false });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const tour = await Tour.update(req.params.id, data);
    if (!tour) {
      return res.status(404).json({ error: 'Tour no encontrado' });
    }

    res.json(tour);
  } catch (error) {
    console.error('Error al actualizar tour:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await Tour.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Tour no encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar tour:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
