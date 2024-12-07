import {Router} from 'express';
const router = Router();

import { crearEquipo, eliminarEquipo, modificarEquipo, obtenerEquipoPorId, obtenerEquipos } from '../controllers/equipos.controller';

router.get('/equipos', obtenerEquipos );
router.get('/equipos/:id', obtenerEquipoPorId);
router.post('/equipos', crearEquipo);
router.put('/equipos/:id', modificarEquipo);
router.delete('/equipos/:id', eliminarEquipo);

export default router;