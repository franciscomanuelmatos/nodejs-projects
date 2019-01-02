import express from 'express';

import todosController from './todosController';
import usersController from './usersController';

const router = express.Router();

router.use('/todos', todosController);
router.use('/users', usersController);

export default router;
