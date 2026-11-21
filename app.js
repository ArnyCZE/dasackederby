/* ===== NASTAVENÍ ===== */
// Číslo účtu pro dobrovolné příspěvky (IBAN bez mezer). Dokud je prázdné, místo QR se ukáže „brzy“.
var IBAN = "";
var ACCOUNT_LABEL = "";            // např. "2203629553/2010" – jen pro zobrazení pod tlačítky
var PAY_MESSAGE = "Podpora skolni hokej";

/* ===== Odpočet ===== */
(function () {
  var target = new Date("2026-12-01T19:30:00+01:00").getTime();
  var el = { d: document.getElementById("d"), h: document.getElementById("h"), m: document.getElementById("m"), s: document.getElementById("s") };
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var t = Math.floor(Math.max(0, target - Date.now()) / 1000);
    el.d.textContent = Math.floor(t / 86400);
    el.h.textContent = pad(Math.floor(t / 3600) % 24);
    el.m.textContent = pad(Math.floor(t / 60) % 60);
    el.s.textContent = pad(t % 60);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ===== QR platba (formát České bankovní asociace „SPD“) ===== */
(function () {
  var box = document.getElementById("qr"), note = document.getElementById("qr-note"), acc = document.getElementById("acc");
  var buttons = document.querySelectorAll(".amounts button");
  var amount = 100;

  function render() {
    if (!IBAN || typeof qrcode === "undefined") {
      box.innerHTML = '<div class="soon">QR kód brzy doplníme</div>';
      note.textContent = "";
      return;
    }
    var spd = "SPD*1.0*ACC:" + IBAN + (amount > 0 ? "*AM:" + amount.toFixed(2) : "") + "*CC:CZK*MSG:" + PAY_MESSAGE;
    var qr = qrcode(0, "M");
    qr.addData(spd);
    qr.make();
    box.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    note.textContent = amount > 0 ? "Příspěvek " + amount + " Kč" : "Částku zadáte v aplikaci";
  }

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      for (var j = 0; j < buttons.length; j++) buttons[j].classList.remove("on");
      this.classList.add("on");
      amount = parseInt(this.getAttribute("data-amount"), 10) || 0;
      render();
    });
  }
  if (ACCOUNT_LABEL) acc.innerHTML = "Číslo účtu: <b>" + ACCOUNT_LABEL + "</b> · zpráva: " + PAY_MESSAGE;
  render();
})();

/* ===== Zvýraznění aktuální sekce v menu ===== */
(function () {
  var links = document.querySelectorAll(".links a");
  if (!("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      for (var i = 0; i < links.length; i++) links[i].classList.toggle("on", links[i].getAttribute("href") === "#" + e.target.id);
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
})();

/* ===== Padající sníh ===== */
(function () {
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

/* ===== Plakát ve 3D: náklon podle myši (počítač) nebo náklonu telefonu ===== */
(function () {
  var wrap = document.getElementById("poster");
  if (!wrap) return;
  var card = wrap.querySelector(".poster-card");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  var MAX = 14;
  function set(x, y) { // x, y v rozsahu -1..1
    card.style.setProperty("--ry", (x * MAX).toFixed(2) + "deg");
    card.style.setProperty("--rx", (-y * MAX).toFixed(2) + "deg");
    card.style.setProperty("--gx", (50 + x * 40).toFixed(1) + "%");
    card.style.setProperty("--gy", (40 + y * 40).toFixed(1) + "%");
  }
  wrap.addEventListener("pointermove", function (e) {
    var r = wrap.getBoundingClientRect();
    set((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
  });
  wrap.addEventListener("pointerleave", function () { set(0, 0); });

  // telefon: jemný náklon podle gyroskopu, jinak pomalé samovolné natáčení
  var gotTilt = false;
  window.addEventListener("deviceorientation", function (e) {
    if (e.gamma == null || e.beta == null) return;
    gotTilt = true;
    var x = Math.max(-1, Math.min(1, e.gamma / 25));
    var y = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
    set(x, y);
  });
  var t = 0;
  setInterval(function () {
    if (gotTilt || wrap.matches(":hover")) return;
    t += 0.05;
    set(Math.sin(t) * 0.6, Math.cos(t * 0.8) * 0.35);
  }, 50);
})();
