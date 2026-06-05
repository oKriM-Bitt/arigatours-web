import { Router } from 'express';
import * as contactoController from '../controllers/contactoController.js';

const router = Router();

router.post('/', contactoController.enviarConsulta);

export default router;
