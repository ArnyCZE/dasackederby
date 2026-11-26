const fs = require("fs"); let s = fs.readFileSync("videa.html", "utf8");
if (!s.includes('"emoji-cam"')) {
  s = s.replace('"kiss-cam": "Kiss cam"', '"emoji-cam": "Emoji cam", "kiss-cam": "Kiss cam"');
  s = s.replace('"vstupne-dobrovolne", "dekujeme"];', '"vstupne-dobrovolne", "emoji-cam", "dekujeme"];');
  s = s.replace('section("Kiss cam a CLAP"', 'section("Kiss cam, Emoji cam a CLAP"');
  s = s.replace('card(v("clap_clap"), "CLAP!", "1920 × 1080")', 'card(v("emoji-cam_emoji-cam"), "Emoji cam", "1920 × 1080") + card(v("clap_clap"), "CLAP!", "1920 × 1080")');
}
// v3: jen 3 zábavné emoji (šílenec, šprt, opička) – přímo ze stavu v1
const NEW = [["silenec", "šílenec 🤪"], ["sprt", "šprt 🤓"], ["opicka", "opička 🙈"]];
if (!s.includes("emoji-cam-sprt")) {
  s = s.replace('"emoji-cam": "Emoji cam",', NEW.map(e => '"emoji-cam-' + e[0] + '": "Emoji cam · ' + e[1] + '",').join(" ") + ' "emoji-cam": "Emoji cam",');
  s = s.replace('"vstupne-dobrovolne", "emoji-cam", "dekujeme"];', '"vstupne-dobrovolne", ' + NEW.map(e => '"emoji-cam-' + e[0] + '"').join(", ") + ', "dekujeme"];');
  s = s.replace('card(v("emoji-cam_emoji-cam"), "Emoji cam", "1920 × 1080")', NEW.map(e => 'card(v("emoji-cam_emoji-cam-' + e[0] + '"), "Emoji cam · ' + e[1] + '", "1920 × 1080")').join(" + "));
}
// úklid zbytků šesti starých variant v popiscích
s = s.replace(/ "emoji-cam-(usmev|jazyk|sok|zamilovany|frajer|smich)": "[^"]*",/g, "");
fs.writeFileSync("videa.html", s);
console.log("videa.html emoji 3:", s.includes("emoji-cam_emoji-cam-opicka") && !s.includes("emoji-cam-usmev"));
