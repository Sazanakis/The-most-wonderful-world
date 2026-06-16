// ============================================================================
// МОДУЛЬ 05: classes.js
// Классы для Совета влиятельных домов (вассалов) и фракционного совета
// ВЕРСИЯ 2.0 – УЛУЧШЕНА ЗАЩИТА ОТ ОТСУТСТВИЯ ГЛОБАЛЬНЫХ ОБЪЕКТОВ
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
        
        // ТИТУЛ (автоматически на основе типа)
        this.title = this.getTitleByType(vassalType);
        
        // Влияние (голоса в совете)
        this.baseInfluence = (typeof VASSAL_TYPES !== 'undefined' && VASSAL_TYPES[vassalType]) 
            ? VASSAL_TYPES[vassalType].baseInfluence 
            : 15;
        this.currentInfluence = this.baseInfluence;
        
        // Лояльность к правителю (0-100)
        this.loyaltyToRuler = baseLoyalty;
        this.satisfaction = 50;
        
        // Черты характера
        this.traits = [];
        
        // История действий
        this.history = [];
        
        // Счётчики для черт характера
        this.counters = {
            warsParticipated: 0,
            battlesWon: 0,
            battlesLost: 0,
            tradeAgreements: 0,
            reformsPassed: 0,
            buildingsConstructed: 0,
            territoriesGained: 0,
            territoriesLost: 0,
            diplomaticInsults: 0,
            turnsIgnored: 0,
            attentionGiven: false,
            attentionTurnsLeft: 0
        };
        
        // Визуальные элементы
        this.coatOfArms = null;
        this.leaderPortrait = null;
        
        // Личная армия вассала
        this.personalArmy = [];
        this.personalArmyPower = 0;
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
     * Вычисляет эффективное влияние с учётом лояльности и черт
     * @returns {number}
     */
    getEffectiveInfluence() {
        let influence = this.currentInfluence;
        
        // Учитываем черты характера
        for (let trait of this.traits) {
            if (trait.active && trait.value) {
                influence += trait.value;
            }
        }
        
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
        
        // АВТОМАТИЧЕСКИ ОБНОВЛЯЕМ ЛИЧНУЮ АРМИЮ (если функция определена)
        if (typeof updateVassalPersonalArmy === 'function') {
            updateVassalPersonalArmy(this);
        }
        
        return this.currentInfluence;
    }
    
    /**
     * Добавляет черту характера вассалу
     * @param {string} traitId - идентификатор черты
     * @param {string} traitName - название
     * @param {string} effect - описание эффекта
     * @param {number} value - модификатор влияния
     * @param {boolean} permanent - постоянная ли черта
     * @param {number|null} duration - длительность в мс (если временная)
     */
    addTrait(traitId, traitName, effect, value, permanent = true, duration = null) {
        const existing = this.traits.find(t => t.id === traitId);
        
        if (existing) {
            existing.value += value;
            existing.active = true;
            if (duration) existing.expiresAt = Date.now() + duration;
        } else {
            this.traits.push({
                id: traitId,
                name: traitName,
                effect: effect,
                value: value,
                active: true,
                permanent: permanent,
                expiresAt: duration ? Date.now() + duration : null
            });
        }
    }
    
    /**
     * Обновляет временные черты (удаляет истёкшие)
     */
    updateTemporaryTraits() {
        const now = Date.now();
        this.traits = this.traits.filter(trait => {
            if (trait.permanent) return true;
            if (trait.expiresAt && trait.expiresAt > now) return true;
            return false;
        });
    }
    
    /**
     * Добавляет отряд в личную армию вассала
     * @param {string} unitKey - ключ юнита в unitDatabase
     * @param {number} count - количество отрядов
     * @returns {boolean}
     */
    addPersonalUnit(unitKey, count = 1) {
        const unitDef = (typeof unitDatabase !== 'undefined') ? unitDatabase[unitKey] : null;
        if (!unitDef) return false;
        
        const existing = this.personalArmy.find(u => u.unitKey === unitKey);
        if (existing) {
            existing.count += count;
        } else {
            this.personalArmy.push({
                id: (typeof generateId === 'function') ? generateId() : Date.now() + '-' + Math.random(),
                unitKey: unitKey,
                name: unitDef.name,
                icon: unitDef.icon,
                count: count,
                experience: 0,
                health: 100
            });
        }
        
        this.personalArmyPower = this.personalArmy.reduce((sum, u) => sum + (u.count * 10), 0);
        return true;
    }
    
    /**
     * Удаляет отряд из личной армии
     * @param {string} unitId - ID отряда
     * @returns {boolean}
     */
    removePersonalUnit(unitId) {
        const index = this.personalArmy.findIndex(u => u.id === unitId);
        if (index !== -1) {
            this.personalArmy.splice(index, 1);
            this.personalArmyPower = this.personalArmy.reduce((sum, u) => sum + (u.count * 10), 0);
            return true;
        }
        return false;
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
            influence: this.getEffectiveInfluence(),
            traitsCount: this.traits.length,
            armyPower: this.personalArmyPower
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
        this.rulerTraits = [];
        
        // Список влиятельных домов
        this.houses = [];
        
        // Статистика фракции
        this.stats = {
            totalIncome: 0,
            totalArmySize: 0,
            totalBuildings: 0,
            territoriesOwned: 1,
            warsActive: 0,
            tradeAgreements: 0,
            religiousBuildings: 0,
            isAtheist: false,
            hasGodBlessing: false,
            turnsAtWar: 0,
            consecutiveVictories: 0,
            consecutiveDefeats: 0
        };
        
        // Глобальные счётчики фракции
        this.globalCounters = {
            warsStarted: 0,
            reformsPassed: 0,
            buildingsDestroyed: 0,
            territoriesLost: 0,
            populationHappiness: 50,
            conqueredPopulationHappiness: 50
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
     * Обрабатывает глобальное действие, вызывая эффекты черт всех вассалов
     * @param {string} actionType - тип действия из ACTION_TYPES
     * @param {Object} data - данные действия
     */
    processGlobalAction(actionType, data) {
        for (let house of this.houses) {
            for (let trait of house.traits) {
                if (!trait.active) continue;
                // Ищем определение черты в TRAITS_DB
                let traitDef = null;
                if (typeof TRAITS_DB !== 'undefined') {
                    for (let key in TRAITS_DB) {
                        if (TRAITS_DB[key].id === trait.id) {
                            traitDef = TRAITS_DB[key];
                            break;
                        }
                    }
                }
                if (traitDef && traitDef.effectOnAction) {
                    traitDef.effectOnAction(house, actionType, data, this);
                }
            }
        }
        this.cleanupExpiredEffects();
    }
    
    /**
     * Очищает истёкшие временные эффекты у всех вассалов
     */
    cleanupExpiredEffects() {
        for (let house of this.houses) {
            house.updateTemporaryTraits();
        }
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

console.log("✅ 05_classes.js загружен — классы InfluentialHouse и FactionCouncil");