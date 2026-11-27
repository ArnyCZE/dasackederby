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

// Arnošt 27. 11.: soupisky (1. formace) a slova kapitánů z Instagramu @hokejdasak
{
  let t = fs.readFileSync("index.html", "utf8");
  const team = (names, quote, who) => '<ul class="roster">' + names.map(n => "<li>" + n + "</li>").join("") + '</ul><p class="roster-note">1. formace</p>' +
    '<blockquote class="cap-quote"><p>„' + quote + '“</p><cite>' + who + '</cite></blockquote>';
  const AB = team(["Václav Kocourek (C)", "Veselý", "Lazarák", "Kučera", "Korel", "Smolík"],
    "Čeká nás těžký zápas, ale jdeme do něj jako jeden tým. 4. FH má špičkového gólmana, ale s naší ofenzívou to nebude mít lehké.", "Václav Kocourek, kapitán 8. AB");
  const FH = team(["Prokop Janovský (C)", "Šmerdová (A)", "Čichovský", "Borovec", "Müller", "Voženílek"],
    "Do zápasu proti 8. AB nejdeme jako favorité, ale právě to nám dává šanci všechny překvapit. Každou příležitost chceme proměnit a odejít s výhrou.", "Prokop Janovský, kapitán 4. FH");
  let n = 0;
  t = t.replace(/<ul class="roster"><li class="tba">Soupiska bude zveřejněna před zápasem<\/li><\/ul>/g, () => (n++ === 0 ? AB : FH));
  if (!t.includes(".cap-quote{")) t = t.replace("</head>", '<style>.roster-note{margin:.4rem 0 0;font-size:.8rem;opacity:.6;text-transform:uppercase;letter-spacing:.08em}.cap-quote{margin:1.1rem 0 0;padding:.9rem 1rem;border-left:4px solid #ff1f2d;background:rgba(255,255,255,.05)}.cap-quote p{margin:0;font-size:.95rem;line-height:1.5}.cap-quote cite{display:block;margin-top:.5rem;font-style:normal;font-weight:700;font-size:.85rem;opacity:.8}</style>\n</head>');
  fs.writeFileSync("index.html", t);
  console.log("soupisky:", t.includes("Kocourek (C)"), t.includes("Janovský (C)"));
}

// Soupisky po formacích (doplňovat sem, až Arnošt pošle další)
{
  const TEAMS = {
    AB: { f: [["1. formace", ["Václav Kocourek (C)", "Veselý", "Lazarák", "Kučera", "Korel", "Smolík"]]],
      q: ["Čeká nás těžký zápas, ale jdeme do něj jako jeden tým. 4. FH má špičkového gólmana, ale s naší ofenzívou to nebude mít lehké.", "Václav Kocourek, kapitán 8. AB"] },
    FH: { f: [["1. formace", ["Prokop Janovský (C)", "Šmerdová (A)", "Čichovský", "Borovec", "Müller", "Voženílek"]],
              ["3. formace", ["Valeš", "Komers", "Herink", "Nimrichtr", "Svatoš"]]],
      q: ["Do zápasu proti 8. AB nejdeme jako favorité, ale právě to nám dává šanci všechny překvapit. Každou příležitost chceme proměnit a odejít s výhrou.", "Prokop Janovský, kapitán 4. FH"] }
  };
  const html = T => T.f.map(([n, l]) => '<p class="roster-note">' + n + '</p><ul class="roster">' + l.map(x => "<li>" + x + "</li>").join("") + "</ul>").join("") +
    '<blockquote class="cap-quote"><p>„' + T.q[0] + '“</p><cite>' + T.q[1] + "</cite></blockquote>";
  let t = fs.readFileSync("index.html", "utf8"), n = 0;
  t = t.replace(/(?:<p class="roster-note">[^<]*<\/p>)?<ul class="roster">[\s\S]*?<\/blockquote>/g, () => html(n++ === 0 ? TEAMS.AB : TEAMS.FH));
  t = t.replace(".roster-note{margin:.4rem 0 0;", ".roster-note{margin:1rem 0 .3rem;");
  fs.writeFileSync("index.html", t);
  console.log("formace:", n, "týmy | 3. formace FH:", t.includes("Nimrichtr"));
}

