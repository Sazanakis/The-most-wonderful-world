// ============================================================================
// МОДУЛЬ 14: init.js
// ВЕРСИЯ 9.0 – ДОБАВЛЕНА ОБРАБОТКА ДЕЙСТВИЙ С КАРТЫ (ОККУПАЦИЯ, ОСВОБОЖДЕНИЕ)
// ============================================================================
// Описание: Основной модуль инициализации игры. Отвечает за загрузку
// всех данных (провинции, армии, совет, торговля, технологии),
// настройку глобальных переменных и обработку параметров URL для
// автоматического запуска действий с карты (оккупация, освобождение).
// ============================================================================

// ============================================================================
// РАЗДЕЛ 1: ДАННЫЕ ДЛЯ КАРТЫ (ГОРОДА)
// ============================================================================
// дата загрузки на гитхаб 01.08.2026
/**
 * Формирует массив данных о городах для отображения на карте.
 * Использует SETTLEMENTS_DB, если он определён.
 */
window.citiesData = (typeof SETTLEMENTS_DB !== 'undefined') 
    ? Object.values(SETTLEMENTS_DB).map(settlement => ({
        name: settlement.name,
        type: settlement.type,
        px: settlement.px,
        py: settlement.py,
        icon: settlement.icon,
        faction: settlement.faction,
        province: settlement.province,
        settlementId: settlement.id,
        isVassal: settlement.isVassal,
        vassalHouse: settlement.vassalHouse
    }))
    : [];

// ============================================================================
// РАЗДЕЛ 2: ИНИЦИАЛИЗАЦИЯ ДАННЫХ ПРОВИНЦИИ
// ============================================================================

/**
 * Создаёт начальные данные для провинции, если они ещё не существуют.
 * Заполняет поселения, ресурсы и расы на основе provinceId.
 * @param {string} provinceId - ID провинции
 */
