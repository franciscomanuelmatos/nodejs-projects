import request from 'supertest';
import { ObjectID } from 'mongodb';

import app from '../../server';

import Todo from '../../models/TodoModel';

const todos = [{
  _id: new ObjectID(),
  text: "First test",
  completed: true,
  completedAt: 3332
}, {
  _id: new ObjectID(),
  text: "Second test"
}];

const port = process.env.PORT;
let server;

beforeEach(async (done) => {
  server = await app.listen(port);
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

afterEach(async () => {
  await server.close();
});

afterAll(async () => {
  await Todo.remove({});
});

describe('POST /todos', () => {
  const endpoint = '/todos';
  it('should create a new todo', (done) => {
    const text = 'Test todo text';
    request(server)
      .post(endpoint)
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({ text }).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(server)
      .post(endpoint)
      .send({})
      .expect(400)
      .end((err,res) => {
        if (err) {
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  const endpoint = '/todos';
  it('should return a list with 2 todos', (done) => {
    request(server)
      .get(endpoint)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(server)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 for non-object id', (done) => {
    request(server)
      .get('/todos/123')
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(server)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    request(server)
      .delete(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(todos[0]._id.toHexString()).then((todo) => {
          expect(todo).toBeNull();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 for non-object id', (done) => {
    request(server)
      .delete('/todos/123')
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });true

  it('should return 404 if todo not found', (done) => {
    request(server)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('PATCH /:id', () => {
  it('should update the todo', (done) => {
    request(server)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
      .send({ completed: true })
      .expect(200)
      .expect((res) => {
        const { todo } = res.body;
        expect(todo._id).toBe(todos[1]._id.toHexString());
        expect(todo.completed).toBe(true);
        expect(todo.completedAt).toBeGreaterThan(0);
      })
      .end(done);
  });

  it('it should clear completedAt when todo is not completed', (done) => {
    request(server)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({ completed: false })
      .expect(200)
      .expect((res) => {
        const { todo } = res.body;
        expect(todo._id).toBe(todos[0]._id.toHexString());
        expect(todo.completed).toBe(false);
        expect(todo.completedAt).toBeNull();
      })
      .end(done);
  });
});
