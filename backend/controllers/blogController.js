import * as Blog from '../models/Blog.js';

const REQUIRED_FIELDS = [
  'id', 'categoria', 'titulo', 'autor', 'fecha', 'imagen', 'resumen', 'contenido',
];

function validateBlogBody(body, { requireId = true } = {}) {
  const missing = REQUIRED_FIELDS.filter((field) => {
    if (!requireId && field === 'id') return false;
    return body[field] === undefined || body[field] === null || body[field] === '';
  });

  if (missing.length > 0) {
    return `Campos obligatorios faltantes: ${missing.join(', ')}`;
  }

  return null;
}

export async function getAll(_req, res) {
  try {
    const blogs = await Blog.findAll();
    res.json(blogs);
  } catch (error) {
    console.error('Error al listar blogs:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getById(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog no encontrado' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error al obtener blog:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function create(req, res) {
  try {
    const validationError = validateBlogBody(req.body);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existing = await Blog.findById(req.body.id);

    if (existing) {
      return res.status(409).json({ error: 'Ya existe un blog con ese id' });
    }

    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error al crear blog:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function update(req, res) {
  try {
    const validationError = validateBlogBody(req.body, { requireId: false });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const blog = await Blog.update(req.params.id, req.body);

    if (!blog) {
      return res.status(404).json({ error: 'Blog no encontrado' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error al actualizar blog:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await Blog.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Blog no encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar blog:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
