const stories = Array.isArray(window.STORIES) ? window.STORIES : [];

/** 含 "All" + 数据中实际出现的分类（canonical），由 refreshCategoryLists 填充 */
let categories = ["All"];
/** 不含 All 的 canonical 分类列表，与图例、底栏按钮一一对应 */
let storyCategoryKeys = [];
let currentFilter = "All";
let searchTerm = "";
/** 国家排行榜点选：与 `item.country` 精确匹配；与分类、搜索关键词叠加 */
let rankingCountryFilter = null;
let selectedStory = null;
let globe;
let tooltipEl = null;

const storyMetaEl = document.getElementById("storyMeta");
const currentRegionEl = document.getElementById("currentRegion");
const storyCardEl = document.getElementById("storyCard");
const storyCardSectionEl = document.getElementById("storyCardSection");
const countryRankingEl = document.getElementById("countryRanking");
const filterBarEl = document.getElementById("filterBar");
const searchInputEl =
  document.getElementById("searchInput") ||
  document.querySelector('input[type="search"]') ||
  document.querySelector('input[placeholder*="搜索"]');

/** @type {'zh' | 'en'} */
let currentLang = "zh";

const I18N = {
  zh: {
    langToggleLabel: "中文 / EN",
    docTitle: "世界神话地图",
    appHeading: "世界神话地图",
    storyMetaTpl: "{n} 个故事 · {c} 个国家/地区",
    searchPlaceholder: "搜索故事名 / 国家 / 分类，例如 China、Japan、Dragon",
    storyCardSectionTitle: "故事卡片",
    storyCardDefaultHint: "点击地球上的发光点位，打开一段来自世界文明的古老故事。",
    countryRankingTitle: "国家排行榜 · 按收录故事数",
    legendHint: "图例",
    legendWrapAria: "点位分类图例",
    aboutButton: "关于项目",
    regionChipPrefix: "当前地区：",
    globalRegion: "全球",
    filterAll: "全部",
    chipCountry: "国家",
    chipRegion: "地区",
    chipCategory: "分类",
    chipEra: "时代",
    chipSourceType: "类型",
    chipConfidence: "可信度",
    storyCardFoot:
      "地点以文化起源地或代表性地区标注，部分故事存在多个版本。",
    storyEmptyFiltered: "当前筛选条件下暂无故事，请尝试切换分类或清空搜索。",
    storyEmptySearch: "没有找到相关故事，请尝试搜索国家、故事名或分类。",
    storyFilteredHintTpl: "已筛选 {country}，点击地球点位查看故事。",
    rankingFilterAriaTpl: "筛选 {country}",
    modalClose: "关闭",
    aboutModalTitle: "世界神话地图",
    aboutModalLead: "关于",
    aboutSec1Title: "项目介绍",
    aboutSec1Text:
      "这是一个用 3D 地球可视化展示世界各地神话、童话、民间传说与史诗故事的互动地图。",
    aboutSec2Title: "使用方法",
    aboutSec2Li1: "拖动地球查看不同地区",
    aboutSec2Li2: "点击发光点位查看故事卡片",
    aboutSec2Li3: "使用搜索框搜索国家、故事名或分类",
    aboutSec2Li4: "使用底部分类按钮筛选故事类型",
    aboutSec3Title: "数据说明",
    aboutSec3Text:
      "故事地点以文化起源地或代表性地区为主，部分神话/民间故事存在多个版本，数据仅作知识可视化参考。",
    confHigh: "较高可信",
    confMedium: "代表性地区",
    confLow: "存在争议",
    exploreTitle: "继续探索",
    exploreSameCountry: "同国家故事",
    exploreSameCategory: "同分类故事",
    filterStatusBarAria: "当前筛选状态",
    filterStatusAll: "当前显示：全部故事",
    filterStatusCountryTpl: "国家：{name}",
    filterStatusCategoryTpl: "分类：{name}",
    filterStatusSearchTpl: "搜索：{q}",
    clearFilters: "清空筛选",
    searchResultsAria: "搜索结果",
    searchResultsEmpty: "没有找到相关故事，试试国家、分类或英文关键词。",
    searchResultsMoreTpl: "还有 {x} 个结果，请继续缩小搜索范围"
  },
  en: {
    langToggleLabel: "CN / English",
    docTitle: "World Myth Map",
    appHeading: "World Myth Map",
    storyMetaTpl: "{n} stories · {c} countries/regions",
    searchPlaceholder: "Search story, country, or category, e.g. China, Japan, Dragon",
    storyCardSectionTitle: "Story Card",
    storyCardDefaultHint:
      "Click a glowing point on the globe to open an ancient story from world civilizations.",
    countryRankingTitle: "Country Ranking · By Collected Stories",
    legendHint: "Legend",
    legendWrapAria: "Category legend for map points",
    aboutButton: "About",
    regionChipPrefix: "Region: ",
    globalRegion: "Global",
    filterAll: "All",
    chipCountry: "Country",
    chipRegion: "Region",
    chipCategory: "Category",
    chipEra: "Era",
    chipSourceType: "Type",
    chipConfidence: "Confidence",
    storyCardFoot:
      "Locations emphasize cultural origins or representative regions; many tales exist in multiple versions.",
    storyEmptyFiltered:
      "No stories match the current filters. Try another category or clear the search.",
    storyEmptySearch: "No stories found. Try a country, title, or category.",
    storyFilteredHintTpl: "Filtered to {country}. Click a glowing point on the globe to read a story.",
    rankingFilterAriaTpl: "Filter by {country}",
    modalClose: "Close",
    aboutModalTitle: "World Myth Map",
    aboutModalLead: "About",
    aboutSec1Title: "Introduction",
    aboutSec1Text:
      "An interactive 3D globe that visualizes myths, fairy tales, folk tales, and epics from cultures around the world.",
    aboutSec2Title: "How to use",
    aboutSec2Li1: "Drag the globe to explore different regions",
    aboutSec2Li2: "Click a glowing point to open the story card",
    aboutSec2Li3: "Search by country, story name, or category",
    aboutSec2Li4: "Use the category chips at the bottom to filter story types",
    aboutSec3Title: "Data note",
    aboutSec3Text:
      "Story locations emphasize cultural origins or representative regions; many tales exist in multiple versions. Data is for reference only.",
    confHigh: "High confidence",
    confMedium: "Representative region",
    confLow: "Disputed",
    exploreTitle: "Continue Exploring",
    exploreSameCountry: "Same Country",
    exploreSameCategory: "Same Category",
    filterStatusBarAria: "Active filters",
    filterStatusAll: "Showing: All stories",
    filterStatusCountryTpl: "Country: {name}",
    filterStatusCategoryTpl: "Category: {name}",
    filterStatusSearchTpl: "Search: {q}",
    clearFilters: "Clear filters",
    searchResultsAria: "Search results",
    searchResultsEmpty: "No stories found. Try a country, category, or English keyword.",
    searchResultsMoreTpl: "{x} more results. Refine your search."
  }
};

function t(key) {
  const pack = I18N[currentLang];
  return pack && Object.prototype.hasOwnProperty.call(pack, key) ? pack[key] : key;
}

