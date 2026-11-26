const fs = require("fs"); let s = fs.readFileSync("videa.html", "utf8");
if (!s.includes('"emoji-cam"')) {
  s = s.replace('"kiss-cam": "Kiss cam"', '"emoji-cam": "Emoji cam", "kiss-cam": "Kiss cam"');
  s = s.replace('"vstupne-dobrovolne", "dekujeme"];', '"vstupne-dobrovolne", "emoji-cam", "dekujeme"];');
  s = s.replace('section("Kiss cam a CLAP"', 'section("Kiss cam, Emoji cam a CLAP"');
  s = s.replace('card(v("clap_clap"), "CLAP!", "1920 × 1080")', 'card(v("emoji-cam_emoji-cam"), "Emoji cam", "1920 × 1080") + card(v("clap_clap"), "CLAP!", "1920 × 1080")');
}
// v2: emoji cam = 6 variant, každá s jedním výrazem
if (!s.includes("emoji-cam-usmev")) {
  const EM = [["usmev", "úsměv"], ["jazyk", "vyplazený jazyk"], ["sok", "šok"], ["zamilovany", "zamilovaný"], ["frajer", "frajer"], ["smich", "smích"]];
  s = s.replace('"emoji-cam": "Emoji cam",', EM.map(e => '"emoji-cam-' + e[0] + '": "Emoji cam · ' + e[1] + '",').join(" ") + ' "emoji-cam": "Emoji cam",');
  s = s.replace('"vstupne-dobrovolne", "emoji-cam", "dekujeme"];', '"vstupne-dobrovolne", ' + EM.map(e => '"emoji-cam-' + e[0] + '"').join(", ") + ', "dekujeme"];');
  s = s.replace('card(v("emoji-cam_emoji-cam"), "Emoji cam", "1920 × 1080")', EM.map(e => 'card(v("emoji-cam_emoji-cam-' + e[0] + '"), "Emoji cam · ' + e[1] + '", "1920 × 1080")').join(" + "));
}
fs.writeFileSync("videa.html", s);
console.log("videa.html emoji v2:", s.includes("emoji-cam_emoji-cam-smich"));

// v3: jen 3 zábavné emoji (šílenec, šprt, opička)
{
  let t = fs.readFileSync("videa.html", "utf8");
  if (!t.includes("emoji-cam-sprt")) {
    const OLD = ["usmev", "jazyk", "sok", "zamilovany", "frajer", "smich"];
    const NEW = [["silenec", "šílenec 🤪"], ["sprt", "šprt 🤓"], ["opicka", "opička 🙈"]];
    t = t.replace(OLD.map(k => '"emoji-cam-' + k + '"').join(", "), NEW.map(e => '"emoji-cam-' + e[0] + '"').join(", "));
    t = t.replace(/"emoji-cam-usmev": [^\n]*?"emoji-cam-smich": "[^"]*",/, NEW.map(e => '"emoji-cam-' + e[0] + '": "Emoji cam · ' + e[1] + '",').join(" "));
    t = t.replace(/card\(v\("emoji-cam_emoji-cam-usmev"\).*?card\(v\("emoji-cam_emoji-cam-smich"\), "[^"]*", "1920 × 1080"\)/, NEW.map(e => 'card(v("emoji-cam_emoji-cam-' + e[0] + '"), "Emoji cam · ' + e[1] + '", "1920 × 1080")').join(" + "));
    fs.writeFileSync("videa.html", t);
  }
  console.log("videa.html emoji v3:", t.includes("emoji-cam_emoji-cam-opicka") && !t.includes("emoji-cam-usmev"));
}
