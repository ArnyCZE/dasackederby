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

// Arnošt 27. 11. 14:30: harmonogram podle plakátku + reel z Instagramu (oficiální vložení) + videa: tombola místo nafukovaček
{
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace("<h3>Příchod diváků</h3><p>19:00–19:30</p>", "<h3>Otevření haly</h3><p>19:00–19:30</p>");
  t = t.replace("20:15–20:20 · vystoupení krasobruslařů", "20:15–20:20 · krasobruslařské vystoupení");
  t = t.replace("<h3>Slavnostní vyhlášení vítěze a konec</h3>", "<h3>Vyhlášení vítězů</h3>");
  if (!t.includes("ig-reel")) {
    const reel = '\n  <section class="section" id="video">\n    <div class="container">\n      <div class="sec-head"><p class="kicker">Instagram</p><h2>Podívej se na upoutávku</h2><p class="lead">Pusť si reel z našeho Instagramu. Dej like a sdílej, ať se o derby dozví celý Dašák.</p></div>\n      <div class="ig-reel"><blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DgPZsuSuLuz/" data-instgrm-version="14" style="background:#fff;border:0;border-radius:14px;margin:0 auto;max-width:540px;min-width:280px;width:100%"><a href="https://www.instagram.com/reel/DgPZsuSuLuz/" target="_blank" rel="noopener">Přehrát reel na Instagramu</a></blockquote></div>\n    </div>\n  </section>\n';
    t = t.replace('  <section class="section" id="program">', reel + '\n  <section class="section" id="program">');
    t = t.replace('<a href="#program">Program</a>', '<a href="#video">Video</a>\n      <a href="#program">Program</a>');
    t = t.replace('</head>', '<style>.ig-reel{display:flex;justify-content:center}.ig-reel iframe{max-width:540px!important;border-radius:14px!important}</style>\n</head>');
    t = t.replace('<script src="app.js', '<script async src="https://www.instagram.com/embed.js"></script>\n<script src="app.js');
  }
  fs.writeFileSync("index.html", t);
  let v = fs.readFileSync("videa.html", "utf8");
  v = v.replace(/prestavka-nafukovacky/g, "prestavka-tombola").replace("Přestávka · nafukovačky", "Přestávka · tombola");
  fs.writeFileSync("videa.html", v);
  console.log("harmonogram:", t.includes("Otevření haly"), t.includes("Vyhlášení vítězů"), "| reel:", t.includes("DgPZsuSuLuz"), "| videa tombola:", v.includes("prestavka-tombola"));
}
