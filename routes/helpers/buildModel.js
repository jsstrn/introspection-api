const Category = require('../../models/Category');
const Action = require('../../models/Action');
const Level = require('../../models/Level');
const boom = require('boom');

module.exports = async jsonArray => {
  for (const result of jsonArray) {
    const replaceKeysArray = [
      ['timeStamp', 'Timestamp'],
      ['name', "What's your name?"],
      ['email', 'Email Address'],
      ['office', 'Which office are you from?']
    ];
    for (const [newKey, replacedKey] of replaceKeysArray) {
      result[newKey] = result[replacedKey];
      delete result[replacedKey];
    }
    const objectKeys = Object.keys(result);
    const actionPlanKeys = objectKeys.filter(key => {
      return key.includes('Action Plan');
    });
    let categories = [];
    for (const item of actionPlanKeys) {
      const pattern = /(?<=\[).*(?=\]$)/;
      const amendedKey = item.match(pattern)[0];
      const object = {
        category: amendedKey,
        level: result[amendedKey],
        action: result[item] ? result[item].split(', ') : []
      };
      delete result[amendedKey];
      delete result[item];

      let category = await Category.findOne({ name: object.category });
      if (!category) {
        category = new Category({ name: object.category });
        await category.save();
      }
      if (!object.level) {
        throw boom.badRequest(
          `Value cannot be empty for '${category.name}' for '${result.email}'`
        );
      }
      const levelRankRegex = /([^.]+)/;
      const levelRank = object.level.match(levelRankRegex)[0];

      let level = await Level.findOne({ rank: levelRank });
      if (!level) {
        throw boom.badRequest(
          `invalid level '${object.level}' for '${category.name}' for '${
            result.email
          }'`
        );
      }
      let actions = [];
      for (const item of object.action) {
        const action = await Action.findOne({ name: item });
        if (!action) {
          throw boom.badRequest(
            `invalid action '${item}' for '${category.name}' for '${
              result.email
            }'`
          );
        }
        actions.push(action._id);
      }
      categories.push({
        category: category._id,
        level: level._id,
        action: actions
      });
    }
    result.categories = categories;
  }
};
