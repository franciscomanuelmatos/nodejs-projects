import './config/config';

import bodyparser from 'body-parser';
import express from 'express';

import mongoose from './db/mongoose';
import router from './controllers/index';

const app = express();

app.use(bodyparser.json())
app.use(router);

export default app;