// 4. FH 2. formace (Arnošt 27. 11.), jeden hráč zatím tajný
{
  let t = fs.readFileSync("index.html", "utf8");
  if (!t.includes("Outrata")) {
    const f2 = '<p class="roster-note">2. formace</p><ul class="roster"><li>Novák</li><li>Outrata</li><li>Korecký</li><li>Procházka</li><li>???</li></ul>';
    t = t.replace('<p class="roster-note">3. formace</p>', f2 + '<p class="roster-note">3. formace</p>');
  }
  fs.writeFileSync("index.html", t);
  console.log("FH 2. formace:", t.includes("Outrata"));
}

// 8. AB 3. formace (Arnošt 27. 11.), jeden hráč zatím tajný
{
  let t = fs.readFileSync("index.html", "utf8");
  if (!t.includes("Weinzettl")) t = t.replace("<li>Smolík</li></ul>", '<li>Smolík</li></ul><p class="roster-note">3. formace</p><ul class="roster"><li>Weinzettl</li><li>Červinka</li><li>???</li></ul>');
  fs.writeFileSync("index.html", t);
  console.log("AB 3. formace:", t.includes("Weinzettl"));
}

// Pěkná platební karta s QR + tlačítko uložit jako obrázek
{
  let t = fs.readFileSync("index.html", "utf8");
  if (!t.includes("pay-card")) {
    t = t.replace('<div class="qr-card"><div id="qr"></div><p id="qr-note">QR platba</p></div>',
      '<div class="qr-card pay-card"><div class="pay-head"><b>Dašácké derby</b><span>Vstupné dobrovolné</span></div><div id="qr"></div><p id="qr-note">QR platba</p><p class="pay-acc">Účet 3191753083/0800</p><button id="qr-save" type="button">⬇ Uložit QR jako obrázek</button></div>');
    t = t.replace("</head>", '<style>.pay-card{background:linear-gradient(180deg,#14163f,#000);border:1px solid rgba(255,255,255,.14);border-top:6px solid #ff1f2d;border-radius:22px;padding:22px 22px 18px;text-align:center;max-width:380px;box-shadow:0 20px 50px rgba(0,0,0,.5)}.pay-head b{display:block;font-family:"Bebas Neue",Impact,sans-serif;font-weight:400;font-size:2.4rem;line-height:1;color:#fff;letter-spacing:.02em}.pay-head span{display:block;color:#ff1f2d;font-weight:800;font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;margin:.3rem 0 1rem}.pay-card #qr{background:#fff;border-radius:16px;padding:14px;width:100%;max-width:300px;margin:0 auto}.pay-card #qr svg{display:block;width:100%;height:auto}.pay-card #qr-note{color:#fff;font-weight:900;font-size:1.5rem;margin:.9rem 0 .2rem}.pay-acc{color:#c9cede;font-size:.9rem;margin:0 0 1rem}#qr-save{font:inherit;font-weight:800;font-size:.9rem;color:#fff;background:#ff1f2d;border:0;border-radius:999px;padding:.7rem 1.2rem;cursor:pointer}#qr-save:hover{filter:brightness(1.1)}</style>\n</head>');
    t = t.replace('<script src="identity.js', '<script src="qr-save.js?v=1"></script>\n<script src="identity.js');
  }
  fs.writeFileSync("index.html", t);
  console.log("pay-card:", t.includes("pay-card"), "| save:", t.includes("qr-save.js"));
}

// 8. AB 2. formace (Arnošt 27. 11.)
{
  let t = fs.readFileSync("index.html", "utf8");
  if (!t.includes("Bartošová")) t = t.replace('<p class="roster-note">3. formace</p><ul class="roster"><li>Weinzettl</li>', '<p class="roster-note">2. formace</p><ul class="roster"><li>Joska (A)</li><li>Bartošová</li><li>Řezka</li><li>Mrva</li><li>Hilbert</li></ul><p class="roster-note">3. formace</p><ul class="roster"><li>Weinzettl</li>');
  fs.writeFileSync("index.html", t);
  console.log("AB 2. formace:", t.includes("Bartošová"));
}

