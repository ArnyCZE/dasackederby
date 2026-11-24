// přidá identitu v3 do index.html (jednorázově, opakovatelně bezpečné)
const fs = require("fs"); let s = fs.readFileSync("index.html", "utf8");
if (!s.includes("identity.css")) s = s.replace('<link rel="stylesheet" href="led.css?v=1">', '<link rel="stylesheet" href="led.css?v=1">\n<link rel="stylesheet" href="identity.css?v=1">');
if (!s.includes("identity.js")) s = s.replace('<script src="app.js?v=5"></script>', '<script src="app.js?v=5"></script>\n<script src="identity.js?v=1"></script>');
fs.writeFileSync("index.html", s); console.log("index.html identita:", s.includes("identity.css"), s.includes("identity.js"));
