const dev = 'localhost:7890';
const auto = 'auto-introspection-api';
const test = 'test-introspection-api';
const staging = 'staging-introspection-api';

//backend hosts
const behosts = {
  [dev]: `http://localhost:7890`,
  [auto]: `https://${auto}.herokuapp.com`,
  [test]: `https://${test}.herokuapp.com`,
  [staging]: `https://${staging}.herokuapp.com`
};

//frontend hosts
const fehosts = {
  [dev]: 'http://localhost:3000',
  [auto]: 'https://auto-introspection-app.netlify.com',
  [test]: 'https://qa-introspection-app.netlify.com',
  [staging]: 'https://staging-introspection-app.netlify.com'
};

const isValidBEHost = host => Object.keys(behosts).indexOf(host) !== -1;

module.exports = { isValidBEHost, fehosts, behosts };