// Reel: místo skriptu Instagramu (blokují ho prohlížeče s ochranou) přímý přehrávač přes iframe + záložní tlačítko
{
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace(/<div class="ig-reel"><blockquote[\s\S]*?<\/blockquote><\/div>/,
    '<div class="ig-reel"><iframe src="https://www.instagram.com/reel/DgPZsuSuLuz/embed/" title="Upoutávka na Dašácké derby" loading="lazy" allowtransparency="true" allowfullscreen scrolling="no"></iframe></div><p class="ig-fallback"><a class="btn btn-outline" href="https://www.instagram.com/reel/DgPZsuSuLuz/" target="_blank" rel="noopener">Nejde přehrát? Otevřít na Instagramu</a></p>');
  t = t.replace('<script async src="https://www.instagram.com/embed.js"></script>\n', "");
  t = t.replace(".ig-reel iframe{max-width:540px!important;border-radius:14px!important}", ".ig-reel iframe{width:100%;max-width:400px;height:720px;border:0;border-radius:14px;background:#fff}.ig-fallback{text-align:center;margin-top:1rem}");
  fs.writeFileSync("index.html", t);
  console.log("reel iframe:", t.includes("DgPZsuSuLuz/embed/"), "| blockquote pryč:", !t.includes("instagram-media"));
}

// 4. FH realizační tým a náhradníci (Arnošt 27. 11.)
{
  let t = fs.readFileSync("index.html", "utf8");
  if (!t.includes("Nedvěd")) t = t.replace('<li>Svatoš</li></ul>', '<li>Svatoš</li></ul><p class="roster-note">Náhradníci</p><ul class="roster"><li>Komersová</li></ul><p class="roster-note">Trenéři</p><ul class="roster"><li>Nedvěd (hlavní trenér)</li><li>Zeman (asistent)</li></ul>');
  fs.writeFileSync("index.html", t);
  console.log("FH trenéři:", t.includes("Nedvěd"));
}

// Časy: hala otevřena od 19:00, zápas (rozbruslení) od 19:30
{
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace('<p class="ph-when">Úterý 1. 12.<br>Enteria aréna</p>', '<p class="ph-when">Úterý 1. 12.<br>Enteria aréna</p>\n    <p class="ph-times">Otevření haly 19:00 · začátek zápasu 19:30</p>');
  t = t.replace('<div><dt>Začátek</dt><dd>19:00</dd></div>', '<div><dt>Otevření haly</dt><dd>19:00</dd></div>\n            <div><dt>Začátek zápasu</dt><dd>19:30</dd></div>');
  if (!t.includes(".ph-times{")) t = t.replace("</head>", '<style>.ph-times{margin:.5rem 0 0;font-weight:800;font-size:clamp(.95rem,2.2vw,1.2rem);letter-spacing:.06em;text-transform:uppercase;color:#fff}.ph-times::first-line{color:#fff}</style>\n</head>');
  fs.writeFileSync("index.html", t);
  console.log("časy:", t.includes("ph-times"), t.includes("Začátek zápasu"));
}

// 8. AB trenéři (Arnošt 27. 11.)
{
  let t = fs.readFileSync("index.html", "utf8");
  if (!t.includes("Šťastný")) t = t.replace('<li>Červinka</li><li>???</li></ul>', '<li>Červinka</li><li>???</li></ul><p class="roster-note">Trenéři</p><ul class="roster"><li>Šťastný (hlavní trenér)</li><li>Plachý (asistent)</li></ul>');
  fs.writeFileSync("index.html", t);
  console.log("AB trenéři:", t.includes("Šťastný"));
}

