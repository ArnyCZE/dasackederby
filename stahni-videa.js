// Stáhne balík videí (vyrenderovaných pro LED) z Google Drive a rozbalí do složky video/
// + plakát vykreslený z originálního SVG (plakat-hq.jpg) + fotky hráčů (hraci.jpg, sprite 6 sloupců × 160 px)
const fs = require("fs");
const ID = "1ae3Xv1gwvur_YlZGnAbf37lGyJI_i4kL", PLAKAT = "1Kosy9ufuPT-ROMP-YX99KYhiKJGX2F4v", HRACI = "118FBxX3B3ZQjQc9AyFYtDQmZ29EJWPAC";
const dl = id => fetch("https://drive.usercontent.google.com/download?id=" + id + "&export=download&confirm=t").then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.arrayBuffer(); }).then(a => Buffer.from(a));
(async () => {
  const b = await dl(ID);
  const n = b.readUInt32BE(0), list = JSON.parse(b.subarray(4, 4 + n).toString());
  fs.mkdirSync("video", { recursive: true });
  let o = 4 + n;
  for (const it of list) { fs.writeFileSync("video/" + it.name, b.subarray(o, o + it.size)); o += it.size; }
  fs.writeFileSync("video/videa.json", JSON.stringify(list));
  console.log("rozbaleno", list.length, "videí");
  for (const [id, f] of [[PLAKAT, "plakat-hq.jpg"], [HRACI, "hraci.jpg"]]) {
    const p = await dl(id);
    if (p[0] !== 0xff || p[1] !== 0xd8) throw new Error(f + " není JPG");
    fs.writeFileSync(f, p); console.log(f, Math.round(p.length / 1024), "kB");
  }
})().catch(e => { console.error("CHYBA", e.message); process.exit(1); });
