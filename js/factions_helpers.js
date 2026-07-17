// ============================================================================
// МОДУЛЬ: factions_helpers.js
// Вспомогательные функции для работы с фракциями (независимые от карты)
// Версия 1.0 – только функции, отсутствующие в карточном helpers.js
// ============================================================================
// Загружено на гитхаб 18.07.2026
// ---------- ФУНКЦИИ ДЛЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О ФРАКЦИИ ----------

/**
 * Возвращает массив ID провинций, принадлежащих текущей фракции
 * @returns {string[]}
 */
function getCurrentFactionProvinces() {
    const faction = window.currentFaction || 'clan_daketa';
    if (typeof FACTION_TO_PROVINCE !== 'undefined' && FACTION_TO_PROVINCE[faction]) {
        // Для фракций с несколькими провинциями можно расширить, но пока одна
        return [FACTION_TO_PROVINCE[faction]];
    }
    return ['orochima'];
}

/**
 * Возвращает ID столичной провинции текущей фракции
 * @returns {string}
 */
function getFactionCapital() {
    const provinces = getCurrentFactionProvinces();
    return provinces[0] || 'orochima';
}

/**
 * Возвращает название текущей фракции
 * @returns {string}
 */
function getFactionName() {
    const faction = window.currentFaction || 'clan_daketa';
    return (typeof FACTION_NAMES !== 'undefined' && FACTION_NAMES[faction]) ? FACTION_NAMES[faction] : faction;
}

/**
 * Возвращает риторику текущей фракции
 * @returns {string}
 */
function getFactionRhetoric() {
    const faction = window.currentFaction || 'clan_daketa';
    return (typeof FACTION_TO_RHETORIC !== 'undefined' && FACTION_TO_RHETORIC[faction]) ? FACTION_TO_RHETORIC[faction] : 'neutral';
}

// ---------- ФУНКЦИИ ДЛЯ РАБОТЫ С ВАССАЛАМИ ----------

/**
 * Находит вассала по ID во всех советах фракций
 * @param {string} houseId
 * @returns {object|null}
 */
function getVassalById(houseId) {
    if (typeof factionCouncils === 'undefined') return null;
    for (let factionId in factionCouncils) {
        const council = factionCouncils[factionId];
        if (council && typeof council.findHouse === 'function') {
            const house = council.findHouse(houseId);
            if (house) return house;
        }
    }
    return null;
}

/**
 * Обновляет личные армии всех вассалов текущей фракции
 */
function updateAllVassalsArmies() {
    if (typeof factionCouncils === 'undefined') return;
    const council = factionCouncils[window.currentFaction];
    if (!council || !council.houses) return;
    for (let house of council.houses) {
        if (typeof updateVassalPersonalArmy === 'function') {
            updateVassalPersonalArmy(house);
        } else {
            console.warn('updateVassalPersonalArmy не определена, используется заглушка');
            // Заглушка: просто пересчитываем силу армии
            if (house.personalArmy) {
                house.personalArmyPower = house.personalArmy.reduce((sum, u) => sum + (u.count * 10), 0);
            }
        }
    }
    if (typeof renderCouncil === 'function') renderCouncil();
    addGlobalLog('⚔️ Личные армии всех вассалов обновлены', 'council');
}

// ---------- ФУНКЦИИ ДЛЯ РАБОТЫ С РЕСУРСАМИ ФРАКЦИИ ----------

/**
 * Возвращает суммарные ресурсы всех провинций фракции
 * @returns {object} объект с ресурсами { wood, stone, iron, gold, ers }
 */
function getTotalFactionResources() {
    const provinces = getCurrentFactionProvinces();
    const total = { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 };
    if (typeof provincesData === 'undefined') return total;
    for (let pid of provinces) {
        const data = provincesData[pid];
        if (data && data.resources) {
            total.wood += data.resources.wood || 0;
            total.stone += data.resources.stone || 0;
            total.iron += data.resources.iron || 0;
            total.gold += data.resources.gold || 0;
            total.ers += data.resources.ers || 0;
        }
    }
    return total;
}