// Arnošt: „vstup od 19:00“ místo „otevření haly“
{
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace("Otevření haly 19:00 · začátek zápasu 19:30", "Vstup od 19:00 · začátek zápasu 19:30");
  t = t.replace("<dt>Otevření haly</dt><dd>19:00</dd>", "<dt>Vstup</dt><dd>od 19:00</dd>");
  t = t.replace("<h3>Otevření haly</h3><p>19:00–19:30</p>", "<h3>Vstup do haly</h3><p>od 19:00</p>");
  fs.writeFileSync("index.html", t);
  console.log("vstup od:", t.includes("Vstup od 19:00"));
}

// Arnošt 27. 11. 14:47: pořadí program → zápas → vstupné → Instagram; reel jen jako proklik v Instagram pruhu; účet jen jednou; bez rámečku kolem QR
{
  let t = fs.readFileSync("index.html", "utf8");
  const cut = id => { const re = new RegExp('\\n\\s*<section class="section" id="' + id + '">[\\s\\S]*?</section>\\n'); const m = t.match(re); if (!m) return ""; t = t.replace(m[0], "\n"); return m[0]; };
  cut("video");
  const prog = cut("program");
  if (prog) t = t.replace('\n  <section class="section" id="zapas">', prog.replace(/^\n+/, "\n") + '\n  <section class="section" id="zapas">');
  t = t.replace(/\s*<a href="#video">Video<\/a>/, "");
  t = t.replace('<a href="#zapas">Zápas</a>\n      <a href="#program">Program</a>', '<a href="#program">Program</a>\n      <a href="#zapas">Týmy</a>');
  // Instagram pruh s proklikem na upoutávku
  t = t.replace('<p class="lead">Soupisky, fotky ze zápasu a výsledky.</p>\n      </div>\n      <a class="btn btn-primary" href="https://www.instagram.com/hokejdasak/" target="_blank" rel="noopener"><svg><use href="#i-ig"/></svg>Otevřít Instagram</a>',
    '<p class="lead">Upoutávka, soupisky, fotky ze zápasu a výsledky.</p>\n      </div>\n      <div class="ig-btns"><a class="btn btn-primary" href="https://www.instagram.com/reel/DgPZsuSuLuz/" target="_blank" rel="noopener">▶ Pustit upoutávku</a><a class="btn btn-outline" href="https://www.instagram.com/hokejdasak/" target="_blank" rel="noopener"><svg><use href="#i-ig"/></svg>Sledovat @hokejdasak</a></div>');
  if (!t.includes(".ig-btns{")) t = t.replace("</head>", '<style>.ig-btns{display:flex;gap:.8rem;flex-wrap:wrap}.acc{display:none!important}.pay-card #qr{border:0!important;box-shadow:none!important;padding:10px}.pay-card #qr svg,.pay-card #qr svg *{border:0!important;outline:0!important}.pay-card #qr svg rect[fill="#ffffff"],.pay-card #qr svg rect[fill="white"]{stroke:none!important}</style>\n</head>');
  fs.writeFileSync("index.html", t);
  const pos = id => t.indexOf('id="' + id + '"');
  console.log("pořadí program<zápas<vstupné:", pos("program") < pos("zapas") && pos("zapas") < pos("podpora"), "| video sekce pryč:", !t.includes('id="video"'), "| reel proklik:", t.includes("Pustit upoutávku"));
}

// oprava: řádek s časy se při každém sestavení přidával znovu → nechat právě jeden
{
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace(/\s*<p class="ph-times">[^<]*<\/p>/g, "");
  t = t.replace('<p class="ph-when">Úterý 1. 12.<br>Enteria aréna</p>', '<p class="ph-when">Úterý 1. 12.<br>Enteria aréna</p>\n    <p class="ph-times">Vstup od 19:00 · začátek zápasu 19:30</p>');
  fs.writeFileSync("index.html", t);
  console.log("řádků s časy:", (t.match(/class="ph-times"/g) || []).length, "| otevření haly:", /Otevření haly/.test(t));
}

