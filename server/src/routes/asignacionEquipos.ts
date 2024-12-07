import {Router} from 'express';
const router = Router();

import { crearAsignacionEquipos, eliminarAsignacionEquipos, obtenerAsignacionEquiposPorId, obtenerAsignacionEquipos } from '../controllers/asignacionEquipos.controller';

router.get('/asigequipos', obtenerAsignacionEquipos);
router.get('/asigequipos/:id', obtenerAsignacionEquiposPorId);
router.post('/asigequipos', crearAsignacionEquipos);
router.delete('/asigequipos/:id', eliminarAsignacionEquipos);

export default router;