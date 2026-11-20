/* Odpočet do začátku a padající sníh */
(function () {
  var target = new Date("2026-12-01T19:30:00+01:00").getTime();
  var el = { d: document.getElementById("d"), h: document.getElementById("h"), m: document.getElementById("m"), s: document.getElementById("s") };
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var diff = Math.max(0, target - Date.now());
    var t = Math.floor(diff / 1000);
    el.d.textContent = Math.floor(t / 86400);
    el.h.textContent = pad(Math.floor(t / 3600) % 24);
    el.m.textContent = pad(Math.floor(t / 60) % 60);
    el.s.textContent = pad(t % 60);
  }
  tick();
  setInterval(tick, 1000);

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var c = document.getElementById("snow");
  if (!c || reduce) return;
  var ctx = c.getContext("2d"), flakes = [], w, h;
  function size() {
    w = c.width = window.innerWidth; h = c.height = window.innerHeight;
    var n = Math.min(120, Math.round(w * h / 14000));
    flakes = [];
    for (var i = 0; i < n; i++) flakes.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2.2 + .6, v: Math.random() * .6 + .3, a: Math.random() * Math.PI * 2 });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(234,246,255,.75)";
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.v; f.a += .01; f.x += Math.sin(f.a) * .3;
      if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener("resize", size);
  size(); draw();
})();
