const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Introspect = require('../models/Introspect');

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
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('[POST] uploading csv file', () => {
    test('should save CSV file as binary', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data.csv`)
        .expect(201);

      const data = res.text;
      const results = await Introspect.find();
      const firstResult = await Introspect.findOne({
        email: 'a@thoughtworks.com'
      });
      expect(results.length).toBe(5);
      expect(data).toEqual(expect.stringContaining(`👍 Successfully uploaded`));
      expect(firstResult.name).toBe('Aaron Bo');
      expect(firstResult.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ category: 'Society and Privilege' })
        ])
      );
    });

    test('should reject csv file due to duplicate emails', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data-duplicate.csv`)
        .expect(500);
    });

    test('should reject files which are not CSV format', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data-excel-format.xlsx`)
        .expect(400);
    });
  });
});
