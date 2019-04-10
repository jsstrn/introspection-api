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
        name: amendedKey,
        level: result[amendedKey],
        action: result[item] ? result[item].split(', ') : []
      };
      delete result[amendedKey];
      delete result[item];
      categories.push(object);
    }
    result.categories = categories;
  }
};
