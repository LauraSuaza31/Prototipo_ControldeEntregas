import {Router} from 'express';
const router = Router();

import { crearCargo, eliminarCargo, modificarCargo, obtenerCargoPorId, obtenerCargos } from '../controllers/cargos.controller';

router.get('/cargos', obtenerCargos );
router.get('/cargos/:id', obtenerCargoPorId);
router.post('/cargos', crearCargo);
router.put('/cargos/:id', modificarCargo);
router.delete('/cargos/:id', eliminarCargo);

export default router;