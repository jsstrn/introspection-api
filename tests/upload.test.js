const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Introspection = require('../models/Introspection');
const Category = require('../models/Category');
const Action = require('../models/Action');
const Level = require('../models/Level');
const { actionSeed, levelSeed, categorySeed } = require('./fixtures/seed');

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

  beforeEach(async () => {
    await Action.insertMany(actionSeed);
    await Category.insertMany(categorySeed);
    await Level.insertMany(levelSeed);
  });

  afterEach(async () => {
    await Action.collection.deleteMany({});
    await Category.collection.deleteMany({});
    await Level.collection.deleteMany({});
  });

  describe('[POST] uploading csv file', () => {
    test('should transform CSV file into mongodb documents', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data.csv`)
        .expect(201);

      const results = await Introspection.find();
      const firstResult = await Introspection.findOne({
        email: 'a@thoughtworks.com'
      })
        .populate('categories.category')
        .populate('categories.action')
        .populate('categories.level');
      expect(results).toHaveLength(5);
      expect(res.text).toEqual(
        expect.stringContaining(`👍 Successfully uploaded`)
      );
      expect(firstResult.name).toBe('Aaron Bo');
      expect(firstResult.categories).toHaveLength(8);
      expect(firstResult.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: expect.objectContaining({ name: 'Climate Injustice' }),
            level: expect.objectContaining({ rank: 4, name: 'Activated' }),
            action: expect.arrayContaining([
              expect.objectContaining({ name: 'Would like to deepen' }),
              expect.objectContaining({ name: 'Would like to share' })
            ])
          })
        ])
      );
    });

    test('should reject csv file due to duplicate emails', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data-duplicate.csv`)
        .expect(400);
      expect(res.body.message).toEqual(
        expect.stringMatching(/duplicate key error/i)
      );
    });

    test('should reject files which are not CSV format', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data-excel-format.xlsx`)
        .expect(400);
      expect(res.body.message).toBe('Only CSV files are allowed');
    });

    test('if csv file has new category, it should be created in the categories collection', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data-new-category.csv`)
        .expect(201);

      const categories = await Category.find();
      expect(categories).toHaveLength(9);
      expect(categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Test New Category' })
        ])
      );
    });

    test('should reject if category level is invalid', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach('file', `${__dirname}/../tests/fixtures/data-invalid-level.csv`)
        .expect(400);
      expect(res.body.message).toEqual(
        expect.stringMatching(/invalid level '5. Do not care'/i)
      );
    });

    test('should reject if category level is empty', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'file',
          `${__dirname}/../tests/fixtures/data-category-field-empty.csv`
        )
        .expect(400);
      expect(res.body.message).toEqual(
        expect.stringMatching(
          /Value cannot be empty for 'Society and Privilege'/i
        )
      );
    });

    test('should reject if action plan value is invalid', async () => {
      const res = await request(app)
        .post('/upload')
        .set('Content-Type', 'multipart/form-data')
        .attach(
          'file',
          `${__dirname}/../tests/fixtures/data-invalid-action.csv`
        )
        .expect(400);
      expect(res.body.message).toEqual(
        expect.stringMatching(/invalid action 'Would like to do nothing'/i)
      );
    });
  });
});
