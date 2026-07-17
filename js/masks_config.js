// ============================================================================
// МОДУЛЬ: masks_config.js — только данные масок (одиночные PNG)
// ============================================================================
// Загружено на гитхаб 18.07.2026
// ---------- 1. МАСКИ РИТОРИКИ (без изменений) ----------
window.rhetoricMasks = [
    { name: "Даё", image: "images/lands_Dae.png", visible: true, opacity: 0.6, rhetoricId: "dayo" },
    { name: "Лоялисты", image: "images/lands_loyalist.png", visible: true, opacity: 0.6, rhetoricId: "loyal" },
    { name: "Нейтралы", image: "images/Neutrals.png", visible: true, opacity: 0.6, rhetoricId: "neutral" },
    { name: "Проюрганцы", image: "images/Proyurgans.png", visible: true, opacity: 0.6, rhetoricId: "proyurgan" },
    { name: "Союз Лепус", image: "images/lands_lepus.png", visible: true, opacity: 0.6, rhetoricId: "lepus" },
    { name: "Совет регентов", image: "images/Board_Regents.png", visible: true, opacity: 0.6, rhetoricId: "neutral" }
];

// ---------- 2. МАСКА ВЛАДЕНИЙ (один слой на все) ----------
window.holdingsMasks = [
    { name: "Все владения", image: "images/holdings_all.png", visible: true, opacity: 0.6 }
];

// ---------- 3. МАСКА ВАССАЛОВ (один слой на все) ----------
window.vassalsMasks = [
    { name: "Все вассалы", image: "images/vassals_all.png", visible: true, opacity: 0.6 }
];
window.mapLayers = [
  { name: "Рельеф",   image: "images/layers/relief.png",     visible: true },
  { name: "Реки",     image: "images/layers/rivers.png",     visible: true },
  { name: "Дороги",   image: "images/layers/roads.png",      visible: true },
  { name: "Поселения", image: "images/layers/settlements.png", visible: true },
  { name: "Границы провинций", image: "images/layers/borders.png", visible: true }
];
console.log("✅ masks_config.js загружен (одиночные PNG для владений и вассалов)");