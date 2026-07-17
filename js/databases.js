// ============================================================================
// МОДУЛЬ 04: databases.js (исправленная версия)
// ============================================================================
// Загружено на гитхаб 18.07.2026
// ========== 1. БАЗА ДАННЫХ ЧЕРТ ХАРАКТЕРА (TRAITS_DB) ==========
const TRAITS_DB = {
    AGRONOMIST: {
        id: "agronomist", name: "Агроном",
        description: "+5 лояльности за развитие сельского хозяйства",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.BUILDING_CONSTRUCTED && data.buildingType === "farm") {
                if (house.modifyLoyalty) house.modifyLoyalty(5, "Развитие сельского хозяйства (Агроном)");
                return true;
            }
            return false;
        }
    },
    KNOWLEDGE_SEEKER: {
        id: "knowledge_seeker", name: "Жаждет знаний",
        description: "-10 лояльности, если влияние вассала выше чем у правителя",
        effectOnAction: (house, actionType, data, council) => {
            if (house.getEffectiveInfluence && council && house.getEffectiveInfluence() > council.getRulerVotes()) {
                if (house.modifyLoyalty) house.modifyLoyalty(-10, "Влияние превышает власть правителя (Жаждет знаний)");
                return true;
            }
            return false;
        }
    },
    XENOPHOBE: {
        id: "xenophobe", name: "Ксенофоб",
        description: "-5 лояльности за сделки с чужеземцами",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.TRADE_AGREEMENT && data.withOtherRace === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(-5, "Сделка с чужеземцами (Ксенофоб)");
                return true;
            }
            return false;
        }
    },
    HYPOCRITE: {
        id: "hypocrite", name: "Лицемер",
        description: "-1 лояльности за каждую переданную землю другому",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.TERRITORY_GAINED && data.recipient !== house.name) {
                if (house.modifyLoyalty) house.modifyLoyalty(-1, `Земля передана ${data.recipient} (Лицемер)`);
                return true;
            }
            return false;
        }
    },
    PROVOCATEUR: {
        id: "provocateur", name: "Идёт на провокации",
        description: "+1 лояльности за публичную похвалу правителя",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.FACTION_LEADER_ACTION && data.type === "public_praise" && data.target === house.name) {
                if (house.modifyLoyalty) house.modifyLoyalty(1, "Публичная похвала правителя (Провокатор)");
                return true;
            }
            return false;
        }
    },
    PACIFIST: {
        id: "pacifist", name: "Ратует за мир",
        description: "-5 лояльности за каждые 5 ходов войны (до -15)",
        effectOnAction: (house, actionType, data, council) => {
            if (actionType === ACTION_TYPES.WAR_DECLARATION) {
                if (!house.counters) house.counters = {};
                house.counters.warsParticipated = (house.counters.warsParticipated || 0) + 1;
                let penalty = Math.min(15, Math.floor(house.counters.warsParticipated / 5) * 5);
                if (penalty > 0 && house.modifyLoyalty) {
                    house.modifyLoyalty(-penalty, `${penalty} за ${house.counters.warsParticipated} ходов войны (Пацифист)`);
                }
                return true;
            }
            return false;
        }
    },
    TRADITIONALIST: {
        id: "traditionalist", name: "Традиционалист",
        description: "+1 лояльности за развитие культуры",
        effectOnAction: (house, actionType, data) => {
            if ((actionType === ACTION_TYPES.REFORM_PASSED || actionType === ACTION_TYPES.BUILDING_CONSTRUCTED) &&
                (data.type === "culture" || data.buildingType === "culture")) {
                if (house.modifyLoyalty) house.modifyLoyalty(1, "Развитие культуры (Традиционалист)");
                return true;
            }
            return false;
        }
    },
    POPULIST: {
        id: "populist", name: "Популист",
        description: "-10 лояльности за реформы, увеличивающие расходы",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.REFORM_PASSED && (data.type === "centralization" || data.type === "tax_increase")) {
                if (house.modifyLoyalty) house.modifyLoyalty(-10, "Реформа увеличивающая расходы (Популист)");
                return true;
            }
            return false;
        }
    },
    CONQUEROR: {
        id: "conqueror", name: "Завоеватель",
        description: "+5 за войну, +1 за победу, -1 за поражение",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.WAR_DECLARATION) {
                if (house.modifyLoyalty) house.modifyLoyalty(5, "Начало новой войны (Завоеватель)");
                return true;
            }
            if (actionType === ACTION_TYPES.BATTLE_WON) {
                if (house.modifyLoyalty) house.modifyLoyalty(1, "Победа в сражении (Завоеватель)");
                if (!house.counters) house.counters = {};
                house.counters.battlesWon = (house.counters.battlesWon || 0) + 1;
                return true;
            }
            if (actionType === ACTION_TYPES.BATTLE_LOST) {
                if (house.modifyLoyalty) house.modifyLoyalty(-1, "Поражение в сражении (Завоеватель)");
                if (!house.counters) house.counters = {};
                house.counters.battlesLost = (house.counters.battlesLost || 0) + 1;
                return true;
            }
            return false;
        }
    },
    MILITARIST: {
        id: "militarist", name: "Милитарист",
        description: "+2 лояльности за военные постройки и реформы",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.BUILDING_CONSTRUCTED && (data.buildingType === "military" || data.buildingType === "defense")) {
                if (house.modifyLoyalty) house.modifyLoyalty(2, "Военная постройка (Милитарист)");
                return true;
            }
            if (actionType === ACTION_TYPES.REFORM_PASSED && data.type === "military") {
                if (house.modifyLoyalty) house.modifyLoyalty(2, "Военная реформа (Милитарист)");
                return true;
            }
            return false;
        }
    },
    DIPLOMAT: {
        id: "diplomat", name: "Дипломат",
        description: "+1 за удачные соглашения, -1 за испорченные отношения",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.TRADE_AGREEMENT && data.success === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(1, "Удачное торговое соглашение (Дипломат)");
                if (!house.counters) house.counters = {};
                house.counters.tradeAgreements = (house.counters.tradeAgreements || 0) + 1;
                return true;
            }
            if (actionType === ACTION_TYPES.DIPLOMATIC_INSULT) {
                if (house.modifyLoyalty) house.modifyLoyalty(-1, "Испорченные дипломатические отношения (Дипломат)");
                if (!house.counters) house.counters = {};
                house.counters.diplomaticInsults = (house.counters.diplomaticInsults || 0) + 1;
                return true;
            }
            return false;
        }
    },
    MERCANTILE: {
        id: "mercantile", name: "Меркантильный торгаш",
        description: "+1 лояльности за каждое торговое соглашение (до 10)",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.TRADE_AGREEMENT) {
                if (!house.counters) house.counters = {};
                if ((house.counters.tradeAgreements || 0) < 10) {
                    house.counters.tradeAgreements = (house.counters.tradeAgreements || 0) + 1;
                    if (house.modifyLoyalty) house.modifyLoyalty(1, `Торговое соглашение (${house.counters.tradeAgreements}/10) (Меркантильный торгаш)`);
                }
                return true;
            }
            return false;
        }
    },
    HONORABLE: {
        id: "honorable", name: "Честь",
        description: "+10 за подвиги, -10 за поражения, +5 за добрые дела",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.BATTLE_WON && data.isRulerLed === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(10, "Личная победа правителя (Честь)");
                return true;
            }
            if (actionType === ACTION_TYPES.BATTLE_LOST && data.isRulerLed === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(-10, "Личное поражение правителя (Честь)");
                return true;
            }
            if (actionType === ACTION_TYPES.FACTION_LEADER_ACTION && data.type === "good_deed") {
                if (house.modifyLoyalty) house.modifyLoyalty(5, "Доброе деяние правителя (Честь)");
                return true;
            }
            return false;
        }
    },
    PATRIOT: {
        id: "patriot", name: "Патриот",
        description: "-5 лояльности за врага на родных землях",
        effectOnAction: (house, actionType, data) => {
            if (actionType === ACTION_TYPES.TERRITORY_LOST && data.enemyArmyOnLand === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(-5, "Вражеская армия на родных землях (Патриот)");
                return true;
            }
            return false;
        }
    },
    RELIGIOUS: {
        id: "religious", name: "Религиозный",
        description: "+5 за религ. постройки, -15 за атеизм, +20 за религ. войну",
        effectOnAction: (house, actionType, data, council) => {
            if (actionType === ACTION_TYPES.BUILDING_CONSTRUCTED && data.buildingType === "religious") {
                if (house.modifyLoyalty) house.modifyLoyalty(5, "Религиозная постройка (Религиозный)");
                return true;
            }
            if (council && council.stats && council.stats.isAtheist === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(-15, "Правитель-атеист (Религиозный)");
                return true;
            }
            if (actionType === ACTION_TYPES.WAR_DECLARATION && data.religiousMotivation === true) {
                if (house.modifyLoyalty) house.modifyLoyalty(20, "Религиозная война (Религиозный)");
                return true;
            }
            return false;
        }
    }
};

