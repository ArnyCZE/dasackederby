// Soupisky: přepínání mezi formacemi (záložky + přejetí prstem na mobilu)
(function () {
  document.querySelectorAll(".rink-team").forEach(function (team) {
    var rinks = Array.prototype.slice.call(team.querySelectorAll(".rink"));
    if (rinks.length < 2) return;
    var bar = document.createElement("div");
    bar.className = "f-tabs";
    bar.setAttribute("role", "tablist");
    var btns = rinks.map(function (r, i) {
      var h = r.querySelector("h4");
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.textContent = h ? h.textContent : (i + 1) + ". formace";
      b.addEventListener("click", function () { show(i); });
      bar.appendChild(b);
      return b;
    });
    rinks[0].parentNode.insertBefore(bar, rinks[0]);
    var cur = 0;
    function show(i) {
      cur = (i + rinks.length) % rinks.length;
      rinks.forEach(function (r, k) { r.classList.toggle("on", k === cur); });
      btns.forEach(function (b, k) { b.classList.toggle("on", k === cur); b.setAttribute("aria-selected", k === cur ? "true" : "false"); });
    }
    // přejetí prstem doleva/doprava po hřišti
    var x0 = null;
    rinks.forEach(function (r) {
      r.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      r.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
      }, { passive: true });
    });
    team.classList.add("has-tabs");
    show(0);
  });
})();
