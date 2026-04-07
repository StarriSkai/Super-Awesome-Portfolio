(function () {
  const params = new URLSearchParams(window.location.search);
  const src = params.get("src");
  const alt = params.get("alt") || "Artwork image";
  const from = params.get("from") || "index.html";

  const img = document.getElementById("viewer-image");
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
})();
