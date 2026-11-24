// identita v3: kolečko s koníkem místo celého loga a štítek LIVE v úvodu
(function () {
  document.querySelectorAll(".brand img, .foot-brand img").forEach(function (img) {
    var s = document.createElement("span"); s.className = "emb"; if (img.closest(".foot-brand")) s.style.setProperty("--s", "50px");
    img.parentNode.insertBefore(s, img);
  });
  var inner = document.querySelector(".ph-inner");
  if (inner && !inner.querySelector(".live-tag")) inner.insertAdjacentHTML("afterbegin", '<div class="live-tag"><b>LIVE</b><span>1. 12. 2026 · ENTERIA ARÉNA</span></div>');
})();
