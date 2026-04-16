(function () {
  const params = new URLSearchParams(window.location.search);
  const src = params.get("src");
  const alt = params.get("alt") || "Artwork image";
  const from = params.get("from") || "index.html";

  const img = document.getElementById("viewer-image");
  const stage = document.getElementById("viewer-stage");
  const back = document.getElementById("viewer-back");

  if (img && src) {
    img.src = src;
    img.alt = alt;
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

    const zoomAroundPoint = function (nextScale, clientX, clientY) {
      const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      if (clampedScale === scale) return;

      const stageRect = stage.getBoundingClientRect();
      const pointX = clientX - stageRect.left;
      const pointY = clientY - stageRect.top;
      const contentX = stage.scrollLeft + pointX;
      const contentY = stage.scrollTop + pointY;
      const scaleRatio = clampedScale / scale;

      scale = clampedScale;
      applyZoom();

      if (scale > MIN_SCALE) {
        stage.scrollLeft = contentX * scaleRatio - pointX;
        stage.scrollTop = contentY * scaleRatio - pointY;
      }
    };

    img.style.transformOrigin = "top left";

    stage.addEventListener(
      "wheel",
      function (event) {
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
        }
        const delta = event.deltaY > 0 ? -WHEEL_STEP : WHEEL_STEP;
        zoomAroundPoint(scale + delta, event.clientX, event.clientY);
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

    stage.addEventListener("click", function (event) {
      if (pointerMoved) return;
      if (scale > MIN_SCALE) {
        scale = MIN_SCALE;
        applyZoom();
        return;
      }
      zoomAroundPoint(CLICK_ZOOM_SCALE, event.clientX, event.clientY);
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
