// úpravy index.html (opakovatelně bezpečné)
const fs = require("fs"); let s = fs.readFileSync("index.html", "utf8");
if (!s.includes("identity.css")) s = s.replace('<link rel="stylesheet" href="led.css?v=1">', '<link rel="stylesheet" href="led.css?v=1">\n<link rel="stylesheet" href="identity.css?v=1">');
if (!s.includes("identity.js")) s = s.replace('<script src="app.js?v=5"></script>', '<script src="app.js?v=5"></script>\n<script src="identity.js?v=1"></script>');
// Arnošt 24. 11.: bufet a grafiku v hale zatím nezveřejňovat (sekce schované, odkazy z menu pryč)
s = s.replace('<section class="section" id="bufet">', '<section class="section" id="bufet" hidden>');
s = s.replace('<section class="section led-sec" id="led">', '<section class="section led-sec" id="led" hidden>');
s = s.replace(/\s*<a href="#bufet">Bufet<\/a>/, "").replace(/\s*<a href="#led">Grafika<\/a>/, "");
fs.writeFileSync("index.html", s);
console.log("identita:", s.includes("identity.css"), "| bufet skrytý:", s.includes('id="bufet" hidden'), "| grafika skrytá:", s.includes('id="led" hidden'), "| v menu:", s.includes('href="#bufet"'), s.includes('href="#led"'));
