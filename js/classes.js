// ============================================================================
// МОДУЛЬ 05: classes.js (версия 3.0 – упрощённая)
// Классы для Совета влиятельных домов (вассалов) и фракционного совета
// Убраны личные армии, черты характера, счётчики.
// ============================================================================

// ========== 1. КЛАСС ВЛИЯТЕЛЬНОГО ДОМА (ВАССАЛА) ==========

class InfluentialHouse {
    constructor(id, name, vassalType, politicalFaction, leaderName, baseLoyalty = 50) {
        this.id = id;
        this.name = name;
        this.vassalType = vassalType;
        this.politicalFaction = politicalFaction;
        this.leaderName = leaderName;
        this.leaderGender = "male";
        this.leaderAge = 35;
        this.leaderCharisma = 5;

        // Титул (автоматически на основе типа)
        this.title = this.getTitleByType(vassalType);

        // Влияние (голоса в совете)
        this.baseInfluence = (typeof VASSAL_TYPES !== 'undefined' && VASSAL_TYPES[vassalType]) 
            ? VASSAL_TYPES[vassalType].baseInfluence 
            : 15;
        this.currentInfluence = this.baseInfluence;

        // Лояльность к правителю (0-100)
        this.loyaltyToRuler = baseLoyalty;
        this.satisfaction = 50;   // пока не используется, но оставлено для будущих механик

        // Внешняя ссылка (например, страница ВК)
        this.externalLink = '';

        // Визуальные элементы
        this.coatOfArms = null;
        this.leaderPortrait = null;

        // История действий
        this.history = [];
    }

    /**
     * Возвращает титул на основе типа вассала и ID дома
     * @param {string} vassalType
     * @returns {string}
     */
    getTitleByType(vassalType) {
        // Вассалы Оку – окутанские титулы
        if (this.id && this.id.startsWith('house_')) {
            const okuTitleMap = {
                "MAJOR_CLAN": "Гун-Даё",
                "MEDIUM_CLAN": "Кугэ",
                "MINOR_CLAN": "Хатамото",
                "NOBLE_HOUSE": "Кугэ"
            };
            return okuTitleMap[vassalType] || "Мураи-дзи";
        }

        // Человеческие вассалы – человеческие титулы
        const humanTitleMap = {
            "MAJOR_CLAN": "Виконт",
            "MEDIUM_CLAN": "Барон",
            "MINOR_CLAN": "Барон",
            "NOBLE_HOUSE": "Виконт"
        };
        return humanTitleMap[vassalType] || "Рыцарь-вассал";
    }

    /**
     * Обновляет титул при изменении типа вассала
     */
    updateTitle() {
        this.title = this.getTitleByType(this.vassalType);
    }

    /**
     * Вычисляет эффективное влияние с учётом лояльности
     * @returns {number}
     */
    getEffectiveInfluence() {
        let influence = this.currentInfluence;

        // Модификаторы от лояльности
        if (this.loyaltyToRuler < 30) {
            influence *= 0.7;
        } else if (this.loyaltyToRuler < 50) {
            influence *= 0.85;
        } else if (this.loyaltyToRuler > 80) {
            influence *= 1.15;
        } else if (this.loyaltyToRuler > 90) {
            influence *= 1.3;
        }

        // Ограничения по типу вассала
        if (typeof VASSAL_TYPES !== 'undefined' && VASSAL_TYPES[this.vassalType]) {
            const limits = VASSAL_TYPES[this.vassalType];
            influence = Math.max(limits.minInfluence, Math.min(limits.maxInfluence, influence));
        }

        return Math.floor(influence);
    }

    /**
     * Изменяет лояльность вассала
     * @param {number} delta - изменение
     * @param {string} reason - причина
     * @returns {number}
     */
    modifyLoyalty(delta, reason) {
        const oldLoyalty = this.loyaltyToRuler;
        this.loyaltyToRuler = Math.min(100, Math.max(0, this.loyaltyToRuler + delta));

        this.history.unshift({
            timestamp: Date.now(),
            type: "loyalty_change",
            delta: delta,
            oldValue: oldLoyalty,
            newValue: this.loyaltyToRuler,
            reason: reason
        });

        if (this.history.length > 50) this.history.pop();

        return this.loyaltyToRuler;
    }

