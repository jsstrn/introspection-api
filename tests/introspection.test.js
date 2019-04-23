const request = require('supertest');
const mongoose = require('mongoose');
const passport = require('passport');
const Action = require('../models/Action');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Introspection = require('../models/Introspection');

jest.mock('../authMiddleware');
const isUserAuthenticated = require('../authMiddleware');

isUserAuthenticated.mockImplementation((req, res, next) => next());

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
    await seedIntrospection();
  });

  afterEach(async () => {
    await Action.deleteMany({});

    await Introspection.collection.deleteMany({});
  });

  describe('[GET] requests for all', () => {
    it('should get status 200 & correct values', async () => {
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(function(req, res, next) {
        req.isUserAuthenticated = function() {
          return true;
        };
        req.user = {};
        next();
      });
      app.get('/', function(req, res) {
        if (!req.user || !req.isUserAuthenticated()) {
          return res.send(403);
        }
        res.send(200);
      });
      const res = await request(app)
        .get('/introspection')
        .expect(200);

      expect(res.body).toHaveLength(3);
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
  describe('[GET] request query by email', () => {
    it('should return status 400 for invalid email', async () => {
      const res = await request(app)
        .get('/introspection')
        .query({ email: '123@tw.com' })
        .expect(400);

      expect(res.body.message).toEqual(expect.stringMatching(/invalid email/i));
    });
    it('should return correct instrospection data for a valid email', async () => {
      const res = await request(app)
        .get('/introspection')
        .query({ email: 'abc@tw.com' })
        .expect(200);
      const data = res.body[0];
      expect(data.name).toBe('abc');
      expect(data.email).toBe('abc@tw.com');
      expect(data.office).toBe('Singapore');
      expect(data.categories).toEqual(
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
    it('should return correct instrospection data for a valid email in mixed case', async () => {
      const res = await request(app)
        .get('/introspection')
        .query({ email: 'aBc@Tw.cOm' })
        .expect(200);
      const data = res.body[0];
      expect(data.name).toBe('abc');
      expect(data.email).toBe('abc@tw.com');
      expect(data.office).toBe('Singapore');
      expect(data.categories).toEqual(
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
  describe('[GET] request query by office', () => {
    it('should return status 400 for invalid office', async () => {
      const res = await request(app)
        .get('/introspection')
        .query({ office: 'Taiwan' })
        .expect(400);
      expect(res.body.message).toEqual(
        expect.stringMatching(/invalid office/i)
      );
    });

    it('should return correct introspection data for valid office', async () => {
      const res = await request(app)
        .get('/introspection')
        .query({ office: 'Singapore' })
        .expect(200);
      const data = res.body;
      expect(data).toHaveLength(2);
      expect(data[1]).toEqual(
        expect.objectContaining({
          name: 'def',
          email: 'def@tw.com',
          office: 'Singapore',
          categories: expect.arrayContaining([
            expect.objectContaining({
              category: categorySeed[2].name,
              level: levelSeed[0].rank
            })
          ])
        })
      );
    });
    it('should return correct introspection data for valid office in mixed case', async () => {
      const res = await request(app)
        .get('/introspection')
        .query({ office: 'sInGaPoRe' })
        .expect(200);
      const data = res.body;
      expect(data).toHaveLength(2);
      expect(data[1]).toEqual(
        expect.objectContaining({
          name: 'def',
          email: 'def@tw.com',
          office: 'Singapore',
          categories: expect.arrayContaining([
            expect.objectContaining({
              category: categorySeed[2].name,
              level: levelSeed[0].rank
            })
          ])
        })
      );
    });
  });
});
