// src/ui/meta.js

/**
 * Set <title> and <meta name="description"> at runtime.
 * Also ensures a few OG tags for nicer link previews.
 * @param {{ title?: string, description?: string, image?: string, type?: string, url?: string }} meta
 * @returns {void}
 */

export function setPageMeta(meta = {}) {
  const brand = "Auction House";
  if (meta.title) {
    document.title = `${meta.title} • ${brand}`;
  }

  const ensure = (name) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      document.head.appendChild(el);
    }
    return el;
  };
  const ensureProp = (property) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", property);
      document.head.appendChild(el);
    }
    return el;
  };

  if (meta.description) {
    ensure("description").setAttribute("content", meta.description.slice(0, 155));
  }
  if (meta.title) {
    ensureProp("og:title").setAttribute("content", `${meta.title} • ${brand}`);
  }
  if (meta.description) {
    ensureProp("og:description").setAttribute("content", meta.description.slice(0, 200));
  }
  if (meta.image) {
    ensureProp("og:image").setAttribute("content", meta.image);
  }
  ensureProp("og:type").setAttribute("content", meta.type || "website");
  ensureProp("og:url").setAttribute("content", meta.url || location.href);
}
