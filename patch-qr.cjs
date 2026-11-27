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
