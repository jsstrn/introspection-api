const Action = require('../models/Action');
const actions = require('./actions');

module.exports = async () => {
  await Action.deleteMany({});
  await Action.insertMany(actions);
};
