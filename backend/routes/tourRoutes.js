import { Router } from 'express';
import * as tourController from '../controllers/tourController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { uploadTourImages } from '../middlewares/upload.js';

const router = Router();

router.get('/', tourController.getAll);
router.get('/:id', tourController.getById);
router.post('/', authenticate, uploadTourImages, tourController.create);
router.put('/:id', authenticate, uploadTourImages, tourController.update);
router.delete('/:id', authenticate, tourController.remove);

export default router;