// QR kreslit vlastním čistým SVG (jen tmavé moduly, žádný rámeček/pozadí z knihovny)
{
  let a = fs.readFileSync("app.js", "utf8");
  if (a.includes("qr.createSvgTag")) {
    a = a.replace('box.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });',
      'var n = qr.getModuleCount(), d = ""; for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += "M" + c + " " + r + "h1v1h-1z";\n    box.innerHTML = \'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \' + n + " " + n + \'" shape-rendering="crispEdges" role="img" aria-label="QR platba"><path fill="#000" d="\' + d + \'"/></svg>\';');
    fs.writeFileSync("app.js", a);
  }
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace(/app\.js\?v=\d+/, "app.js?v=7");
  fs.writeFileSync("index.html", t);
  console.log("čisté QR SVG:", !a.includes("createSvgTag"));
}

// Soupisky jako karty hráčů s fotkou (Arnošt 27. 11.); bez věty o posledním slově
{
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace(" Maturanti se utkají na tři třetiny o pohár a o to hlavní: kdo bude mít na Dašáku poslední slovo.", " Maturanti se utkají na tři třetiny o pohár.");
  const MAP = { cichovsky: 0, janovsky: 1, borovec: 2, smerdova: 3, muller: 4, vozenilek: 5, vesely: 6, kocourek: 7, lazarak: 8, kucera: 9, korel: 10, smolik: 11, vales: 12, komers: 13, herink: 14, nimrichtr: 15, svatos: 16, novak: 17, outrata: 18, korecky: 19, prochazka: 20, weinzettl: 21, cervinka: 22, bartosova: 23, joska: 24, rezka: 25, mrva: 26, hilbert: 27, komersova: 28 };
  const key = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\(.*?\)/g, "").trim().split(/\s+/).pop();
  t = t.replace(/<ul class="roster">([\s\S]*?)<\/ul>/g, (m, inner) => {
    if (inner.includes('class="pl"')) return m;
    const lis = [...inner.matchAll(/<li>([^<]*)<\/li>/g)].map(x => x[1]);
    return '<ul class="roster">' + lis.map(n => {
      const badge = (n.match(/\((C|A)\)/) || [])[1], role = (n.match(/\((hlavní trenér|asistent)\)/) || [])[1];
      const name = n.replace(/\s*\((C|A|hlavní trenér|asistent)\)/, "").trim(), i = MAP[key(name)];
      const ph = n.includes("???") ? '<span class="ph q">?</span>'
        : i != null ? '<span class="ph" style="background-position:' + (i % 6) * 20 + '% ' + Math.floor(i / 6) * 25 + '%"></span>'
        : '<span class="ph n">' + name.split(/\s+/).map(w => w[0]).join("").slice(0, 2) + "</span>";
      return '<li class="pl">' + ph + '<span class="nm">' + (name === "???" ? "Tajný hráč" : name) + (role ? "<small>" + role + "</small>" : "") + "</span>" + (badge ? '<b class="bd">' + badge + "</b>" : "") + "</li>";
    }).join("") + "</ul>";
  });
  if (!t.includes(".pl{")) t = t.replace("</head>", '<style>.team{overflow:visible;clip-path:none!important}.roster{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.6rem}.roster-note{text-align:left}.pl{display:flex;align-items:center;gap:.65rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:.45rem .6rem;border-radius:12px;position:relative;min-width:0}.pl .ph{flex:none;width:46px;height:46px;border-radius:50%;background:url(hraci.jpg) no-repeat;background-size:600% 500%;box-shadow:0 0 0 2px rgba(255,255,255,.35)}.team-a .pl .ph{box-shadow:0 0 0 2px #ff1f2d}.pl .ph.q,.pl .ph.n{background:#1b1e4a;display:grid;place-items:center;font-weight:900;color:#fff}.pl .nm{font-weight:700;font-size:.95rem;line-height:1.15;overflow:hidden;text-overflow:ellipsis}.pl .nm small{display:block;font-weight:500;font-size:.75rem;opacity:.7}.pl .bd{position:absolute;top:-6px;left:36px;background:#ff1f2d;color:#fff;font-size:.7rem;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;box-shadow:0 0 0 2px #0b0c2a}.team-b .pl .bd{background:#fff;color:#10113b}</style>\n</head>');
  fs.writeFileSync("index.html", t);
  console.log("karty hráčů:", (t.match(/class="pl"/g) || []).length, "| poslední slovo:", t.includes("poslední slovo"));
}

