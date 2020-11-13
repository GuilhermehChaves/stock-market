const puppeteer = require('puppeteer');
const fs = require('fs');

Array.prototype.toMatrix = function (width) {
    return this.reduce(function (rows, key, index) {
        return (
            index % width == 0 ?
                rows.push([key]) :
                rows[rows.length - 1].push(key)) && rows;
    }, []);
}

class Table {
    async fromHtml(url, visible = false) {
        try {
            let browser = await puppeteer.launch({
                headless: !visible,
                defaultViewport: null,
            });

            const page = await browser.newPage();
            await page.goto(url);

            const data = await page.evaluate(() => {
                const tds = Array.from(document.querySelectorAll('table tr td'));
                return tds.map(td => {
                    var divide = false;

                    var value = td.innerText;
                    if (/[a-zA-Z]/g.test(value)) return value;

                    const percent = new RegExp("%", "g");
                    if (percent.test(value)) {
                        value = value.replace(percent, "");
                        divide = true;
                    };

                    value = value.replace(/\./g, "");
                    const pos = value.lastIndexOf(',');
                    const number = Number(value.substring(0, pos) + "." + value.substring(pos + 1));
                    return divide ? number / 100 : number; //Transforma o valor em % para decimal;
                })
            });

            await browser.close();

            var table = data.toMatrix(21);
            for (let i = 0; i < table.length; i++) {
                const date = new Date();
                // date.setDate(date.getDate() - 1);
                table[i].push(date);
            }

            this.csv = this.parse(table);
            this.content = table;
        } catch (e) {
           return process.kill();
        }
    }

    parse(content) {
        var csv = content.map(function (d) {
            return JSON.stringify(d);
        });

        return csv.join('\n').replace(/(^\[)|(\]$)/mg, '') + '\n';
    }

    save(filename) {
        fs.writeFile(filename, this.csv, { flag: "a+" }, function (err) {
            if (err) return console.log(err);
            console.log("Done!!!");
        });
    }
}

module.exports = Table;