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
            wood: 300,
            stone: 300,
            iron: 150,
            gold: 10,
            ers: 10000
        },
        buildTime: 3,
        income: {},
        special: "alchemy_district",
        faction: "principality_lorein",
        limit: { scope: "province", max: 1 }
    };
    console.log("✅ DLC: Постройка «Алхимический район» добавлена");
}

// ---------- 2. ФУНКЦИЯ ПРОВЕРКИ АКТИВНОСТИ ПОСТРОЙКИ ----------
function isAlchemyDistrictActive() {
    if (typeof provincesData === 'undefined' || typeof getCurrentFactionProvinces !== 'function') return false;
    const provinces = getCurrentFactionProvinces();
    for (let pid of provinces) {
        const prov = provincesData[pid];
        if (!prov) continue;
        for (let s of prov.settlements) {
            if (s.captured) continue;
            for (let b of s.buildings) {
                if (b.completed && b.special === "alchemy_district") {
                    return true;
                }
            }
        }
    }
    return false;
}

// ---------- 3. БОНУС В getTechBonuses ----------
if (typeof window.getTechBonuses === 'function') {
    const originalGetTechBonuses = window.getTechBonuses;
    window.getTechBonuses = function() {
        const bonuses = originalGetTechBonuses();
        if (isAlchemyDistrictActive()) {
            bonuses.civilTechCostReduction = (bonuses.civilTechCostReduction || 0) + 10;
        }
        return bonuses;
    };
    console.log("✅ DLC: getTechBonuses обновлён");
}

// ---------- 4. ПЕРЕОПРЕДЕЛЯЕМ processResearch ДЛЯ УЧЁТА СКИДКИ ----------
if (typeof window.processResearch === 'function') {
    const originalProcessResearch = window.processResearch;
    window.processResearch = function() {
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
            originalProcessResearch();
            window.TECH_DB = originalTechDB;
        } else {
            originalProcessResearch();
        }
    };
    console.log("✅ DLC: processResearch адаптирован");
}