// ========== 2. БАЗА ДАННЫХ ПОСТРОЕК (buildingsCatalog) ==========
const buildingsCatalog = {
    "Лесопилка": {
        name: "Лесопилка", category: "resource", allowedSettlementTypes: ["village"],
        description: "+50 древесины/ход",
        cost: { wood: 200, stone: 100, iron: 0, gold: 0, ers: 2500 },
        buildTime: 3,
        income: { wood: 50, stone: 0, iron: 0, gold: 0, ers: 0 },
        upgrade: {
            name: "Лесопилка (улучшенная)",
            cost: { wood: 300, stone: 160, iron: 40, gold: 0, ers: 4000 },
            buildTime: 4,
            income: { wood: 100, stone: 0, iron: 0, gold: 0, ers: 0 }
        }
    },
    "Каменоломня": {
        name: "Каменоломня", category: "resource", allowedSettlementTypes: ["village"],
        description: "+30 камня/ход",
        cost: { wood: 160, stone: 0, iron: 40, gold: 0, ers: 3000 },
        buildTime: 3,
        income: { wood: 0, stone: 30, iron: 0, gold: 0, ers: 0 },
        upgrade: {
            name: "Каменоломня (улучшенная)",
            cost: { wood: 240, stone: 120, iron: 60, gold: 0, ers: 5000 },
            buildTime: 4,
            income: { wood: 0, stone: 60, iron: 0, gold: 0, ers: 0 }
        }
    },
    "Железная шахта": {
        name: "Железная шахта", category: "resource", allowedSettlementTypes: ["village"],
        description: "+20 железа/ход",
        cost: { wood: 240, stone: 160, iron: 0, gold: 0, ers: 4000 },
        buildTime: 4,
        income: { wood: 0, stone: 0, iron: 20, gold: 0, ers: 0 },
        upgrade: {
            name: "Железная шахта (улучшенная)",
            cost: { wood: 360, stone: 240, iron: 60, gold: 0, ers: 6000 },
            buildTime: 5,
            income: { wood: 0, stone: 0, iron: 40, gold: 0, ers: 0 }
        }
    },
    "Золотая шахта": {
        name: "Золотая шахта", category: "resource", allowedSettlementTypes: ["village"],
        description: "+10 золота/ход",
        cost: { wood: 300, stone: 200, iron: 60, gold: 0, ers: 7500 },
        buildTime: 5,
        income: { wood: 0, stone: 0, iron: 0, gold: 10, ers: 0 },
        upgrade: {
            name: "Золотая шахта (улучшенная)",
            cost: { wood: 500, stone: 360, iron: 100, gold: 20, ers: 10000 },
            buildTime: 6,
            income: { wood: 0, stone: 0, iron: 0, gold: 20, ers: 0 }
        }
    },
	"Кузница Титанов": {
		name: "Кузница Титанов",
		category: "resource",
		allowedSettlementTypes: ["village"],
		description: "Переплавляет гигантские мечи Титанов в редкий металл. Даёт 10 Железа меча/ход, но потребляет 5 древесины/ход.",
		cost: { wood: 300, stone: 400, iron: 100, gold: 20, ers: 8000 },
		buildTime: 5,
		income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
		special: "titanForge",
		limit: { scope: "province", max: 1 }
	},
    "Казармы": {
        name: "Казармы", category: "military", allowedSettlementTypes: ["city"],
        description: "+5% к призывному резерву",
        cost: { wood: 200, stone: 160, iron: 80, gold: 0, ers: 5000 },
        buildTime: 3,
        income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
        special: "conscriptionBonus5",
        upgrade: {
            name: "Казармы (улучшенные)",
            cost: { wood: 300, stone: 240, iron: 120, gold: 0, ers: 7500 },
            buildTime: 4,
            income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
            special: "conscriptionBonus10"
        }
    },
	"Осадная мастерская": {
		name: "Осадная мастерская", category: "military", allowedSettlementTypes: ["city"],
		description: "Позволяет строить осадные орудия",
		cost: { wood: 500, stone: 400, iron: 160, gold: 10, ers: 7500 },
		buildTime: 4,
		income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
		special: "siegeWorkshop",
		limit: { scope: "province", max: 1 },
		upgrade: {
			name: "Инженерный цех",
			cost: { wood: 700, stone: 600, iron: 240, gold: 20, ers: 10000 },
			buildTime: 5,
			income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
			special: "siegeWorkshopPlus"
		}
	},
	"Монетный двор": {
		name: "Монетный двор", category: "economic", allowedSettlementTypes: ["city"],
		description: "Курс обмена 1 золото → 1200 эрсов",
		cost: { wood: 400, stone: 300, iron: 100, gold: 20, ers: 10000 },
		buildTime: 4,
		income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
		special: "coinExchange1200",
		limit: { scope: "faction", max: 1 },
		upgrade: {
			name: "Монетный двор (улучшенный)",
			cost: { wood: 600, stone: 400, iron: 160, gold: 40, ers: 15000 },
			buildTime: 5,
			income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
			special: "coinExchange1700"
		}
	},
    "Кузница": {
        name: "Кузница", category: "economic", allowedSettlementTypes: ["city"],
        description: "+20% к добыче железа",
        cost: { wood: 160, stone: 120, iron: 40, gold: 0, ers: 4000 },
        buildTime: 3,
        income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
        special: "ironBonus20",
        upgrade: {
            name: "Кузница (улучшенная)",
            cost: { wood: 240, stone: 200, iron: 60, gold: 0, ers: 6000 },
            buildTime: 4,
            income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
            special: "goldBonus20"
        }
    },
	"Рынок": {
		name: "Рынок", category: "economic", allowedSettlementTypes: ["city"],
		description: "+15% к доходу от торговых соглашений",
		cost: { wood: 400, stone: 200, iron: 40, gold: 10, ers: 5000 },
		buildTime: 3,
		income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
		special: "tradeBonus15",
		upgrade: {
			name: "Большой рынок",
			cost: { wood: 600, stone: 300, iron: 80, gold: 20, ers: 7500 },
			buildTime: 4,
			income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
			special: "tradeBonus30",
			limit: { scope: "province", max: 1 }
		}
	},
    "Таверна": {
        name: "Таверна", category: "economic", allowedSettlementTypes: ["city"],
        description: "Открывает наёмников (дварфы и др.)",
        cost: { wood: 300, stone: 100, iron: 20, gold: 0, ers: 3000 },
        buildTime: 3,
        income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
        special: "tavern",
        upgrade: {
            name: "Большая таверна",
            cost: { wood: 500, stone: 200, iron: 60, gold: 20, ers: 6000 },
            buildTime: 4,
            income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
            special: "tavernPlus"
        }
    },
	"Алтарь Варсиса": {
		name: "Алтарь Варсиса", category: "religious", allowedSettlementTypes: ["city", "castle", "village"],
		description: "Открывает «Мясников Варсиса», +7% к призывному резерву людей и дварфов",
		cost: { wood: 400, stone: 200, iron: 100, gold: 20, ers: 8000 },
		buildTime: 3,
		income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
		special: "altarVarsis",
		limit: { scope: "province", max: 1 }
	},
	"Святилище Тэямы": {
		name: "Святилище Тэямы", category: "religious", allowedSettlementTypes: ["city", "castle", "village"],
		description: "+7% к призывному резерву оку и гоблинов, +5% к рождаемости",
		cost: { wood: 500, stone: 300, iron: 40, gold: 10, ers: 6000 },
		buildTime: 3,
		income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
		special: "sanctuaryTeama",
		limit: { scope: "province", max: 1 }
	},
	"Храм Варситэи": {
		name: "Храм Варситэи", category: "religious", allowedSettlementTypes: ["city", "castle", "village"],
		description: "+10% к призывному резерву (заменяет Алтарь и Святилище). Позволяет строить их в одной провинции.",
		cost: { wood: 600, stone: 400, iron: 60, gold: 30, ers: 9000 },
		buildTime: 4,
		income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
		special: "templeVarsiteya",
		limit: { scope: "faction", max: 1 }
	},
	"Пантеон": {
		name: "Пантеон", category: "religious", allowedSettlementTypes: ["city", "castle", "village"],
		description: "+15% к призывному резерву и +15% к рождаемости (заменяет все религиозные бонусы). Позволяет строить любые религиозные постройки в провинции.",
		cost: { wood: 1000, stone: 800, iron: 200, gold: 50, ers: 15000 },
		buildTime: 6,
		income: { wood: 0, stone: 0, iron: 0, gold: 0, ers: 0 },
		special: "pantheon",
		limit: { scope: "faction", max: 1 }
	},
	"Суд": {
		name: "Суд", category: "civil", allowedSettlementTypes: ["city"],
		description: "Снижает рост коррупции на 2%. Можно построить 2 в провинции.",
		cost: { wood: 200, stone: 100, iron: 0, gold: 0, ers: 3000 },
		buildTime: 3,
		income: {},
		special: "court",
		limit: { scope: "province", max: 2 }
	},
	"Ристалище Мейана": {
		name: "Ристалище Мейана",
		category: "military",
		allowedSettlementTypes: ["city"],
		description: "Увеличивает лимит Железного ордонанса на +1, снижает содержание до 5 эрсов, повышает мораль до 14. Только для Мейана.",
		cost: { wood: 400, stone: 200, iron: 100, gold: 20, ers: 8000 },
		buildTime: 5,
		income: {},
		special: "meyan_tournament",
		faction: "county_meyan",
		limit: { scope: "faction", max: 1 }
	},
	"Ристалище": {
		name: "Ристалище",
		category: "military",
		allowedSettlementTypes: ["city"],
		description: "Увеличивает лимит Вольных рыцарей с 5 до 7 отрядов, +1 к силе.",
		cost: { wood: 400, stone: 200, iron: 100, gold: 20, ers: 8000 },
		buildTime: 5,
		income: {},
		special: "tournament",
		limit: { scope: "faction", max: 1 }
	},
	"Алтарь Фенрира": {
		name: "Алтарь Фенрира",
		category: "religious",
		allowedSettlementTypes: ["city", "castle"],
		description: "Святилище Великого Волка. Сокращает время найма Гамураев и поднимает боевой дух всех войск. Только для Сколльфанга.",
		cost: { wood: 500, stone: 300, iron: 80, gold: 15, ers: 9000 },
		buildTime: 5,
		income: {},
		special: "fenrir_altar",
		faction: "county_skollfang",
		limit: { scope: "faction", max: 1 }
	}
};

