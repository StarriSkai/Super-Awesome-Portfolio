(function () {
  const links = document.querySelectorAll(".art-gallery__item > a");
  if (!links.length) return;

  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      const href = link.getAttribute("href");
      if (!href) return;

      event.preventDefault();

      const img = link.querySelector("img");
      const alt = img ? img.getAttribute("alt") || "Artwork image" : "Artwork image";
      const from = window.location.pathname.split("/").pop() || "index.html";

      const viewerUrl =
        "image-viewer.html?src=" +
        encodeURIComponent(href) +
        "&alt=" +
        encodeURIComponent(alt) +
        "&from=" +
        encodeURIComponent(from);

      window.location.href = viewerUrl;
    });
  });
})();
