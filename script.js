const stories = Array.isArray(window.STORIES) ? window.STORIES : [];

const categories = ["All", "Sun", "Flood", "Fire", "Dragon", "Love", "Moon", "Princess"];
let currentFilter = "All";
let searchTerm = "";
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

const CATEGORY_KEY_ALIASES = {
  Dark: "Evil"
};

function getCategoryMarkerLook(category) {
  let key = category != null && String(category).trim() !== "" ? String(category).trim() : "";
  if (key && CATEGORY_KEY_ALIASES[key]) key = CATEGORY_KEY_ALIASES[key];
  if (key && CATEGORY_GLYPHS[key]) return CATEGORY_GLYPHS[key];
  return CATEGORY_GLYPHS.__default;
}

function getSelectedRingColor() {
  if (!selectedStory) return "rgba(150, 160, 195, 0.42)";
  const look = getCategoryMarkerLook(selectedStory.category);
  return look.ringColor || "rgba(190, 175, 255, 0.55)";
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
    const passCategory = currentFilter === "All" || item.category === currentFilter;
    if (!passCategory) return false;
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
  storyMetaEl.textContent = `${stories.length} stories · ${countries.size} countries`;
  currentRegionEl.textContent = selectedStory ? selectedStory.country : "Global";
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
  if (k === "high") return { text: "较高可信", key: "high" };
  if (k === "medium") return { text: "代表性地区", key: "medium" };
  if (k === "low") return { text: "存在争议", key: "low" };
  return { text: String(value).trim(), key: "other" };
}

function buildSelectedStoryCardHtml(s) {
  const blocks = [];
  if (hasDisplayText(s.cn)) {
    blocks.push(`<h3 class="story-card__title">${escapeHtml(s.cn)}</h3>`);
  }
  if (hasDisplayText(s.en)) {
    blocks.push(`<p class="story-card__en story-card__subtitle">${escapeHtml(s.en)}</p>`);
  }

  const chipParts = [];
  if (hasDisplayText(s.country)) {
    chipParts.push(
      `<span class="story-chip story-chip--country" title="国家">${escapeHtml(s.country)}</span>`
    );
  }
  if (hasDisplayText(s.region)) {
    chipParts.push(
      `<span class="story-chip story-chip--region" title="地区">${escapeHtml(s.region)}</span>`
    );
  }
  if (hasDisplayText(s.category)) {
    chipParts.push(
      `<span class="story-chip story-chip--category" title="分类">${escapeHtml(s.category)}</span>`
    );
  }
  if (hasDisplayText(s.sourceType)) {
    chipParts.push(
      `<span class="story-chip story-chip--sourcetype" title="类型">${escapeHtml(s.sourceType)}</span>`
    );
  }
  if (hasDisplayText(s.era)) {
    chipParts.push(
      `<span class="story-chip story-chip--era" title="时代">${escapeHtml(s.era)}</span>`
    );
  }
  const confChip = getConfidenceChip(s.confidence);
  if (confChip) {
    chipParts.push(
      `<span class="story-chip story-chip--confidence story-chip--conf-${confChip.key}" title="可信度">${escapeHtml(
        confChip.text
      )}</span>`
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

  blocks.push(
    '<p class="story-card__foot">地点以文化起源地或代表性地区标注，部分故事存在多个版本。</p>'
  );
  return blocks.join("");
}

function renderStoryCard() {
  if (getFilteredStories().length === 0) {
    storyCardEl.innerHTML =
      '<p class="placeholder">没有找到相关故事，请尝试搜索国家、故事名或分类。</p>';
    return;
  }

  if (!selectedStory) {
    storyCardEl.innerHTML =
      '<p class="placeholder">点击地球上的发光点位，打开一段来自世界文明的古老故事。</p>';
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

  globe
    .pointsData([])
    .labelsData([])
    .htmlElementsData(data)
    .htmlLat((d) => d.lat)
    .htmlLng((d) => d.lng)
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
    .ringColor(() => getSelectedRingColor())
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

function initSearch() {
  if (!searchInputEl) return;
  searchInputEl.addEventListener("input", (event) => {
    searchTerm = event.target.value || "";
    const filtered = getFilteredStories();
    if (selectedStory && !filtered.includes(selectedStory)) {
      selectedStory = null;
    }
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
  initFilters();
  initSearch();
  initAboutModal();
  refreshGlobePoints();
  renderStoryCard();
  renderCountryRanking();
  updateHeader();
}

init();
