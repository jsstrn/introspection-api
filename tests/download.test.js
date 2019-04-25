const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const File = require('../models/File');
const seedFile = require('./fixtures/binary_data.json');
jest.mock('../authMiddleware');
const isUserAuthenticated = require('../authMiddleware');

describe('Downloading CSV file from MongoDB', () => {
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
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const file = new File({ binary: seedFile.binary });
    await file.save();
  });

  describe('[GET] downloading csv file', () => {
    afterEach(() => {
      isUserAuthenticated.mockReset();
    });
    test('should respond with a csv file', async () => {
      isUserAuthenticated.mockImplementationOnce((req, res, next) => next());
      const res = await request(app)
        .get('/download')
        .expect(200);
      expect(res.type).toBe('text/csv');
    });

    test('should not respond cuz unauthorized', async () => {
      isUserAuthenticated.mockImplementationOnce((req, res, next) => {
        res.status(401).json({ message: 'unauthorized' });
      });
      const res = await request(app)
        .get('/download')
        .expect(401);

      expect(res.body.message).toEqual(expect.stringMatching(/unauthorized/i));
    });

    test('should respond with 404 if db has no file', async () => {
      isUserAuthenticated.mockImplementationOnce((req, res, next) => next());
      await File.collection.deleteMany({});
      const res = await request(app)
        .get('/download')
        .expect(404);
      expect(res.body.message).toBe('No CSV file found');
    });
  });
});
