// ============================================================================
// DLC CONTENT – заготовка для будущих обновлений
// Все функции закомментированы, чтобы файл не влиял на игру
// ============================================================================
// Загружено на гитхаб 18.07.2026
console.log("🔧 DLC Content загружается...");

// ---------- 1. НОВЫЕ РЕСУРСЫ ----------
// if (typeof window.RESOURCES_REGISTRY !== 'undefined') {
//     window.RESOURCES_REGISTRY["cloth"] = {
//         id: "cloth", name: "Ткань",
//         icon: "icons/cloth.png", category: "basic",
//         tradeable: true, defaultValue: 0
//     };
// }

// ---------- 2. НОВЫЕ ПОСТРОЙКИ ----------
// if (typeof window.buildingsCatalog !== 'undefined') {
//     window.buildingsCatalog["merchant_guild"] = {
//         name: "Гильдия торговцев", category: "economic",
//         allowedSettlementTypes: ["city"],
//         description: "Увеличивает доход от торговых соглашений.",
//         cost: { wood: 400, stone: 200, iron: 40, gold: 10, ers: 5000 },
//         buildTime: 4,
//         income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
//         special: "tradeBonus30", tradeBonus: 30
//     };
// }

// ---------- 3. НОВЫЕ ЮНИТЫ ----------
// if (typeof window.unitDatabase !== 'undefined') {
//     window.unitDatabase["gnome_militia"] = {
//         name: "Ополчение гномов", race: "Гномы", gender: "male",
//         troopType: "Ополчение", strength: 3, defense: 4, morale: 4,
//         upkeep: 1, hireCost: 200, countPerUnit: 100,
//         description: "Гномы-ополченцы, вооружённые кирками и топорами.",
//         availableFactions: ["loyal", "neutral"],
//         special: "«Стойкость в пещерах»",
//         icon: "gnome_militia.png", maxCount: null, hireTime: 1
//     };
// }

// ---------- 4. НОВЫЕ ТЕХНОЛОГИИ ----------
// if (typeof window.TECH_DB !== 'undefined') {
//     window.TECH_DB["cartography"] = {
//         id: "cartography", name: "Картография", category: "civil",
//         description: "Увеличивает скорость движения по суше на 10%.",
//         points: 90, effects: { landSpeedBonus: 0.1 }
//     };
// }

// ---------- 5. ПЕРЕОПРЕДЕЛЕНИЕ ФУНКЦИЙ ----------
// (function() {
//     const originalAddUnitToArmy = window.addUnitToArmy;
//     if (typeof originalAddUnitToArmy === 'function') {
//         window.addUnitToArmy = function(armyId, unitKey, count) {
//             if (unitKey === "gnome_militia" && !window.hasDlcBuilding("merchant_guild")) {
//                 alert('Требуется постройка «Гильдия торговцев»');
//                 return false;
//             }
//             return originalAddUnitToArmy(armyId, unitKey, count);
//         };
//     }
// })();

console.log("✅ DLC Content успешно загружен (без изменений)");