// ========== ПУСТЫШКИ ДЛЯ ЛИМИТИРОВАННЫХ ПОСТРОЕК ==========
const dummyBuildingsCatalog = {};

// Перечень построек, для которых нужны пустышки
const dummyList = [
    "Пантеон",
    "Храм Варситэи",
    "Алтарь Варсиса",
    "Святилище Тэямы",
    "Монетный двор",
    "Осадная мастерская",
    "Большой рынок"  // улучшенная версия Рынка
];

for (let key of dummyList) {
    const original = buildingsCatalog[key];
    if (!original) continue;
    
    const dummyKey = key + "_dummy";
    dummyBuildingsCatalog[dummyKey] = {
        name: original.name + " (неактивна)",
        category: original.category,
        allowedSettlementTypes: original.allowedSettlementTypes,
        description: "Неактивная версия постройки. Не даёт эффектов.",
        cost: original.cost,                     // стоимость не важна, всё равно не строится
        buildTime: original.buildTime,
        income: {},
        special: null,
        isDummy: true,
        limit: null,                              // пустышка не учитывается в лимитах
        upgrade: null                             // улучшить пустышку нельзя
    };
    
    // Добавляем в общий каталог
    buildingsCatalog[dummyKey] = dummyBuildingsCatalog[dummyKey];
}

// Экспорт
window.dummyBuildingsCatalog = dummyBuildingsCatalog;
window.buildingsCatalog = buildingsCatalog;
window.TRAITS_DB = TRAITS_DB;

console.log("✅ databases.js загружен (черты + постройки)");