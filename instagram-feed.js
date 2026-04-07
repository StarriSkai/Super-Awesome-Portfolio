(function () {
  const script = document.currentScript;
  if (script?.hasAttribute("data-instagram-feed-disabled")) {
    return;
  }
  const apiBase = script?.getAttribute("data-instagram-api") || "/api/instagram";
  const limit = script?.getAttribute("data-instagram-limit") || "9";
  const grid = document.getElementById("instagram-grid");
  const statusEl = document.getElementById("instagram-status");
  if (!grid || !statusEl) return;

  function pickImageUrl(item) {
    if (!item) return null;
    if (item.media_type === "VIDEO") {
      return item.thumbnail_url || item.media_url || null;
    }
    if (item.media_type === "CAROUSEL_ALBUM" && item.children?.data?.length) {
      const c = item.children.data[0];
      if (c.media_type === "VIDEO") {
        return c.thumbnail_url || c.media_url || null;
      }
      return c.media_url || c.thumbnail_url || null;
    }
    return item.media_url || item.thumbnail_url || null;
  }

  function load() {
    statusEl.textContent = "Loading Instagram…";
    const url = `${apiBase}?limit=${encodeURIComponent(limit)}`;

    fetch(url)
      .then(function (res) {
        return res.json().then(function (data) {
          return { res: res, data: data };
        });
      })
      .then(function (_ref) {
        const res = _ref.res;
        const data = _ref.data;
        if (!res.ok) {
          const msg =
            data.hint ||
            (data.error && data.error.message) ||
            (typeof data.error === "string" ? data.error : null) ||
            "Could not load Instagram.";
          statusEl.textContent = msg;
          return;
        }
        const items = data.data || [];
        if (!items.length) {
          statusEl.textContent = "No posts returned yet.";
          return;
        }
        statusEl.textContent = "";
        grid.textContent = "";

        items.forEach(function (item) {
          const imgUrl = pickImageUrl(item);
          if (!imgUrl || !item.permalink) return;

          const article = document.createElement("article");
          article.className = "instagram-tile";

          const a = document.createElement("a");
          a.className = "instagram-tile__link";
          a.href = item.permalink;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          const cap = item.caption ? String(item.caption).slice(0, 120) : "";
          a.setAttribute("aria-label", cap || "View post on Instagram");

          const img = document.createElement("img");
          img.src = imgUrl;
          img.alt = "";
          img.loading = "lazy";
          img.decoding = "async";

          a.appendChild(img);
          article.appendChild(a);

          if (item.media_type === "VIDEO" || item.media_type === "CAROUSEL_ALBUM") {
            const badge = document.createElement("span");
            badge.className = "instagram-tile__badge";
            badge.textContent = item.media_type === "VIDEO" ? "Video" : "Album";
            article.appendChild(badge);
          }

          grid.appendChild(article);
        });
      })
      .catch(function () {
        statusEl.textContent =
          "Could not reach the Instagram feed. Deploy this site with the API route and open the live URL (not a local file).";
      });
  }

  load();
})();
