(function () {
  const params = new URLSearchParams(window.location.search);
  const src = params.get("src");
  const alt = params.get("alt") || "Artwork image";
  const from = params.get("from") || "index.html";
  const seriesParam = params.get("series");
  const seriesAlt = params.get("seriesAlt") || alt;
  const allowSeriesNav = params.get("seriesNav") === "1";

  const img = document.getElementById("viewer-image");
  const stage = document.getElementById("viewer-stage");
  const back = document.getElementById("viewer-back");
  const controls = document.getElementById("viewer-controls");
  const slider = document.getElementById("viewer-slider");
  const sliderCount = document.getElementById("viewer-slider-count");
  const rawSeries = seriesParam
    ? seriesParam.split("|").map(function (s) {
        return s.trim();
      }).filter(Boolean)
    : [];
  const series = [];
  const seen = Object.create(null);
  for (let i = 0; i < rawSeries.length; i += 1) {
    const u = rawSeries[i];
    if (!seen[u]) {
      seen[u] = true;
      series.push(u);
    }
  }
  let currentIndex = series.indexOf(src);

  if (src && currentIndex === -1 && series.length) {
    series.unshift(src);
    currentIndex = 0;
  }

  const updateSeriesUi = function () {
    const hasSeries = allowSeriesNav && series.length > 1;
    if (controls) {
      controls.hidden = !hasSeries;
    }
    if (slider) {
      slider.min = "1";
      slider.max = String(Math.max(1, series.length));
      slider.value = String(currentIndex + 1);
      slider.disabled = !hasSeries;
    }
    if (sliderCount) {
      sliderCount.value = (currentIndex + 1) + " / " + Math.max(1, series.length);
    }
  };

  const setViewerImage = function (nextSrc) {
    if (!img || !nextSrc) return;
    img.src = nextSrc;
    img.alt = allowSeriesNav && series.length > 1 ? seriesAlt : alt;
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

  if (allowSeriesNav && series.length > 1) {
    updateSeriesUi();

    if (slider) {
      slider.addEventListener("input", function () {
        const nextIndex = Number(slider.value) - 1;
        if (nextIndex < 0 || nextIndex >= series.length || nextIndex === currentIndex) return;
        currentIndex = nextIndex;
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
