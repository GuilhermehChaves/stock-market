const Table = require('./src/Table');
const table = new Table();

(async () => {
    await table.data();
    table.save('test.csv');
})();
