/* Logika halaman detail studi kasus (project.html) */
(function () {
  "use strict";

  var S = window.SHEET;
  var esc = S.esc, pad = S.pad;
  var projects = window.PROJECTS || [];
  var root = document.getElementById("project");

  var slug = new URLSearchParams(location.search).get("p");
  var idx = -1;
  projects.forEach(function (p, i) { if (p.slug === slug) idx = i; });

  var miniMap = null;
  var miniTileLayer = null;

  function refreshMiniTile() {
    if (!miniMap) return;
    if (miniTileLayer) miniMap.removeLayer(miniTileLayer);
    miniTileLayer = S.createTileLayer(S.state.basemap, S.state.theme).addTo(miniMap);
    S.syncBasemapBar(document.getElementById("mini-basemap-bar"));
  }

  function render() {
    S.syncHeaderUI();
    var d = S.t();

    if (idx < 0) {
      root.innerHTML =
        '<div class="pj-top"><a class="back-btn" href="index.html#proyek">' + esc(d.backAll) + "</a></div>" +
        "<h1>" + esc(d.notFound) + "</h1>";
      return;
    }

    var p = projects[idx];
    var loc = S.pLoc(p);
    var prev = idx > 0 ? projects[idx - 1] : null;
    var next = idx < projects.length - 1 ? projects[idx + 1] : null;

    document.title = loc.title + " | Jariyan Arifudin";

    function cell(label, value, wide) {
      if (!value) return "";
      return '<div class="cell' + (wide ? " wide" : "") + '"><dt>' + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>";
    }
    function entry(no, title, text, extra) {
      return (
        '<section class="entry">' +
          '<div class="e-label"><b>' + pad(no) + "</b>" + esc(title) + "</div>" +
          "<div>" + (text ? "<p>" + esc(text) + "</p>" : "") + (extra || "") + "</div>" +
        "</section>"
      );
    }
    function tableHtml(tbl) {
      if (!tbl || !tbl.head || !tbl.rows) return "";
      return (
        '<div class="tbl-wrap"><table class="dtable">' +
          (tbl.caption ? "<caption>" + esc(tbl.caption) + "</caption>" : "") +
          "<thead><tr>" + tbl.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead>" +
          "<tbody>" + tbl.rows.map(function (r) {
            return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>";
          }).join("") + "</tbody>" +
        "</table></div>"
      );
    }

    var photosHtml = (p.photos && p.photos.length)
      ? '<div class="photos">' + p.photos.map(function (ph) {
          return '<figure class="photo"><img src="' + esc(ph.src) + '" alt="' + esc(ph.caption || loc.title) + '" loading="lazy">' +
            (ph.caption ? "<figcaption>" + esc(ph.caption) + "</figcaption>" : "") + "</figure>";
        }).join("") + "</div>"
      : '<div class="photos">' + [1, 2].map(function () {
          return '<figure class="photo empty"><div class="ph">' + esc(d.photoPh).replace(/\n/g, "<br>") + "</div></figure>";
        }).join("") + "</div>";

    var layoutHtml = p.cover
      ? '<figure class="fig"><div class="frame"><img src="' + esc(p.cover) + '" alt="Layout ' + esc(loc.title) + '"></div><figcaption>' + esc(d.figLayout) + "</figcaption></figure>"
      : '<figure class="fig"><div class="frame empty"><div class="ph">' + esc(d.layoutPh).replace(/\n/g, "<br>") + "</div></div><figcaption>" + esc(d.figLayout) + "</figcaption></figure>";

    var linksHtml = (p.links || []).map(function (l) {
      return '<a class="btn" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label[S.state.lang]) + " &nearr;</a>";
    }).join("");

    var figLocText = d.figLoc
      .replace("{place}", loc.place)
      .replace("{approx}", p.approx ? d.approxSuffix : "");

    root.innerHTML =
      '<div class="pj-top">' +
        '<a class="back-btn" href="index.html#proyek">' + esc(d.backAll) + "</a>" +
        "<span>" + pad(idx + 1) + " / " + pad(projects.length) + "</span>" +
      "</div>" +
      "<h1>" + esc(loc.title) + "</h1>" +
      '<p class="pj-sum">' + esc(loc.summary) + "</p>" +
      '<dl class="cells">' +
        cell(d.cellYear, p.year) +
        cell(d.cellCat, loc.category) +
        cell(d.cellCtx, loc.context) +
        cell(d.cellLoc, loc.place) +
        cell(d.cellCoord, S.coordOf(p)) +
        cell(d.cellTools, p.tools.join(", ")) +
        cell(d.cellRole, loc.role, true) +
      "</dl>" +
      '<figure class="fig">' +
        '<div class="frame">' +
          '<div class="basemap-bar" id="mini-basemap-bar" role="group" aria-label="Basemap switcher">' +
            '<button type="button" data-bm="minimal">' + esc(d.bmMinimal) + "</button>" +
            '<button type="button" data-bm="topo">' + esc(d.bmTopo) + "</button>" +
            '<button type="button" data-bm="satellite">' + esc(d.bmSat) + "</button>" +
          "</div>" +
          '<div id="mini" role="img" aria-label="Project location map"></div>' +
        "</div>" +
        "<figcaption>" + esc(figLocText) + "</figcaption>" +
      "</figure>" +
      layoutHtml +
      '<div class="entries">' +
        entry(1, d.secProblem, loc.problem) +
        entry(2, d.secData, loc.data, tableHtml(loc.table)) +
        entry(3, d.secMethod, loc.method) +
        entry(4, d.secResult, loc.result) +
        entry(5, d.secPhotos, "", photosHtml) +
      "</div>" +
      (linksHtml ? '<div class="reslinks">' + linksHtml + "</div>" : "") +
      '<nav class="pager" aria-label="Other projects">' +
        (prev ? '<a href="project.html?p=' + encodeURIComponent(prev.slug) + '"><small>&larr; ' + pad(idx) + "</small>" + esc(S.pLoc(prev).title) + "</a>" : "<span></span>") +
        (next ? '<a class="nx" href="project.html?p=' + encodeURIComponent(next.slug) + '"><small>' + pad(idx + 2) + " &rarr;</small>" + esc(S.pLoc(next).title) + "</a>" : "<span></span>") +
      "</nav>";

    var bar = document.getElementById("mini-basemap-bar");
    S.syncBasemapBar(bar);
    bar.addEventListener("click", function (ev) {
      var btn = ev.target.closest("button[data-bm]");
      if (btn) S.setBasemap(btn.getAttribute("data-bm"), refreshMiniTile);
    });

    if (miniMap) { miniMap.remove(); miniMap = null; }
    miniMap = L.map("mini", { scrollWheelZoom: false, zoomControl: false }).setView([p.lat, p.lng], 10);
    miniMap.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    L.control.zoom({ position: "bottomright", zoomInTitle: d.zoomIn, zoomOutTitle: d.zoomOut }).addTo(miniMap);
    miniTileLayer = S.createTileLayer(S.state.basemap, S.state.theme).addTo(miniMap);
    L.control.scale({ imperial: false, maxWidth: 120 }).addTo(miniMap);
    L.marker([p.lat, p.lng], { icon: S.pinIcon(), keyboard: false }).addTo(miniMap);
    miniMap.on("click", function () { miniMap.scrollWheelZoom.enable(); });
    miniMap.on("mouseout", function () { miniMap.scrollWheelZoom.disable(); });
  }

  document.getElementById("lang-id").addEventListener("click", function () { S.setLang("id", render); });
  document.getElementById("lang-en").addEventListener("click", function () { S.setLang("en", render); });
  document.getElementById("theme-toggle").addEventListener("click", function () {
    S.toggleTheme(function () { if (S.state.basemap === "minimal") refreshMiniTile(); });
  });

  render();
})();
