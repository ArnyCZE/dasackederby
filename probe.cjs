const fs = require("fs");
for (const f of fs.readdirSync(".").filter(f => /\.(html|js)$/.test(f))) { const s = fs.readFileSync(f, "utf8"); let m, re = /otevření haly|OTEVŘENÍ HALY|Otevření/gi; while ((m = re.exec(s))) console.log(f, JSON.stringify(s.slice(Math.max(0, m.index - 120), m.index + 80))); }
