const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Action = require('../models/Action');
const { actionSeed } = require('./fixtures/seed');

describe('get action list', () => {
  beforeAll(async () => {
    jest.setTimeout(120000);
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000
    });
    db = mongoose.connection;
    await Action.insertMany(actionSeed);
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('[GET] actions', () => {
    test('should get a list of all actions ', async () => {
      const res = await request(app)
        .get('/actions')
        .expect(200);

      const expectedActions = actionSeed.map(elem => elem.name);

      expect(res.body).toEqual(expect.arrayContaining(expectedActions));
    });
  });
});