function formatTpl(str, vars) {
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ""));
}

function getFilterButtonLabel(filterKey) {
  if (filterKey === "All") return t("filterAll");
  if (currentLang === "en") return filterKey;
  const { zh } = getLegendLabels(filterKey);
  return zh;
}

/**
 * 地图点位：分类图标徽章（仅外观；统一 24 视图 SVG + stroke，无 emoji）
 * 字段：svg、color（图标主色）、glowColor（外晕）、cls（修饰类名）、ringColor（选中时 Globe 波纹）
 * 不参与筛选/数据/点击业务逻辑
 */
const CATEGORY_GLYPHS = {
  Sun: {
    color: "#e8bc4a",
    glowColor: "#f5d078",
    cls: "glow-point--sun",
    ringColor: "rgba(245, 208, 120, 0.55)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.25" /><path d="M12 2.25v2" /><path d="M12 19.75v2" /><path d="m4.35 4.35 1.4 1.4" /><path d="m18.25 18.25 1.4 1.4" /><path d="M2.25 12h2" /><path d="M19.75 12h2" /><path d="m5.75 18.25-1.4 1.4" /><path d="m19.65 4.35-1.4 1.4" /></svg>'
  },
  Flood: {
    color: "#5eb0d4",
    glowColor: "#7ec8e8",
    cls: "glow-point--flood",
    ringColor: "rgba(110, 200, 232, 0.5)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7.5c.65.55 1.35 1 2.75 1 2.6 0 2.4-2 5-2s2.4 2 5 2 2.5-2 5-2c1.4 0 2.1.45 2.75 1" /><path d="M2 12.5c.65.55 1.35 1 2.75 1 2.6 0 2.4-2 5-2s2.4 2 5 2 2.5-2 5-2c1.4 0 2.1.45 2.75 1" /><path d="M2 17.5c.65.55 1.35 1 2.75 1 2.6 0 2.4-2 5-2s2.4 2 5 2 2.5-2 5-2c1.4 0 2.1.45 2.75 1" /></svg>'
  },
  Fire: {
    color: "#e86848",
    glowColor: "#ff9468",
    cls: "glow-point--fire",
    ringColor: "rgba(255, 148, 104, 0.52)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c3.2 0 5.5-2.1 5.5-5.2 0-2.4-1.2-4.2-2.8-6.1-.9-1-1.7-2.4-1.7-3.7 0-.8.2-1.5.5-2.1-2.2 1.8-3.5 4.2-3.5 6.8 0 1.2.3 2.2.8 3.1-1.1-.6-1.8-1.7-1.8-3.1 0-1.4.6-2.6 1.4-3.6C6.8 8.2 5.5 10.5 5.5 13.2 5.5 16.6 8.2 20 12 20Z" /></svg>'
  },
  Dragon: {
    color: "#8b7fd8",
    glowColor: "#b0a6f0",
    cls: "glow-point--dragon",
    ringColor: "rgba(160, 150, 235, 0.52)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.4" /><circle cx="12" cy="12" r="6.8" stroke-dasharray="3.2 3.8" /></svg>'
  },
  Love: {
    color: "#d884a8",
    glowColor: "#f0a0c4",
    cls: "glow-point--love",
    ringColor: "rgba(240, 160, 196, 0.5)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 8.2c0-2.65-2.1-4.45-4.65-4.45-1.55 0-3 .75-3.85 2.05-.85-1.3-2.3-2.05-3.85-2.05C4.6 3.75 2.5 5.55 2.5 8.2c0 2.85 2.55 5.15 6.4 8.65L12 21l3.1-4.15c3.85-3.5 6.4-5.8 6.4-8.65Z" /></svg>'
  },
  Moon: {
    color: "#9eb6e0",
    glowColor: "#c8d8f5",
    cls: "glow-point--moon",
    ringColor: "rgba(180, 205, 245, 0.48)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" /></svg>'
  },
  Princess: {
    color: "#d4b078",
    glowColor: "#ecd4a0",
    cls: "glow-point--princess",
    ringColor: "rgba(236, 212, 160, 0.5)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l2.5 10h11L20 8l-4.5 5-3.5-5-3.5 5L4 8z" /><path d="M6.5 18h11" /><path d="M9 8l1.5-2h3L15 8" /></svg>'
  },
  Hero: {
    color: "#a8bdd8",
    glowColor: "#dce8f5",
    cls: "glow-point--hero",
    ringColor: "rgba(200, 218, 245, 0.48)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="m10 5 2-2 2 2" /><path d="M12 5v11" /><path d="M8.5 16h7" /><path d="M12 16v3.5" /></svg>'
  },
  Creation: {
    color: "#e8dc98",
    glowColor: "#faf0c8",
    cls: "glow-point--creation",
    ringColor: "rgba(248, 236, 180, 0.5)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.6 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="2.2" /></svg>'
  },
  Underworld: {
    color: "#7a7490",
    glowColor: "#9a94b0",
    cls: "glow-point--underworld",
    ringColor: "rgba(130, 125, 155, 0.45)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11c1.5-3 4.2-4.5 5-4.5s3.5 1.5 5 4.5" /><path d="M9 11v5.5c0 2 1.3 3.5 3 3.5s3-1.5 3-3.5V11" /><path d="M8 17.5h8" /></svg>'
  },
  Trickster: {
    color: "#5ec4b0",
    glowColor: "#88e0d0",
    cls: "glow-point--trickster",
    ringColor: "rgba(100, 210, 190, 0.48)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11c1.8-2.2 4.2-3.2 7-3.2s5.2 1 7 3.2" /><ellipse cx="9" cy="12" rx="1.1" ry="1.35" /><ellipse cx="15" cy="12" rx="1.1" ry="1.35" /><path d="M9 16c1.2 1.2 2.8 1.8 4.5 1.8s3.3-.6 4.5-1.8" /></svg>'
  },
  Monster: {
    color: "#c85858",
    glowColor: "#e88880",
    cls: "glow-point--monster",
    ringColor: "rgba(232, 120, 110, 0.48)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6c1.5 3 1.2 7-.8 10" /><path d="M12 5c0 4 .2 8-1 12" /><path d="M18 6c-1.5 3-1.2 7 .8 10" /></svg>'
  },
  Evil: {
    color: "#a85888",
    glowColor: "#d070a0",
    cls: "glow-point--evil",
    ringColor: "rgba(200, 100, 160, 0.45)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6l1.2 2.8" /><path d="M16 6l-1.2 2.8" /><path d="M8 14.5c1.3 2 3.4 3.5 5.5 3.5s4.2-1.5 5.5-3.5" /></svg>'
  },
  __default: {
    color: "#9eb0d0",
    glowColor: "#c0d4f0",
    cls: "glow-point--other",
    ringColor: "rgba(170, 190, 220, 0.45)",
    svg:
      '<svg class="glow-point__svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v2.5" /><path d="M12 16.5V19" /><path d="M5.5 12H8" /><path d="M16 12h2.5" /><circle cx="12" cy="12" r="2" /></svg>'
  }
};