    /**
     * Изменяет влияние вассала
     * @param {number} delta - изменение
     * @param {string} reason - причина
     * @returns {number}
     */
    modifyInfluence(delta, reason) {
        const oldInfluence = this.currentInfluence;
        this.currentInfluence = Math.max(0, this.currentInfluence + delta);

        this.history.unshift({
            timestamp: Date.now(),
            type: "influence_change",
            delta: delta,
            oldValue: oldInfluence,
            newValue: this.currentInfluence,
            reason: reason
        });

        if (this.history.length > 50) this.history.pop();

        return this.currentInfluence;
    }

    /**
     * Возвращает краткую информацию о доме
     * @returns {Object}
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            title: this.title,
            vassalType: this.vassalType,
            politicalFaction: this.politicalFaction,
            leaderName: this.leaderName,
            loyalty: this.loyaltyToRuler,
            influence: this.getEffectiveInfluence()
        };
    }
}

// ========== 2. КЛАСС СОВЕТА ФРАКЦИИ ==========

class FactionCouncil {
    constructor(factionId, rulerName) {
        this.factionId = factionId;
        this.rulerName = rulerName;
        this.rulerGender = "male";
        this.rulerAge = 40;
        this.rulerCharisma = 7;

        // Список влиятельных домов
        this.houses = [];

        // Базовая статистика (можно расширять)
        this.stats = {
            totalIncome: 0,
            totalArmySize: 0,
            totalBuildings: 0,
            territoriesOwned: 1,
            warsActive: 0,
            tradeAgreements: 0,
            religiousBuildings: 0
        };
    }

    /**
     * Возвращает количество голосов правителя в совете
     * @returns {number}
     */
    getRulerVotes() {
        let totalHousesInfluence = 0;
        for (let house of this.houses) {
            totalHousesInfluence += house.getEffectiveInfluence();
        }
        let rulerBaseVotes = 50;
        let rulerBonus = Math.floor(this.rulerCharisma * 3);
        const totalSeats = (typeof TOTAL_COUNCIL_SEATS !== 'undefined') ? TOTAL_COUNCIL_SEATS : 300;
        return Math.max(0, totalSeats - totalHousesInfluence + rulerBaseVotes + rulerBonus);
    }

    /**
     * Возвращает процент контроля правителя над советом
     * @returns {number}
     */
    getRulerControlPercent() {
        const totalSeats = (typeof TOTAL_COUNCIL_SEATS !== 'undefined') ? TOTAL_COUNCIL_SEATS : 300;
        return (this.getRulerVotes() / totalSeats) * 100;
    }

    /**
     * Возвращает суммарное влияние политической фракции
     * @param {string} politicalFaction - ключ фракции из POLITICAL_FACTIONS
     * @returns {number}
     */
    getFactionInfluence(politicalFaction) {
        let total = 0;
        for (let house of this.houses) {
            if (house.politicalFaction === politicalFaction) {
                total += house.getEffectiveInfluence();
            }
        }
        return total;
    }

    /**
     * Добавляет вассала в совет
     * @param {InfluentialHouse} house
     */
    addHouse(house) {
        this.houses.push(house);
    }

    /**
     * Удаляет вассала из совета по ID
     * @param {string} houseId
     * @returns {boolean}
     */
    removeHouse(houseId) {
        const index = this.houses.findIndex(h => h.id === houseId);
        if (index !== -1) {
            this.houses.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Находит вассала по ID
     * @param {string} houseId
     * @returns {InfluentialHouse|null}
     */
    findHouse(houseId) {
        return this.houses.find(h => h.id === houseId) || null;
    }

    /**
     * Возвращает краткую сводку по совету
     * @returns {Object}
     */
    getSummary() {
        return {
            factionId: this.factionId,
            rulerName: this.rulerName,
            rulerControl: this.getRulerControlPercent().toFixed(1),
            housesCount: this.houses.length,
            totalInfluence: this.houses.reduce((sum, h) => sum + h.getEffectiveInfluence(), 0),
            averageLoyalty: this.houses.reduce((sum, h) => sum + h.loyaltyToRuler, 0) / (this.houses.length || 1)
        };
    }
}

// ========== 3. ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ==========

/**
 * Находит вассала по ID во всех советах
 * @param {string} houseId
 * @returns {InfluentialHouse|null}
 */
function findHouseById(houseId) {
    if (typeof factionCouncils !== 'undefined') {
        for (let council of Object.values(factionCouncils)) {
            const house = council.findHouse(houseId);
            if (house) return house;
        }
    }
    return null;
}

console.log("✅ classes.js загружен — упрощённая версия 3.0 (без армий, черт и счётчиков)");