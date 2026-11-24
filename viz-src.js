// Zdroje obrazu pro vizualizaci: skutečná vyrenderovaná videa ze složky video/
(function () {
  function vid() { var v = document.createElement("video"); v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "auto"; v.style.cssText = "position:fixed;left:-9999px;width:2px;height:2px"; document.body.appendChild(v); return v; }
  function cnv(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  var V = { top: vid(), bot: vid(), ring: vid(), prs: vid(), sev: vid() };
  var C = { k: cnv(1280, 912), r: cnv(2560, 128), p: cnv(3928, 128), s: cnv(1660, 256) };
  function set(v, name) { var src = "video/" + name + ".mp4"; if (v.getAttribute("src") !== src) v.src = src; v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  window.VIZ = {
    canvases: C,
    show: function (s) { set(V.top, "kostka_" + s.k); set(V.bot, "spodek_" + s.k); set(V.ring, "ring_" + s.r); set(V.prs, "prstenec_" + s.r); set(V.sev, "panel-sever_zakladni-grafika"); },
    ready: function () { return V.top.readyState >= 2; },
    update: function () {
      var k = C.k.getContext("2d");
      if (V.top.readyState >= 2) k.drawImage(V.top, 0, 0, 1280, 720);
      if (V.bot.readyState >= 2) k.drawImage(V.bot, 0, 720, 1280, 192);
      [["ring", "r"], ["prs", "p"], ["sev", "s"]].forEach(function (q) { var v = V[q[0]], c = C[q[1]]; if (v.readyState >= 2) c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); });
    }
  };
})();