/** 归一化后再查图标：与 normalizeCategoryKey 输出一致 */
const CATEGORY_KEY_ALIASES = {
  Dark: "Evil"
};

/** 底栏 / 图例排序：其余未知分类按字母排在后面 */
const CATEGORY_SORT_ORDER = [
  "Sun",
  "Flood",
  "Fire",
  "Dragon",
  "Love",
  "Moon",
  "Princess",
  "Hero",
  "Creation",
  "Underworld",
  "Trickster",
  "Monster",
  "Evil"
];

/** 图例展示用中文名；英文默认用 canonical key，Evil 行显示 Evil / Dark */
const CATEGORY_LABEL_META = {
  Sun: { zh: "太阳" },
  Flood: { zh: "洪水" },
  Fire: { zh: "火焰" },
  Dragon: { zh: "龙" },
  Love: { zh: "爱情" },
  Moon: { zh: "月亮" },
  Princess: { zh: "公主" },
  Hero: { zh: "英雄" },
  Creation: { zh: "创世" },
  Underworld: { zh: "冥界" },
  Trickster: { zh: "诡计者" },
  Monster: { zh: "怪物" },
  Evil: { en: "Evil / Dark", zh: "黑暗" }
};

const GLYPH_CATEGORY_KEYS = Object.keys(CATEGORY_GLYPHS).filter((k) => k !== "__default");

/**
 * 将 story.category 规范为与筛选、图例、底栏共用的 canonical key（trim、大小写、别名）
 */
