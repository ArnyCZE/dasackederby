// Hlasování o hráči zápasu: sekce se ukáže až od začátku zápasu (1. 12. 2026 19:30 SEČ) do konce dne
(function () {
  var FORM = "https://forms.gle/XE8BTYwM4pDSrPCr7";
  var OD = Date.UTC(2026, 11, 1, 18, 30), DO = Date.UTC(2026, 11, 1, 23, 0);
  var q = location.search.indexOf("hlasovani=1") >= 0; // náhled: ?hlasovani=1
  var sec = document.getElementById("hlasovani"), link = document.getElementById("nav-hlasovani");
  if (!sec) return;
  function kresli() {
    var box = document.getElementById("vote-qr");
    if (!box || box.firstChild || typeof qrcode !== "function") return;
    var qr = qrcode(0, "M"); qr.addData(FORM); qr.make();
    var n = qr.getModuleCount(), d = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += "M" + c + " " + r + "h1v1h-1z";
    box.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ' + (n + 4) + " " + (n + 4) + '" shape-rendering="crispEdges" role="img" aria-label="QR kód hlasování"><rect x="-2" y="-2" width="' + (n + 4) + '" height="' + (n + 4) + '" fill="#fff"/><path fill="#000" stroke="none" d="' + d + '"/></svg>';
  }
  function tik() {
    var t = Date.now(), on = q || (t >= OD && t < DO);
    sec.hidden = !on; if (link) link.hidden = !on;
    if (on) kresli();
  }
  tik(); setInterval(tik, 30000);
})();