// v2 soupisek (Arnošt 27. 11.): jako grafika na Instagramu – formace na ledě, fotky na pozicích, jmenovky
{
  const MAP = { cichovsky: 0, janovsky: 1, borovec: 2, smerdova: 3, muller: 4, vozenilek: 5, vesely: 6, kocourek: 7, lazarak: 8, kucera: 9, korel: 10, smolik: 11, vales: 12, komers: 13, herink: 14, nimrichtr: 15, svatos: 16, novak: 17, outrata: 18, korecky: 19, prochazka: 20, weinzettl: 21, cervinka: 22, bartosova: 23, joska: 24, rezka: 25, mrva: 26, hilbert: 27, komersova: 28 };
  const key = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/\s+/).pop();
  // pořadí na ledě: L, střed, P, obrana L, obrana P, dole
  const T = {
    ab: { cls: "team-a", tag: "Osmileté ročníky", name: "8. AB",
      f: [["Veselý", "Kocourek (C)", "Lazarák", "Kučera", "Korel", "Smolík"], ["Joska (A)", "Bartošová", "Řezka", "Mrva", "Hilbert"], ["Weinzettl", "Červinka", "???"]],
      extra: [["Trenéři", "Šťastný (hlavní), Plachý (asistent)"]],
      q: ["Čeká nás těžký zápas, ale jdeme do něj jako jeden tým. 4. FH má špičkového gólmana, ale s naší ofenzívou to nebude mít lehké.", "Václav Kocourek, kapitán 8. AB"] },
    fh: { cls: "team-b", tag: "Čtyřleté ročníky", name: "4. FH",
      f: [["Čichovský", "Janovský (C)", "Borovec", "Šmerdová (A)", "Müller", "Voženílek"], ["Outrata", "Novák", "Korecký", "Procházka", "???"], ["Komers", "Valeš", "Herink", "Nimrichtr", "Svatoš"]],
      extra: [["Náhradníci", "Komersová"], ["Trenéři", "Nedvěd (hlavní), Zeman (asistent)"]],
      q: ["Do zápasu proti 8. AB nejdeme jako favorité, ale právě to nám dává šanci všechny překvapit. Každou příležitost chceme proměnit a odejít s výhrou.", "Prokop Janovský, kapitán 4. FH"] }
  };
  const POS = [[17, 34], [50, 24], [83, 34], [28, 66], [72, 66], [50, 88]];
  const player = (n, i) => {
    const nm = n.replace(/\s*\(.\)/, ""), b = (n.match(/\((C|A)\)/) || [])[1], ix = MAP[key(nm)];
    const ph = n === "???" ? '<span class="ph q">?</span>' : '<span class="ph" style="background-position:' + (ix % 6) * 20 + "% " + Math.floor(ix / 6) * 25 + '%"></span>';
    return '<div class="rp" style="left:' + POS[i][0] + "%;top:" + POS[i][1] + '%">' + ph + '<span class="tagname">' + nm.toUpperCase() + (b ? " (" + b + ")" : "") + "</span></div>";
  };
  const team = d => '<article class="team ' + d.cls + ' rink-team"><header><span class="tag">' + d.tag + '</span><h3>Tým ' + d.name + "</h3></header>" +
    d.f.map((f, k) => '<div class="rink"><h4>' + (k + 1) + ". formace</h4>" + f.map(player).join("") + "</div>").join("") +
    '<div class="team-extra">' + d.extra.map(e => "<p><b>" + e[0] + ":</b> " + e[1] + "</p>").join("") + "</div>" +
    '<blockquote class="cap-quote"><p>„' + d.q[0] + "“</p><cite>" + d.q[1] + "</cite></blockquote></article>";
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace(/<div class="teams">[\s\S]*<\/article>\s*<\/div>/, '<div class="teams">\n        ' + team(T.ab) + '\n        <div class="vs-big" aria-hidden="true">VS</div>\n        ' + team(T.fh) + "\n      </div>");
  if (!t.includes(".rink{")) t = t.replace("</head>", '<style>.rink-team{padding-bottom:1rem}.rink-team header h3{font-family:"Bebas Neue",Impact,sans-serif;font-weight:400;font-size:2.6rem;letter-spacing:.02em}.team-a.rink-team header h3{color:#ff1f2d}' +
    '.rink{position:relative;aspect-ratio:1/1.02;margin:.9rem 1rem 0;border-radius:16px;overflow:hidden;background-color:#eef1f5;' +
    'background-image:linear-gradient(#d8262f,#d8262f),linear-gradient(#2a5bd7,#2a5bd7),radial-gradient(circle at 50% 12%,transparent 19%,#2a5bd7 19.4%,#2a5bd7 20.2%,transparent 20.6%),radial-gradient(circle at 28% 82%,transparent 15%,#d8262f 15.4%,#d8262f 16.2%,transparent 16.6%),radial-gradient(circle at 72% 82%,transparent 15%,#d8262f 15.4%,#d8262f 16.2%,transparent 16.6%),radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.9),transparent 60%);' +
    'background-size:100% 3px,100% 4px,100% 100%,100% 100%,100% 100%,100% 100%;background-position:0 12%,0 48%,0 0,0 0,0 0,0 0;background-repeat:no-repeat;box-shadow:inset 0 0 40px rgba(0,0,0,.08)}' +
    '.rink h4{position:absolute;left:0;right:0;top:2.5%;margin:0;text-align:center;font:900 clamp(.8rem,1.6vw,1rem)/1 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#111}' +
    '.rp{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;width:34%}' +
    '.rp .ph{width:clamp(52px,9vw,84px);aspect-ratio:1;border-radius:50%;background:url(hraci.jpg) no-repeat;background-size:600% 500%;box-shadow:0 6px 14px rgba(0,0,0,.35)}' +
    '.rp .ph.q{background:#1b1b1b;display:grid;place-items:center;color:#fff;font:900 1.6rem/1 Inter,sans-serif}' +
    '.rp .tagname{margin-top:-8px;position:relative;background:#fff;color:#111;border:2px solid #111;border-radius:999px;padding:.18rem .55rem;font:800 clamp(.6rem,1.1vw,.78rem)/1.1 Inter,sans-serif;letter-spacing:.03em;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,.2)}' +
    '.team-extra{margin:1rem 1rem 0;font-size:.92rem}.team-extra p{margin:.25rem 0}.rink-team .cap-quote{margin:1rem 1rem 0}' +
    '@media(max-width:760px){.rink{margin:.8rem .4rem 0}}</style>\n</head>');
  fs.writeFileSync("index.html", t);
  console.log("led soupisky:", (t.match(/class="rink"/g) || []).length, "formací | hráčů:", (t.match(/class="rp"/g) || []).length);
}

