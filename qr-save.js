/* Pěkná karta s QR na vstupné + uložení jako obrázek (do galerie / na sdílení) */
(function () {
  var IBAN = "CZ7208000000003191753083", ACC = "3191753083/0800", MSG = "Dasacke derby";
  var btn = document.getElementById("qr-save");
  if (!btn || typeof qrcode === "undefined") return;
  function amount() { var b = document.querySelector(".amounts button.on"); return b ? parseInt(b.getAttribute("data-amount"), 10) || 0 : 0; }
  function rr(x, X, y, w, h, r) { x.beginPath(); x.moveTo(X + r, y); x.arcTo(X + w, y, X + w, y + h, r); x.arcTo(X + w, y + h, X, y + h, r); x.arcTo(X, y + h, X, y, r); x.arcTo(X, y, X + w, y, r); x.closePath(); }
  btn.addEventListener("click", function () {
    var am = amount(), spd = "SPD*1.0*ACC:" + IBAN + (am > 0 ? "*AM:" + am.toFixed(2) : "") + "*CC:CZK*MSG:" + MSG;
    var q = qrcode(0, "M"); q.addData(spd); q.make();
    var W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d");
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#14163f"); g.addColorStop(1, "#000"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = "#ff1f2d"; x.fillRect(0, 0, W, 14); x.fillRect(0, H - 14, W / 2, 14); x.fillStyle = "#fff"; x.fillRect(W / 2, H - 14, W / 2, 14);
    x.textAlign = "center"; x.fillStyle = "#fff";
    x.font = "400 120px 'Bebas Neue', Impact, sans-serif"; x.fillText("DAŠÁCKÉ DERBY", W / 2, 170);
    x.font = "800 40px Inter, Arial, sans-serif"; x.fillStyle = "#ff1f2d"; x.fillText("VSTUPNÉ DOBROVOLNÉ", W / 2, 235);
    var S = 640, X0 = (W - S) / 2, Y0 = 300, pad = 40;
    x.fillStyle = "#fff"; rr(x, X0 - pad, Y0 - pad, S + 2 * pad, S + 2 * pad, 36); x.fill();
    var n = q.getModuleCount(), m = S / n; x.fillStyle = "#000";
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(Math.floor(X0 + k * m), Math.floor(Y0 + r * m), Math.ceil(m), Math.ceil(m));
    x.fillStyle = "#fff"; x.font = "900 64px Inter, Arial, sans-serif";
    x.fillText(am > 0 ? am + " Kč" : "Částka dle vás", W / 2, Y0 + S + 140);
    x.font = "600 36px Inter, Arial, sans-serif"; x.fillStyle = "#c9cede";
    x.fillText("Účet " + ACC + "  ·  zpráva: " + MSG, W / 2, Y0 + S + 200);
    x.fillText("Naskenuj v bankovní aplikaci", W / 2, Y0 + S + 250);
    x.font = "700 30px Inter, Arial, sans-serif"; x.fillStyle = "#8b92a8"; x.fillText("8. AB vs 4. FH  ·  1. 12. 2026  ·  Enteria arena", W / 2, H - 50);
    var a = document.createElement("a"); a.download = "dasacke-derby-vstupne" + (am ? "-" + am + "kc" : "") + ".png"; a.href = c.toDataURL("image/png"); document.body.appendChild(a); a.click(); a.remove();
  });
})();
