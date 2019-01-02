import express from 'express';

import todosController from './todosController';

const router = express.Router();

router.use('/todos', todosController);

export default router;
