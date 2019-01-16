import request from 'supertest';

import app from '../../server';

import User from '../../models/UserModel';

const port = process.env.PORT;
let server;

beforeEach(async (done) => {
  server = await app.listen(port);
  User.remove({}).then(() => done());
});

afterEach(async () => {
  await server.close();
});

afterAll(async () => {
  await User.remove({});
});

describe('POST /users', () => {
  it('should create a new User', (done) => {
    const email = 'johndoe@example.com';
    const password = 'abc123';

    request(server)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.find({ email }).then((users) => {
          expect(users.length).toBe(1);
          expect(users[0].email).toBe(email);
          expect(users[0].tokens[0].token).toBeDefined();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create user with invalid email', (done) => {
    const wrongEmail = 'jcd.com';
    const password = 'abc123';

    request(server)
      .post('/users')
      .send({ wrongEmail, password })
      .expect(400)
      .end((err,res) => {
        if (err) {
          return done(err);
        }
        User.find().then((users) => {
          expect(users.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});