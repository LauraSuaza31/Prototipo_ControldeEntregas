import {Router} from 'express';
const router = Router();

import { obtenerMenus } from '../controllers/menus.controller';

router.get('/menus', obtenerMenus );

export default router;