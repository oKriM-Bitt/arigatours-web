import { Router } from 'express';
import * as blogController from '../controllers/blogController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', blogController.getAll);
router.get('/:id', blogController.getById);
router.post('/', authenticate, blogController.create);
router.put('/:id', authenticate, blogController.update);
router.delete('/:id', authenticate, blogController.remove);

export default router;
