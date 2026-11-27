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
