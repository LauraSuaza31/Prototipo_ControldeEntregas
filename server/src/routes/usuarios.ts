import {Router} from 'express';
const router = Router();

import { crearUsuario, eliminarUsuario, modificarUsuario, obtenerUsuarioPorId, obtenerUsuarios, obtenerUsuarioPorNombre, obtenerUsuarioPorEmpleado } from '../controllers/usuarios.controller';

router.get('/usuario', obtenerUsuarios);
router.get('/usuario/:id', obtenerUsuarioPorId);
router.get('/usuarionombre/:nombre', obtenerUsuarioPorNombre);
router.get('/usuarioempleado/:id', obtenerUsuarioPorEmpleado);
router.post('/usuario', crearUsuario);
router.put('/usuario/:id', modificarUsuario);
router.delete('/usuario/:id', eliminarUsuario);

export default router;