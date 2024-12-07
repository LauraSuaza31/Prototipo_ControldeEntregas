import {Router} from 'express';
const router = Router();

import { getUsers } from '../controllers/index.controller';

router.get('/usuarios', getUsers );

export default router;