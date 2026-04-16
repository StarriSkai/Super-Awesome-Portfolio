(function () {
  const params = new URLSearchParams(window.location.search);
  const src = params.get("src");
  const alt = params.get("alt") || "Artwork image";
  const from = params.get("from") || "index.html";
  const seriesParam = params.get("series");
  const seriesAlt = params.get("seriesAlt") || alt;

  const img = document.getElementById("viewer-image");
  const stage = document.getElementById("viewer-stage");
  const back = document.getElementById("viewer-back");
  const controls = document.getElementById("viewer-controls");
  const prev = document.getElementById("viewer-prev");
  const next = document.getElementById("viewer-next");
  const series = seriesParam ? seriesParam.split("|").filter(Boolean) : [];
  let currentIndex = series.indexOf(src);

  if (src && currentIndex === -1 && series.length) {
    series.unshift(src);
    currentIndex = 0;
  }

  const updateSeriesUi = function () {
    const hasSeries = series.length > 1;
    if (controls) {
      controls.hidden = !hasSeries;
    }
    if (prev) {
      prev.disabled = !hasSeries || currentIndex <= 0;
    }
    if (next) {
      next.disabled = !hasSeries || currentIndex >= series.length - 1;
    }
  };

  const setViewerImage = function (nextSrc) {
    if (!img || !nextSrc) return;
    img.src = nextSrc;
    img.alt = series.length > 1 ? seriesAlt : alt;
  };

  if (img && src) {
    setViewerImage(src);
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
        event.preventDefault();
        const delta = event.deltaY > 0 ? -WHEEL_STEP : WHEEL_STEP;
        zoomAroundPoint(scale + delta, event.clientX, event.clientY);
      },
      { passive: false }
    );

    stage.addEventListener("mousedown", function (event) {
      if (event.button !== 0 || scale <= MIN_SCALE) return;
      event.preventDefault();
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

  if (series.length > 1) {
    updateSeriesUi();

    if (prev) {
      prev.addEventListener("click", function () {
        if (currentIndex <= 0) return;
        currentIndex -= 1;
        setViewerImage(series[currentIndex]);
        updateSeriesUi();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        if (currentIndex >= series.length - 1) return;
        currentIndex += 1;
        setViewerImage(series[currentIndex]);
        updateSeriesUi();
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        currentIndex -= 1;
        setViewerImage(series[currentIndex]);
        updateSeriesUi();
      }
      if (event.key === "ArrowRight" && currentIndex < series.length - 1) {
        currentIndex += 1;
        setViewerImage(series[currentIndex]);
        updateSeriesUi();
      }
    });
  } else {
    updateSeriesUi();
  }
})();
