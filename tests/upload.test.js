const request = require('supertest');
const mongoose = require('mongoose');
const Action = require('../models/Action');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Introspection = require('../models/Introspection');
const { actionSeed } = require('./fixtures/seed');

jest.mock('../authMiddleware');
const isUserAuthenticated = require('../authMiddleware');

describe('Uploading CSV files to MongoDB', () => {
  let mongoServer;
  let db;

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
    await Action.deleteMany({});
    mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(() => {
    isUserAuthenticated.mockReset();
  });

  describe.only('[POST] uploading csv file', () => {
    test('should transform CSV file into mongodb documents', async () => {
      isUserAuthenticated.mockImplementationOnce((req, res, next) => next());
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data.csv`)
        .expect(201);

      const results = await Introspection.find();
      const firstResult = await Introspection.findOne({
        email: 'a@thoughtworks.com'
      }).populate('categories.action');
      expect(results).toHaveLength(5);
      expect(res.text).toEqual(
        expect.stringContaining(`👍 Successfully uploaded`)
      );
      expect(firstResult.name).toBe('Aaron Bo');
      expect(firstResult.categories).toHaveLength(8);

      expect(firstResult.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Climate Injustice',
            level: '4. Activated',
            action: expect.arrayContaining([
              expect.objectContaining({
                name: 'Would like to deepen'
              }),
              expect.objectContaining({
                name: 'Would like to share'
              })
            ])
          })
        ])
      );
    });

    test('should reject csv file due to duplicate emails', async () => {
      isUserAuthenticated.mockImplementationOnce((req, res, next) => next());

      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data-duplicate.csv`)
        .expect(400);
      expect(res.body.message).toEqual(
        expect.stringMatching(/duplicate key error/i)
      );
    });
    test('should reject csv file cause user not authenticated', async () => {
      isUserAuthenticated.mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'unauthorized' });
      });
      // isUserAuthenticated.mockRestore();
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data.csv`)
        .expect(401);
      expect(res.body.message).toEqual(expect.stringMatching(/unauthorized/i));
    });

    test('should reject files which are not CSV format', async () => {
      isUserAuthenticated.mockImplementationOnce((req, res, next) => next());
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data-excel-format.xlsx`)
        .expect(400);
      expect(res.body.message).toBe('Only CSV files are allowed');
    });

    test('if csv file has new category, it should be created in the categories collection', async () => {
      isUserAuthenticated.mockImplementationOnce((req, res, next) => next());
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data-new-category.csv`)
        .expect(201);

      let newData = await Introspection.findOne();
      expect(newData.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Test New Category' })
        ])
      );
    });
  });
});
