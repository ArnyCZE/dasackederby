const fs = require("fs");
const a = fs.readFileSync("app.js", "utf8"); const i = a.indexOf("getModuleCount"); console.log(a.slice(i - 200, i + 400));
console.log("hraci.jpg:", fs.existsSync("hraci.jpg") && fs.statSync("hraci.jpg").size);