/**
 * Возвращает текущую казну фракции (суммарно по провинциям)
 * @returns {number}
 */
function getFactionTreasury() {
    const total = getTotalFactionResources();
    return total.ers;
}

// ---------- ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ ----------

/**
 * Проверяет, принадлежит ли поселение текущей фракции
 * @param {string} settlementId
 * @returns {boolean}
 */
function isSettlementOwnedByFaction(settlementId) {
    if (typeof SETTLEMENTS_DB === 'undefined') return false;
    const settlement = SETTLEMENTS_DB[settlementId];
    if (!settlement) return false;
    return settlement.faction === window.currentFaction;
}

/**
 * Возвращает массив поселений текущей фракции
 * @returns {Array}
 */
function getFactionSettlements() {
    if (typeof SETTLEMENTS_DB === 'undefined') return [];
    const faction = window.currentFaction;
    const result = [];
    for (let id in SETTLEMENTS_DB) {
        const s = SETTLEMENTS_DB[id];
        if (s.faction === faction) {
            result.push(s);
        }
    }
    return result;
}

// ---------- ФУНКЦИИ ДЛЯ ИНИЦИАЛИЗАЦИИ ДАННЫХ (используются при создании фракции) ----------

/**
 * Создаёт начальные данные для провинции фракции, если их нет
 * @param {string} provinceId - ID провинции
 */
function initProvinceDataIfNeeded(provinceId) {
    if (typeof provincesData === 'undefined') return;
    if (provincesData[provinceId]) return;

    const settlements = [];
    if (typeof SETTLEMENTS_DB !== 'undefined') {
        for (let id in SETTLEMENTS_DB) {
            const s = SETTLEMENTS_DB[id];
            if (s.province === provinceId) {
                settlements.push({ id: s.id, name: s.name, type: s.type, buildings: [] });
            }
        }
    }

    // Базовая инициализация рас и ресурсов (можно переопределить для каждой фракции)
    provincesData[provinceId] = {
        settlements: settlements,
        resources: { wood: 500, stone: 300, iron: 200, gold: 10, ers: 10000 },
        races: [], // будут заполнены в зависимости от фракции
        army: []
    };
}

/**
 * Инициализирует начальные расы для провинции на основе фракции
 * @param {string} provinceId
 * @param {string} factionId
 */
