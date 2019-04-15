const Category = require('../../models/Category');
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
  { rank: '1. Open' },
  { rank: '2. Informed' },
  { rank: '3. Engaged' },
  { rank: '4. Activated' }
];

const seedIntrospection = async () => {
  await Action.collection.deleteMany({});
  const action0 = await Action.create({ name: actionSeed[0].name });
  const action1 = await Action.create({ name: actionSeed[1].name });
  const category1 = {
    level: levelSeed[0].rank,
    name: categorySeed[0].name,
    action: [action0._id]
  };
  const category2 = {
    level: levelSeed[1].rank,
    name: categorySeed[1].name,
    action: [action0._id]
  };
  const category3 = {
    level: levelSeed[0].rank,
    name: categorySeed[2].name,
    action: [action0._id, action1._id]
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
