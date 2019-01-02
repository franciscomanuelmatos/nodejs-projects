import { existsSync, mkdirSync } from 'fs';
import morgan from 'morgan';
import { join } from 'path';
import rfs from 'rotating-file-stream';

import app from './server/server';

const logDirectory = join(__dirname, 'logs');

// ensure log directory exists
existsSync(logDirectory) || mkdirSync(logDirectory);

// create a rotating write stream
var accessLogStream = rfs('access.log', {
    size:     '10M',  // rotate every 10 MegaBytes written
    interval: '1d',   // rotate daily
    compress: 'gzip', // compress rotated files
    path: logDirectory
});

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

const port = process.env.PORT;

app.listen(port);
