/* Helper bersama untuk index.html dan project.html */
(function () {
  "use strict";

  var CONFIG = {
    maptilerKey: "eSUysoYBK7Cw9G8f4ThF",
    attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  };

  var state = {
    lang: "id",
    theme: "light",
    basemap: "minimal"
  };

  try {
    var sLang = localStorage.getItem("ja_gis_lang");
    if (sLang === "id" || sLang === "en") state.lang = sLang;
    var sTheme = localStorage.getItem("ja_gis_theme");
    if (sTheme === "light" || sTheme === "dark") state.theme = sTheme;
    var sBm = localStorage.getItem("ja_gis_bm");
    if (sBm === "minimal" || sBm === "topo" || sBm === "satellite") state.basemap = sBm;
  } catch (e) {}

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function t() { return window.UI[state.lang]; }
  function pLoc(p) { return p[state.lang]; }

  function dms(v, pos, neg) {
    var h = v >= 0 ? pos : neg;
    var a = Math.abs(v);
    var d = Math.floor(a + 1e-9);
    var m = Math.floor((a - d) * 60 + 1e-9);
    return d + "°" + pad(m) + "′" + h;
  }

  function coordOf(p) {
    var d = t();
    var s = dms(p.lat, d.hemiN, d.hemiS) + " " + dms(p.lng, d.hemiE, d.hemiW);
    return (p.approx ? "≈ " : "") + s;
  }

  function createTileLayer(bmKey, theme) {
    var styleId = "dataviz-light";
    var ext = "png";
    var cls = "";
    if (bmKey === "minimal") {
      styleId = theme === "dark" ? "dataviz-dark" : "dataviz-light";
      cls = theme === "dark" ? "tile-mono-dark" : "tile-mono-light";
    } else if (bmKey === "topo") {
      styleId = "topo-v2";
      ext = "png";
    } else if (bmKey === "satellite") {
      styleId = "hybrid";
      ext = "jpg";
    }
    return L.tileLayer(
      "https://api.maptiler.com/maps/" + styleId + "/{z}/{x}/{y}." + ext + "?key=" + CONFIG.maptilerKey,
      {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        maxZoom: 19,
        className: cls,
        crossOrigin: true,
        attribution: CONFIG.attribution
      }
    );
  }

  function pinIcon() {
    return L.divIcon({
      className: "",
      html: '<div class="pin"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -12]
    });
  }

  var sunSvg = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
  var moonSvg = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

  function syncThemeUI() {
    document.documentElement.setAttribute("data-theme", state.theme);
    var d = t();
    var iconEl = document.getElementById("theme-icon");
    var lblEl = document.getElementById("theme-label");
    if (iconEl) iconEl.innerHTML = state.theme === "dark" ? sunSvg : moonSvg;
    if (lblEl) lblEl.textContent = state.theme === "dark" ? d.themeLight : d.themeDark;
  }

  function syncHeaderUI() {
    document.documentElement.lang = state.lang;
    var d = t();
    var idBtn = document.getElementById("lang-id");
    var enBtn = document.getElementById("lang-en");
    if (idBtn) {
      idBtn.classList.toggle("active", state.lang === "id");
      idBtn.setAttribute("aria-pressed", state.lang === "id" ? "true" : "false");
    }
    if (enBtn) {
      enBtn.classList.toggle("active", state.lang === "en");
      enBtn.setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
    }
    var np = document.getElementById("nav-projects");
    var na = document.getElementById("nav-about");
    var nct = document.getElementById("nav-contact");
    var nc = document.getElementById("nav-cv");
    var ft = document.getElementById("footer-text");
    if (np) np.textContent = d.navProjects;
    if (na) na.textContent = d.navAbout;
    if (nct) nct.textContent = d.navContact;
    if (nc) nc.textContent = d.navCv;
    if (ft) ft.textContent = d.footer.replace("{yr}", new Date().getFullYear());
    syncThemeUI();
  }

  function syncBasemapBar(barEl) {
    if (!barEl) return;
    var d = t();
    var labels = { minimal: d.bmMinimal, topo: d.bmTopo, satellite: d.bmSat };
    Array.prototype.forEach.call(barEl.querySelectorAll("button[data-bm]"), function (b) {
      var k = b.getAttribute("data-bm");
      b.textContent = labels[k];
      var on = k === state.basemap;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function setLang(lang, cb) {
    state.lang = lang;
    try { localStorage.setItem("ja_gis_lang", lang); } catch (e) {}
    syncHeaderUI();
    if (cb) cb();
  }

  function toggleTheme(cb) {
    state.theme = state.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("ja_gis_theme", state.theme); } catch (e) {}
    syncThemeUI();
    if (cb) cb();
  }

  function setBasemap(bmKey, cb) {
    state.basemap = bmKey;
    try { localStorage.setItem("ja_gis_bm", bmKey); } catch (e) {}
    if (cb) cb();
  }

  window.SHEET = {
    state: state,
    esc: esc,
    pad: pad,
    t: t,
    pLoc: pLoc,
    coordOf: coordOf,
    createTileLayer: createTileLayer,
    pinIcon: pinIcon,
    syncHeaderUI: syncHeaderUI,
    syncBasemapBar: syncBasemapBar,
    setLang: setLang,
    toggleTheme: toggleTheme,
    setBasemap: setBasemap
  };
})();
