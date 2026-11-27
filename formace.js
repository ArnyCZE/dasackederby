// Soupisky: přepínání formací (záložky s posuvným podkladem, šipky, přejetí prstem), animace hráčů
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".rink-team").forEach(function (team) {
    var rinks = Array.prototype.slice.call(team.querySelectorAll(".rink"));
    if (rinks.length < 2) return;
    var bar = document.createElement("div");
    bar.className = "f-tabs";
    bar.setAttribute("role", "tablist");
    var pill = document.createElement("span");
    pill.className = "f-pill";
    bar.appendChild(pill);
    var btns = rinks.map(function (r, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.textContent = (i + 1) + ". formace";
      b.addEventListener("click", function () { show(i); });
      bar.appendChild(b);
      return b;
    });
    var stage = document.createElement("div");
    stage.className = "f-stage";
    rinks[0].parentNode.insertBefore(bar, rinks[0]);
    bar.parentNode.insertBefore(stage, bar.nextSibling);
    rinks.forEach(function (r) { stage.appendChild(r); });
    var prev = document.createElement("button"), next = document.createElement("button");
    prev.type = next.type = "button";
    prev.className = "f-arrow f-prev"; next.className = "f-arrow f-next";
    prev.setAttribute("aria-label", "Předchozí formace"); next.setAttribute("aria-label", "Další formace");
    prev.textContent = "‹"; next.textContent = "›";
    prev.addEventListener("click", function () { show(cur - 1); });
    next.addEventListener("click", function () { show(cur + 1); });
    stage.appendChild(prev); stage.appendChild(next);

    var cur = -1;
    function movePill() {
      var b = btns[cur];
      pill.style.width = b.offsetWidth + "px";
      pill.style.transform = "translateX(" + b.offsetLeft + "px) skewX(-12deg)";
    }
    function show(i) {
      var n = (i + rinks.length) % rinks.length, dir = n > cur ? "from-r" : "from-l";
      if (n === cur) return;
      cur = n;
      rinks.forEach(function (r, k) {
        r.classList.remove("on", "from-r", "from-l");
        if (k === cur) { void r.offsetWidth; r.classList.add("on", dir); }
      });
      btns.forEach(function (b, k) { b.classList.toggle("on", k === cur); b.setAttribute("aria-selected", k === cur ? "true" : "false"); });
      movePill();
    }
    var x0 = null;
    stage.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) show(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    window.addEventListener("resize", movePill);
    team.classList.add("has-tabs");
    show(0);
  });

  // hráči „naskočí“ na led, až soupiska dojede na obrazovku
  var teams = document.querySelectorAll(".rink-team");
  if (reduce || !("IntersectionObserver" in window)) { teams.forEach(function (t) { t.classList.add("seen"); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); } });
  }, { threshold: .2 });
  teams.forEach(function (t) { t.classList.add("pre"); io.observe(t); });
})();
