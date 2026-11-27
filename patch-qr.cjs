// Arnošt 27. 11.: QR na účet 3191753083/0800, ceny bufetu z webu úplně pryč, odkaz na maturák na nové doméně
const fs = require("fs");
let s = fs.readFileSync("index.html", "utf8");
s = s.replace(/\s*<section class="section" id="bufet"[\s\S]*?<\/section>/, "");
s = s.replace(/https:\/\/maturak\.virtuos\.tech/g, "https://maturak.gypce.cz");
s = s.replace('app.js?v=5', 'app.js?v=6');
fs.writeFileSync("index.html", s);
let a = fs.readFileSync("app.js", "utf8");
a = a.replace('var IBAN = "";', 'var IBAN = "CZ7208000000003191753083";').replace('var ACCOUNT_LABEL = "";', 'var ACCOUNT_LABEL = "3191753083/0800";');
fs.writeFileSync("app.js", a);
console.log("bufet v HTML:", /Kofola|pricelist|id="bufet"/.test(s), "| IBAN:", a.includes("CZ7208000000003191753083"), "| maturák odkaz:", s.includes("maturak.gypce.cz"));

// Arnošt 27. 11. odpoledne: 2. přestávka = vyhlášení tomboly; plakát v hlavičce z originálního SVG
{
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace("20:50–21:00 · závod na nafukovačkách", "20:50–21:00 · vyhlášení tomboly");
  t = t.replace(/src="plakat2\.jpg"/g, 'src="plakat-hq.jpg"');
  fs.writeFileSync("index.html", t);
  console.log("tombola:", t.includes("vyhlášení tomboly"), "| plakát HQ:", t.includes("plakat-hq.jpg"), "| plakát soubor:", fs.existsSync("plakat-hq.jpg"));
}
