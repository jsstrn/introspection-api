const Category = require('../../models/Category');
const Level = require('../../models/Level');
const Action = require('../../models/Action');
const Introspection = require('../../models/Introspection');
const actionSeed = [
  { name: 'Would like to explore' },
  { name: 'Would like to deepen' },
  { name: 'Would like to share' }
];
const categorySeed = [
  { name: 'Society and Privilege' },
  { name: 'Religious Minorities' },
  { name: 'Diversity and Inclusion' },
  { name: 'Economic Justice' },
  { name: 'Racial Minorities' },
  { name: 'Sexual Orientation and Gender Identity' },
  { name: 'Equitable Tech' },
  { name: 'Climate Injustice' }
];
const levelSeed = [
  { rank: 1, name: 'Open' },
  { rank: 2, name: 'Informed' },
  { rank: 3, name: 'Engaged' },
  { rank: 4, name: 'Activated' }
];

const seedIntrospection = async () => {
  const cat1 = await Category.findOne(categorySeed[0]);
  const cat2 = await Category.findOne(categorySeed[1]);
  const cat3 = await Category.findOne(categorySeed[2]);
  const level1 = await Level.findOne(levelSeed[0]);
  const level2 = await Level.findOne(levelSeed[1]);
  const act1 = await Action.findOne(actionSeed[0]);
  const act2 = await Action.findOne(actionSeed[1]);

  const category1 = { level: level1._id, category: cat1._id, action: act1._id };
  const category2 = { level: level2._id, category: cat2._id, action: act1._id };
  const category3 = {
    level: level1._id,
    category: cat3._id,
    action: [act1._id, act2._id]
  };
  const dummyTw1 = {
    timeStamp: '2019-03-06T02:24:00.000Z',
    name: 'abc',
    email: 'abc@tw.com',
    office: 'Singapore',
    categories: [category1, category3]
  };

  const dummyTw2 = {
    timeStamp: '2019-03-06T02:24:00.000Z',
    name: 'def',
    email: 'def@tw.com',
    office: 'Singapore',
    categories: [category3, category2]
  };

  const dummyTw3 = {
    timeStamp: '2019-03-06T02:24:00.000Z',
    name: 'xyz',
    email: 'xyz@tw.com',
    office: 'Thailand',
    categories: [category1, category2]
  };
  await Introspection.insertMany([dummyTw1, dummyTw2, dummyTw3]);
};
module.exports = { actionSeed, categorySeed, levelSeed, seedIntrospection };
