import { Router, json } from 'express';
import { getAllUsers } from '../controller/UserController.js';

const router = Router();

router.use(json());

router.get('/', getAllUsers);

export default router;
