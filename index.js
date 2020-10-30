const Table = require('./src/Table');
const table = new Table();

(async () => {
    await table.fromHtml("https://fundamentus.com.br/resultado.php");
    table.save('data.csv');
})();
