const t = require("fs").readFileSync("index.html", "utf8"); const i = t.indexOf("<dl>"); console.log(t.slice(i, t.indexOf("</dl>") + 5));