// ---------- 5. ПЕРЕОПРЕДЕЛЯЕМ openAssignTechModal ----------
if (typeof window.openAssignTechModal === 'function') {
    const originalOpenAssignTechModal = window.openAssignTechModal;
    window.openAssignTechModal = function(slot) {
        const researcher = researchData.researchers[slot];
        if (!researcher) return;

        const bonuses = getTechBonuses();
        const reduction = bonuses.civilTechCostReduction || 0;

        const techList = [];
        for (let techId in TECH_DB) {
            const tech = TECH_DB[techId];
            if (tech.category !== slot && slot !== 'unique') continue;
            if (researchData.completedTechs.includes(techId)) continue;
            if (researchData.techQueue.some(q => q.techId === techId)) continue;

            let points = tech.points;
            if (tech.category === 'civil' && reduction > 0) {
                points = Math.max(10, points - reduction);
            }
            techList.push({ id: techId, name: tech.name, points: points });
        }

        if (techList.length === 0) {
            alert('Нет доступных технологий для этого слота.');
            return;
        }

        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;justify-content:center;align-items:center;';
        let optionsHtml = techList.map(t => `<option value="${t.id}">${t.name} (${t.points} очков)</option>`).join('');
        modal.innerHTML = `
            <div style="background:#1f1c14;border:2px solid #b87c4f;border-radius:24px;padding:25px;max-width:400px;width:90%;color:#e6ddb3;">
                <h3>Назначить технологию</h3>
                <select id="techSelect">${optionsHtml}</select>
                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:15px;">
                    <button id="confirmTechBtn">✅ Начать</button>
                    <button id="cancelTechBtn">Отмена</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('confirmTechBtn').onclick = () => {
            const techId = document.getElementById('techSelect').value;
            const tech = TECH_DB[techId];
            const selected = techList.find(t => t.id === techId);
            const totalPoints = selected ? selected.points : tech.points;
            researchData.techQueue.push({ slot, techId, pointsInvested: 0, totalPoints: totalPoints });
            renderAllTechSlots();
            renderAvailableTechs();
            renderActiveResearch();
            addGlobalLog(`🔬 "${tech.name}" назначена исследователю "${researcher.name}".`, 'tech');
            saveAllData();
            modal.remove();
        };
        document.getElementById('cancelTechBtn').onclick = () => modal.remove();
    };
    console.log("✅ DLC: openAssignTechModal адаптирован");
}

// ---------- 6. ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ТЕХНОЛОГИЙ ----------
// Функция, которая перерисовывает всё, что связано с технологиями
function refreshTechUI() {
    if (typeof renderAllTechSlots === 'function') renderAllTechSlots();
    if (typeof renderAvailableTechs === 'function') renderAvailableTechs();
    if (typeof renderActiveResearch === 'function') renderActiveResearch();
    if (typeof renderCompletedTechs === 'function') renderCompletedTechs();
    if (typeof renderTechEffectsWork === 'function') renderTechEffectsWork();
    console.log('🔄 Интерфейс технологий обновлён');
}

// Переопределяем processConstruction, чтобы после завершения строительства обновлять технологии
if (typeof window.processConstruction === 'function') {
    const originalProcessConstruction = window.processConstruction;
    window.processConstruction = function() {
        const result = originalProcessConstruction();
        // Если что-то завершилось, обновляем технологии (на случай, если это был Алхимический район)
        refreshTechUI();
        return result;
    };
    console.log("✅ DLC: processConstruction адаптирован для обновления технологий");
}

// Переопределяем refreshBuildingsUI (она вызывается после строительства)
if (typeof window.refreshBuildingsUI === 'function') {
    const originalRefreshBuildingsUI = window.refreshBuildingsUI;
    window.refreshBuildingsUI = function() {
        originalRefreshBuildingsUI();
        // После обновления построек проверяем, активен ли Алхимический район, и обновляем технологии
        if (isAlchemyDistrictActive()) {
            refreshTechUI();
        }
    };
    console.log("✅ DLC: refreshBuildingsUI адаптирован");
}

// Добавляем обновление при переключении на вкладку "Технологии"
// Подменяем setupTabs (если она определена)
if (typeof window.setupTabs === 'function') {
    const originalSetupTabs = window.setupTabs;
    window.setupTabs = function() {
        originalSetupTabs();
        // Добавляем дополнительный обработчик на вкладку tech
        const techTab = document.querySelector('.tab-button[data-tab="tech"]');
        if (techTab) {
            techTab.addEventListener('click', function() {
                // Небольшая задержка, чтобы DOM успел обновиться
                setTimeout(refreshTechUI, 100);
            });
        }
    };
    console.log("✅ DLC: setupTabs адаптирован для обновления технологий при переключении");
}

// ---------- 7. ОТОБРАЖЕНИЕ УМЕНЬШЕННОЙ СТОИМОСТИ В UI (рендер) ----------
if (typeof window.renderAvailableTechs === 'function') {
    const originalRenderAvailableTechs = window.renderAvailableTechs;
    window.renderAvailableTechs = function() {
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
            originalRenderAvailableTechs();
            window.TECH_DB = originalTechDB;
        } else {
            originalRenderAvailableTechs();
        }
    };
    console.log("✅ DLC: renderAvailableTechs адаптирован");
}

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
    console.log("✅ DLC: renderActiveResearch адаптирован");
}

// ---------- 8. ФИЛЬТРАЦИЯ ПОСТРОЕК ПО ФРАКЦИИ ----------
(function() {
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
        console.log("✅ DLC: Логика показа построек адаптирована");
    }

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

// ---------- 9. ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ПРИ ЗАГРУЗКЕ ----------
// Если мы уже на странице Лорейн, обновляем интерфейс сразу
setTimeout(function() {
    if (window.currentFaction === 'principality_lorein') {
        refreshTechUI();
        console.log('🔄 Принудительное обновление технологий при загрузке DLC');
    }
}, 500);

console.log("✅ DLC «Алхимический район» для Лорейн полностью загружен");
