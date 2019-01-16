import express from 'express';
import _ from 'lodash';

import User from '../models/UserModel';
import authenticate from '../middleware/authenticate';

const router = express.Router();

router.post('/', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  const user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.get('/me', authenticate, (req, res) => {
  res.send(req.user);
})

export default router;