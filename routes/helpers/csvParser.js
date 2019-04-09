const csv = require('csvtojson');

module.exports = async (buffer) => {
    const data = buffer.binary.toString('utf8');
    const jsonArray = await csv().fromString(data);
    return jsonArray;
}