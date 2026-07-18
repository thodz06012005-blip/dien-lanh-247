const { getInitialData } = require('../seed/initialData');
const { writeDB } = require('../utils/db');

writeDB(getInitialData());
console.log('Mock database reset to service-only snapshot.');
