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

const route = (params = '') => {
  const path = '/categories';
  return `${path}/${params}`;
};

describe.skip('Categories', () => {
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
    await seedIntrospection();
  });

  afterEach(async () => {
    await Introspection.collection.deleteMany({});
  });

  describe('[GET]', () => {
    it('should return 200 & all results', async () => {
      const res = await request(app)
        .get(route())
        .expect(200);
      expect(res.body).toHaveLength(8);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Society and Privilege' }),
          expect.objectContaining({ name: 'Climate Injustice' })
        ])
      );
    });
  });
  describe('[POST]', () => {
    it('should return 201 when creating new category', async () => {
      const res = await request(app)
        .post(route())
        .send({ name: 'New Category' })
        .expect(201);
      expect(res.body).toHaveLength(9);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'New Category' })
        ])
      );
    });
    it('should return 409 when creating category that already exist', async () => {
      const res = await request(app)
        .post(route())
        .send({ name: 'Society and Privilege' })
        .expect(409);
      expect(res.body.message).toEqual(
        expect.stringMatching(/duplicate key error/i)
      );
    });
    it('should return 400 when creating category without name', async () => {
      const res = await request(app)
        .post(route())
        .send({ name: '' })
        .expect(400);
      expect(res.body.message).toEqual(
        expect.stringMatching(/`name` is required/i)
      );
    });
  });
  describe('[PUT]', () => {
    it('should return 201 when updating an existing category', async () => {
      const category = await Category.findOne({
        name: 'Society and Privilege'
      });
      const res = await request(app)
        .put(route(category._id))
        .send({ name: 'Updated Category' })
        .expect(202);
      const updatedCategory = await Category.findById(category._id);
      expect(updatedCategory.name).toBe('Updated Category');
      expect(res.body).toEqual(
        expect.objectContaining({ name: 'Updated Category' })
      );
    });
    it('should return 409 when updating category with name that already exist', async () => {
      const category = await Category.findOne({
        name: 'Society and Privilege'
      });
      const res = await request(app)
        .put(route(category._id))
        .send({ name: 'Religious Minorities' })
        .expect(409);
      expect(res.body.message).toEqual(
        expect.stringMatching(/duplicate key error/i)
      );
    });
    it('should return 400 when updating category without name', async () => {
      const category = await Category.findOne({
        name: 'Society and Privilege'
      });
      const res = await request(app)
        .put(route(category._id))
        .send({ name: '' })
        .expect(400);
      expect(res.body.message).toEqual(
        expect.stringMatching(/`name` is required/i)
      );
    });
  });
  describe('[DELETE]', () => {
    it('should respond with 200 on delete of existing category', async () => {
      const category = await Category.findOne({
        name: 'Society and Privilege'
      });
      const res = await request(app)
        .delete(route(category._id))
        .expect(200);
      const categories = await Category.find();
      expect(categories).toHaveLength(7);
    });
  });
});
