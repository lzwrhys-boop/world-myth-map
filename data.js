window.STORIES = (() => {
  const templates = {
    EastAsia: [
      { cn: "创世传说", en: "Creation Chronicle", category: "Creation", era: "Ancient", sourceType: "Myth", confidence: "High", summary: "关于天地开辟与秩序建立的叙事，常被视为文化宇宙观的起点与母题来源。" },
      { cn: "月夜神话", en: "Moonlit Legend", category: "Moon", era: "Folk", sourceType: "Legend", confidence: "Medium", summary: "月亮与人间命运相连，传说常借月相变化解释团圆、离别与时间循环。" },
      { cn: "英雄讨伐", en: "Heroic Quest", category: "Hero", era: "Classical", sourceType: "Epic", confidence: "Medium", summary: "英雄在试炼中对抗怪物与灾厄，最终守护共同体并确立价值秩序。" }
    ],
    SouthAsia: [
      { cn: "大洪水传说", en: "Great Flood Narrative", category: "Flood", era: "Ancient", sourceType: "Myth", confidence: "High", summary: "洪灾与重建是南亚叙事中常见母题，强调神谕、伦理与文明延续。" },
      { cn: "王族爱情史诗", en: "Royal Love Epic", category: "Love", era: "Classical", sourceType: "Epic", confidence: "High", summary: "王族恋人经历流放与战争，故事承载忠诚、誓约与家国责任的理想。" },
      { cn: "火祭神话", en: "Sacred Fire Rite", category: "Fire", era: "Ancient", sourceType: "Myth", confidence: "Medium", summary: "火焰被赋予净化与转化意义，祭火叙事常与王权和秩序合法性相关。" }
    ],
    PersiaArabia: [
      { cn: "屠龙史诗", en: "Dragon-Slaying Epic", category: "Dragon", era: "Classical", sourceType: "Epic", confidence: "High", summary: "英雄对抗巨龙与暴政，象征混沌被克服、政治与道德秩序重建。" },
      { cn: "沙海诡计故事", en: "Desert Trickster Tale", category: "Trickster", era: "Folk", sourceType: "Folk Tale", confidence: "Medium", summary: "智者或精灵凭机敏化解危机，故事强调语言与判断在荒漠社会中的价值。" },
      { cn: "冥界之门传说", en: "Gates of the Underworld", category: "Underworld", era: "Ancient", sourceType: "Legend", confidence: "Medium", summary: "关于生死边界的叙事，常通过洞穴、古城或星象象征灵魂旅程。" }
    ],
    Mediterranean: [
      { cn: "太阳神巡行", en: "Solar Journey", category: "Sun", era: "Ancient", sourceType: "Myth", confidence: "High", summary: "太阳神每日巡行天地，成为季节、政权与秩序循环的神话解释模型。" },
      { cn: "冥界降临", en: "Descent to Underworld", category: "Underworld", era: "Classical", sourceType: "Myth", confidence: "High", summary: "神祇或英雄下探冥界完成试炼，折射生死观与共同体伦理规范。" },
      { cn: "神祇之恋", en: "Divine Love Story", category: "Love", era: "Classical", sourceType: "Legend", confidence: "Medium", summary: "神祇爱情与权力冲突并置，常用于解释人间秩序与命运反复。" }
    ],
    NordicCeltic: [
      { cn: "末日与重生", en: "Doom and Renewal", category: "Monster", era: "Ancient", sourceType: "Myth", confidence: "High", summary: "世界在巨灾与大战后重启，神话强调勇气、宿命与新秩序诞生。" },
      { cn: "寒海巨龙", en: "Dragon of the Cold Sea", category: "Dragon", era: "Folk", sourceType: "Legend", confidence: "Medium", summary: "巨龙盘踞峡湾或湖泊，兼具守护与威胁属性，体现边境生存经验。" },
      { cn: "月夜女王", en: "Queen under the Moon", category: "Princess", era: "Medieval", sourceType: "Fairy Tale", confidence: "Medium", summary: "公主在月夜完成试炼与抉择，叙事常关联王权合法性与道德教育。" }
    ],
    SlavicBalkan: [
      { cn: "森林女巫故事", en: "Forest Witch Tale", category: "Trickster", era: "Folk", sourceType: "Folk Tale", confidence: "High", summary: "女巫兼具惩戒与引导功能，故事强调边界意识与对自然的敬畏。" },
      { cn: "城邦屠龙记", en: "City Dragon Legend", category: "Dragon", era: "Medieval", sourceType: "Legend", confidence: "High", summary: "屠龙叙事用于塑造城邦共同记忆，强化集体身份与防御伦理。" },
      { cn: "河谷洪潮传说", en: "River Flood Chronicle", category: "Flood", era: "Folk", sourceType: "Legend", confidence: "Medium", summary: "洪潮被神话化为惩戒与净化，提醒人群遵守节律与仪式禁忌。" }
    ],
    Africa: [
      { cn: "祖灵创世", en: "Ancestral Creation", category: "Creation", era: "Ancient", sourceType: "Myth", confidence: "Medium", summary: "祖灵与自然神共同塑造大地与族群谱系，强调土地与血缘纽带。" },
      { cn: "火风守护神", en: "Guardian of Fire and Wind", category: "Fire", era: "Folk", sourceType: "Legend", confidence: "Medium", summary: "火风神被视为边界守卫者，既能赐福也会惩戒越界行为。" },
      { cn: "诡计英雄", en: "Trickster Hero", category: "Trickster", era: "Folk", sourceType: "Folk Tale", confidence: "High", summary: "诡计英雄通过智慧改写强弱关系，是口传传统中重要伦理载体。" }
    ],
    Americas: [
      { cn: "玉米与创世", en: "Maize and Creation", category: "Creation", era: "Ancient", sourceType: "Myth", confidence: "High", summary: "以谷物塑造人类的叙事广泛分布于美洲文明，体现农耕宇宙观。" },
      { cn: "羽蛇与天象", en: "Feathered Serpent and Sky", category: "Dragon", era: "Ancient", sourceType: "Myth", confidence: "High", summary: "羽蛇或巨蛇连接天空与大地，常与历法、祭仪和王权相关联。" },
      { cn: "冥途试炼", en: "Trials of the Underworld", category: "Underworld", era: "Ancient", sourceType: "Legend", confidence: "Medium", summary: "亡灵需通过层层关卡，反映对伦理、牺牲与来世秩序的理解。" }
    ],
    Oceania: [
      { cn: "梦时代创世", en: "Dreamtime Creation", category: "Creation", era: "Ancient", sourceType: "Myth", confidence: "High", summary: "祖灵在歌路中塑造地貌和生灵，地理与叙事共同构成神圣地图。" },
      { cn: "海潮月神", en: "Moon of Tides", category: "Moon", era: "Folk", sourceType: "Legend", confidence: "Medium", summary: "月神掌控潮汐、渔期与航线，是海岛社会时间秩序的重要象征。" },
      { cn: "火山守门者", en: "Volcano Guardians", category: "Fire", era: "Folk", sourceType: "Legend", confidence: "Low", summary: "火山喷发被解释为神灵醒来，相关传说承载避险知识与仪式传统。" }
    ]
  };

  const countries = [
    ["China","EastAsia",34.3,108.9],["Japan","EastAsia",35.7,139.7],["Korea","EastAsia",37.6,127.0],["Mongolia","EastAsia",47.9,106.9],["Taiwan","EastAsia",25.0,121.5],
    ["India","SouthAsia",28.6,77.2],["Nepal","SouthAsia",27.7,85.3],["Sri Lanka","SouthAsia",6.9,79.9],["Bangladesh","SouthAsia",23.8,90.4],["Pakistan","SouthAsia",33.7,73.1],
    ["Iran","PersiaArabia",35.7,51.4],["Iraq","PersiaArabia",33.3,44.4],["Turkey","PersiaArabia",39.9,32.8],["Saudi Arabia","PersiaArabia",24.7,46.7],["Jordan","PersiaArabia",31.9,35.9],
    ["Syria","PersiaArabia",33.5,36.3],["Lebanon","PersiaArabia",33.9,35.5],["Israel","PersiaArabia",31.8,35.2],["Armenia","PersiaArabia",40.2,44.5],["Georgia","PersiaArabia",41.7,44.8],
    ["Greece","Mediterranean",37.9,23.7],["Italy","Mediterranean",41.9,12.5],["Spain","Mediterranean",40.4,-3.7],["Portugal","Mediterranean",38.7,-9.1],["Egypt","Mediterranean",30.0,31.2],
    ["Norway","NordicCeltic",59.9,10.7],["Sweden","NordicCeltic",59.3,18.0],["Denmark","NordicCeltic",55.7,12.6],["Finland","NordicCeltic",60.2,24.9],["Iceland","NordicCeltic",64.1,-21.9],
    ["Ireland","NordicCeltic",53.3,-6.3],["Scotland","NordicCeltic",56.8,-4.2],["Wales","NordicCeltic",51.5,-3.2],["England","NordicCeltic",51.5,-0.1],["Faroe Islands","NordicCeltic",62.0,-6.8],
    ["Poland","SlavicBalkan",52.2,21.0],["Czech Republic","SlavicBalkan",50.1,14.4],["Hungary","SlavicBalkan",47.5,19.0],["Romania","SlavicBalkan",44.4,26.1],["Ukraine","SlavicBalkan",50.4,30.5],
    ["Russia","SlavicBalkan",55.8,37.6],["Serbia","SlavicBalkan",44.8,20.4],["Bulgaria","SlavicBalkan",42.7,23.3],["Croatia","SlavicBalkan",45.8,15.9],["Slovakia","SlavicBalkan",48.1,17.1],
    ["Nigeria","Africa",6.5,3.3],["Ghana","Africa",5.6,-0.2],["Kenya","Africa",-1.3,36.8],["Ethiopia","Africa",9.0,38.7],["South Africa","Africa",-26.2,28.0],
    ["Morocco","Africa",34.0,-6.8],["Algeria","Africa",36.7,3.1],["Tunisia","Africa",36.8,10.2],["Congo","Africa",-4.3,15.3],["Tanzania","Africa",-6.8,39.2],
    ["Mexico","Americas",19.4,-99.1],["Guatemala","Americas",14.6,-90.5],["Peru","Americas",-13.5,-71.9],["Bolivia","Americas",-16.5,-68.1],["Chile","Americas",-33.4,-70.6],
    ["Brazil","Americas",-23.5,-46.6],["Colombia","Americas",4.7,-74.1],["Argentina","Americas",-34.6,-58.4],["United States","Americas",38.9,-77.0],["Canada","Americas",45.4,-75.7],
    ["Australia","Oceania",-33.9,151.2],["New Zealand","Oceania",-36.8,174.7],["Samoa","Oceania",-13.8,-171.8],["Fiji","Oceania",-18.1,178.4],["Papua New Guinea","Oceania",-9.4,147.2],
    ["Indonesia","Oceania",-6.2,106.8],["Malaysia","Oceania",3.1,101.7],["Thailand","Oceania",13.7,100.5],["Cambodia","Oceania",11.6,104.9],["Philippines","Oceania",14.6,121.0]
  ];

  return countries.flatMap(([country, key, lat, lng]) =>
    templates[key].map((t, idx) => ({
      cn: `${country}·${t.cn}`,
      en: `${t.en} of ${country}`,
      country,
      region: key,
      lat: Number((lat + (idx - 1) * 0.45).toFixed(4)),
      lng: Number((lng + (idx - 1) * 0.55).toFixed(4)),
      category: t.category,
      era: t.era,
      summary: t.summary,
      sourceType: t.sourceType,
      confidence: t.confidence
    }))
  );
})();
