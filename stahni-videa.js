// Stáhne balík videí (vyrenderovaných pro LED) z Google Drive a rozbalí do složky video/
const fs = require("fs");
const ID = "1ae3Xv1gwvur_YlZGnAbf37lGyJI_i4kL";
(async () => {
  const r = await fetch("https://drive.usercontent.google.com/download?id=" + ID + "&export=download&confirm=t");
  if (!r.ok) throw new Error("HTTP " + r.status);
  const b = Buffer.from(await r.arrayBuffer());
  const n = b.readUInt32BE(0), list = JSON.parse(b.subarray(4, 4 + n).toString());
  fs.mkdirSync("video", { recursive: true });
  let o = 4 + n;
  for (const it of list) { fs.writeFileSync("video/" + it.name, b.subarray(o, o + it.size)); o += it.size; }
  fs.writeFileSync("video/videa.json", JSON.stringify(list));
  console.log("rozbaleno", list.length, "videí");
})().catch(e => { console.error("CHYBA", e.message); process.exit(1); });
