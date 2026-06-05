import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.get('/admin', authenticate, requireRole('admin'), (_req, res) => {
  res.json({ message: 'Ruta protegida para administradores' });
});

export default router;
