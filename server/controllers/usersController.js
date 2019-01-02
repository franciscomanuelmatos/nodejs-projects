import express from 'express';
import { ObjectID } from 'mongodb';
import _ from 'lodash';

import User from '../models/UserModel';

const router = express.Router();

router.post('/', (req, res) => {
  const { email, password } = req.body;

  const user = new User({
    email,
    password,
    tokens: [{
      access: 'auth',
      token: 'placeholder'
    }]
  });

  user.save().then((doc) => {
    res.send(doc);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

export default router;