// oprava QR: globální styl ikon (stroke) obtahoval každý čtvereček → černá skvrna
{
  let a = fs.readFileSync("app.js", "utf8");
  a = a.replace('<path fill="#000" d="', '<path fill="#000" stroke="none" style="stroke:none;stroke-width:0" d="');
  fs.writeFileSync("app.js", a);
  let t = fs.readFileSync("index.html", "utf8");
  if (!t.includes("#qr svg path{stroke:none")) t = t.replace("</head>", "<style>#qr svg,#qr svg path{stroke:none!important;stroke-width:0!important;fill:#000}</style>\n</head>");
  t = t.replace(/app\.js\?v=\d+/, "app.js?v=8");
  fs.writeFileSync("index.html", t);
  console.log("QR stroke fix:", a.includes('stroke="none"'));
}

// Citáty kapitánů nahoru nad formace + fotka kapitána (Arnošt 27. 11.)
{
  let t = fs.readFileSync("index.html", "utf8");
  const IDX = { "Václav Kocourek": 7, "Prokop Janovský": 1 };
  t = t.replace(/(<article class="team [^"]*rink-team">\s*<header>[\s\S]*?<\/header>)([\s\S]*?)<blockquote class="cap-quote"><p>([^<]*)<\/p><cite>([^<]*)<\/cite><\/blockquote>/g, (m, head, mid, q, cite) => {
    const who = cite.split(",")[0].trim(), i = IDX[who];
    const ph = i != null ? '<span class="cq-ph" style="background-position:' + (i % 6) * 20 + "% " + Math.floor(i / 6) * 25 + '%"></span>' : "";
    return head + '<blockquote class="cap-quote cq-top">' + ph + '<div><p>' + q + "</p><cite>" + cite + "</cite></div></blockquote>" + mid;
  });
  if (!t.includes(".cq-top{")) t = t.replace("</head>", '<style>.cq-top{display:flex;gap:.9rem;align-items:center;margin:1rem 1rem .2rem!important}.cq-ph{flex:none;width:72px;height:72px;border-radius:50%;background:url(hraci.jpg) no-repeat;background-size:600% 500%;box-shadow:0 0 0 3px #fff}.team-a .cq-ph{box-shadow:0 0 0 3px #ff1f2d}.cq-top div{min-width:0}</style>\n</head>');
  fs.writeFileSync("index.html", t);
  console.log("citáty nahoře:", (t.match(/cq-top/g) || []).length);
}

