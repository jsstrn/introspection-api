const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const File = require('../models/File');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

describe('Upload a CSV file to MongoDB', () => {
  let mongod;
  let db;
  beforeAll(async () => {
    jest.setTimeout(120000);
    mongod = new MongoMemoryServer();
    const uri = await mongod.getConnectionString();

    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);

    await mongoose.connect(uri, {
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000
    });
    db = mongoose.connection;
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongod.stop();
  });

  it('returns status code 201 when uploading correct file type', async () => {
    await request(app)
      .post('/upload')
      .field('name', 'file')
      .attach('file', `${__dirname}/fixtures/data.csv`)
      .expect(201);
  });

  it('returns status code 400 when uploading incorrect file type', async () => {
    await request(app)
      .post('/upload')
      .field('name', 'file')
      .attach('file', `${__dirname}/fixtures/data.txt`)
      .expect(400);
  });

  it('returns a binary object when uploading is successful', async () => {
    const res = await request(app)
      .post('/upload')
      .field('name', 'file')
      .attach('file', `${__dirname}/fixtures/data.csv`)
      .expect(201);

    expect(res.body.binary).toEqual(expect.any(Object));
  });
});