function initRacesForProvince(provinceId, factionId) {
    if (typeof provincesData === 'undefined' || !provincesData[provinceId]) return;
    const data = provincesData[provinceId];
    if (data.races && data.races.length > 0) return;

    let races = [];

    if (factionId === 'clan_daketa' || provinceId === 'orochima') {
        races = [
            { name: "Оку", adultMale: 12000, adultFemale: 12000, children: 5000, elders: 1000, birthRate: 3.0, deathRate: 1.2, goblinChance: 0.05 },
            { name: "Люди", adultMale: 2500, adultFemale: 2500, children: 900, elders: 300, birthRate: 2.0, deathRate: 1.0 },
            { name: "Гоблины", adultMale: 1200, adultFemale: 1200, children: 600, elders: 100, birthRate: 4.0, deathRate: 2.5 },
            { name: "Вульфины", adultMale: 500, adultFemale: 400, children: 150, elders: 50, birthRate: 1.5, deathRate: 1.5 },
            { name: "Тайро", adultMale: 400, adultFemale: 450, children: 150, elders: 50, birthRate: 2.0, deathRate: 1.0 }
        ];
    } else if (factionId === 'county_markarn' || provinceId === 'kaya') {
        races = [
            { name: "Люди", adultMale: 10000, adultFemale: 10000, children: 4000, elders: 1200, birthRate: 2.0, deathRate: 1.0 },
            { name: "Дварфы", adultMale: 3000, adultFemale: 3000, children: 1200, elders: 400, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
            { name: "Гоблины", adultMale: 800, adultFemale: 800, children: 400, elders: 100, birthRate: 4.0, deathRate: 2.5 },
            { name: "Оку", adultMale: 400, adultFemale: 400, children: 120, elders: 40, birthRate: 3.0, deathRate: 1.2 }
        ];
    } else if (factionId === 'principality_gorski' || provinceId === 'neolania') {
        races = [
            { name: "Люди", adultMale: 14000, adultFemale: 14000, children: 5000, elders: 1500, birthRate: 2.0, deathRate: 1.0 },
            { name: "Дварфы", adultMale: 5000, adultFemale: 5000, children: 2000, elders: 600, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } },
            { name: "Высшие эльфы", adultMale: 1000, adultFemale: 1200, children: 200, elders: 400, birthRate: 0.5, deathRate: 0 }
        ];
    } else if (factionId === 'clan_date' || provinceId === 'mutsura') {
        // 140 000 жителей: Оку ~93 800, Гоблины ~28 000, Люди ~14 000, Вульфины ~2 800, Дварфы ~1 400
        races = [
            { name: "Оку", adultMale: 40000, adultFemale: 40000, children: 10000, elders: 3800, birthRate: 3.0, deathRate: 1.2, goblinChance: 0.05 },
            { name: "Гоблины", adultMale: 11000, adultFemale: 11000, children: 5000, elders: 1000, birthRate: 4.0, deathRate: 2.5 },
            { name: "Люди", adultMale: 6000, adultFemale: 6000, children: 1500, elders: 500, birthRate: 2.0, deathRate: 1.0 },
            { name: "Вульфины", adultMale: 1100, adultFemale: 1100, children: 400, elders: 200, birthRate: 1.5, deathRate: 1.5 },
            { name: "Дварфы", adultMale: 600, adultFemale: 600, children: 150, elders: 50, birthRate: 1.8, deathRate: 0.8, economyBonus: { stone: 0.1, iron: 0.1, buildSpeed: 0.05 } }
        ];
    } else {
        // fallback – люди
        races = [
            { name: "Люди", adultMale: 10000, adultFemale: 10000, children: 4000, elders: 1200, birthRate: 2.0, deathRate: 1.0 }
        ];
    }

    data.races = races;
}

/**
 * Инициализирует совет фракции, если он ещё не создан
 * @param {string} factionId
 * @param {string} rulerName
 */
function initCouncilIfNeeded(factionId, rulerName) {
    if (typeof factionCouncils === 'undefined') return;
    if (factionCouncils[factionId]) return;

    if (typeof FactionCouncil === 'undefined') {
        console.warn('FactionCouncil не определён, невозможно создать совет');
        return;
    }

    const council = new FactionCouncil(factionId, rulerName || (FACTION_RULERS ? FACTION_RULERS[factionId] : 'Правитель'));

    // Добавляем начальных вассалов из конфига
    if (typeof INITIAL_VASSALS !== 'undefined' && INITIAL_VASSALS[factionId]) {
        for (let v of INITIAL_VASSALS[factionId]) {
            const house = new InfluentialHouse(v.id, v.name, v.type, v.political, v.leader, v.loyalty);
            // Устанавливаем герб и портрет, если есть
            if (typeof VASSAL_ICONS !== 'undefined' && VASSAL_ICONS[v.id]) {
                house.coatOfArms = VASSAL_ICONS[v.id].coat;
                house.leaderPortrait = VASSAL_ICONS[v.id].portrait;
            }
            council.houses.push(house);
        }
    }

    factionCouncils[factionId] = council;
}

// ---------- ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ----------
window.getCurrentFactionProvinces = getCurrentFactionProvinces;
window.getFactionCapital = getFactionCapital;
window.getFactionName = getFactionName;
window.getFactionRhetoric = getFactionRhetoric;
window.getVassalById = getVassalById;
window.updateAllVassalsArmies = updateAllVassalsArmies;
window.getTotalFactionResources = getTotalFactionResources;
window.getFactionTreasury = getFactionTreasury;
window.isSettlementOwnedByFaction = isSettlementOwnedByFaction;
window.getFactionSettlements = getFactionSettlements;
window.initProvinceDataIfNeeded = initProvinceDataIfNeeded;
window.initRacesForProvince = initRacesForProvince;
window.initCouncilIfNeeded = initCouncilIfNeeded;

console.log("✅ factions_helpers.js загружен");