function normalizeCategoryKey(raw) {
  if (raw == null) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const spaced = s.replace(/\s+/g, " ");
  const lower = spaced.toLowerCase();
  const compact = lower.replace(/\s/g, "");

  if (compact === "underworld" || lower === "under world") return "Underworld";

  if (
    lower === "evil / dark" ||
    lower === "evil/dark" ||
    compact === "evil" ||
    compact === "dark" ||
    compact === "evildark"
  ) {
    return "Evil";
  }

  const hit = GLYPH_CATEGORY_KEYS.find((k) => k.toLowerCase() === lower || k.toLowerCase() === compact);
  if (hit) return hit;

  if (Object.prototype.hasOwnProperty.call(CATEGORY_KEY_ALIASES, spaced))
    return CATEGORY_KEY_ALIASES[spaced];
  if (Object.prototype.hasOwnProperty.call(CATEGORY_KEY_ALIASES, s)) return CATEGORY_KEY_ALIASES[s];

  return spaced
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function sortCategoryKeys(keys) {
  const set = new Set(keys);
  const head = CATEGORY_SORT_ORDER.filter((k) => set.has(k));
  const tail = keys.filter((k) => !head.includes(k)).sort((a, b) => a.localeCompare(b));
  return [...head, ...tail];
}

function computeStoryCategoryKeys() {
  const set = new Set();
  stories.forEach((item) => {
    const k = normalizeCategoryKey(item.category);
    if (k) set.add(k);
  });
  return sortCategoryKeys([...set]);
}

function getLegendLabels(canonicalKey) {
  const meta = CATEGORY_LABEL_META[canonicalKey];
  const en = meta && meta.en ? meta.en : canonicalKey;
  const zh = meta && meta.zh ? meta.zh : canonicalKey;
  return { en, zh };
}

function getCategoryMarkerLook(category) {
  let key = normalizeCategoryKey(category || "");
  if (key && CATEGORY_KEY_ALIASES[key]) key = CATEGORY_KEY_ALIASES[key];
  if (key && CATEGORY_GLYPHS[key]) return CATEGORY_GLYPHS[key];
  return CATEGORY_GLYPHS.__default;
}

function getSelectedRingColor() {
  if (!selectedStory) return "rgba(150, 160, 195, 0.42)";
  const look = getCategoryMarkerLook(selectedStory.category);
  return look.ringColor || "rgba(190, 175, 255, 0.55)";
}

function syncLegendActive() {
  const wrap = document.getElementById("categoryLegendWrap");
  if (!wrap) return;
  wrap.querySelectorAll(".legend-item").forEach((el) => {
    const f = el.dataset.legendFilter;
    const on = f === currentFilter;
    el.classList.toggle("is-active", on);
    el.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function hasActiveFiltersState() {
  const q = String(searchTerm || "").trim();
  return !!(rankingCountryFilter || currentFilter !== "All" || q);
}

function updateFilterStatusBar() {
  const bar = document.getElementById("filterStatusBar");
  const chipsEl = document.getElementById("filterStatusChips");
  const clearBtn = document.getElementById("clearFiltersBtn");
  if (bar) bar.setAttribute("aria-label", t("filterStatusBarAria"));
  if (!chipsEl) return;

  chipsEl.innerHTML = "";
  const active = hasActiveFiltersState();

  if (!active) {
    const p = document.createElement("p");
    p.className = "filter-status-all";
    p.textContent = t("filterStatusAll");
    chipsEl.appendChild(p);
  } else {
    if (rankingCountryFilter) {
      const span = document.createElement("span");
      span.className = "filter-status-chip";
      span.textContent = formatTpl(t("filterStatusCountryTpl"), {
        name: getCountryDisplayName(rankingCountryFilter)
      });
      chipsEl.appendChild(span);
    }
    if (currentFilter !== "All") {
      const span = document.createElement("span");
      span.className = "filter-status-chip";
      span.textContent = formatTpl(t("filterStatusCategoryTpl"), {
        name: getFilterButtonLabel(currentFilter)
      });
      chipsEl.appendChild(span);
    }
    const q = String(searchTerm || "").trim();
    if (q) {
      const span = document.createElement("span");
      span.className = "filter-status-chip";
      span.textContent = formatTpl(t("filterStatusSearchTpl"), { q });
      chipsEl.appendChild(span);
    }
  }

  if (clearBtn) {
    clearBtn.textContent = t("clearFilters");
    clearBtn.disabled = !active;
  }
}

function clearAllFilters() {
  if (!hasActiveFiltersState()) return;
  selectedStory = null;
  applyCategoryFilter("All");
}

function initClearFilters() {
  const btn = document.getElementById("clearFiltersBtn");
  if (!btn || btn.dataset.clearBound === "1") return;
  btn.dataset.clearBound = "1";
  btn.addEventListener("click", () => clearAllFilters());
}

/**
 * 与底部分类按钮、图例共用 currentFilter；仅接受 categories 中的值（由数据推导）。
 */
function applyCategoryFilter(filter) {
  if (filter === "All") {
    currentFilter = "All";
  } else if (categories.includes(filter)) {
    currentFilter = filter;
  } else {
    return;
  }

  if (filter === "All") {
    rankingCountryFilter = null;
    searchTerm = "";
    if (searchInputEl) searchInputEl.value = "";
  }

  const filtered = getFilteredStories();
  if (selectedStory && !filtered.includes(selectedStory)) {
    selectedStory = null;
  }

  if (filterBarEl) {
    Array.from(filterBarEl.querySelectorAll("button")).forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === currentFilter);
    });
  }

  refreshGlobePoints();
  renderStoryCard();
  renderCountryRanking();
  updateHeader();
  syncLegendActive();
  updateFilterStatusBar();
  renderSearchResults();
}

const countryAliasMap = {
  中国: "China",
  大陆: "China",
  日本: "Japan",
  韩国: "Korea",
  朝鲜: "Korea",
  蒙古: "Mongolia",
  台湾: "Taiwan",
  印度: "India",
  尼泊尔: "Nepal",
  斯里兰卡: "Sri Lanka",
  孟加拉: "Bangladesh",
  泰国: "Thailand",
  越南: "Vietnam",
  柬埔寨: "Cambodia",
  老挝: "Laos",
  缅甸: "Myanmar",
  马来西亚: "Malaysia",
  印尼: "Indonesia",
  印度尼西亚: "Indonesia",
  菲律宾: "Philippines",
  新加坡: "Singapore",
  澳大利亚: "Australia",
  澳洲: "Australia",
  新西兰: "New Zealand",
  希腊: "Greece",
  罗马: "Italy",
  意大利: "Italy",
  法国: "France",
  德国: "Germany",
  英国: ["United Kingdom", "England", "Scotland", "Wales"],
  英格兰: ["United Kingdom", "England"],
  苏格兰: ["United Kingdom", "Scotland"],
  威尔士: ["United Kingdom", "Wales"],
  爱尔兰: "Ireland",
  挪威: "Norway",
  瑞典: "Sweden",
  芬兰: "Finland",
  冰岛: "Iceland",
  丹麦: "Denmark",
  俄罗斯: "Russia",
  乌克兰: "Ukraine",
  波兰: "Poland",
  捷克: "Czech Republic",
  匈牙利: "Hungary",
  西班牙: "Spain",
  葡萄牙: "Portugal",
  荷兰: "Netherlands",
  埃及: "Egypt",
  尼日利亚: "Nigeria",
  加纳: "Ghana",
  肯尼亚: "Kenya",
  埃塞俄比亚: "Ethiopia",
  南非: "South Africa",
  摩洛哥: "Morocco",
  苏丹: "Sudan",
  刚果: "Congo",
  马里: "Mali",
  美国: "United States",
  美洲原住民: ["United States", "Canada"],
  加拿大: "Canada",
  墨西哥: "Mexico",
  秘鲁: "Peru",
  巴西: "Brazil",
  智利: "Chile",
  阿根廷: "Argentina",
  玻利维亚: "Bolivia",
  危地马拉: "Guatemala",
  伊朗: "Iran",
  波斯: "Iran",
  伊拉克: "Iraq",
  巴比伦: "Iraq",
  苏美尔: "Iraq",
  以色列: "Israel",
  土耳其: "Turkey",
  沙特: "Saudi Arabia",
  阿拉伯: "Saudi Arabia",
  叙利亚: "Syria",
  黎巴嫩: "Lebanon",
  阿尔及利亚: "Algeria",
  亚美尼亚: "Armenia",
  格鲁吉亚: "Georgia",
  约旦: "Jordan",
  塞尔维亚: "Serbia",
  斯洛伐克: "Slovakia",
  罗马尼亚: "Romania",
  保加利亚: "Bulgaria",
  克罗地亚: "Croatia",
  突尼斯: "Tunisia",
  坦桑尼亚: "Tanzania",
  巴基斯坦: "Pakistan",
  萨摩亚: "Samoa",
  斐济: "Fiji",
  巴布亚新几内亚: "Papua New Guinea",
  法罗群岛: "Faroe Islands"
};

const countryDisplayAliasMap = {
  China: ["中国", "大陆"],
  Japan: ["日本"],
  Korea: ["韩国", "朝鲜"],
  Mongolia: ["蒙古"],
  Taiwan: ["台湾"],
  India: ["印度"],
  Nepal: ["尼泊尔"],
  "Sri Lanka": ["斯里兰卡"],
  Bangladesh: ["孟加拉"],
  Thailand: ["泰国"],
  Cambodia: ["柬埔寨"],
  Malaysia: ["马来西亚"],
  Indonesia: ["印尼", "印度尼西亚"],
  Philippines: ["菲律宾"],
  Australia: ["澳大利亚", "澳洲"],
  "New Zealand": ["新西兰"],
  Greece: ["希腊"],
  Italy: ["意大利", "罗马"],
  Ireland: ["爱尔兰"],
  Norway: ["挪威"],
  Sweden: ["瑞典"],
  Finland: ["芬兰"],
  Iceland: ["冰岛"],
  Denmark: ["丹麦"],
  Russia: ["俄罗斯"],
  Ukraine: ["乌克兰"],
  Poland: ["波兰"],
  "Czech Republic": ["捷克"],
  Hungary: ["匈牙利"],
  Spain: ["西班牙"],
  Portugal: ["葡萄牙"],
  Egypt: ["埃及"],
  Nigeria: ["尼日利亚"],
  Ghana: ["加纳"],
  Kenya: ["肯尼亚"],
  Ethiopia: ["埃塞俄比亚"],
  "South Africa": ["南非"],
  Morocco: ["摩洛哥"],
  Congo: ["刚果"],
  "United States": ["美国", "美洲原住民"],
  Canada: ["加拿大"],
  Mexico: ["墨西哥"],
  Peru: ["秘鲁"],
  Brazil: ["巴西"],
  Chile: ["智利"],
  Argentina: ["阿根廷"],
  Bolivia: ["玻利维亚"],
  Guatemala: ["危地马拉"],
  Iran: ["伊朗", "波斯"],
  Iraq: ["伊拉克", "巴比伦", "苏美尔"],
  Israel: ["以色列"],
  Turkey: ["土耳其"],
  "Saudi Arabia": ["沙特", "阿拉伯"],
  Syria: ["叙利亚"],
  Lebanon: ["黎巴嫩"],
  England: ["英格兰", "英国"],
  Scotland: ["苏格兰", "英国"],
  Wales: ["威尔士", "英国"],
  "Faroe Islands": ["法罗群岛"]
};

/** 状态栏等 UI：中文下优先用常见中文国名，否则用数据里的英文 country */
function getCountryDisplayName(country) {
  if (!country) return "";
  if (currentLang === "en") return String(country);
  const list = countryDisplayAliasMap[country];
  if (list && list.length) return list[0];
  return String(country);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function buildSearchKeywords(rawTerm) {
  const normalized = normalizeText(rawTerm);
  if (!normalized) return [];
  const compact = normalized.replace(/\s+/g, "");
  const terms = new Set([normalized, compact]);
  Object.entries(countryAliasMap).forEach(([zhAlias, mapped]) => {
    const alias = normalizeText(zhAlias);
    if (!alias || !compact.includes(alias.replace(/\s+/g, ""))) return;
    const targets = Array.isArray(mapped) ? mapped : [mapped];
    targets.forEach((target) => {
      const t = normalizeText(target);
      terms.add(t);
      terms.add(t.replace(/\s+/g, ""));
    });
  });
  return [...terms];
}

function getFilteredStories() {
  const terms = buildSearchKeywords(searchTerm);
  return stories.filter((item) => {
    const itemCat = normalizeCategoryKey(item.category);
    const passCategory = currentFilter === "All" || itemCat === currentFilter;
    if (!passCategory) return false;
    if (rankingCountryFilter && item.country !== rankingCountryFilter) return false;
    if (!terms.length) return true;

    const aliases = countryDisplayAliasMap[item.country] || [];
    const haystack = [
      item.cn,
      item.en,
      item.country,
      ...aliases,
      item.region,
      item.category,
      item.era,
      item.sourceType,
      item.summary
    ]
      .filter(Boolean)
      .map((v) => normalizeText(v))
      .join(" ");
    const haystackCompact = haystack.replace(/\s+/g, "");

    return terms.some((term) => haystack.includes(term) || haystackCompact.includes(term));
  });
}

function updateHeader() {
  const countries = new Set(stories.map((item) => item.country));
  const n = stories.length;
  const c = countries.size;
  storyMetaEl.textContent = formatTpl(t("storyMetaTpl"), { n, c });
  if (selectedStory) {
    currentRegionEl.textContent = selectedStory.country;
  } else if (rankingCountryFilter) {
    currentRegionEl.textContent = rankingCountryFilter;
  } else {
    currentRegionEl.textContent = t("globalRegion");
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasDisplayText(value) {
  return value != null && String(value).trim() !== "";
}

function getConfidenceChip(value) {
  if (!hasDisplayText(value)) return null;
  const k = String(value).trim().toLowerCase();
  if (k === "high") return { text: t("confHigh"), key: "high" };
  if (k === "medium") return { text: t("confMedium"), key: "medium" };
  if (k === "low") return { text: t("confLow"), key: "low" };
  return { text: String(value).trim(), key: "other" };
}

function storyExploreTitle(story) {
  if (currentLang === "zh") {
    if (hasDisplayText(story.cn)) return story.cn;
    if (hasDisplayText(story.en)) return story.en;
    return "";
  }
  if (hasDisplayText(story.en)) return story.en;
  if (hasDisplayText(story.cn)) return story.cn;
  return "";
}

function buildExploreRecommendationsHtml(current) {
  const visible = new Set(getFilteredStories());
  const curCat = normalizeCategoryKey(current.category);
  const sameCountry = stories
    .filter((st) => st !== current && st.country === current.country && visible.has(st))
    .slice(0, 3);
  const sameCategory = stories
    .filter(
      (st) =>
        st !== current &&
        visible.has(st) &&
        curCat &&
        normalizeCategoryKey(st.category) === curCat
    )
    .slice(0, 3);

  const groups = [];
  if (sameCountry.length > 0) {
    const btns = sameCountry
      .map((st) => {
        const label = escapeHtml(storyExploreTitle(st));
        const cnAttr = escapeHtml(st.cn);
        return `<button type="button" class="explore-rec__item" data-story-cn="${cnAttr}">${label}</button>`;
      })
      .join("");
    groups.push(
      `<div class="explore-rec__group"><h4 class="explore-rec__sub">${escapeHtml(
        t("exploreSameCountry")
      )}</h4><div class="explore-rec__list">${btns}</div></div>`
    );
  }
  if (sameCategory.length > 0) {
    const btns = sameCategory
      .map((st) => {
        const label = escapeHtml(storyExploreTitle(st));
        const cnAttr = escapeHtml(st.cn);
        return `<button type="button" class="explore-rec__item" data-story-cn="${cnAttr}">${label}</button>`;
      })
      .join("");
    groups.push(
      `<div class="explore-rec__group"><h4 class="explore-rec__sub">${escapeHtml(
        t("exploreSameCategory")
      )}</h4><div class="explore-rec__list">${btns}</div></div>`
    );
  }
  if (!groups.length) return "";
  return `<section class="explore-rec" aria-label="${escapeHtml(t("exploreTitle"))}"><h3 class="explore-rec__title">${escapeHtml(
    t("exploreTitle")
  )}</h3>${groups.join("")}</section>`;
}

function selectStoryAndRefresh(story) {
  selectedStory = story;
  renderStoryCard();
  updateHeader();
  refreshGlobePoints();
  updateFilterStatusBar();
}

const MAX_SEARCH_RESULTS_PREVIEW = 8;

function getCategoryDisplayForSearch(story) {
  const raw = story.category;
  if (!hasDisplayText(raw)) return "";
  const key = normalizeCategoryKey(raw);
  if (currentLang === "en") return key || String(raw).trim();
  if (key && categories.includes(key)) return getFilterButtonLabel(key);
  const { zh } = getLegendLabels(key || raw);
  return zh || String(raw).trim();
}

function getSearchResultSummaryLine(story) {
  const text = hasDisplayText(story.summary)
    ? story.summary
    : story.desc && hasDisplayText(story.desc)
      ? story.desc
      : "";
  return String(text).replace(/\s+/g, " ").trim();
}

function renderSearchResults() {
  const panel = document.getElementById("searchResultsPanel");
  const inner = document.getElementById("searchResultsInner");
  if (!panel || !inner) return;

  panel.setAttribute("aria-label", t("searchResultsAria"));

  const q = String(searchTerm || "").trim();
  if (!q) {
    inner.innerHTML = "";
    panel.hidden = true;
    return;
  }

  panel.hidden = false;
  const filtered = getFilteredStories();

  if (filtered.length === 0) {
    inner.innerHTML = `<p class="search-results-empty">${escapeHtml(t("searchResultsEmpty"))}</p>`;
    return;
  }

  const shown = filtered.slice(0, MAX_SEARCH_RESULTS_PREVIEW);
  const more = filtered.length - shown.length;

  const rows = shown
    .map((st) => {
      const title = escapeHtml(storyExploreTitle(st));
      const cnAttr = escapeHtml(st.cn);
      const country = escapeHtml(getCountryDisplayName(st.country));
      const cat = escapeHtml(getCategoryDisplayForSearch(st));
      const meta = cat ? `${country} · ${cat}` : country;
      const sumRaw = getSearchResultSummaryLine(st);
      const sum = sumRaw ? escapeHtml(sumRaw) : "";
      const sumHtml = sum ? `<span class="search-result-item__sum">${sum}</span>` : "";
      return `<button type="button" class="search-result-item" data-story-cn="${cnAttr}"><span class="search-result-item__title">${title}</span><span class="search-result-item__meta">${meta}</span>${sumHtml}</button>`;
    })
    .join("");

  const moreHtml =
    more > 0
      ? `<p class="search-results-more">${escapeHtml(formatTpl(t("searchResultsMoreTpl"), { x: String(more) }))}</p>`
      : "";

  inner.innerHTML = rows + moreHtml;
}

function initSearchResultsNav() {
  const panel = document.getElementById("searchResultsPanel");
  if (!panel || panel.dataset.searchResultsNavBound === "1") return;
  panel.dataset.searchResultsNavBound = "1";
  panel.addEventListener("click", (event) => {
    const btn = event.target.closest(".search-result-item[data-story-cn]");
    if (!btn) return;
    const cn = btn.getAttribute("data-story-cn");
    if (!cn) return;
    const found = stories.find((x) => x.cn === cn);
    if (found) {
      event.preventDefault();
      selectStoryAndRefresh(found);
    }
  });
}

function buildSelectedStoryCardHtml(s) {
  const blocks = [];
  if (currentLang === "zh") {
    if (hasDisplayText(s.cn)) {
      blocks.push(`<h3 class="story-card__title">${escapeHtml(s.cn)}</h3>`);
    }
    if (hasDisplayText(s.en)) {
      blocks.push(`<p class="story-card__en story-card__subtitle">${escapeHtml(s.en)}</p>`);
    }
  } else {
    if (hasDisplayText(s.en)) {
      blocks.push(`<h3 class="story-card__title">${escapeHtml(s.en)}</h3>`);
    }
    if (hasDisplayText(s.cn)) {
      blocks.push(`<p class="story-card__en story-card__subtitle">${escapeHtml(s.cn)}</p>`);
    }
  }

  const chipParts = [];
  if (hasDisplayText(s.country)) {
    chipParts.push(
      `<span class="story-chip story-chip--country" title="${escapeHtml(t("chipCountry"))}">${escapeHtml(
        s.country
      )}</span>`
    );
  }
  if (hasDisplayText(s.region)) {
    chipParts.push(
      `<span class="story-chip story-chip--region" title="${escapeHtml(t("chipRegion"))}">${escapeHtml(
        s.region
      )}</span>`
    );
  }
  if (hasDisplayText(s.category)) {
    chipParts.push(
      `<span class="story-chip story-chip--category" title="${escapeHtml(t("chipCategory"))}">${escapeHtml(
        s.category
      )}</span>`
    );
  }
  if (hasDisplayText(s.sourceType)) {
    chipParts.push(
      `<span class="story-chip story-chip--sourcetype" title="${escapeHtml(t("chipSourceType"))}">${escapeHtml(
        s.sourceType
      )}</span>`
    );
  }
  if (hasDisplayText(s.era)) {
    chipParts.push(
      `<span class="story-chip story-chip--era" title="${escapeHtml(t("chipEra"))}">${escapeHtml(s.era)}</span>`
    );
  }
  const confChip = getConfidenceChip(s.confidence);
  if (confChip) {
    chipParts.push(
      `<span class="story-chip story-chip--confidence story-chip--conf-${confChip.key}" title="${escapeHtml(
        t("chipConfidence")
      )}">${escapeHtml(confChip.text)}</span>`
    );
  }
  if (chipParts.length) {
    blocks.push(`<div class="story-card__chips">${chipParts.join("")}</div>`);
  }

  const summaryText = hasDisplayText(s.summary)
    ? s.summary
    : s.desc && hasDisplayText(s.desc)
      ? s.desc
      : null;
  if (summaryText) {
    blocks.push(`<p class="story-card__summary">${escapeHtml(summaryText)}</p>`);
  }

  blocks.push(`<p class="story-card__foot">${escapeHtml(t("storyCardFoot"))}</p>`);
  const exploreHtml = buildExploreRecommendationsHtml(s);
  const inner = blocks.join("") + exploreHtml;
  return `<div class="story-card__scroll">${inner}</div>`;
}

function renderStoryCard() {
  const filtered = getFilteredStories();
  if (filtered.length === 0) {
    if (rankingCountryFilter || currentFilter !== "All") {
      storyCardEl.innerHTML = `<p class="placeholder">${escapeHtml(t("storyEmptyFiltered"))}</p>`;
    } else {
      storyCardEl.innerHTML = `<p class="placeholder">${escapeHtml(t("storyEmptySearch"))}</p>`;
    }
    return;
  }

  if (!selectedStory) {
    if (rankingCountryFilter) {
      storyCardEl.innerHTML = `<p class="placeholder">${escapeHtml(
        formatTpl(t("storyFilteredHintTpl"), { country: rankingCountryFilter })
      )}</p>`;
    } else {
      storyCardEl.innerHTML = `<p class="placeholder">${escapeHtml(t("storyCardDefaultHint"))}</p>`;
    }
    return;
  }

  storyCardEl.innerHTML = buildSelectedStoryCardHtml(selectedStory);

  if (window.matchMedia && window.matchMedia("(max-width: 767px)").matches) {
    const anchor = storyCardSectionEl || storyCardEl.closest(".card-block") || storyCardEl;
    requestAnimationFrame(() => {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function renderCountryRanking() {
  const data = getFilteredStories();
  const map = {};
  data.forEach((item) => {
    map[item.country] = (map[item.country] || 0) + 1;
  });

  const ranking = Object.entries(map).sort((a, b) => b[1] - a[1]);
  countryRankingEl.innerHTML = ranking
    .map(([country, count], idx) => {
      const safeCountry = escapeHtml(country);
      const selected = rankingCountryFilter === country;
      const selClass = selected ? " is-country-selected" : "";
      const pressed = selected ? "true" : "false";
      const ariaFilter = formatTpl(t("rankingFilterAriaTpl"), { country });
      return `<li class="country-ranking-item${selClass}" data-country="${safeCountry}" role="button" tabindex="0" aria-pressed="${pressed}" aria-label="${escapeHtml(ariaFilter)}"><span>${idx + 1}. ${safeCountry}</span><span class="count">${count}</span></li>`;
    })
    .join("");
}

function applyRankingCountryToggle(country) {
  if (!country || !countryRankingEl) return;
  if (rankingCountryFilter === country) {
    rankingCountryFilter = null;
    searchTerm = "";
    if (searchInputEl) searchInputEl.value = "";
  } else {
    rankingCountryFilter = country;
    searchTerm = country;
    if (searchInputEl) searchInputEl.value = country;
  }
  const filtered = getFilteredStories();
  if (selectedStory && !filtered.includes(selectedStory)) {
    selectedStory = null;
  }
  refreshGlobePoints();
  renderStoryCard();
  renderCountryRanking();
  updateHeader();
  updateFilterStatusBar();
  renderSearchResults();
}

function initStoryExploreNav() {
  if (!storyCardEl || storyCardEl.dataset.exploreNavBound === "1") return;
  storyCardEl.dataset.exploreNavBound = "1";
  storyCardEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".explore-rec__item[data-story-cn]");
    if (!btn) return;
    const cn = btn.getAttribute("data-story-cn");
    if (!cn) return;
    const found = stories.find((x) => x.cn === cn);
    if (found) {
      event.preventDefault();
      selectStoryAndRefresh(found);
    }
  });
}

function initCountryRankingNav() {
  if (!countryRankingEl || countryRankingEl.dataset.rankingNavBound === "1") return;
  countryRankingEl.dataset.rankingNavBound = "1";
  countryRankingEl.addEventListener("click", (event) => {
    const li = event.target.closest(".country-ranking-item[data-country]");
    if (!li) return;
    const country = li.getAttribute("data-country");
    if (!country) return;
    applyRankingCountryToggle(country);
  });
  countryRankingEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const li = event.target.closest(".country-ranking-item[data-country]");
    if (!li) return;
    if (event.key === " ") event.preventDefault();
    const country = li.getAttribute("data-country");
    if (country) applyRankingCountryToggle(country);
  });
}

function ensureTooltip() {
  if (tooltipEl) return;
  tooltipEl = document.createElement("div");
  tooltipEl.className = "point-tooltip";
  document.body.appendChild(tooltipEl);
}

function storyPrimaryLineForTooltip(story) {
  if (currentLang === "zh") {
    if (hasDisplayText(story.cn)) return story.cn;
    if (hasDisplayText(story.en)) return story.en;
    return "";
  }
  if (hasDisplayText(story.en)) return story.en;
  if (hasDisplayText(story.cn)) return story.cn;
  return "";
}

function showTooltip(story, event) {
  ensureTooltip();
  const primary = storyPrimaryLineForTooltip(story);
  tooltipEl.innerHTML = `${escapeHtml(primary)}<br/>${escapeHtml(story.country)} · ${escapeHtml(
    String(story.category || "")
  )}`;
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

/**
 * 当前筛选结果里，同一 country + 相同 lat/lng 的故事在地球上会完全重叠。
 * 为每条 story 计算仅用于渲染的经纬度（微小环形散开），不修改数据里的 lat/lng。
 */
function buildMarkerDisplayPositions(filteredStories) {
  const posByStory = new Map();
  if (!filteredStories || !filteredStories.length) return posByStory;

  const groups = new Map();
  for (const story of filteredStories) {
    const la = Number(story.lat);
    const lo = Number(story.lng);
    const key = `${story.country}|${la}|${lo}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(story);
  }

  for (const members of groups.values()) {
    members.sort((a, b) => String(a.cn).localeCompare(String(b.cn)));
    if (members.length === 1) {
      const s = members[0];
      posByStory.set(s, { lat: Number(s.lat), lng: Number(s.lng) });
      continue;
    }
    const lat0 = Number(members[0].lat);
    const lng0 = Number(members[0].lng);
    const n = members.length;
    const cosLat = Math.max(0.2, Math.cos((lat0 * Math.PI) / 180));
    const Rlat = Math.min(0.1, 0.026 + 0.012 * (n - 1));

    members.forEach((st, i) => {
      const ang = (2 * Math.PI * i) / n;
      let plat = lat0 + Rlat * Math.cos(ang);
      let plng = lng0 + (Rlat * Math.sin(ang)) / cosLat;
      plat = Math.min(89.9, Math.max(-89.9, plat));
      if (plng > 180) plng -= 360;
      if (plng < -180) plng += 360;
      posByStory.set(st, { lat: plat, lng: plng });
    });
  }
  return posByStory;
}

function refreshGlobePoints() {
  const data = getFilteredStories();
  const displayPos = buildMarkerDisplayPositions(data);
  const ringPayload =
    selectedStory && data.includes(selectedStory) && displayPos.has(selectedStory)
      ? [{ ...selectedStory, lat: displayPos.get(selectedStory).lat, lng: displayPos.get(selectedStory).lng }]
      : [];

  globe
    .pointsData([])
    .labelsData([])
    .htmlElementsData(data)
    .htmlLat((d) => (displayPos.has(d) ? displayPos.get(d).lat : d.lat))
    .htmlLng((d) => (displayPos.has(d) ? displayPos.get(d).lng : d.lng))
    .htmlAltitude(() => 0.01)
    .htmlElement((d) => {
      const look = getCategoryMarkerLook(d.category);
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = `glow-point ${look.cls}`;
      marker.style.setProperty("--marker-color", look.color);
      marker.style.setProperty("--glow-color", look.glowColor || look.color);
      const isSel = selectedStory && selectedStory.cn === d.cn;
      if (isSel) marker.classList.add("is-selected");

      if (isSel) {
        const pulse = document.createElement("span");
        pulse.className = "glow-point__pulse";
        pulse.setAttribute("aria-hidden", "true");
        marker.appendChild(pulse);
      }

      const halo = document.createElement("span");
      halo.className = "glow-point__halo";
      halo.setAttribute("aria-hidden", "true");
      const icon = document.createElement("span");
      icon.className = "glow-point__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = look.svg;
      marker.appendChild(halo);
      marker.appendChild(icon);

      marker.addEventListener("mouseenter", (event) => {
        showTooltip(d, event);
      });
      marker.addEventListener("mousemove", moveTooltip);
      marker.addEventListener("mouseleave", () => {
        hideTooltip();
      });
      marker.addEventListener("click", (event) => {
        event.stopPropagation();
        selectStoryAndRefresh(d);
      });
      return marker;
    })
    .ringsData(ringPayload)
    .ringLat((d) => d.lat)
    .ringLng((d) => d.lng)
    .ringColor(() => getSelectedRingColor())
    .ringMaxRadius(2.2)
    .ringPropagationSpeed(0.75)
    .ringRepeatPeriod(1200);
}

function rebuildFilterBar() {
  if (!filterBarEl) return;
  const prev = currentFilter;
  filterBarEl.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.dataset.filter = "All";
  allBtn.textContent = getFilterButtonLabel("All");
  if (prev === "All") allBtn.classList.add("active");
  filterBarEl.appendChild(allBtn);
  storyCategoryKeys.forEach((cat) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.filter = cat;
    b.textContent = getFilterButtonLabel(cat);
    if (prev === cat) b.classList.add("active");
    filterBarEl.appendChild(b);
  });
}

function rebuildLegendDom() {
  const legendEl = document.getElementById("categoryLegend");
  if (!legendEl) return;
  legendEl.innerHTML = "";
  storyCategoryKeys.forEach((key) => {
    const look = getCategoryMarkerLook(key);
    const { en, zh } = getLegendLabels(key);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "legend-item";
    btn.dataset.legendFilter = key;
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", `${en}，${zh}`);

    const badge = document.createElement("span");
    badge.className = "legend-badge";
    badge.style.setProperty("--marker-color", look.color);
    badge.style.setProperty("--glow-color", look.glowColor || look.color);
    badge.setAttribute("aria-hidden", "true");

    const halo = document.createElement("span");
    halo.className = "legend-badge__halo";

    const icon = document.createElement("span");
    icon.className = "legend-badge__icon";
    icon.innerHTML = look.svg;

    const textWrap = document.createElement("span");
    textWrap.className = "legend-item__text";
    const enEl = document.createElement("span");
    enEl.className = "legend-item__en";
    const zhEl = document.createElement("span");
    zhEl.className = "legend-item__zh";
    if (currentLang === "zh") {
      enEl.textContent = zh;
      zhEl.textContent = en;
    } else {
      enEl.textContent = en;
      zhEl.textContent = zh;
    }
    textWrap.appendChild(enEl);
    textWrap.appendChild(zhEl);

    badge.appendChild(halo);
    badge.appendChild(icon);
    btn.appendChild(badge);
    btn.appendChild(textWrap);
    legendEl.appendChild(btn);
  });
  syncLegendActive();
}

function refreshCategoryLists() {
  storyCategoryKeys = computeStoryCategoryKeys();
  categories = ["All", ...storyCategoryKeys];
  if (currentFilter !== "All" && !categories.includes(currentFilter)) {
    currentFilter = "All";
  }
  rebuildFilterBar();
  rebuildLegendDom();
}

function initFilters() {
  if (!filterBarEl || filterBarEl.dataset.filterNavBound === "1") return;
  filterBarEl.dataset.filterNavBound = "1";
  filterBarEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const filter = target.dataset.filter;
    if (!categories.includes(filter)) return;
    applyCategoryFilter(filter);
  });
}

function initLegendNav() {
  const wrap = document.getElementById("categoryLegendWrap");
  if (!wrap || wrap.dataset.legendNavBound === "1") return;
  wrap.dataset.legendNavBound = "1";
  wrap.addEventListener("click", (event) => {
    const item = event.target.closest(".legend-item");
    if (!item || !(item instanceof HTMLButtonElement)) return;
    const f = item.dataset.legendFilter;
    if (!f || !categories.includes(f)) return;
    applyCategoryFilter(f);
  });
}

function initSearch() {
  if (!searchInputEl) return;
  searchInputEl.addEventListener("input", (event) => {
    searchTerm = event.target.value || "";
    if (!String(searchTerm).trim()) {
      rankingCountryFilter = null;
    }
    const filtered = getFilteredStories();
    if (selectedStory && !filtered.includes(selectedStory)) {
      selectedStory = null;
    }
    refreshGlobePoints();
    renderStoryCard();
    renderCountryRanking();
    updateHeader();
    updateFilterStatusBar();
    renderSearchResults();
  });
}

function initGlobe() {
  const globeContainer = document.getElementById("globeViz");
  const interactionContainer = document.querySelector(".globe-panel") || globeContainer;
  let isPointerInside = false;
  let isDragging = false;
  let isWheeling = false;
  let wheelIdleTimer = null;
  const WHEEL_IDLE_MS = 200;
  const ZOOM_MIN_DIST = 105;
  const ZOOM_MAX_DIST = 5000;

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

  const camera = globe.camera();
  const controls = globe.controls();
  controls.enableZoom = false;
  if (typeof controls.minDistance === "number") controls.minDistance = ZOOM_MIN_DIST;
  if (typeof controls.maxDistance === "number") controls.maxDistance = ZOOM_MAX_DIST;

  function syncAutoRotate() {
    // Pause while hovering, dragging, or wheel-zooming so zoom does not stack with spin.
    globe.controls().autoRotate = !(isPointerInside || isDragging || isWheeling);
  }

  function handleCustomWheelZoom(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!camera || !controls) return;

    let factor = 1;
    if (e.deltaY < 0) factor = 0.9;
    else if (e.deltaY > 0) factor = 1.1;
    else return;

    isWheeling = true;
    syncAutoRotate();

    const direction = camera.position.clone().normalize();
    const currentDistance = camera.position.length();
    let nextDistance = currentDistance * factor;
    nextDistance = Math.min(Math.max(nextDistance, ZOOM_MIN_DIST), ZOOM_MAX_DIST);

    camera.position.copy(direction.multiplyScalar(nextDistance));
    camera.lookAt(0, 0, 0);
    controls.update();

    if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
    wheelIdleTimer = setTimeout(() => {
      isWheeling = false;
      wheelIdleTimer = null;
      syncAutoRotate();
    }, WHEEL_IDLE_MS);
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

  interactionContainer.addEventListener("wheel", handleCustomWheelZoom, { passive: false });
}

function updateAboutModalI18n() {
  const titleEl = document.getElementById("aboutModalTitle");
  const leadEl = document.getElementById("aboutModalLead");
  const s1t = document.getElementById("aboutSec1Title");
  const s1x = document.getElementById("aboutSec1Text");
  const s2t = document.getElementById("aboutSec2Title");
  const s2l = document.getElementById("aboutSec2List");
  const s3t = document.getElementById("aboutSec3Title");
  const s3x = document.getElementById("aboutSec3Text");
  if (titleEl) titleEl.textContent = t("aboutModalTitle");
  if (leadEl) leadEl.textContent = t("aboutModalLead");
  if (s1t) s1t.textContent = t("aboutSec1Title");
  if (s1x) s1x.textContent = t("aboutSec1Text");
  if (s2t) s2t.textContent = t("aboutSec2Title");
  if (s3t) s3t.textContent = t("aboutSec3Title");
  if (s3x) s3x.textContent = t("aboutSec3Text");
  if (s2l) {
    s2l.innerHTML = [t("aboutSec2Li1"), t("aboutSec2Li2"), t("aboutSec2Li3"), t("aboutSec2Li4")]
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("");
  }
}

function updateLanguageUI() {
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";

  const lt = document.getElementById("langToggle");
  if (lt) {
    lt.textContent = t("langToggleLabel");
    lt.setAttribute("aria-label", currentLang === "zh" ? "Switch to English" : "Switch to Chinese");
  }

  const h1 = document.getElementById("appTitle");
  if (h1) h1.textContent = t("appHeading");
  document.title = t("docTitle");

  if (searchInputEl) searchInputEl.placeholder = t("searchPlaceholder");

  const sch = document.getElementById("storyCardHeading");
  if (sch) sch.textContent = t("storyCardSectionTitle");

  const rh = document.getElementById("countryRankingHeading");
  if (rh) rh.textContent = t("countryRankingTitle");

  const lhint = document.getElementById("categoryLegendHint");
  if (lhint) lhint.textContent = t("legendHint");

  const ab = document.getElementById("aboutBtn");
  if (ab) ab.textContent = t("aboutButton");

  const regionLab = document.getElementById("regionChipLabel");
  if (regionLab) regionLab.textContent = t("regionChipPrefix");

  const wrap = document.getElementById("categoryLegendWrap");
  if (wrap) wrap.setAttribute("aria-label", t("legendWrapAria"));

  updateAboutModalI18n();

  const closeBtn = document.getElementById("aboutModalClose");
  if (closeBtn) closeBtn.setAttribute("aria-label", t("modalClose"));

  rebuildFilterBar();
  rebuildLegendDom();
  syncLegendActive();
  updateHeader();
  renderStoryCard();
  renderCountryRanking();
  updateFilterStatusBar();
  renderSearchResults();
}

function initLangToggle() {
  const lt = document.getElementById("langToggle");
  if (!lt || lt.dataset.langBound === "1") return;
  lt.dataset.langBound = "1";
  lt.addEventListener("click", () => {
    currentLang = currentLang === "zh" ? "en" : "zh";
    updateLanguageUI();
  });
}

function initAboutModal() {
  const modal = document.getElementById("aboutModal");
  const btn = document.getElementById("aboutBtn");
  const closeBtn = document.getElementById("aboutModalClose");
  const backdrop = document.getElementById("aboutModalBackdrop");
  if (!modal || !btn) return;

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    btn.focus();
  }

  btn.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  backdrop?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function init() {
  initGlobe();
  refreshCategoryLists();
  initLegendNav();
  initFilters();
  initCountryRankingNav();
  initStoryExploreNav();
  initLangToggle();
  initSearchResultsNav();
  initSearch();
  initClearFilters();
  initAboutModal();
  refreshGlobePoints();
  updateLanguageUI();
}

init();
