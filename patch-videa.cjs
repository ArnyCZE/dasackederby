const fs = require("fs"); let s = fs.readFileSync("videa.html", "utf8");
if (!s.includes('"emoji-cam"')) {
  s = s.replace('"kiss-cam": "Kiss cam"', '"emoji-cam": "Emoji cam", "kiss-cam": "Kiss cam"');
  s = s.replace('"vstupne-dobrovolne", "dekujeme"];', '"vstupne-dobrovolne", "emoji-cam", "dekujeme"];');
  s = s.replace('section("Kiss cam a CLAP"', 'section("Kiss cam, Emoji cam a CLAP"');
  s = s.replace('card(v("clap_clap"), "CLAP!", "1920 × 1080")', 'card(v("emoji-cam_emoji-cam"), "Emoji cam", "1920 × 1080") + card(v("clap_clap"), "CLAP!", "1920 × 1080")');
  fs.writeFileSync("videa.html", s);
}
console.log("videa.html emoji:", s.includes("emoji-cam_emoji-cam"));
