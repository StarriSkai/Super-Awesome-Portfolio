(function () {
  document.body.classList.add("js-img-fade");

  const images = document.querySelectorAll("img:not(#viewer-image)");

  const setLoaded = function (img) {
    img.classList.add("is-loaded");
  };

  images.forEach(function (img) {
    if (img.complete) {
      setLoaded(img);
      return;
    }

    img.addEventListener(
      "load",
      function () {
        setLoaded(img);
      },
      { once: true }
    );

    img.addEventListener(
      "error",
      function () {
        setLoaded(img);
      },
      { once: true }
    );
  });
})();
