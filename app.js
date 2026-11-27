/* ===== NASTAVENÍ ===== */
// Číslo účtu pro dobrovolné vstupné (IBAN bez mezer). Dokud je prázdné, místo QR se ukáže „brzy“.
var IBAN = "CZ7208000000003191753083";
var ACCOUNT_LABEL = "3191753083/0800";            // např. "123456789/0100" – jen pro zobrazení
var PAY_MESSAGE = "Dasacke derby";

(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* odpočet – začátek podle plakátu 19:00 */
  var target = new Date("2026-12-01T19:00:00+01:00").getTime();
  var el = { d: document.getElementById("d"), h: document.getElementById("h"), m: document.getElementById("m"), s: document.getElementById("s") };
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var t = Math.floor(Math.max(0, target - Date.now()) / 1000);
    el.d.textContent = Math.floor(t / 86400);
    el.h.textContent = pad(Math.floor(t / 3600) % 24);
    el.m.textContent = pad(Math.floor(t / 60) % 60);
    el.s.textContent = pad(t % 60);
  }
  tick(); setInterval(tick, 1000);

  /* hlavička při scrollu + mobilní menu */
  var hdr = document.getElementById("hdr"), burger = document.getElementById("burger"), menu = document.getElementById("menu");
  function onScroll() { hdr.classList.toggle("scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  burger.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  });

  /* zvýraznění aktivní sekce v menu + plynulé objevení obsahu */
  var links = menu.querySelectorAll('a[href^="#"]');
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });

    var items = document.querySelectorAll(".sec-head, .team, .schedule li, .venue > *, .pricelist li, .support > *, .ig-in > *");
    if (!reduce) {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -8% 0px" });
      items.forEach(function (n, i) { n.classList.add("reveal"); n.style.transitionDelay = (i % 6) * 50 + "ms"; ro.observe(n); });
    }
  }

  /* plakát – jemný 3D náklon */
  var poster = document.getElementById("poster");
  if (poster && !reduce) {
    var MAX = 9;
    var set = function (x, y) {
      poster.style.setProperty("--ry", (x * MAX).toFixed(2) + "deg");
      poster.style.setProperty("--rx", (-y * MAX).toFixed(2) + "deg");
      poster.style.setProperty("--gx", (50 + x * 40).toFixed(1) + "%");
      poster.style.setProperty("--gy", (35 + y * 40).toFixed(1) + "%");
    };
    poster.addEventListener("pointermove", function (e) {
      var r = poster.getBoundingClientRect();
      set((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
    });
    poster.addEventListener("pointerleave", function () { set(0, 0); });
    window.addEventListener("deviceorientation", function (e) {
      if (e.gamma == null || e.beta == null) return;
      set(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
    });
  }

  /* QR platba (SPD – Česká bankovní asociace) */
  var box = document.getElementById("qr"), note = document.getElementById("qr-note"), acc = document.getElementById("acc");
  var buttons = document.querySelectorAll(".amounts button"), amount = 100;
  function renderQR() {
    if (!IBAN || typeof qrcode === "undefined") { box.innerHTML = '<div class="soon">QR kód brzy doplníme</div>'; note.textContent = ""; return; }
    var spd = "SPD*1.0*ACC:" + IBAN + (amount > 0 ? "*AM:" + amount.toFixed(2) : "") + "*CC:CZK*MSG:" + PAY_MESSAGE;
    var qr = qrcode(0, "M"); qr.addData(spd); qr.make();
    var n = qr.getModuleCount(), d = ""; for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += "M" + c + " " + r + "h1v1h-1z";
    box.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + " " + n + '" shape-rendering="crispEdges" role="img" aria-label="QR platba"><path fill="#000" stroke="none" style="stroke:none;stroke-width:0" d="' + d + '"/></svg>';
    note.textContent = amount > 0 ? "Příspěvek " + amount + " Kč" : "Částku zadáte v aplikaci";
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      buttons.forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      amount = parseInt(b.getAttribute("data-amount"), 10) || 0;
      renderQR();
    });
  });
  if (ACCOUNT_LABEL) acc.innerHTML = "Číslo účtu: <b>" + ACCOUNT_LABEL + "</b>";
  renderQR();
})();
