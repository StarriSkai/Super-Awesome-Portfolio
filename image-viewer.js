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
    const MIN_SCALE = 1;
    const MAX_SCALE = 4;
    const CLICK_ZOOM_SCALE = 2.1;
    const WHEEL_STEP = 0.2;
    let scale = 1;
    let isPanning = false;
    let pointerMoved = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    const clamp = function (value, min, max) {
      return Math.min(max, Math.max(min, value));
    };

    const applyZoom = function () {
      img.style.transform = "scale(" + scale + ")";
      stage.classList.toggle("is-zoomed", scale > MIN_SCALE);
      if (scale <= MIN_SCALE) {
        stage.scrollLeft = 0;
        stage.scrollTop = 0;
      }
    };

    stage.addEventListener(
      "wheel",
      function (event) {
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
        }
        const delta = event.deltaY > 0 ? -WHEEL_STEP : WHEEL_STEP;
        scale = clamp(scale + delta, MIN_SCALE, MAX_SCALE);
        applyZoom();
      },
      { passive: false }
    );

    stage.addEventListener("mousedown", function (event) {
      if (scale <= MIN_SCALE) return;
      isPanning = true;
      pointerMoved = false;
      stage.classList.add("is-panning");
      startX = event.clientX;
      startY = event.clientY;
      startScrollLeft = stage.scrollLeft;
      startScrollTop = stage.scrollTop;
    });

    window.addEventListener("mousemove", function (event) {
      if (!isPanning) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        pointerMoved = true;
      }
      stage.scrollLeft = startScrollLeft - dx;
      stage.scrollTop = startScrollTop - dy;
    });

    window.addEventListener("mouseup", function () {
      if (!isPanning) return;
      isPanning = false;
      stage.classList.remove("is-panning");
    });

    stage.addEventListener("mouseleave", function () {
      if (!isPanning) return;
      isPanning = false;
      stage.classList.remove("is-panning");
    });

    stage.addEventListener("click", function () {
      if (pointerMoved) return;
      scale = scale > MIN_SCALE ? MIN_SCALE : CLICK_ZOOM_SCALE;
      applyZoom();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && scale > MIN_SCALE) {
        scale = MIN_SCALE;
        applyZoom();
      }
    });

    img.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });

    applyZoom();
  }
})();
