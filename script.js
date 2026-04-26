const stories = Array.isArray(window.STORIES) ? window.STORIES : [];

const categories = ["All", "Sun", "Flood", "Fire", "Dragon", "Love", "Moon", "Princess"];
let currentFilter = "All";
let selectedStory = null;
let globe;
let tooltipEl = null;

const storyMetaEl = document.getElementById("storyMeta");
const currentRegionEl = document.getElementById("currentRegion");
const storyCardEl = document.getElementById("storyCard");
const countryRankingEl = document.getElementById("countryRanking");
const filterBarEl = document.getElementById("filterBar");

function getFilteredStories() {
  if (currentFilter === "All") return stories;
  return stories.filter((item) => item.category === currentFilter);
}

function updateHeader() {
  const countries = new Set(stories.map((item) => item.country));
  storyMetaEl.textContent = `${stories.length} stories · ${countries.size} countries`;
  currentRegionEl.textContent = selectedStory ? selectedStory.country : "Global";
}

function renderStoryCard() {
  if (!selectedStory) {
    storyCardEl.innerHTML = '<p class="placeholder">点击地球上的点位，查看神话详情。</p>';
    return;
  }

  storyCardEl.innerHTML = `
    <h3>${selectedStory.cn}</h3>
    <p class="en">${selectedStory.en}</p>
    <p class="meta">
      国家：${selectedStory.country}<br/>
      分类：${selectedStory.category}<br/>
      坐标：${selectedStory.lat.toFixed(1)}, ${selectedStory.lng.toFixed(1)}
    </p>
    <p class="desc">${selectedStory.summary || selectedStory.desc || ""}</p>
  `;
}

function renderCountryRanking() {
  const data = getFilteredStories();
  const map = {};
  data.forEach((item) => {
    map[item.country] = (map[item.country] || 0) + 1;
  });

  const ranking = Object.entries(map).sort((a, b) => b[1] - a[1]);
  countryRankingEl.innerHTML = ranking
    .map(([country, count], idx) => `<li><span>${idx + 1}. ${country}</span><span class="count">${count}</span></li>`)
    .join("");
}

function ensureTooltip() {
  if (tooltipEl) return;
  tooltipEl = document.createElement("div");
  tooltipEl.className = "point-tooltip";
  document.body.appendChild(tooltipEl);
}

function showTooltip(story, event) {
  ensureTooltip();
  tooltipEl.innerHTML = `${story.cn}<br/>${story.country} · ${story.category}`;
  tooltipEl.style.left = `${event.clientX + 12}px`;
  tooltipEl.style.top = `${event.clientY + 12}px`;
  tooltipEl.classList.add("show");
}

function moveTooltip(event) {
  if (!tooltipEl || !tooltipEl.classList.contains("show")) return;
  tooltipEl.style.left = `${event.clientX + 12}px`;
  tooltipEl.style.top = `${event.clientY + 12}px`;
}

function hideTooltip() {
  if (!tooltipEl) return;
  tooltipEl.classList.remove("show");
}

function refreshGlobePoints() {
  const data = getFilteredStories();
  const palette = {
    Sun: "#ffd166",
    Flood: "#4cc9f0",
    Fire: "#ff6b6b",
    Dragon: "#b892ff",
    Love: "#ff8fab",
    Moon: "#9cc4ff",
    Princess: "#c7b6ff"
  };

  globe
    .pointsData([])
    .labelsData([])
    .htmlElementsData(data)
    .htmlLat((d) => d.lat)
    .htmlLng((d) => d.lng)
    .htmlAltitude(() => 0.01)
    .htmlElement((d) => {
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = "glow-point";
      marker.style.setProperty("--marker-color", palette[d.category] || "#ffffff");
      if (selectedStory && selectedStory.cn === d.cn) marker.classList.add("is-selected");

      marker.addEventListener("mouseenter", (event) => {
        showTooltip(d, event);
      });
      marker.addEventListener("mousemove", moveTooltip);
      marker.addEventListener("mouseleave", () => {
        hideTooltip();
      });
      marker.addEventListener("click", (event) => {
        event.stopPropagation();
        selectedStory = d;
        renderStoryCard();
        updateHeader();
        refreshGlobePoints();
      });
      return marker;
    })
    .ringsData([...(selectedStory ? [selectedStory] : [])])
    .ringLat((d) => d.lat)
    .ringLng((d) => d.lng)
    .ringColor(() => "rgba(116, 227, 255, 0.8)")
    .ringMaxRadius(2.2)
    .ringPropagationSpeed(0.75)
    .ringRepeatPeriod(1200);
}

function initFilters() {
  filterBarEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const filter = target.dataset.filter;
    if (!categories.includes(filter)) return;

    currentFilter = filter;
    const filtered = getFilteredStories();

    if (selectedStory && !filtered.includes(selectedStory)) {
      selectedStory = null;
    }

    Array.from(filterBarEl.querySelectorAll("button")).forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === currentFilter);
    });

    refreshGlobePoints();
    renderStoryCard();
    renderCountryRanking();
    updateHeader();
  });
}

function initGlobe() {
  const globeContainer = document.getElementById("globeViz");
  const interactionContainer = document.querySelector(".globe-panel") || globeContainer;
  let isPointerInside = false;
  let isDragging = false;
  globe = Globe()(globeContainer)
    .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("rgba(0,0,0,0)")
    .atmosphereColor("#7fd8ff")
    .atmosphereAltitude(0.2)
    .showGraticules(true);

  globe.controls().autoRotate = true;
  globe.controls().autoRotateSpeed = 0.45;
  globe.controls().enableDamping = true;
  globe.pointOfView({ lat: 20, lng: 20, altitude: 2.25 }, 1000);

  function syncAutoRotate() {
    // Pause rotation while hovering or dragging for easier clicking.
    globe.controls().autoRotate = !(isPointerInside || isDragging);
  }

  function resizeGlobe() {
    const width = globeContainer.clientWidth;
    const height = globeContainer.clientHeight;
    if (!width || !height) return;
    globe.width(width).height(height);
  }

  resizeGlobe();
  window.addEventListener("resize", resizeGlobe);
  interactionContainer.addEventListener("mouseenter", () => {
    isPointerInside = true;
    syncAutoRotate();
  });
  interactionContainer.addEventListener("mouseleave", () => {
    isPointerInside = false;
    hideTooltip();
    syncAutoRotate();
  });
  globe.controls().addEventListener("start", () => {
    isDragging = true;
    syncAutoRotate();
  });
  globe.controls().addEventListener("end", () => {
    isDragging = false;
    syncAutoRotate();
  });
}

function init() {
  initGlobe();
  initFilters();
  refreshGlobePoints();
  renderStoryCard();
  renderCountryRanking();
  updateHeader();
}

init();
