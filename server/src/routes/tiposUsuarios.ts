import {Router} from 'express';
const router = Router();

import { crearTipoUsuario, eliminarTipoUsuario, modificarTipoUsuario, obtenerTipoUsuarioPorId, obtenerTipoUsuario } from '../controllers/tipoUsuarios.controller';

router.get('/tiposUsuarios', obtenerTipoUsuario );
router.get('/tiposUsuarios/:id', obtenerTipoUsuarioPorId);
router.post('/tiposUsuarios', crearTipoUsuario);
router.put('/tiposUsuarios/:id', modificarTipoUsuario);
router.delete('/tiposUsuarios/:id', eliminarTipoUsuario);

export default router;