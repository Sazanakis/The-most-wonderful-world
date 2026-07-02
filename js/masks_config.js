// ============================================================================
// МОДУЛЬ: masks_config.js — только данные масок (одиночные PNG)
// ============================================================================

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

console.log("✅ masks_config.js загружен (одиночные PNG для владений и вассалов)");