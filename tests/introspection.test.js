const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Introspection = require('../models/Introspection');
const Category = require('../models/Category');
const Action = require('../models/Action');
const Level = require('../models/Level');
const {
  actionSeed,
  levelSeed,
  categorySeed,
  seedIntrospection
} = require('./fixtures/seed');

describe('Get Introspections', () => {
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
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Action.insertMany(actionSeed);
    await Category.insertMany(categorySeed);
    await Level.insertMany(levelSeed);
    await seedIntrospection();
  });

  afterEach(async () => {
    await Action.collection.deleteMany({});
    await Category.collection.deleteMany({});
    await Level.collection.deleteMany({});
    await Introspection.collection.deleteMany({});
  });

  describe('[GET] requests for all', () => {
    it('should get 200 on introspection route', async () => {
      await request(app)
        .get('/introspection')
        .expect(200);
    });
    it('expect on introspection route', async () => {
      const res = await request(app)
        .get('/introspection')
        .expect(200);

      expect(res.body).toHaveLength(2);
      const result1 = res.body[0];
      expect(result1.name).toBe('abc');
      expect(result1.email).toBe('abc@tw.com');
      expect(result1.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: categorySeed[0].name,
            level: levelSeed[0].rank,
            action: [actionSeed[0].name]
          }),
          expect.objectContaining({
            category: categorySeed[2].name,
            level: levelSeed[0].rank,
            action: expect.arrayContaining([
              actionSeed[0].name,
              actionSeed[1].name
            ])
          })
        ])
      );
    });
  });
});
