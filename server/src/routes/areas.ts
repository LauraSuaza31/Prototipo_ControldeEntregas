import {Router} from 'express';
const router = Router();

import { crearArea, eliminarArea, modificarArea, obtenerAreaPorId, obtenerAreas } from '../controllers/areas.controller';

router.get('/areas', obtenerAreas );
router.get('/areas/:id', obtenerAreaPorId);
router.post('/areas', crearArea);
router.put('/areas/:id', modificarArea);
router.delete('/areas/:id', eliminarArea);

export default router;