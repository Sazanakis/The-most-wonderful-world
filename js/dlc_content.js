// ============================================================================
// DLC: АЛХИМИЧЕСКИЙ РАЙОН (уникальная постройка для Княжества Лорейн)
// ============================================================================

// ---------- 1. НОВАЯ ПОСТРОЙКА ----------
if (typeof window.buildingsCatalog !== 'undefined') {
    window.buildingsCatalog["Alchemy_District"] = {
        name: "Алхимический район",
        category: "economic",
        allowedSettlementTypes: ["city", "castle"],
        description: "Отдельный район для алхимических исследований. Снижает стоимость гражданских технологий на 10 очков.",
        cost: {
            wood: 400,
            stone: 600,
            iron: 150,
            gold: 30,
            ers: 10000
        },
        buildTime: 6,
        income: {},
        special: "alchemy_district",
        faction: "principality_lorein",   // только для Лорейн
        limit: { scope: "province", max: 1 }
    };
    console.log("✅ DLC: Постройка «Алхимический район» добавлена для Лорейн (стоимость 10000 эрсов, -10 очков к гражданским технологиям)");
}

// ---------- 2. БОНУС К ГРАЖДАНСКИМ ТЕХНОЛОГИЯМ (через getTechBonuses) ----------
if (typeof window.getTechBonuses === 'function') {
    const originalGetTechBonuses = window.getTechBonuses;
    window.getTechBonuses = function() {
        const bonuses = originalGetTechBonuses();
        // Проверяем наличие активного Алхимического района
        const provinces = getCurrentFactionProvinces();
        let hasAlchemy = false;
        for (let pid of provinces) {
            const prov = provincesData[pid];
            if (!prov) continue;
            for (let s of prov.settlements) {
                if (s.captured) continue;
                for (let b of s.buildings) {
                    if (b.completed && b.special === "alchemy_district") {
                        hasAlchemy = true;
                        break;
                    }
                }
                if (hasAlchemy) break;
            }
            if (hasAlchemy) break;
        }
        if (hasAlchemy) {
            bonuses.civilTechCostReduction = (bonuses.civilTechCostReduction || 0) + 10;
        }
        return bonuses;
    };
    console.log("✅ DLC: Бонус к гражданским технологиям добавлен в getTechBonuses");
}

// ---------- 3. ОТОБРАЖЕНИЕ УМЕНЬШЕННОЙ СТОИМОСТИ В UI ----------
// Переопределяем renderAvailableTechs для учёта бонуса
if (typeof window.renderAvailableTechs === 'function') {
    const originalRenderAvailableTechs = window.renderAvailableTechs;
    window.renderAvailableTechs = function() {
        // Применяем бонусы к стоимости технологий перед отрисовкой
        const bonuses = getTechBonuses();
        const reduction = bonuses.civilTechCostReduction || 0;
        // Временно модифицируем TECH_DB для отображения
        const originalTechDB = window.TECH_DB;
        if (originalTechDB) {
            const modifiedDB = {};
            for (let key in originalTechDB) {
                const tech = originalTechDB[key];
                modifiedDB[key] = { ...tech };
                if (tech.category === 'civil' && reduction > 0) {
                    modifiedDB[key].points = Math.max(10, tech.points - reduction);
                }
            }
            // Подменяем глобальный TECH_DB на время рендера
            window.TECH_DB = modifiedDB;
            originalRenderAvailableTechs();
            // Восстанавливаем
            window.TECH_DB = originalTechDB;
        } else {
            originalRenderAvailableTechs();
        }
    };
    console.log("✅ DLC: renderAvailableTechs адаптирован для отображения уменьшенной стоимости");
}

// Переопределяем renderActiveResearch для отображения уменьшенной стоимости
if (typeof window.renderActiveResearch === 'function') {
    const originalRenderActiveResearch = window.renderActiveResearch;
    window.renderActiveResearch = function() {
        const bonuses = getTechBonuses();
        const reduction = bonuses.civilTechCostReduction || 0;
        const originalTechDB = window.TECH_DB;
        if (originalTechDB && reduction > 0) {
            const modifiedDB = {};
            for (let key in originalTechDB) {
                const tech = originalTechDB[key];
                modifiedDB[key] = { ...tech };
                if (tech.category === 'civil') {
                    modifiedDB[key].points = Math.max(10, tech.points - reduction);
                }
            }
            window.TECH_DB = modifiedDB;
            originalRenderActiveResearch();
            window.TECH_DB = originalTechDB;
        } else {
            originalRenderActiveResearch();
        }
    };
    console.log("✅ DLC: renderActiveResearch адаптирован для отображения уменьшенной стоимости");
}

// ---------- 4. ФИЛЬТРАЦИЯ ПОСТРОЕК ПО ФРАКЦИИ (уже есть, но дублируем для надёжности) ----------
(function() {
    // Модифицируем showBuildingSelector, чтобы показывать постройку только для Лорейн
    const originalShowBuildingSelector = window.showBuildingSelector;
    if (typeof originalShowBuildingSelector === 'function') {
        window.showBuildingSelector = function(settlementId) {
            const data = provincesData[currentProvince];
            if (!data) return;
            const settlement = data.settlements.find(s => s.id === settlementId);
            if (!settlement) return;

            const filteredCatalog = {};
            for (let key in buildingsCatalog) {
                const building = buildingsCatalog[key];
                if (building.faction && building.faction !== window.currentFaction) {
                    continue;
                }
                filteredCatalog[key] = building;
            }
            const originalCatalog = window.buildingsCatalog;
            window.buildingsCatalog = filteredCatalog;
            originalShowBuildingSelector(settlementId);
            window.buildingsCatalog = originalCatalog;
        };
        console.log("✅ DLC: Логика показа построек адаптирована для фракционных построек");
    }

    // Модифицируем startBuilding для проверки фракции
    const originalStartBuilding = window.startBuilding;
    if (typeof originalStartBuilding === 'function') {
        window.startBuilding = function(settlementId, buildingName, isUpgrade, baseBuilding) {
            const buildingDef = buildingsCatalog[buildingName];
            if (buildingDef && buildingDef.faction && buildingDef.faction !== window.currentFaction) {
                addBuildingsLog(`❌ Постройка "${buildingDef.name}" доступна только для фракции ${buildingDef.faction}.`);
                alert(`Эта постройка доступна только для ${buildingDef.faction}.`);
                return;
            }
            originalStartBuilding(settlementId, buildingName, isUpgrade, baseBuilding);
        };
        console.log("✅ DLC: Проверка фракции добавлена в startBuilding");
    }
})();

console.log("✅ DLC «Алхимический район» для Лорейн полностью загружен");