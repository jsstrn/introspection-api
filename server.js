/* eslint-disable no-console */

const app = require('./app');
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Action = require('./models/Action');
const Level = require('./models/Level');
const Introspection = require('./models/Introspection');
const {
  actionSeed,
  levelSeed,
  categorySeed,
  seedIntrospection
} = require('./tests/fixtures/seed');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const port = process.env.PORT;
const mongodbUri = process.env.MONGODB_URI;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(mongodbUri);
const db = mongoose.connection;

db.on('error', err => {
  console.error('⛈  Unable to connect to database', err);
});

db.on('connected', err => {
  console.log('☀️  Successfully connected to the database', err);
});

db.once('connected', () => {
  app.listen(port, async () => {
    if (process.env.NODE_ENV === 'production') {
      console.log(`Server is running on Heroku with port number ${port}`);
    } else {
      await Introspection.deleteMany({});
      await Action.deleteMany({});
      await Category.deleteMany({});
      await Level.deleteMany({});
      await Action.insertMany(actionSeed);
      await Category.insertMany(categorySeed);
      await Level.insertMany(levelSeed);
      await seedIntrospection();
      console.log(`Server is running on http://localhost:${port}`);
    }
  });
});
