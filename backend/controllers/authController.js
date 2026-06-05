import bcrypt from 'bcrypt';
import * as Usuario from '../models/Usuario.js';
import { signToken } from '../utils/jwt.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const usuario = await Usuario.findByEmail(email.trim().toLowerCase());

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = signToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function me(req, res) {
  res.json({ usuario: req.user });
}
