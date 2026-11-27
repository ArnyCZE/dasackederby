// Stáhne balík videí (vyrenderovaných pro LED) z Google Drive a rozbalí do složky video/
// + plakát, fotky hráčů, ikony webu (nové logo puk), logo puk 1024 a textura ledu
const fs = require("fs");
const ID = "1ae3Xv1gwvur_YlZGnAbf37lGyJI_i4kL";
const FILES = [["1Kosy9ufuPT-ROMP-YX99KYhiKJGX2F4v", "plakat-hq.jpg"], ["118FBxX3B3ZQjQc9AyFYtDQmZ29EJWPAC", "hraci.jpg"],
  ["1ta6LyGCbI9HkT-8WhQTjrJtCy3FTfX0W", "favicon-512.png"], ["1kUVKT2StqlSZtsfXWcGf0x1AGHg63tys", "apple-touch-icon.png"], ["1XFakNbstiPQxlx9o6cnyfNwuLnTBOhPK", "favicon-32.png"],
  ["1iIaUnax320UMeWcLm0q-Y_s3pnKlCY4P", "logo-puk.png"], ["1D1Ky5GH5Pa-x20qbPaJpRj1tkAXtYql1", "led-textura.jpg"]];
const dl = id => fetch("https://drive.usercontent.google.com/download?id=" + id + "&export=download&confirm=t").then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.arrayBuffer(); }).then(a => Buffer.from(a));
(async () => {
  const b = await dl(ID);
  const n = b.readUInt32BE(0), list = JSON.parse(b.subarray(4, 4 + n).toString());
  fs.mkdirSync("video", { recursive: true });
  let o = 4 + n;
  for (const it of list) { fs.writeFileSync("video/" + it.name, b.subarray(o, o + it.size)); o += it.size; }
  fs.writeFileSync("video/videa.json", JSON.stringify(list));
  console.log("rozbaleno", list.length, "videí");
  for (const [id, f] of FILES) {
    const p = await dl(id);
    const ok = f.endsWith(".png") ? p.subarray(1, 4).toString() === "PNG" : (p[0] === 0xff && p[1] === 0xd8);
    if (!ok) throw new Error(f + " má špatný formát");
    fs.writeFileSync(f, p); console.log(f, Math.round(p.length / 1024), "kB");
  }
})().catch(e => { console.error("CHYBA", e.message); process.exit(1); });