function initProvinceData(provinceId) {
    if (typeof provincesData === 'undefined') return;
    if (!provincesData[provinceId]) {
        const settlementsInProvince = (typeof SETTLEMENTS_DB !== 'undefined')
            ? Object.values(SETTLEMENTS_DB).filter(s => s.province === provinceId)
            : [];
        const settlements = settlementsInProvince.map(s => ({
            id: s.id,
            name: s.name,
            type: s.type,
            buildings: []
        }));
        const resources = {};
        for (let [key, def] of Object.entries(RESOURCES_REGISTRY)) {
            resources[key] = def.defaultValue;
        }
        let races = [];

        // ===== Определение рас для конкретных провинций =====
        if (provinceId === "orochima") {
            races = [
                { name: "Оку", adultMale: 12000, adultFemale: 12000, children: 5000, elders: 1000, birthRate: 3.0, deathRate: 1.2, goblinChance: 0.05 },
                { name: "Люди", adultMale: 2500, adultFemale: 2500, children: 900, elders: 300, birthRate: 2.0, deathRate: 1.0 },
                { name: "Гоблины", adultMale: 1200, adultFemale: 1200, children: 600, elders: 100, birthRate: 4.0, deathRate: 2.5 },
                { name: "Вульфины", adultMale: 500, adultFemale: 400, children: 150, elders: 50, birthRate: 1.5, deathRate: 1.5 },
                { name: "Тайро", adultMale: 400, adultFemale: 450, children: 150, elders: 50, birthRate: 2.0, deathRate: 1.0 }
            ];
        } else if (provinceId === "kaya") {
            races = [
                { name: "Люди", adultMale: 10000, adultFemale: 10000, children: 4000, elders: 1200, birthRate: 2.0, deathRate: 1.0 },
                { name: "Дварфы", adultMale: 3000, adultFemale: 3000, children: 1200, elders: 400, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
                { name: "Гоблины", adultMale: 800, adultFemale: 800, children: 400, elders: 100, birthRate: 4.0, deathRate: 2.5 },
                { name: "Оку", adultMale: 400, adultFemale: 400, children: 120, elders: 40, birthRate: 3.0, deathRate: 1.2 },
                { name: "Высшие эльфы", adultMale: 300, adultFemale: 350, children: 60, elders: 90, birthRate: 0.5, deathRate: 0 },
                { name: "Вульфины", adultMale: 200, adultFemale: 150, children: 60, elders: 20, birthRate: 1.5, deathRate: 1.5 },
                { name: "Лепусиды (высшие)", adultMale: 200, adultFemale: 200, children: 80, elders: 30, birthRate: 3.5, deathRate: 1.5 }
            ];
        } else if (provinceId === "vogel") {
            races = [
                { name: "Люди", adultMale: 9000, adultFemale: 9000, children: 3500, elders: 1000, birthRate: 2.0, deathRate: 1.0 },
                { name: "Дварфы", adultMale: 2500, adultFemale: 2500, children: 1000, elders: 300, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
                { name: "Гоблины", adultMale: 500, adultFemale: 500, children: 300, elders: 50, birthRate: 4.0, deathRate: 2.5 },
                { name: "Высшие эльфы", adultMale: 200, adultFemale: 200, children: 40, elders: 60, birthRate: 0.5, deathRate: 0 },
                { name: "Вульфины", adultMale: 150, adultFemale: 120, children: 50, elders: 15, birthRate: 1.5, deathRate: 1.5 },
                { name: "Лепусиды (высшие)", adultMale: 150, adultFemale: 150, children: 60, elders: 20, birthRate: 3.5, deathRate: 1.5 }
            ];
        } else if (provinceId === "neolania") {
            races = [
                { name: "Люди", adultMale: 14000, adultFemale: 14000, children: 5000, elders: 1500, birthRate: 2.0, deathRate: 1.0 },
                { name: "Дварфы", adultMale: 5000, adultFemale: 5000, children: 2000, elders: 600, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
                { name: "Высшие эльфы", adultMale: 1000, adultFemale: 1200, children: 200, elders: 400, birthRate: 0.5, deathRate: 0 }
            ];
        } else if (provinceId === "metropolitan_area") {
            races = [
                { name: "Люди", adultMale: 280000, adultFemale: 290000, children: 100000, elders: 30000, birthRate: 2.0, deathRate: 1.0 },
                { name: "Оку", adultMale: 60000, adultFemale: 60000, children: 20000, elders: 6000, birthRate: 3.0, deathRate: 1.2 },
                { name: "Гоблины", adultMale: 50000, adultFemale: 50000, children: 25000, elders: 5000, birthRate: 4.0, deathRate: 2.5 },
                { name: "Дварфы", adultMale: 40000, adultFemale: 40000, children: 12000, elders: 4000, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
                { name: "Высшие эльфы", adultMale: 15000, adultFemale: 15000, children: 3000, elders: 4000, birthRate: 0.5, deathRate: 0 },
                { name: "Вульфины", adultMale: 8000, adultFemale: 7000, children: 2500, elders: 500, birthRate: 1.5, deathRate: 1.5 },
                { name: "Лепусиды (высшие)", adultMale: 6000, adultFemale: 6500, children: 2000, elders: 500, birthRate: 3.5, deathRate: 1.5 },
                { name: "Лепусиды (карликовые)", adultMale: 4000, adultFemale: 4500, children: 1500, elders: 300, birthRate: 3.5, deathRate: 1.8 },
                { name: "Тайро", adultMale: 1000, adultFemale: 1100, children: 400, elders: 100, birthRate: 2.0, deathRate: 1.0 }
            ];
        } else if (provinceId === "great_shaft") {
            races = [
                { name: "Люди", adultMale: 12000, adultFemale: 5000, children: 2000, elders: 500, birthRate: 2.0, deathRate: 1.0 },
                { name: "Оку", adultMale: 4000, adultFemale: 2000, children: 600, elders: 200, birthRate: 3.0, deathRate: 1.2 },
                { name: "Гоблины", adultMale: 2500, adultFemale: 2000, children: 1000, elders: 150, birthRate: 4.0, deathRate: 2.5 },
                { name: "Дварфы", adultMale: 2000, adultFemale: 1000, children: 400, elders: 100, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
                { name: "Вульфины", adultMale: 500, adultFemale: 400, children: 150, elders: 30, birthRate: 1.5, deathRate: 1.5 },
                { name: "Тайро", adultMale: 100, adultFemale: 100, children: 30, elders: 10, birthRate: 2.0, deathRate: 1.0 }
            ];
        } else if (provinceId === "leporis") {
            races = [
                { name: "Лепусиды (высшие)", adultMale: 9000, adultFemale: 10000, children: 3500, elders: 1200, birthRate: 3.5, deathRate: 1.5 },
                { name: "Лепусиды (карликовые)", adultMale: 14000, adultFemale: 16000, children: 5000, elders: 1500, birthRate: 3.5, deathRate: 1.8 },
                { name: "Люди", adultMale: 1500, adultFemale: 1500, children: 500, elders: 100, birthRate: 2.0, deathRate: 1.0 }
            ];
        } else if (provinceId.startsWith("oku_province_")) {
            races = [
                { name: "Оку", adultMale: 8000, adultFemale: 8000, children: 3000, elders: 800, birthRate: 3.0, deathRate: 1.2 },
                { name: "Люди", adultMale: 2000, adultFemale: 2000, children: 700, elders: 200, birthRate: 2.0, deathRate: 1.0 },
                { name: "Гоблины", adultMale: 1500, adultFemale: 1500, children: 600, elders: 100, birthRate: 4.0, deathRate: 2.5 },
                { name: "Вульфины", adultMale: 500, adultFemale: 400, children: 120, elders: 30, birthRate: 1.5, deathRate: 1.5 }
            ];
        } else if (provinceId.startsWith("loyalist_province_")) {
            races = [
                { name: "Люди", adultMale: 10000, adultFemale: 10000, children: 4000, elders: 1200, birthRate: 2.0, deathRate: 1.0 },
                { name: "Дварфы", adultMale: 2500, adultFemale: 2500, children: 800, elders: 300, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
                { name: "Гоблины", adultMale: 1000, adultFemale: 1000, children: 400, elders: 100, birthRate: 4.0, deathRate: 2.5 },
                { name: "Высшие эльфы", adultMale: 300, adultFemale: 300, children: 60, elders: 90, birthRate: 0.5, deathRate: 0 },
                { name: "Вульфины", adultMale: 200, adultFemale: 150, children: 50, elders: 20, birthRate: 1.5, deathRate: 1.5 },
                { name: "Лепусиды (высшие)", adultMale: 200, adultFemale: 200, children: 80, elders: 30, birthRate: 3.5, deathRate: 1.5 }
            ];
        } else if (provinceId.startsWith("neutral_province_")) {
            races = [
                { name: "Люди", adultMale: 8000, adultFemale: 8000, children: 3000, elders: 1000, birthRate: 2.0, deathRate: 1.0 },
                { name: "Дварфы", adultMale: 2000, adultFemale: 2000, children: 600, elders: 200, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
                { name: "Оку", adultMale: 1000, adultFemale: 1000, children: 300, elders: 100, birthRate: 3.0, deathRate: 1.2 },
                { name: "Гоблины", adultMale: 500, adultFemale: 500, children: 200, elders: 50, birthRate: 4.0, deathRate: 2.5 },
                { name: "Вульфины", adultMale: 200, adultFemale: 150, children: 50, elders: 20, birthRate: 1.5, deathRate: 1.5 },
                { name: "Тайро", adultMale: 100, adultFemale: 100, children: 30, elders: 10, birthRate: 2.0, deathRate: 1.0 },
                { name: "Высшие эльфы", adultMale: 150, adultFemale: 150, children: 30, elders: 40, birthRate: 0.5, deathRate: 0 },
                { name: "Лепусиды (высшие)", adultMale: 150, adultFemale: 150, children: 60, elders: 20, birthRate: 3.5, deathRate: 1.5 }
            ];
        } else if (provinceId.startsWith("proyurgan_province_")) {
            races = [
                { name: "Люди", adultMale: 10000, adultFemale: 10000, children: 4000, elders: 1200, birthRate: 2.0, deathRate: 1.0 },
                { name: "Дварфы", adultMale: 3500, adultFemale: 3500, children: 1200, elders: 400, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
                { name: "Высшие эльфы", adultMale: 800, adultFemale: 800, children: 200, elders: 300, birthRate: 0.5, deathRate: 0 }
            ];
        } else {
            races = [
                { name: "Люди", adultMale: 2500, adultFemale: 2500, children: 1000, elders: 300, birthRate: 2.0, deathRate: 1.0 }
            ];
        }

        const army = [];
        provincesData[provinceId] = { settlements, resources, races, army };
        console.log(`🏰 Инициализирована провинция ${provinceId} с ${settlements.length} поселениями`);
    }
}

// ============================================================================
// РАЗДЕЛ 3: ЗАГРУЗКА ВСЕХ ДАННЫХ
// ============================================================================

/**
 * Загружает все сохранённые данные из localStorage:
 * - Совет (factionCouncils)
 * - Армии (loadArmyData)
 * - Провинции (provincesData)
 * - Торговые соглашения (globalTradeAgreements)
 * - Состояние населения (peopleState)
 * - Маршруты (loadRoutes)
 * - Дату (loadGameDate)
 * Также инициализирует недостающие провинции и обновляет интерфейсы.
 */
function loadAllGameData() {
    // === Загрузка Совета ===
    const councilSaved = localStorage.getItem('councilData');
    if (councilSaved && typeof factionCouncils !== 'undefined') {
        try {
            const data = JSON.parse(councilSaved);
            if (data.factionCouncils) {
                for (let fid in data.factionCouncils) {
                    const councilData = data.factionCouncils[fid];
                    const council = new FactionCouncil(councilData.factionId, councilData.rulerName);
                    Object.assign(council, councilData);
                    council.houses = councilData.houses.map(hData => {
                        const house = new InfluentialHouse(hData.id, hData.name, hData.vassalType, hData.politicalFaction, hData.leaderName, hData.loyaltyToRuler);
                        Object.assign(house, hData);
                        return house;
                    });
                    factionCouncils[fid] = council;
                }
            }
            if (data.currentCouncilFaction) currentCouncilFaction = data.currentCouncilFaction;
        } catch(e) { console.error("Ошибка загрузки Совета:", e); }
    }
    // Если совет не загружен, инициализируем основные фракции
    if (typeof factionCouncils !== 'undefined' && Object.keys(factionCouncils).length === 0) {
        const factionsToInit = ["clan_daketa", "county_markarn", "principality_gorski", "regency_council", "lepus_union"];
        for (let fid of factionsToInit) {
            if (typeof initFactionCouncil === 'function') {
                const rulerName = (typeof FACTION_RULERS !== 'undefined' && FACTION_RULERS[fid]) ? FACTION_RULERS[fid] : "Правитель";
                initFactionCouncil(fid, rulerName);
            }
        }
    }

    // === Загрузка армий ===
    if (typeof loadArmyData === 'function') loadArmyData();

    // === Загрузка провинций ===
    const provinceSaved = localStorage.getItem('unified_province_manager');
    if (provinceSaved && typeof provincesData !== 'undefined') {
        try {
            const data = JSON.parse(provinceSaved);
            if (data.provincesData) provincesData = data.provincesData;
            if (data.currentProvince) currentProvince = data.currentProvince;
            if (data.globalTradeAgreements) globalTradeAgreements = data.globalTradeAgreements;
            if (data.peopleState) peopleState = data.peopleState;
            if (typeof migrateAllRaces === 'function') migrateAllRaces();
        } catch(e) { console.error("Ошибка загрузки провинции:", e); }
    }

    // === Гарантируем наличие всех необходимых провинций ===
    const requiredProvinces = ["orochima", "kaya", "vogel", "neolania", "metropolitan_area", "great_shaft", "leporis"];
    for (let pid of requiredProvinces) {
        if (typeof provincesData !== 'undefined' && !provincesData[pid]) {
            initProvinceData(pid);
        }
    }
    // Дополнительно инициализируем все провинции из SETTLEMENTS_DB
    if (typeof SETTLEMENTS_DB !== 'undefined') {
        for (let sid in SETTLEMENTS_DB) {
            const s = SETTLEMENTS_DB[sid];
            if (typeof provincesData !== 'undefined' && !provincesData[s.province]) {
                initProvinceData(s.province);
            }
        }
    }

    // Устанавливаем текущую провинцию, если она не задана
    if (typeof provincesData !== 'undefined' && !provincesData[currentProvince]) {
        currentProvince = (typeof FACTION_TO_PROVINCE !== 'undefined' && FACTION_TO_PROVINCE[currentFaction]) ? FACTION_TO_PROVINCE[currentFaction] : "orochima";
    }

    // === Миграция ресурсов ===
    if (typeof migrateProvinceResources === 'function') {
        for (let pid in provincesData) migrateProvinceResources(pid);
    }

    // === Инициализация полей для строительства ===
    if (typeof peopleState !== 'undefined') {
        if (peopleState.activeConstructionCount === undefined) {
            peopleState.activeConstructionCount = 0;
        }
        if (peopleState.maxConstructionSlots === undefined) {
            peopleState.maxConstructionSlots = 2;
        }
    }

    // === Синхронизация казны с GameState ===
    if (typeof GameState !== 'undefined') {
        const savedTreasury = localStorage.getItem('game_state');
        if (savedTreasury) {
            try {
                const state = JSON.parse(savedTreasury);
                if (state.treasury) GameState.setTreasury(state.treasury);
            } catch(e) {}
        }
        if (typeof armyTreasury !== 'undefined') armyTreasury = GameState.getTreasury();
        if (typeof provincesData !== 'undefined' && provincesData[currentProvince]) provincesData[currentProvince].resources.ers = GameState.getTreasury();
        if (typeof peopleState !== 'undefined') peopleState.treasury = GameState.getTreasury();
    }

    // === Загрузка маршрутов и даты ===
    if (typeof loadRoutes === 'function') loadRoutes();
    if (typeof loadGameDate === 'function') loadGameDate();

    // === Обновление интерфейсов ===
    if (typeof updateGlobalDateDisplay === 'function') updateGlobalDateDisplay();
    if (typeof updateGlobalResourcesDisplay === 'function') updateGlobalResourcesDisplay();
    if (typeof updateTreasuryDisplay === 'function') updateTreasuryDisplay();
}

// ============================================================================
// РАЗДЕЛ 4: ФУНКЦИИ СМЕНЫ ФРАКЦИИ
// ============================================================================

/**
 * Переключает текущую фракцию на указанную, обновляет провинцию,
 * совет, интерфейсы и сохраняет состояние.
 * @param {string} factionId - ID новой фракции
 */
function switchFaction(factionId) {
    if (!factionId || factionId === currentFaction) return;
    currentFaction = factionId;
    const provinceId = (typeof FACTION_TO_PROVINCE !== 'undefined' && FACTION_TO_PROVINCE[factionId]) ? FACTION_TO_PROVINCE[factionId] : "orochima";
    currentProvince = provinceId;
    currentCouncilFaction = factionId;
    if (typeof setCouncilFaction === 'function') setCouncilFaction(factionId);
    if (typeof renderCouncil === 'function') renderCouncil();
    if (typeof renderArmy === 'function') renderArmy();
    if (typeof renderAvailableUnits === 'function') renderAvailableUnits();
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof initTradeData === 'function') initTradeData();
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
    const factionName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId]) ? FACTION_NAMES[factionId] : factionId;
    const rhetoric = (typeof FACTION_TO_RHETORIC !== 'undefined' && FACTION_TO_RHETORIC[factionId]) ? FACTION_TO_RHETORIC[factionId] : "neutral";
    const rhetoricName = (typeof RHETORIC_NAMES !== 'undefined' && RHETORIC_NAMES[rhetoric]) ? RHETORIC_NAMES[rhetoric] : rhetoric;
    addGlobalLog(`🏛️ Переключено на фракцию: ${factionName} (${rhetoricName})`, 'general');
    localStorage.setItem('currentFaction', currentFaction);
    if (typeof saveAllData === 'function') saveAllData();
}

/**
 * Переключает фракцию по клику на герб (используется в интерфейсе).
 * @param {string} factionId - ID фракции
 */
function switchFactionByCoat(factionId) {
    if (!factionId || factionId === currentFaction) return;
    const factionSelect = document.getElementById('globalFactionSelect');
    if (factionSelect) factionSelect.value = factionId;
    switchFaction(factionId);
    addGlobalLog(`🛡️ Переключено на фракцию ${(typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[factionId]) ? FACTION_NAMES[factionId] : factionId} через герб`, 'general');
}

// ============================================================================
// РАЗДЕЛ 5: ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ
// ============================================================================

/**
 * Главная функция инициализации игры.
 * Загружает текущую фракцию, все данные, инициализирует карту, интерфейсы,
 * и обрабатывает параметры URL для действий с карты (оккупация, освобождение).
 */
function fullInit() {
    console.log("🚀 ЗАПУСК ОБЪЕДИНЁННОЙ СИСТЕМЫ УПРАВЛЕНИЯ...");
    console.log("📌 НОВАЯ СТРУКТУРА: Фракция → Провинция → Риторика");
    console.log("🗺️ НОВАЯ СИСТЕМА СЛОЁВ: Риторика | Владения | Вассалы");
    
    // === Загрузка текущей фракции ===
    const savedFaction = localStorage.getItem('currentFaction');
    if (savedFaction && typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[savedFaction]) {
        currentFaction = savedFaction;
    } else {
        currentFaction = "clan_daketa";
    }
    
    // === Загрузка всех данных ===
    loadAllGameData();

    // === Инициализация карты (если она есть на странице) ===
    if (typeof initMap === 'function') {
        initMap();
        if (typeof addCityMarkers === 'function') addCityMarkers();
    }
    
    // === Загрузка маршрутов ===
    if (typeof loadRoutes === 'function') loadRoutes();
    
    // === Настройка UI ===
    if (typeof setupTabs === 'function') setupTabs();
    if (typeof setupCollapsibles === 'function') setupCollapsibles();
    if (typeof setupMapModes === 'function') setupMapModes();
    if (typeof bindGlobalEvents === 'function') bindGlobalEvents();

    // === Обновление селектора фракций ===
    const factionSelect = document.getElementById('globalFactionSelect');
    if (factionSelect) factionSelect.value = currentFaction;
    
    // === Инициализация торговли ===
    if (typeof updatePartnerSelect === 'function') updatePartnerSelect();
    
    // === Отрисовка всех интерфейсов ===
    if (typeof renderCouncil === 'function') renderCouncil();
    if (typeof renderArmy === 'function') { renderArmy(); if (typeof renderAvailableUnits === 'function') renderAvailableUnits(); }
    if (typeof refreshPeopleUI === 'function') refreshPeopleUI();
    if (typeof refreshBuildingsUI === 'function') refreshBuildingsUI();
    if (typeof initTradeData === 'function') initTradeData();
    if (typeof renderProvinceDashboard === 'function') renderProvinceDashboard();
    if (typeof renderAgreements === 'function') renderAgreements();
    if (typeof refreshRecruitmentLimits === 'function') refreshRecruitmentLimits();
    if (typeof startAutoSave === 'function') startAutoSave();
    if (typeof hideLoadingScreen === 'function') hideLoadingScreen();
    
    // === Если нет армий, создаём пример ===
    if (typeof armies !== 'undefined' && armies.length === 0 && typeof loadExampleArmy === 'function') loadExampleArmy();

    console.log("✅ Система полностью инициализирована!");
    const factionName = (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[currentFaction]) ? FACTION_NAMES[currentFaction] : currentFaction;
    const rhetoric = (typeof FACTION_TO_RHETORIC !== 'undefined' && FACTION_TO_RHETORIC[currentFaction]) ? FACTION_TO_RHETORIC[currentFaction] : "neutral";
    const rhetoricName = (typeof RHETORIC_NAMES !== 'undefined' && RHETORIC_NAMES[rhetoric]) ? RHETORIC_NAMES[rhetoric] : rhetoric;
    if (typeof addGlobalLog === 'function') addGlobalLog(`🏛️⚔️ Объединённая система управления фракцией загружена!`, 'general');
    addGlobalLog(`📍 Текущая фракция: ${factionName} (${rhetoricName})`, 'general');
    
    // === Проверка необходимости демографии ===
    if (typeof peopleState !== 'undefined' && peopleState.turnsSinceDemography >= 4) {
        const globalTurnBtn = document.getElementById('globalTurnBtn');
        if (globalTurnBtn) globalTurnBtn.disabled = true;
        addGlobalLog(`⚠️ Требуется применить демографию (${peopleState.turnsSinceDemography}/4). Ход заблокирован.`, 'general');
        if (typeof showDemographyRequiredModal === 'function') {
            showDemographyRequiredModal();
        }
    } else {
        const globalTurnBtn = document.getElementById('globalTurnBtn');
        if (globalTurnBtn) globalTurnBtn.disabled = false;
    }
    
    // === Обновление лимитов и интерфейса найма ===
    if (typeof refreshRecruitmentLimits === 'function') {
        refreshRecruitmentLimits();
    }
    if (typeof updateUnitRecruitAvailability === 'function') {
        updateUnitRecruitAvailability();
    }

    // =========================================================================
    // НОВЫЙ БЛОК: ОБРАБОТКА ДЕЙСТВИЙ С КАРТЫ (ОККУПАЦИЯ, ОСВОБОЖДЕНИЕ)
    // =========================================================================
    // Этот блок проверяет параметры URL, которые передаются при переходе с карты.
    // Параметры:
    //   ?settlement=<ID>   - ID поселения
    //   &action=occupy     - действие "оккупация"
    //   &occupier=<ID>     - (опционально) ID фракции-оккупанта (если не указан, используется текущая фракция)
    //   &action=liberate   - действие "освобождение" (пока не реализовано автоматически)
    // =========================================================================
    const urlParams = new URLSearchParams(window.location.search);
    const settlementId = urlParams.get('settlement');
    const action = urlParams.get('action');
    const occupier = urlParams.get('occupier');

    if (settlementId && action === 'occupy') {
        // Если явно указан occupier, можно использовать его, но captureSettlement берёт текущую фракцию.
        // Так как мы перешли на страницу фракции-оккупанта, то currentFaction уже должна быть этой фракцией.
        // Однако, если мы на странице не той фракции (например, ошибка), можно принудительно переключить.
        // Но для простоты оставим как есть.
        console.log(`🔍 Получен запрос на оккупацию поселения ${settlementId} от фракции ${occupier || currentFaction}`);
        // Задержка, чтобы все данные успели загрузиться
        setTimeout(() => {
            if (typeof captureSettlement === 'function') {
                // captureSettlement принимает только settlementId и использует текущую фракцию
                // Нам нужно, чтобы она использовала occupier, если он передан.
                // Для этого мы можем временно подменить currentFaction, но это опасно.
                // Лучше модифицировать captureSettlement, чтобы он принимал опциональный параметр occupier.
                // Пока оставляем как есть, полагаясь на то, что мы на правильной странице.
                captureSettlement(settlementId);
                // После оккупации можно очистить параметры URL, чтобы при обновлении страницы не повторять действие.
                // Но оставим для простоты.
            } else {
                console.warn('⚠️ Функция captureSettlement не определена');
            }
        }, 500);
    } else if (settlementId && action === 'liberate') {
        // Освобождение обычно требует загрузки файла. Можно показать диалог или перейти на страницу управления.
        // Пока просто выводим сообщение.
        console.log(`🕊️ Запрос на освобождение поселения ${settlementId}`);
        alert('Для освобождения поселения загрузите соответствующий файл на вкладке "Оккупированные земли".');
        // Если есть функция автоматического освобождения, можно её вызвать.
        // Например, если в buildings.js есть liberateSettlement, можно использовать.
    }
}

// ============================================================================
// РАЗДЕЛ 6: ЗАПУСК И ЭКСПОРТ
// ============================================================================

// Автоматический запуск отключён – стартовые экраны вызовут fullInit позже.
// Экспортируем fullInit в глобальную область для вызова из startup.js.
window.fullInit = fullInit;
console.log("⏳ Игра ожидает запуска через стартовые экраны");

// Экспорт функций для внешнего использования
window.initProvinceData = initProvinceData;
window.loadAllGameData = loadAllGameData;
window.switchFaction = switchFaction;
window.switchFactionByCoat = switchFactionByCoat;

console.log("✅ init.js загружен — версия 9.0 (добавлена обработка действий с карты)");