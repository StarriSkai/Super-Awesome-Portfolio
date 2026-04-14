(function () {
  const params = new URLSearchParams(window.location.search);
  const src = params.get("src");
  const alt = params.get("alt") || "Artwork image";
  const from = params.get("from") || "index.html";

  const img = document.getElementById("viewer-image");
  const stage = document.getElementById("viewer-stage");
  const back = document.getElementById("viewer-back");
  const fallback = document.getElementById("viewer-fallback");

  if (img && src) {
    img.src = src;
    img.alt = alt;
  }

  if (fallback) {
    fallback.href = src || from;
  }

  if (back) {
    back.addEventListener("click", function (event) {
      event.preventDefault();
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = from;
      }
    });
  }

  if (img && stage) {
    let zoomLevel = 1;
    const zoomScales = [1, 2.1];

    const applyZoom = function () {
      const scale = zoomScales[zoomLevel];
      img.style.transform = "scale(" + scale + ")";
      stage.classList.toggle("is-zoomed", scale > 1);
    };

    stage.addEventListener("click", function () {
      zoomLevel = zoomLevel === 0 ? 1 : 0;
      applyZoom();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && zoomLevel !== 0) {
        zoomLevel = 0;
        applyZoom();
      }
    });

    img.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });
  }
})();