// LIVE tečka: plynulé pulzování místo skokového blikání
{
  let t = fs.readFileSync("index.html", "utf8");
  if (!t.includes("@keyframes livepulse")) t = t.replace("</head>", '<style>@keyframes livepulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.8)}}.live-tag b::before{animation:livepulse 1.6s ease-in-out infinite!important;will-change:opacity,transform}</style>\n</head>');
  fs.writeFileSync("index.html", t);
  console.log("live plynule:", t.includes("livepulse"));
}

// Klik na 8. AB / 4. FH nahoře → skok na soupisku týmu (+ krátké zvýraznění)
{
  let t = fs.readFileSync("index.html", "utf8");
  t = t.replace('<article class="team team-a rink-team">', '<article class="team team-a rink-team" id="tym-8ab">').replace('<article class="team team-b rink-team">', '<article class="team team-b rink-team" id="tym-4fh">');
  t = t.replace('<span class="a">8. AB</span>', '<a class="a" href="#tym-8ab" title="Soupiska 8. AB">8. AB</a>').replace('<span class="b">4. FH</span>', '<a class="b" href="#tym-4fh" title="Soupiska 4. FH">4. FH</a>');
  if (!t.includes("@keyframes teamflash")) t = t.replace("</head>", '<style>.ph-match a{text-decoration:none;padding:.35rem 1.4rem;transform:skewX(-12deg);font-weight:900;cursor:pointer;transition:filter .2s,transform .2s}.ph-match a.a{background:#ff1f2d;color:#fff}.ph-match a.b{background:#fff;color:#10113b}.ph-match a:hover{filter:brightness(1.12);transform:skewX(-12deg) translateY(-2px)}#tym-8ab,#tym-4fh{scroll-margin-top:90px}@keyframes teamflash{0%{box-shadow:0 0 0 0 rgba(255,31,45,.9)}100%{box-shadow:0 0 0 22px rgba(255,31,45,0)}}#tym-8ab:target,#tym-4fh:target{animation:teamflash 1.2s ease-out 2}@media(max-width:760px){.ph-match a{padding:.3rem .9rem}}</style>\n</head>');
  fs.writeFileSync("index.html", t);
  console.log("prokliky týmů:", t.includes('href="#tym-8ab"'), t.includes('id="tym-4fh"'));
}
