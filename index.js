const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    Array.prototype.toMatrix = function (width) {
        return this.reduce(function (rows, key, index) {
            return (
                index % width == 0 ?
                    rows.push([key]) :
                    rows[rows.length - 1].push(key)) && rows;
        }, []);
    }

    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    })

    const page = await browser.newPage();
    await page.goto("https://fundamentus.com.br/resultado.php");

    const data = await page.evaluate(() => {
        const tds = Array.from(document.querySelectorAll('table tr td'))
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

    const header =
        ["papel", "cotacao", "P/L", "P/VP", "PSR", "div.yield",
            "P/ativo", "P/cap.giro", "P/EBIT", "P/ativ_circ.liq",
            "EV/EBIT", "EV/EBITDA", "mrg_ebit", "mrg.Liq",
            "liq.corr", "ROIC", "ROE", "liq.2meses", "patrim.liq",
            "div.brut/patrim", "cresc.rec.5a"
        ];
    const table = data.toMatrix(21);
    table.unshift(header);

    console.log(table[1]);

    const csv = table.map(function (d) {
        return JSON.stringify(d);
    })
        .join('\n')
        .replace(/(^\[)|(\]$)/mg, '');

    fs.writeFile('data.csv', csv, function (err) {
        if (err) return console.log(err);
        console.log("Done!!!");
    });
})();
