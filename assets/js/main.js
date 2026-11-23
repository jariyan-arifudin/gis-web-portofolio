/* Logika halaman beranda (index.html) */
(function () {
  "use strict";

  var S = window.SHEET;
  var esc = S.esc, pad = S.pad;
  var projects = window.PROJECTS || [];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia ? window.matchMedia("(hover: hover) and (min-width: 961px)") : { matches: false };

  var filterCat = null;
  var currentPts = [];
  var hoveredProject = null;
  var hoverTimer = null;
  var resetTimer = null;

  var map = L.map("map", {
    zoomControl: false,
    scrollWheelZoom: false,
    minZoom: 3,
    zoomAnimation: !reduce,
    fadeAnimation: !reduce,
    markerZoomAnimation: !reduce
  }).setView([-2.5, 113], 5);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  var zoomCtrl = L.control.zoom({ position: "bottomright" }).addTo(map);
  var tileLayer = S.createTileLayer(S.state.basemap, S.state.theme).addTo(map);

  map.on("click", function () { map.scrollWheelZoom.enable(); });
  map.on("mouseout", function () { map.scrollWheelZoom.disable(); });

  function buildPopup(p) {
    var loc = S.pLoc(p);
    return (
      '<div class="pop-cat">' + esc(loc.category) + "</div>" +
      '<div class="pop-title">' + esc(loc.title) + "</div>" +
      '<div class="pop-co">' + esc(S.coordOf(p)) + "</div>" +
      '<a class="pop-link" href="project.html?p=' + encodeURIComponent(p.slug) + '">' + esc(S.t().openPopup) + "</a>"
    );
  }

  var markers = {};
  projects.forEach(function (p) {
    if (typeof p.lat !== "number" || typeof p.lng !== "number") return;
    var m = L.marker([p.lat, p.lng], { icon: S.pinIcon(), title: S.pLoc(p).title, keyboard: true });
    m.bindPopup(buildPopup(p), { minWidth: 210, maxWidth: 270 });
    m.addTo(map);
    markers[p.slug] = m;
  });

  function refreshTileLayer() {
    if (tileLayer) map.removeLayer(tileLayer);
    tileLayer = S.createTileLayer(S.state.basemap, S.state.theme).addTo(map);
    S.syncBasemapBar(document.getElementById("main-basemap-bar"));
  }

  function fitAll(pts) {
    if (!pts.length) return;
    if (pts.length === 1) { map.setView(pts[0], 8, { animate: false }); return; }
    map.fitBounds(pts, { padding: [46, 46], maxZoom: 7, animate: false });
  }

  function setPin(slug, on) {
    var m = markers[slug];
    if (!m || !m.getElement()) return;
    var el = m.getElement().querySelector(".pin");
    if (el) el.classList.toggle("active", on);
  }

  var capL = document.getElementById("cap-l");
  var capR = document.getElementById("cap-r");
  function setCap(p) {
    var d = S.t();
    if (!p) {
      capL.textContent = d.figSpread;
      capR.textContent = currentPts.length + " " + d.ptsUnit;
    } else {
      capL.textContent = d.projPrefix + " " + pad(projects.indexOf(p) + 1);
      capR.textContent = S.coordOf(p);
    }
  }

  function focusProject(p) {
    if (!canHover.matches) return;
    hoveredProject = p;
    clearTimeout(resetTimer);
    clearTimeout(hoverTimer);
    setPin(p.slug, true);
    setCap(p);
    var m = markers[p.slug];
    if (m) {
      hoverTimer = setTimeout(function () {
        if (reduce) map.setView(m.getLatLng(), 8, { animate: false });
        else map.flyTo(m.getLatLng(), 8, { duration: 0.65 });
      }, 130);
    }
  }

  function blurProject(p) { setPin(p.slug, false); }

  var listEl = document.getElementById("list");
  listEl.addEventListener("mouseleave", function () {
    if (!canHover.matches) return;
    hoveredProject = null;
    clearTimeout(hoverTimer);
    resetTimer = setTimeout(function () { fitAll(currentPts); setCap(null); }, 320);
  });

  document.getElementById("map-reset").addEventListener("click", function () {
    map.closePopup();
    fitAll(currentPts);
    setCap(null);
  });

  document.getElementById("main-basemap-bar").addEventListener("click", function (ev) {
    var btn = ev.target.closest("button[data-bm]");
    if (btn) S.setBasemap(btn.getAttribute("data-bm"), refreshTileLayer);
  });

  function renderFilters() {
    var chips = document.getElementById("chips");
    chips.innerHTML = "";
    var catKeys = [];
    projects.forEach(function (p) { if (catKeys.indexOf(p.catKey) < 0) catKeys.push(p.catKey); });

    function countFor(ck) {
      return projects.filter(function (p) { return !ck || p.catKey === ck; }).length;
    }

    function addChip(ck, label) {
      var b = document.createElement("button");
      b.type = "button";
      var isOn = (ck || null) === filterCat;
      b.className = "flt" + (isOn ? " on" : "");
      b.setAttribute("aria-pressed", isOn ? "true" : "false");
      b.innerHTML = esc(label) + "<em>" + pad(countFor(ck)) + "</em>";
      b.addEventListener("click", function () {
        filterCat = (ck && filterCat !== ck) ? ck : null;
        renderFilters();
        renderList();
      });
      chips.appendChild(b);
    }

    addChip(null, S.t().allFilter);
    catKeys.forEach(function (ck) {
      var sample = projects.find(function (p) { return p.catKey === ck; });
      addChip(ck, S.pLoc(sample).category);
    });
  }

  function renderList() {
    var d = S.t();
    listEl.innerHTML = "";
    var shown = projects.filter(function (p) { return !filterCat || p.catKey === filterCat; });

    shown.forEach(function (p) {
      var idx = projects.indexOf(p);
      var loc = S.pLoc(p);
      var el = document.createElement("div");
      el.className = "row";
      el.innerHTML =
        '<a class="row-link" href="project.html?p=' + encodeURIComponent(p.slug) + '">' +
          '<span class="no">' + pad(idx + 1) + "</span>" +
          '<span class="r-main">' +
            '<span class="r-cat">' + esc(loc.category) + "</span>" +
            '<strong class="r-title">' + esc(loc.title) + "</strong>" +
            '<span class="r-sum">' + esc(loc.summary) + "</span>" +
            '<span class="r-tools">' + esc(p.tools.join(" / ")) + "</span>" +
          "</span>" +
          '<span class="r-meta">' + esc(loc.place) + '<span class="mono">' + esc(S.coordOf(p)) + "</span></span>" +
          '<span class="r-year">' + esc(p.year) + "</span>" +
        "</a>";
      el.addEventListener("mouseenter", function () { focusProject(p); });
      el.addEventListener("mouseleave", function () { blurProject(p); });
      el.addEventListener("focusin", function () { focusProject(p); });
      el.addEventListener("focusout", function () { blurProject(p); });
      listEl.appendChild(el);
    });

    document.getElementById("count").textContent =
      (filterCat ? pad(shown.length) + " " + d.ofWord + " " + pad(projects.length) : pad(projects.length)) + " " + d.projUnit;

    currentPts = [];
    projects.forEach(function (p) {
      var m = markers[p.slug];
      if (!m) return;
      m.setPopupContent(buildPopup(p));
      if (!filterCat || p.catKey === filterCat) {
        if (!map.hasLayer(m)) m.addTo(map);
        currentPts.push([p.lat, p.lng]);
      } else if (map.hasLayer(m)) {
        map.removeLayer(m);
      }
    });
    fitAll(currentPts);
    setCap(hoveredProject);
  }

  function renderAbout() {
    var d = S.t();
    document.getElementById("about-role").textContent = d.aboutRole;
    document.getElementById("about-status").textContent = d.aboutStatus;
    document.getElementById("about-loc").textContent = d.aboutLoc;
    document.getElementById("about-bio").textContent = d.aboutBio;
    document.getElementById("about-stats").innerHTML = d.stats.map(function (st) {
      return "<div><dt>" + esc(st.val) + "</dt><dd>" + esc(st.label) + "</dd></div>";
    }).join("");

    document.getElementById("about-dl").innerHTML = d.groups.map(function (g) {
      return (
        '<div class="grp">' + esc(g.title) + "</div>" +
        g.rows.map(function (r) {
          return (
            '<div class="r"><span>' + esc(r[0]) + "</span><span>" + esc(r[1]) +
            (r[2] ? "<small>" + esc(r[2]) + "</small>" : "") + "</span></div>"
          );
        }).join("")
      );
    }).join("");
  }

  function renderAll() {
    var d = S.t();
    document.title = d.pageTitle;
    S.syncHeaderUI();

    document.getElementById("spec-field-dt").textContent = d.specFieldDt;
    document.getElementById("spec-field-dd").textContent = d.specFieldDd;
    document.getElementById("spec-bg-dt").textContent = d.specBgDt;
    document.getElementById("spec-bg-dd").textContent = d.specBgDd;
    document.getElementById("spec-count-dt").textContent = d.specCountDt;
    document.getElementById("sheetcount").textContent = pad(projects.length);

    document.getElementById("sec-projects-h").textContent = d.secProjects;
    document.getElementById("sec-about-h").textContent = d.secAbout;
    document.getElementById("sec-contact-h").textContent = d.secContact;

    document.getElementById("th-no").textContent = d.thNo;
    document.getElementById("th-proj").textContent = d.thProj;
    document.getElementById("th-loc").textContent = d.thLoc;
    document.getElementById("th-yr").textContent = d.thYr;
    document.getElementById("map-reset").textContent = d.resetMap;

    document.getElementById("ct-email").textContent = d.ctEmail;
    document.getElementById("ct-cv").textContent = d.ctCv;

    if (zoomCtrl && zoomCtrl._zoomInButton && zoomCtrl._zoomOutButton) {
      zoomCtrl._zoomInButton.title = d.zoomIn;
      zoomCtrl._zoomOutButton.title = d.zoomOut;
    }

    S.syncBasemapBar(document.getElementById("main-basemap-bar"));
    renderFilters();
    renderList();
    renderAbout();
  }

  document.getElementById("lang-id").addEventListener("click", function () { S.setLang("id", renderAll); });
  document.getElementById("lang-en").addEventListener("click", function () { S.setLang("en", renderAll); });
  document.getElementById("theme-toggle").addEventListener("click", function () {
    S.toggleTheme(function () { if (S.state.basemap === "minimal") refreshTileLayer(); });
  });

  renderAll();
})();
