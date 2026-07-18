const snapshot = require('./service-only.snapshot.json');

const getInitialData = () => JSON.parse(JSON.stringify(snapshot));

module.exports = { getInitialData };
