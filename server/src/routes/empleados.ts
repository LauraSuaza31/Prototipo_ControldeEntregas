import {Router} from 'express';
const router = Router();

import { crearEmpleado, eliminarEmpleado, modificarEmpleado, obtenerEmpleadoPorId, obtenerEmpleados } from '../controllers/empleados.controller';

router.get('/empleados', obtenerEmpleados);
router.get('/empleados/:id', obtenerEmpleadoPorId);
router.post('/empleados', crearEmpleado);
router.put('/empleados/:id', modificarEmpleado);
router.delete('/empleados/:id', eliminarEmpleado);

export default router;